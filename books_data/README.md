# Book Crawler and Data Pusher

This directory contains scripts for crawling book data from the Google Books API and pushing it to the book service.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Edit the `.env` file and add your Google Books API key:
   ```
   GOOGLE_BOOKS_API_KEY=<your_google_books_api_key_here>
   BOOK_SERVICE_URL=<your_book_service_url_here>
   ```

## Usage

### Crawling Books

To crawl books from the Google Books API:

```bash
python book_crawler.py [options]
```

Options:
- `--categories`: Comma-separated list of categories to crawl (e.g., "Fiction,Fantasy")
- `--bestsellers`: Crawl bestseller books
- `--new-releases`: Crawl new release books
- `--format`: Output format (json or csv, default: json)
- `--limit`: Maximum number of books to crawl per category (default: 100)

Examples:
```bash
# Crawl 100 new release books
python book_crawler.py --new-releases --limit 100 --format json

# Crawl books from specific categories
python book_crawler.py --categories "Fiction,Fantasy" --limit 50 --format json

# Crawl bestseller books
python book_crawler.py --bestsellers --limit 200 --format json
```

The crawled data will be saved to `data/books.json` (or `data/books.csv` if CSV format is selected).

### Pushing Books to the Book Service

To push the crawled book data to the book service:

```bash
python push_books.py [options]
```

Options:
- `--file`: Path to the JSON file containing book data (default: data/books.json)
- `--url`: URL of the book service API (default: http://localhost:3001)

Examples:
```bash
# Push books from the default file to the default book service URL
python push_books.py

# Push books from a specific file
python push_books.py --file data/my_books.json

# Push books to a specific book service URL
python push_books.py --url http://my-book-service:3001
```

## Workflow

1. Crawl book data:
   ```bash
   python book_crawler.py --new-releases --limit 100 --format json
   ```

2. Push the crawled data to the book service:
   ```bash
   python push_books.py
   ```

## Notes

- The book crawler respects rate limits and includes error handling.
- The book pusher checks for duplicate books by ISBN to avoid creating duplicates.
- Both scripts include progress bars and detailed logging.
- The book pusher handles image uploads for book covers.

## Features

- Search books by query
- Crawl books by category
- Get bestsellers
- Get new releases
- Save data in JSON or CSV format
- Download book cover images
- Rate limiting to respect API quotas

## Output

The script creates the following directory structure:
```
data/
├── books/
│   ├── books.json (or books.csv)
│   └── images/
│       └── [book_id].jpg
```

## Notes

- The script includes rate limiting to avoid hitting API quotas
- Book cover images are downloaded and stored in the images directory
- The script handles missing data gracefully
- All dates are standardized to ISO format
- Prices are converted to USD when possible 