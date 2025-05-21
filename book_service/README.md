# Book Service API

A RESTful API service for managing books and their images. Built with Node.js, Express, and MongoDB.

## Features

- CRUD operations for books
- Image upload and management
- Advanced search and filtering
- Tag management
- Health check endpoint

## Project Structure

```
book_service/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── index.js        # Application entry point
├── uploads/            # Image upload directory
├── package.json        # Node.js dependencies
├── Dockerfile          # Docker build instructions
└── docker-compose.yml  # Docker Compose configuration
```

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd book_service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   PORT=8002
   MONGODB_URI=mongodb://localhost:27017/bookshop
   ```

4. **Start the service**
   ```bash
   npm start
   ```
   The service will run on `http://localhost:8002` by default.

## API Documentation

### Health Check
- `GET /health`  
  Returns service status.
  ```json
  {
    "status": "ok",
    "service": "book-service"
  }
  ```

### Books

#### Get All Books with Search & Filter
- `GET /`
  - Supports pagination, search and filtering
  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
    - `title`: Search by title (case-insensitive)
    - `author`: Search by author (case-insensitive)
    - `tags`: Search by tags (comma-separated)
    - `minPrice`: Minimum price
    - `maxPrice`: Maximum price
    - `minQuantity`: Minimum quantity
    - `maxQuantity`: Maximum quantity
    - `isbn`: Search by ISBN
    - `publishedDate`: Search by publication date

  Examples:
  ```
  # Get first page with 10 items
  GET /?page=1&limit=10

  # Search by title and author
  GET /?title=harry&author=rowling

  # Filter by tags and price range
  GET /?tags=Fiction,Adventure&minPrice=100000&maxPrice=200000

  # Search by ISBN
  GET /?isbn=978-3-16-148410-0

  # Filter by quantity range
  GET /?minQuantity=5&maxQuantity=20

  # Search by publication date
  GET /?publishedDate=2023-01-01
  ```

  Response:
  ```json
  {
    "success": true,
    "count": 10,
    "total": 50,
    "totalPages": 5,
    "currentPage": 1,
    "data": [
      {
        "_id": "123456789",
        "title": "Book Title",
        "author": "Author Name",
        "price": 120000,
        "quantity": 10,
        "tags": ["Fiction", "Adventure"],
        "description": "...",
        "isbn": "1234567890",
        "publishedDate": "2023-01-01",
        "imageUrl": "/uploads/book-123.jpg"
      },
      // ... more books
    ]
  }
  ```

#### Get Book by ID
- `GET /:id`
  Example:
  ```
  GET /123456789
  ```
  Response:
  ```json
  {
    "success": true,
    "data": {
      "_id": "123456789",
      "title": "Book Title",
      "author": "Author Name",
      "price": 120000,
      "quantity": 10,
      "tags": ["Fiction", "Adventure"],
      "description": "...",
      "isbn": "1234567890",
      "publishedDate": "2023-01-01",
      "imageUrl": "/uploads/book-123.jpg"
    }
  }
  ```

