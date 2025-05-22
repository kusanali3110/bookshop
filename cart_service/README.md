# Cart Service API

A RESTful API service for managing user shopping carts. Built with Go, Gin, and MongoDB.

## Features

- Add items to cart
- Update cart items
- Remove items from cart
- Clear cart
- View cart contents
- Integration with Book Service for real-time book details

## Project Structure

```
cart_service/
├── database/     # Database operations
├── handlers/     # Request handlers
├── middleware/   # Middleware functions
├── models/       # Data models
├── services/     # External service clients
├── main.go       # Application entry point
└── README.md     # Documentation
```

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd cart_service
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Create `.env` file**
   ```env
   PORT=8003
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=bookshop
   BOOK_SERVICE_URL=http://localhost:8002
   AUTH_SERVICE_URL=http://localhost:8001
   ```

4. **Start the service**
   ```bash
   go run main.go
   ```
   The service will run on `http://localhost:8003` by default.

## API Documentation

### Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Health Check
- `GET /health`  
  Returns service status.
  ```json
  {
    "status": "ok",
    "service": "cart-service"
  }
  ```

### Cart Operations

#### Get Cart
- `GET /`
  Returns the current user's cart contents.
  
  Response:
  ```json
  {
    "data": {
      "items": [
        {
          "id": "60d21b4667d0d8992e610c85",
          "bookId": "60d21b4667d0d8992e610c86",
          "quantity": 2,
          "price": 19.99,
          "title": "Sample Book",
          "imageUrl": "https://example.com/book.jpg"
        }
      ]
    },
    "success": true
  }
  ```

#### Add Item to Cart
- `POST /items`
  Adds a new item to the cart.
  
  Request Body:
  ```json
  {
    "bookId": "60d21b4667d0d8992e610c86",
    "quantity": 2
  }
  ```
  
  Response:
  ```json
  {
    "success": true,
    "data": {
      "message": "Item added to cart",
      "item": {
        "id": "60d21b4667d0d8992e610c85",
        "bookId": "60d21b4667d0d8992e610c86",
        "quantity": 2,
        "price": 19.99,
        "title": "Sample Book",
        "imageUrl": "https://example.com/book.jpg"
      }
    }
  }
  ```

#### Update Cart Item
- `PUT /items/:itemId`
  Updates the quantity of an item in the cart.
  
  URL Parameters:
  - `itemId`: ID of the cart item to update
  
  Request Body:
  ```json
  {
    "quantity": 3
  }
  ```
  
  Response:
  ```json
  {
    "success": true,
    "data": {
      "message": "Cart item updated"
    }
  }
  ```

#### Remove Item from Cart
- `DELETE /items/:itemId`
  Removes an item from the cart.
  
  URL Parameters:
  - `itemId`: ID of the cart item to remove
  
  Response:
  ```json
  {
    "success": true,
    "data": {
      "message": "Item removed from cart"
    }
  }
  ```

#### Clear Cart
- `DELETE /`
  Removes all items from the cart.
  
  Response:
  ```json
  {
    "success": true,
    "data": {
      "message": "Cart cleared"
    }
  }
  ```

## Error Responses

All endpoints return error responses in the following format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common error scenarios:
- Invalid request body
- Book not found
- Cart item not found
- Database errors
- Authentication errors

## Integration with Book Service

The cart service integrates with the book service to fetch real-time book details when adding items to the cart. This ensures that cart items always have up-to-date information about:
- Book title
- Price
- Image URL

The book service URL is configured via the `BOOK_SERVICE_URL` environment variable.

## Development

### Prerequisites
- Go 1.16 or higher
- MongoDB 4.4 or higher
- Book Service running
- Auth Service running

### Running Tests
```bash
go test ./...
```

### Building
```bash
go build -o cart_service
```

### Docker Support
```bash
docker build -t cart_service .
docker run -p 8003:8003 cart_service
``` 