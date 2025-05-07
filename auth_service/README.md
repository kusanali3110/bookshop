# Auth Service

The Auth Service is responsible for user authentication and authorization in the BookShop application. It provides endpoints for user registration, login, email verification, password reset, and profile management.

## Features

- User registration with email verification
- JWT-based authentication
- Email verification
- Password reset functionality
- User profile management

## API Endpoints

| Method | Endpoint | Description | Authorization | Request Body | Response |
|--------|----------|-------------|---------------|--------------|---------|
| GET | `/` | Get service information | - | - | Service info |
| POST | `/register` | Register a new user | - | `{"username": "string", "email": "string", "password": "string", "first_name": "string", "last_name": "string", "gender": "string", "date_of_birth": "YYYY-MM-DD"}` | User info |
| POST | `/login` | Login with email/username and password | - | `{"email": "string", "password": "string"}` | Access token |
| POST | `/verify-email` | Verify email address | - | `{"user_id": "string", "token": "string"}` | Verification status |
| POST | `/forgot-password` | Request password reset | - | `{"email": "string"}` | Reset instructions |
| POST | `/reset-password` | Reset password with token | - | `{"token": "string", "new_password": "string"}` | Reset status |
| GET | `/me` | Get current user info | Bearer Token | - | User profile |
| PUT | `/me` | Update current user info | Bearer Token | `{"first_name": "string", "last_name": "string", "gender": "string", "date_of_birth": "YYYY-MM-DD"}` | Updated user profile |

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
export MONGODB_URL=mongodb://mongodb:27017/bookshop
export JWT_SECRET=your_jwt_secret
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your_email@gmail.com
export SMTP_PASSWORD=your_app_password
```

3. Run the service:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## Docker

Adjust environment variables in docker-compose.yml file.
Build and run the service using Docker:

```bash
docker-compose up -d
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URL | MongoDB connection URL | mongodb://localhost:27017 |
| JWT_SECRET | Secret key for JWT tokens | - |
| SMTP_HOST | SMTP server host | - |
| SMTP_PORT | SMTP server port | - |
| SMTP_USER | SMTP username | - |
| SMTP_PASSWORD | SMTP password | - |

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Email verification is required for account activation
- Password reset tokens expire after 1 hour
- CORS is enabled for all origins

## Error Handling

The service uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include a detail message explaining the error.

## Integration with Other Services

The Auth Service integrates with:

- Book Service: Provides user authentication for book operations
- Cart Service: Provides user authentication for cart operations
- API Gateway: Routes authentication requests to this service

## Development

### Project Structure

```
auth_service/
├── main.py              # FastAPI application
├── routes.py            # API endpoints
├── models.py            # Data models
├── database.py          # Database connection
├── security.py          # Security utilities
├── email_service.py     # Email service
├── requirements.txt     # Dependencies
└── README.md           # Documentation
```

### Adding New Features

1. Define new models in `models.py`
2. Add new routes in `routes.py`
3. Update security utilities in `security.py` if needed
4. Update email templates in `email_service.py` if needed
5. Update documentation in `README.md` 