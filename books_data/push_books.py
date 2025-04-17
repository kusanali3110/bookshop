#!/usr/bin/env python3
"""
Book Data Pusher

This script reads the crawled book data from the book_crawler.py output
and pushes it to the book service API.
"""

import os
import json
import argparse
import requests
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging
from tqdm import tqdm
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
DATA_DIR = Path('data')
BOOKS_FILE = DATA_DIR / 'books.json'
BOOK_SERVICE_URL = os.getenv('BOOK_SERVICE_URL', 'http://localhost:8000/book/')
RATE_LIMIT_DELAY = 0.5  # seconds between API calls
MAX_RETRIES = 3  # maximum number of retries for API calls

class BookPusher:
    """Pushes book data to the book service API"""
    
    def __init__(self, book_service_url: str = BOOK_SERVICE_URL):
        """
        Initialize the book pusher
        
        Args:
            book_service_url: URL of the book service API
        """
        self.book_service_url = book_service_url.rstrip('/')
        self.books: List[Dict[str, Any]] = []
        self.success_count = 0
        self.error_count = 0
        self.skipped_count = 0
        
        # Create data directory if it doesn't exist
        DATA_DIR.mkdir(exist_ok=True)
    
    def load_books(self, file_path: Path = BOOKS_FILE) -> bool:
        """
        Load books from a JSON file
        
        Args:
            file_path: Path to the JSON file
            
        Returns:
            True if books were loaded successfully, False otherwise
        """
        try:
            if not file_path.exists():
                logger.error(f"Books file not found: {file_path}")
                return False
                
            with open(file_path, 'r', encoding='utf-8') as f:
                self.books = json.load(f)
                
            logger.info(f"Loaded {len(self.books)} books from {file_path}")
            return True
        except Exception as e:
            logger.error(f"Error loading books: {e}")
            return False
    
    def check_book_exists(self, isbn: Optional[str]) -> bool:
        """
        Check if a book with the given ISBN already exists
        
        Args:
            isbn: ISBN of the book
            
        Returns:
            True if the book exists, False otherwise
        """
        if not isbn:
            return False
            
        try:
            response = requests.get(
                f"{self.book_service_url}/search",
                params={"query": isbn},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('count', 0) > 0:
                    # Check if any book has the exact ISBN
                    for book in data.get('data', []):
                        if book.get('isbn') == isbn:
                            return True
                            
            return False
        except Exception as e:
            logger.warning(f"Error checking if book exists: {e}")
            return False
    def push_book(self, book: Dict[str, Any]) -> bool:
        """
        Push a book to the book service API
        
        Args:
            book: Book data to push
            
        Returns:
            True if the book was pushed successfully, False otherwise
        """
        # Check if book already exists by ISBN
        if book.get('isbn') and self.check_book_exists(book['isbn']):
            logger.info(f"Book with ISBN {book['isbn']} already exists, skipping")
            self.skipped_count += 1
            return True
            
        # Prepare the book data
        book_data = {
            'title': book.get('title', ''),
            'author': book.get('author', ''),
            'tags': book.get('tags', []),
            'price': book.get('price', 0.0),
            'quantity': book.get('quantity', 0),
            'description': book.get('description', ''),
            'isbn': book.get('isbn', ''),
            'publishedDate': book.get('publishedDate', '')
        }
        
        # Handle image upload if available
        files = {}
        image_path = None
        
        if book.get('imageUrl'):
            # Check if it's a local file path
            if os.path.exists(book['imageUrl']):
                image_path = book['imageUrl']
            else:
                # Check if it's a relative path from the data directory
                potential_path = DATA_DIR / 'images' / os.path.basename(book['imageUrl'])
                if potential_path.exists():
                    image_path = str(potential_path)
                    
        if image_path:
            try:
                files = {'image': open(image_path, 'rb')}
            except Exception as e:
                logger.warning(f"Error opening image file {image_path}: {e}")
        
        # Push the book to the API
        for attempt in range(MAX_RETRIES):
            try:
                if files:
                    response = requests.post(
                        f"{self.book_service_url}/",
                        data=book_data,
                        files=files,
                        timeout=10
                    )
                else:
                    response = requests.post(
                        f"{self.book_service_url}/",
                        json=book_data,
                        timeout=10
                    )
                    
                # Close file if it was opened
                if files and 'image' in files:
                    files['image'].close()
                    
                if response.status_code in [200, 201]:
                    logger.info(f"Successfully pushed book: {book_data['title']}")
                    self.success_count += 1
                    return True
                else:
                    logger.warning(f"Failed to push book: {book_data['title']}, status: {response.status_code}")
                    logger.warning(f"Response: {response.text}")
                    
                    if attempt < MAX_RETRIES - 1:
                        sleep_time = RATE_LIMIT_DELAY * (2 ** attempt)
                        logger.info(f"Retrying in {sleep_time} seconds...")
                        time.sleep(sleep_time)
                    else:
                        self.error_count += 1
                        return False
                        
            except Exception as e:
                logger.error(f"Error pushing book: {e}")
                
                # Close file if it was opened
                if files and 'image' in files:
                    files['image'].close()
                    
                if attempt < MAX_RETRIES - 1:
                    sleep_time = RATE_LIMIT_DELAY * (2 ** attempt)
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)
                else:
                    self.error_count += 1
                    return False
                    
        return False
    
    def push_all_books(self) -> None:
        """
        Push all loaded books to the book service API
        """
        if not self.books:
            logger.error("No books loaded")
            return
            
        logger.info(f"Pushing {len(self.books)} books to {self.book_service_url}")
        
        for book in tqdm(self.books, desc="Pushing books"):
            self.push_book(book)
            time.sleep(RATE_LIMIT_DELAY)
            
        logger.info(f"Push complete: {self.success_count} successful, {self.error_count} failed, {self.skipped_count} skipped")


def main():
    """Main function to run the book pusher"""
    parser = argparse.ArgumentParser(description='Push book data to the book service API')
    parser.add_argument('--file', type=str, default=str(BOOKS_FILE), help='Path to the JSON file containing book data')
    parser.add_argument('--url', type=str, default=BOOK_SERVICE_URL, help='URL of the book service API')
    
    args = parser.parse_args()
    
    pusher = BookPusher(book_service_url=args.url)
    
    if pusher.load_books(Path(args.file)):
        pusher.push_all_books()
    else:
        logger.error("Failed to load books, exiting")


if __name__ == "__main__":
    main() 