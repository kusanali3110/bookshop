# Book Service API

A RESTful API service for managing books and their images. Built with Node.js, Express, and MongoDB.

## Features

- CRUD operations for books
- Image upload and management
- Search, filter, and pagination
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
3. **Create `.env` file** (see below for variables)
   ```env
   PORT=8002
   MONGODB_URI=mongodb://localhost:27017/bookshop
   ```
4. **Start the service**
   ```bash
   npm start
   ```
   The service will run on `http://localhost:8002` by default.

## Environment Variables

| Variable      | Description                | Default                                 |
|--------------|----------------------------|-----------------------------------------|
| PORT         | Service port               | 8002                                    |
| MONGODB_URI  | MongoDB connection string  | mongodb://localhost:27017/bookshop      |
| NODE_ENV     | Environment                | development                             |

## Docker Usage

Build and run with Docker Compose:
```bash
docker-compose up --build
```

## Health Check
- `GET /health`  
  Returns `{ status: 'ok', service: 'book-service' }` if service is running.

## API Endpoints

### Books
- `GET /` — Get all books (supports pagination, filtering)
- `GET /search` — Search books by title, author, tags, price
- `GET /tags` — Get all unique tags
- `POST /upload-image` — Upload a book image (see below)
- `POST /` — Create a new book (with or without image)
- `GET /:id` — Get a book by ID
- `PUT /:id` — Update a book (with or without image)
- `PATCH /:id/quantity` — Update book quantity
- `DELETE /:id` — Delete a book

### Example: Get All Books
```
GET /?page=1&limit=10&author=John&tags=Fiction&minPrice=50000&maxPrice=200000
```
- Supports query params: `page`, `limit`, `author`, `tags`, `minPrice`, `maxPrice`, `title`

### Example: Search Books
```
GET /search?query=harry+potter
```

### Example: Get Book by ID
```
GET /<book_id>
```

### Example: Create Book (JSON)
```
POST /
Content-Type: application/json
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

### Example: Create Book with Image (multipart/form-data)
```
POST /
Content-Type: multipart/form-data
- image=@/path/to/image.jpg
- title=Book Title
- author=Author Name
- price=120000
...
```

### Example: Upload Image Only
```
POST /upload-image
Content-Type: multipart/form-data
- image=@/path/to/image.jpg
```
- Response:
```json
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/book-1680000000000.jpg",
    ...
  }
}
```

### Example: Update Book
```
PUT /<book_id>
Content-Type: application/json or multipart/form-data
```

### Example: Delete Book
```
DELETE /<book_id>
```

### Example: Update Quantity
```
PATCH /<book_id>/quantity
Content-Type: application/json
{
  "quantity": 20
}
```

## Book Schema

```json
{
  "_id": "string (MongoDB ObjectId)",
  "title": "string (required, max 100)",
  "author": "string (required, max 100)",
  "description": "string (max 1000)",
  "price": "number (required, >=0)",
  "quantity": "number (>=0, default 0)",
  "tags": ["string"],
  "imageUrl": "string (path to uploaded image)",
  "isbn": "string (optional)",
  "publishedDate": "string (YYYY-MM-DD, optional)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Image Upload
- Supported formats: JPEG, PNG, JPG, WebP
- Max file size: 5MB
- Images are stored in `/uploads` and served at `/uploads/<filename>`

## Error Handling
- Standard HTTP status codes (200, 201, 400, 404, 500...)
- Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

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