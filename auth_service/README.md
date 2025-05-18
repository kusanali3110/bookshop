# Authentication Service

User authentication and management service for the Bookshop system.

## Features

- User registration
- Login with email/username and password
- Email verification
- Password reset functionality
- User profile management
- Security with JWT and Cookies

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string",
  "gender": "string",
  "date_of_birth": "YYYY-MM-DD"
}
```

#### POST /auth/login
Login with email/username and password
```json
// Request (x-www-form-urlencoded)
username: string
password: string

// Response
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "username": "string",
    "first_name": "string",
    "last_name": "string",
    "is_active": boolean,
    "is_verified": boolean,
    "created_at": "string",
    "updated_at": "string"
  }
}
// Cookie: token=<jwt_token>
```

#### GET /auth/verify-email
Verify email with token
```
Query params:
- user_id: string
- token: string
```

#### POST /auth/forgot-password
Request password reset
```json
{
  "email": "string"
}
```

#### POST /auth/reset-password
Reset password with token
```json
{
  "token": "string",
  "new_password": "string"
}
```

### User Management

#### GET /auth/me
Get current user information
```json
// Response
{
  "id": "string",
  "email": "string",
  "username": "string",
  "first_name": "string",
  "last_name": "string",
  "gender": "string",
  "date_of_birth": "YYYY-MM-DD",
  "is_active": boolean,
  "is_verified": boolean,
  "created_at": "string",
  "updated_at": "string"
}
```

#### PUT /auth/me
Update user information
```json
{
  "first_name": "string",
  "last_name": "string",
  "gender": "string",
  "date_of_birth": "YYYY-MM-DD"
}
```

## Security

### JWT Token
- Uses JWT for user authentication
- Token stored in cookie with security flags:
  - `httponly`: Prevents JavaScript access to cookie
  - `secure`: Only sends cookie over HTTPS
  - `samesite`: CSRF protection
- Token expiration: 30 minutes

### Password
- Passwords are hashed using bcrypt
- Email verification required before login
- Password reset functionality available

## Installation

1. Clone repository
2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```env
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
MONGODB_URI=your-mongodb-uri
SMTP_HOST=your-smtp-host
SMTP_PORT=your-smtp-port
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

4. Run service:
```bash
uvicorn main:app --reload
```

## Docker

Build and run with Docker:
```bash
docker build -t auth-service .
docker run -p 8000:8000 auth-service
```

Or use docker-compose:
```bash
docker-compose up -d
```

## Testing

### Postman
1. Login:
```
POST http://localhost:8000/auth/login
Content-Type: application/x-www-form-urlencoded

username=your_email@example.com
password=your_password
```

2. Check authentication:
```
GET http://localhost:8000/auth/me
```

Cookie will be automatically sent in subsequent requests.

## Notes
- Ensure proper CORS configuration for frontend
- Use HTTPS in production environment
- Change JWT_SECRET_KEY in production environment

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