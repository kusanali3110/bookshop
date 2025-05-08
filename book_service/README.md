# Book Service

Book management and inventory service for the BookShop application.

## Features

- Book CRUD operations
- Book search and filtering
- Category management
- Inventory tracking
- Image upload and management
- Tag management.

## API Endpoints

### Books

| Method | Endpoint | Description | Query Parameters | Request Body | Response |
|--------|----------|-------------|------------------|--------------|-----------|
| GET | `/` | Get all books | `page`, `limit`, `sort`, `category`, `author`, `tags` | - | `{ "books": [...], "total": number, "page": number }` |
| GET | `/:id` | Get book by ID | - | - | `{ "book": { ... } }` |
| POST | `/` | Create new book | - | `{ "title": "...", "author": "...", "price": number, ... }` | `{ "book": { ... } }` |
| PUT | `/:id` | Update book | - | `{ "title": "...", "price": number, ... }` | `{ "book": { ... } }` |
| DELETE | `/:id` | Delete book | - | - | `{ "message": "Book deleted" }` |
| GET | `/search` | Search books | `q`, `page`, `limit` | - | `{ "books": [...], "total": number }` |
| PUT | `/:id/quantity` | Update book quantity | - | `{ "quantity": number }` | `{ "book": { ... } }` |
| GET | `/tags` | Get all unique tags | - | - | `{ "tags": [...] }` |


## Book Data Model

```json
{
  "id": "string (UUID)",
  "title": "string (required)",
  "author": "string (required)",
  "description": "string",
  "price": "number (required)",
  "category": "string (required)",
  "tags": "string[]",
  "quantity": "number (required)",
  "imageUrl": "string",
  "isbn": "string",
  "publishedDate": "string (YYYY-MM-DD)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run the service:
   ```bash
   npm start
   ```

## Docker

Build and run with Docker:

```bash
docker-compose up -d
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Service port | 8002 |
| MONGODB_URI | MongoDB connection URL | mongodb://mongodb:27017/bookshop |
| NODE_ENV | Environment | development |
| UPLOAD_DIR | Image upload directory | uploads |

## Query Parameters

### Get All Books
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc)
- `category`: Filter by category
- `author`: Filter by author
- `tags`: Filter by tags (comma-separated)
- `minPrice`: Minimum price
- `maxPrice`: Maximum price

### Search Books
- `q`: Search query
- `page`: Page number
- `limit`: Items per page
- `fields`: Search fields (comma-separated)

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include a message and details:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Integration with Other Services

The Book Service integrates with:

1. **Auth Service**: For user authentication
2. **Cart Service**: For inventory management
3. **API Gateway**: For routing requests

## Development

### Project Structure

```
book_service/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.js        # Application entry point
├── uploads/            # Image upload directory
├── package.json        # Node.js dependencies
├── Dockerfile          # Docker build instructions
└── docker-compose.yml  # Docker Compose configuration
```

### Adding New Features

1. Create new models in `src/models/`
2. Add controllers in `src/controllers/`
3. Define routes in `src/routes/`
4. Implement business logic in `src/services/`
5. Update tests
6. Update documentation 