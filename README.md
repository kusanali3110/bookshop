# BookShop Microservices Application 
(Manifest repo can be found [here](https://github.com/kusanali3110/bookshop-config))
## Overview

This is a modern e-commerce application for selling books, built using a microservices architecture. The application consists of multiple services that work together to provide a complete online book shopping experience.

## Architecture

The application is built using a microservices architecture with the following components:

### Services

1. **API Gateway** (Port 8000)
   - Entry point for all client requests
   - Routes requests to appropriate microservices
   - Handles authentication and authorization

2. **Auth Service** (Port 8001)
   - User authentication and authorization
   - User registration and profile management
   - Email verification
   - Password reset functionality

3. **Book Service** (Port 8002)
   - Book catalog management
   - Book search and filtering
   - Book details and reviews

4. **Cart Service** (Port 8003)
   - Shopping cart management
   - Add/remove items from cart
   - Update item quantities
   - Cart persistence

### Technologies Used

- **Backend Services**:
  - Auth Service: Python with FastAPI
  - Book Service: Nodejs with Express
  - Cart Service: Go with Gin
  - API Gateway: Python with FastAPI

- **Databases**: MongoDB

- **Containerization**: Docker and Docker Compose for containerization and orchestration

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Go 1.21+ (for Cart Service)
- Python 3.9+ (for Auth, Book, and API Gateway services)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/bookshop.git
   cd bookshop
   ```

2. Adjust environment variables defined in docker-compose.yml file
   ```
   vim docker-compose.yml
   ```
   or 
   ```
   nano docker-compose.yml
   ```

3. Start the services using Docker Compose:
   ```
   docker-compose up -d
   ```

4. Access the API Gateway at:
   ```
   http://localhost:8000
   ```

## API Documentation

### Auth Service Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `GET /auth/verify-email` - Verify email address
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/me` - Get current user info
- `PUT /auth/me` - Update current user info

### Book Service Endpoints

- `GET /book` - Get all books
- `GET /book/{id}` - Get book by ID
- `POST /book` - Create a new book
- `PUT /book/{id}` - Update a book
- `DELETE /book/{id}` - Delete a book
- `GET /book/search` - Search books

### Cart Service Endpoints

- `GET /cart` - Get cart contents
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/{itemId}` - Update item quantity
- `DELETE /cart/items/{itemId}` - Remove item from cart
- `DELETE /cart` - Clear cart

## Running Services Individually

Move to each service in this project to get instructions

## Deployment

The application is designed to be deployed using Docker Compose. In future, using Kubernetes for better scalability and management.

## Acknowledgments

- FastAPI for the Python web framework
- Gin for the Go web framework
- MongoDB for databases
- Docker for containerization