#### Upload Image
- `POST /upload-image`
  - Upload a book cover image
  - Content-Type: multipart/form-data
  - Field name: image
  - Max file size: 5MB
  - Supported formats: JPEG, PNG, JPG, WebP

  Example:
  ```
  POST /upload-image
  Content-Type: multipart/form-data
  - image=@/path/to/image.jpg
  ```

  Response:
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully",
    "data": {
      "imageUrl": "/uploads/book-123456789.jpg",
      "filename": "book-123456789.jpg",
      "mimetype": "image/jpeg",
      "size": 123456
    }
  }
  ```

#### Create Book
- `POST /`
  - Supports both JSON and multipart/form-data
  - Required fields: title, author, price
  - Optional fields: description, tags, isbn, publishedDate, imageUrl

  Example (JSON):
  ```json
  {
    "title": "Book Title",
    "author": "Author Name",
    "price": 120000,
    "quantity": 10,
    "tags": ["Fiction", "Adventure"],
    "description": "...",
    "isbn": "1234567890",
    "publishedDate": "2023-01-01"
  }
  ```

  Example (multipart/form-data):
  ```
  POST /
  Content-Type: multipart/form-data
  - image=@/path/to/image.jpg
  - title=Book Title
  - author=Author Name
  - price=120000
  - quantity=10
  - tags=Fiction,Adventure
  - description=Book description
  - isbn=1234567890
  - publishedDate=2023-01-01
  ```

  Response:
  ```json
  {
    "success": true,
    "message": "Book created successfully",
    "data": {
      "_id": "123456789",
      "title": "Book Title",
      "author": "Author Name",
      "price": 120000,
      "quantity": 10,
      "tags": ["Fiction", "Adventure"],
      "description": "...",
      "isbn": "1234567890",
      "publishedDate": "2023-01-01",
      "imageUrl": "/uploads/book-123456789.jpg"
    }
  }
  ```

#### Update Book
- `PUT /:id`
  - Supports both JSON and multipart/form-data
  - All fields are optional
  - Can update image by uploading new file or providing imageUrl

  Example (JSON):
  ```
  PUT /123456789
  Content-Type: application/json
  {
    "price": 150000,
    "quantity": 20
  }
  ```

  Example (multipart/form-data):
  ```
  PUT /123456789
  Content-Type: multipart/form-data
  - image=@/path/to/new-image.jpg
  - price=150000
  - quantity=20
  ```

  Response:
  ```json
  {
    "success": true,
    "message": "Book updated successfully",
    "data": {
      "_id": "123456789",
      "title": "Book Title",
      "author": "Author Name",
      "price": 150000,
      "quantity": 20,
      "tags": ["Fiction", "Adventure"],
      "description": "...",
      "isbn": "1234567890",
      "publishedDate": "2023-01-01",
      "imageUrl": "/uploads/book-123456789.jpg"
    }
  }
  ```

#### Delete Book
- `DELETE /:id`
  Example:
  ```
  DELETE /123456789
  ```

  Response:
  ```json
  {
    "success": true,
    "message": "Book deleted successfully"
  }
  ```

#### Update Book Quantity
- `PATCH /:id/quantity`
  - Update only the quantity field
  - Required field: quantity

  Example:
  ```
  PATCH /123456789/quantity
  Content-Type: application/json
  {
    "quantity": 20
  }
  ```

  Response:
  ```json
  {
    "success": true,
    "message": "Book quantity updated successfully",
    "data": {
      "_id": "123456789",
      "title": "Book Title",
      "author": "Author Name",
      "price": 120000,
      "quantity": 20,
      "tags": ["Fiction", "Adventure"],
      "description": "...",
      "isbn": "1234567890",
      "publishedDate": "2023-01-01",
      "imageUrl": "/uploads/book-123456789.jpg"
    }
  }
  ```

### Tags

#### Get All Tags
- `GET /tags`
  Returns all unique tags used in books.
  Response:
  ```json
  {
    "success": true,
    "count": 5,
    "data": ["Fiction", "Adventure", "Mystery", "Romance", "Science Fiction"]
  }
  ```

## Error Responses

All endpoints return error responses in the following format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Book Schema

```json
{
  "title": {
    "type": "String",
    "required": true,
    "maxlength": 100
  },
  "author": {
    "type": "String",
    "required": true,
    "maxlength": 100
  },
  "description": {
    "type": "String",
    "maxlength": 1000
  },
  "price": {
    "type": "Number",
    "required": true,
    "min": 0
  },
  "quantity": {
    "type": "Number",
    "default": 0,
    "min": 0
  },
  "tags": [{
    "type": "String",
    "maxlength": 50
  }],
  "imageUrl": {
    "type": "String"
  },
  "isbn": {
    "type": "String"
  },
  "publishedDate": {
    "type": "Date"
  }
}
```

## Image Upload
- Supported formats: JPEG, PNG, JPG, WebP
- Max file size: 5MB
- Images are stored in `/uploads` and served at `/uploads/<filename>`

## Data Import

Use the provided `push_books.py` script (in `../books_data/`) to import bulk book data:
```bash
cd ../books_data
python push_books.py
```

## Development & Contribution
- Add new models in `src/models/`
- Add controllers in `src/controllers/`
- Define routes in `src/routes/`
- Update documentation as needed

---

For any questions or issues, please open an issue or contact the maintainer. 