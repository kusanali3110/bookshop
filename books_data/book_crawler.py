#!/usr/bin/env python3
"""
Book Crawler for Book Service

This script crawls book data from Google Books API and formats it for the book service.
It can be used to populate the book database with initial data.
"""

import os
import json
import time
import random
import argparse
import requests
from typing import List, Dict, Any, Optional, Set
from datetime import datetime
import logging
from pathlib import Path
import csv
from tqdm import tqdm
from dotenv import load_dotenv
import re
from dateutil import parser as date_parser
import os   

# Load environment variables
load_dotenv()

# Constants
API_KEY = os.getenv('GOOGLE_BOOKS_API_KEY')
BASE_URL = os.getenv('GOOGLE_BOOKS_BASE_URL')
RATE_LIMIT_DELAY = 1  # seconds between API calls
MAX_RETRIES = 3  # maximum number of retries for API calls
MAX_RESULTS_PER_REQUEST = 40  # maximum results per API request
DATA_DIR = Path('data')
IMAGES_DIR = DATA_DIR / 'images'

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BookCrawler:
    """Crawler for fetching book data from Google Books API"""
    
    def __init__(self, output_format: str = 'json'):
        """
        Initialize the book crawler
        
        Args:
            output_format: The format to save the data in ('json' or 'csv')
        """
        self.output_format = output_format
        self.books: List[Dict[str, Any]] = []
        self.processed_isbns: Set[str] = set()  # Track processed ISBNs to avoid duplicates
        
        # Create necessary directories
        DATA_DIR.mkdir(exist_ok=True)
        IMAGES_DIR.mkdir(exist_ok=True)
        
        if not API_KEY:
            logger.warning("Google Books API key not found in environment variables. Using public API without key.")
    
    def search_books(self, query: str, max_results: int = 40) -> List[Dict[str, Any]]:
        """
        Search for books using the Google Books API with pagination support
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
            
        Returns:
            List of book data dictionaries
        """
        all_items = []
        start_index = 0
        
        while start_index < max_results:
            # Calculate how many results to request in this batch
            batch_size = min(MAX_RESULTS_PER_REQUEST, max_results - start_index)
            
            params = {
                'q': query,
                'maxResults': batch_size,
                'startIndex': start_index,
                'printType': 'books',
                'langRestrict': 'en'
            }
            
            # Only add API key if it exists
            if API_KEY:
                params['key'] = API_KEY
            
            for attempt in range(MAX_RETRIES):
                try:
                    response = requests.get(BASE_URL, params=params, timeout=10)
                    
                    # Check for specific error codes
                    if response.status_code == 403:
                        logger.error("API access forbidden. This could be due to an invalid API key or quota exceeded.")
                        if API_KEY:
                            logger.error("Please check your API key or create a new one at https://console.cloud.google.com/")
                        else:
                            logger.error("Consider using an API key for better results.")
                        return all_items
                    
                    response.raise_for_status()
                    
                    data = response.json()
                    items = data.get('items', [])
                    
                    # If no more items, break the loop
                    if not items:
                        logger.info(f"No more books found for query: {query}")
                        return all_items
                    
                    all_items.extend(items)
                    logger.info(f"Retrieved {len(items)} books (total: {len(all_items)})")
                    
                    # If we got fewer items than requested, we've reached the end
                    if len(items) < batch_size:
                        logger.info(f"Reached end of results for query: {query}")
                        return all_items
                    
                    # Move to the next batch
                    start_index += batch_size
                    
                    # Respect rate limiting
                    time.sleep(RATE_LIMIT_DELAY)
                    break
                    
                except requests.exceptions.RequestException as e:
                    logger.warning(f"API request failed (attempt {attempt+1}/{MAX_RETRIES}): {e}")
                    if attempt < MAX_RETRIES - 1:
                        # Exponential backoff
                        sleep_time = RATE_LIMIT_DELAY * (2 ** attempt)
                        logger.info(f"Retrying in {sleep_time} seconds...")
                        time.sleep(sleep_time)
                    else:
                        logger.error(f"Failed to fetch books after {MAX_RETRIES} attempts")
                        return all_items
        
        return all_items
    
    def parse_date(self, date_str: str) -> Optional[str]:
        """
        Parse various date formats into ISO format (YYYY-MM-DD)
        
        Args:
            date_str: Date string in various formats
            
        Returns:
            ISO formatted date string or None if parsing fails
        """
        if not date_str:
            return None
            
        try:
            # Try to parse with dateutil
            parsed_date = date_parser.parse(date_str)
            return parsed_date.strftime('%Y-%m-%d')
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            
            # Fallback to simple pattern matching
            try:
                # Handle year only
                if re.match(r'^\d{4}$', date_str):
                    return f"{date_str}-01-01"
                    
                # Handle year and month
                if re.match(r'^\d{4}-\d{2}$', date_str):
                    return f"{date_str}-01"
                    
                # Handle year/month/day
                if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
                    return date_str
                    
                # Handle month/year
                if re.match(r'^\d{1,2}/\d{4}$', date_str):
                    month, year = date_str.split('/')
                    return f"{year}-{int(month):02d}-01"
                    
                # Handle day/month/year
                if re.match(r'^\d{1,2}/\d{1,2}/\d{4}$', date_str):
                    day, month, year = date_str.split('/')
                    return f"{year}-{int(month):02d}-{int(day):02d}"
                    
            except Exception as e:
                logger.warning(f"Fallback date parsing failed for {date_str}: {e}")
                
            return None
    
    def process_book(self, book_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Process raw book data into a standardized format matching the book service schema.
        
        Args:
            book_data: Raw book data from the API
            
        Returns:
            Processed book data dictionary or None if invalid
        """
        try:
            volume_info = book_data['volumeInfo']
            
            # Extract and validate required fields
            title = volume_info.get('title', '').strip()
            if not title or len(title) > 100:
                logger.warning(f"Invalid title for book {book_data.get('id')}")
                return None
                
            authors = volume_info.get('authors', [])
            if not authors:
                logger.warning(f"No authors found for book {book_data.get('id')}")
                return None
            author = authors[0].strip()
            if len(author) > 100:
                author = author[:100]
            
            # Extract price and convert to USD if needed
            sale_info = volume_info.get('saleInfo', {})
            list_price = sale_info.get('listPrice', {})
            price = list_price.get('amount', 0.0)
            currency = list_price.get('currencyCode', 'USD')
            
            # Convert price to USD if not already
            if currency != 'USD' and price > 0:
                # Simple conversion rates (in production, use a proper currency conversion API)
                conversion_rates = {
                    'EUR': 1.08,
                    'GBP': 1.27,
                    'JPY': 0.0067,
                    'AUD': 0.66,
                    'CAD': 0.73
                }
                price = price * conversion_rates.get(currency, 1.0)
            
            # Process categories into tags (limit to 10)
            categories = volume_info.get('categories', [])
            tags = [cat.strip() for cat in categories[:10]]
            
            # Process description
            description = volume_info.get('description', '').strip()
            if len(description) > 1000:
                description = description[:997] + '...'
            
            # Process ISBN
            isbn = next((identifier['identifier'] for identifier in volume_info.get('industryIdentifiers', [])
                        if identifier['type'] in ['ISBN_13', 'ISBN_10']), None)
            
            # Check for duplicates by ISBN
            if isbn and isbn in self.processed_isbns:
                logger.info(f"Skipping duplicate book with ISBN: {isbn}")
                return None
                
            if isbn:
                self.processed_isbns.add(isbn)
            
            # Process published date
            published_date = self.parse_date(volume_info.get('publishedDate', ''))
            
            # Process image
            image_url = volume_info.get('imageLinks', {}).get('thumbnail', '')
            if image_url:
                # Convert thumbnail URL to high quality
                image_url = image_url.replace('zoom=1', 'zoom=2')
                image_url = image_url.replace('&edge=curl', '')
                
                # Download and save image
                image_path = IMAGES_DIR / f"{book_data['id']}.jpg"
                if not image_path.exists():
                    try:
                        response = requests.get(image_url, timeout=10)
                        if response.status_code == 200:
                            with open(image_path, 'wb') as f:
                                f.write(response.content)
                    except Exception as e:
                        logger.error(f"Error downloading image: {e}")
                        image_url = None
            
            # Create book object matching the schema
            book = {
                'title': title,
                'author': author,
                'tags': tags,
                'price': round(price, 2),
                'quantity': 0,  # Default quantity
                'imageUrl': image_url,
                'description': description,
                'isbn': isbn,
                'publishedDate': published_date,
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            
            return book
            
        except (KeyError, TypeError) as e:
            logger.error(f"Error processing book: {e}")
            return None
    
    def crawl_category(self, category: str, limit: Optional[int] = None) -> None:
        """
        Crawl books from a specific category.
        
        Args:
            category: The category to crawl
            limit: Maximum number of books to crawl
        """
        logger.info(f"Crawling books in category: {category}")
        query = f"subject:{category}"
        
        books = self.search_books(query, limit or 100)
        
        for book_data in tqdm(books, desc="Processing books"):
            book = self.process_book(book_data)
            if book:
                self.books.append(book)
            time.sleep(RATE_LIMIT_DELAY)
    
    def crawl_bestsellers(self, limit: Optional[int] = None) -> None:
        """
        Crawl bestseller books.
        
        Args:
            limit: Maximum number of books to crawl
        """
        logger.info("Crawling bestseller books")
        query = "bestseller"
        
        books = self.search_books(query, limit or 100)
        
        for book_data in tqdm(books, desc="Processing books"):
            book = self.process_book(book_data)
            if book:
                self.books.append(book)
            time.sleep(RATE_LIMIT_DELAY)
    
    def crawl_new_releases(self, limit: Optional[int] = None) -> None:
        """
        Crawl new release books.
        
        Args:
            limit: Maximum number of books to crawl
        """
        logger.info("Crawling new release books")
        current_year = datetime.now().year
        query = f"published:{current_year}"
        
        books = self.search_books(query, limit or 100)
        
        for book_data in tqdm(books, desc="Processing books"):
            book = self.process_book(book_data)
            if book:
                self.books.append(book)
            time.sleep(RATE_LIMIT_DELAY)
    
    def save_data(self) -> None:
        """
        Save the crawled data to a file.
        """
        if not self.books:
            logger.info("No books to save")
            return
            
        output_file = DATA_DIR / f"books.{self.output_format}"
        
        if self.output_format == 'json':
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.books, f, indent=2, ensure_ascii=False)
        elif self.output_format == 'csv':
            with open(output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=self.books[0].keys())
                writer.writeheader()
                writer.writerows(self.books)
                
        logger.info(f"Saved {len(self.books)} books to {output_file}")


def main():
    """Main function to run the book crawler"""
    parser = argparse.ArgumentParser(description='Crawl book data from Google Books API')
    parser.add_argument('--categories', help='Comma-separated list of categories to crawl')
    parser.add_argument('--bestsellers', action='store_true', help='Crawl bestsellers')
    parser.add_argument('--new-releases', action='store_true', help='Crawl new releases')
    parser.add_argument('--format', choices=['json', 'csv'], default='json', help='Output format')
    parser.add_argument('--limit', type=int, default=100, help='Maximum number of books to crawl per category')
    
    args = parser.parse_args()
    
    if not any([args.categories, args.bestsellers, args.new_releases]):
        parser.error("At least one of --categories, --bestsellers, or --new-releases must be specified")
    
    crawler = BookCrawler(output_format=args.format)
    
    if args.categories:
        categories = [cat.strip() for cat in args.categories.split(',')]
        for category in categories:
            crawler.crawl_category(category, args.limit)
            
    if args.bestsellers:
        crawler.crawl_bestsellers(args.limit)
        
    if args.new_releases:
        crawler.crawl_new_releases(args.limit)
        
    crawler.save_data()


if __name__ == "__main__":
    main() 