# API Gateway

A gateway service for the BookShop application that routes requests to the appropriate microservices.

## Features

- Routes requests to auth, book, and cart services
- Provides a single entry point for all API requests
- Handles CORS for cross-origin requests
- Simple and efficient request forwarding

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8000 | Main entry point for all API requests |
| Auth Service | 8001 | User authentication and authorization |
| Book Service | 8002 | Book management and inventory |
| Cart Service | 8003 | Shopping cart operations |

## API Routes

| Route | Service | Description |
|-------|---------|-------------|
| `/auth/*` | Auth Service | User authentication and management |
| `/books/*` | Book Service | Book operations and inventory |
| `/cart/*` | Cart Service | Shopping cart operations |

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the service:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Docker

Build and run with Docker:

```bash
docker-compose up -d
```

## Development

### Project Structure

```
api_gateway/
├── main.py              # Application entry point
├── routes.py            # Route definitions and forwarding logic
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker build instructions
└── docker-compose.yml   # Docker Compose configuration
```

### Adding New Services

To add a new service to the gateway:

1. Add the service URL to the routes.py file
2. Create new route handlers for the service
3. Update the docker-compose.yml file to include the new service

## Integration with Other Services

The API gateway integrates with:

1. **Auth Service**: For user authentication and authorization
2. **Book Service**: For book operations and inventory
3. **Cart Service**: For shopping cart operations

## Security Considerations

- CORS is configured to allow cross-origin requests
- Requests are forwarded to the appropriate services
- No sensitive data is stored in the gateway 