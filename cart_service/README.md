# Cart Service

The Cart Service is a microservice responsible for managing shopping carts in the BookShop application. It provides APIs for adding, updating, removing, and retrieving items in a user's cart.

## Features

- User authentication via JWT tokens
- Cart management (create, read, update, delete)
- Integration with Book Service for product information
- MongoDB for data persistence

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| GET | `/` | Get the user's cart |
| POST | `/items` | Add an item to the cart |
| PUT | `/items/:itemId` | Update the quantity of an item in the cart |
| DELETE | `/items/:itemId` | Remove an item from the cart |
| DELETE | `/` | Clear the cart |

## Request/Response Examples

### Get Cart

**Request:**
```
GET /
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "userId": "user123",
    "items": [
      {
        "id": "60d21b4667d0d8992e610c86",
        "bookId": "book123",
        "quantity": 2,
        "price": 19.99,
        "title": "Sample Book",
        "imageUrl": "https://example.com/book.jpg"
      }
    ],
    "createdAt": "2023-04-16T12:00:00Z",
    "updatedAt": "2023-04-16T12:00:00Z"
  }
}
```

### Add to Cart

**Request:**
```
POST /items
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "bookId": "book123",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Item added to cart",
    "item": {
      "id": "60d21b4667d0d8992e610c86",
      "bookId": "book123",
      "quantity": 2,
      "price": 19.99,
      "title": "Sample Book",
      "imageUrl": "https://example.com/book.jpg"
    }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection URI | `mongodb://mongodb:27017` |
| `MONGODB_DB` | MongoDB database name | `bookshop` |
| `AUTH_SERVICE_URL` | URL of the auth service | `http://auth-service:8001` |
| `BOOK_SERVICE_URL` | URL of the book service | `http://book-service:8002` |
| `PORT` | Port to listen on | `8003` |

## Setup and Installation

### Prerequisites

- Go 1.21 or higher
- Docker and Docker Compose
- MongoDB

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   go mod download
   ```
3. Run the service:
   ```
   go run main.go
   ```

### Docker Deployment

1. Build the Docker image:
   ```
   docker build -t cart-service .
   ```

2. Run with Docker Compose:
   ```
   docker-compose up -d
   ```

## Project Structure

```
cart_service/
├── main.go              # Main application entry point
├── models/              # Data models
│   └── cart.go          # Cart and CartItem models
├── database/            # Database operations
│   └── db.go            # MongoDB operations
├── handlers/            # HTTP request handlers
│   └── cart.go          # Cart API handlers
├── middleware/          # Middleware components
│   └── auth.go          # Authentication middleware
├── Dockerfile           # Docker build configuration
├── docker-compose.yml   # Docker Compose configuration
├── .env                 # Environment variables
└── README.md            # Documentation
```

## Cart Data Model

```json
{
  "id": "string (UUID)",
  "userId": "string (required)",
  "items": [
    {
      "bookId": "string (required)",
      "quantity": "number (required, min 1)",
      "price": "number (required)",
      "title": "string (required)",
      "imageUrl": "string"
    }
  ],
  "total": "number (required)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

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

The Cart Service integrates with:

1. **Auth Service**: For user authentication and validation
2. **Book Service**: For book information and inventory checks
3. **API Gateway**: For routing requests

## Development

### Project Structure

```
cart_service/
├── main.go              # Application entry point
├── models/             # Data models
├── handlers/           # Request handlers
├── services/           # Business logic
├── utils/              # Utility functions
├── go.mod              # Go dependencies
├── Dockerfile          # Docker build instructions
└── docker-compose.yml  # Docker Compose configuration
```

### Adding New Features

1. Create new models in `models/`
2. Add handlers in `handlers/`
3. Implement business logic in `services/`
4. Update tests
5. Update documentation

## Cart Operations

### Adding Items
- Validates book existence and availability
- Checks user authentication
- Updates cart totals
- Returns updated cart

### Updating Quantities
- Validates new quantity against book inventory
- Updates item price if book price changed
- Recalculates cart totals
- Returns updated cart

### Removing Items
- Removes item from cart
- Recalculates cart totals
- Returns updated cart

### Cart Validation
- Checks book availability
- Validates user authentication
- Ensures cart belongs to user
- Maintains data consistency 