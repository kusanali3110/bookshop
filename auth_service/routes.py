from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import HTMLResponse
from database import db
from security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
    create_email_token,
    verify_email_token,
    create_password_reset_token,
    verify_password_reset_token
)
from models import (
    UserCreate,
    UserLogin,
    Token,
    UserResponse,
    PasswordReset,
    PasswordResetConfirm
)
from email_service import email_service
import logging
from datetime import datetime
from bson import ObjectId
import asyncio

# Configure logging
logger = logging.getLogger(__name__)
router = APIRouter()

# ===== API ROUTES =====

@router.get("/")
async def get_routes():
    """Return information about available endpoints"""
    return {
        "service": "Authentication Service",
        "version": "1.0.0",
        "endpoints": [
            {"method": "POST", "path": "/register", "description": "Register a new user"},
            {"method": "POST", "path": "/login", "description": "Login with email and password"},
            {"method": "GET", "path": "/verify-email", "description": "Verify email address"},
            {"method": "POST", "path": "/forgot-password", "description": "Request password reset"},
            {"method": "POST", "path": "/reset-password", "description": "Reset password"},
            {"method": "GET", "path": "/me", "description": "Get current user info"},
            {"method": "PUT", "path": "/me", "description": "Update current user info"}
        ]
    }

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user and send verification email"""
    try:
        # Check if user exists
        if db.users_collection.find_one({"$or": [
            {"username": user.username},
            {"email": user.email}
        ]}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already exists"
            )

        # Parse date_of_birth
        try:
            date_of_birth = datetime.strptime(user.date_of_birth, '%Y-%m-%d')
        except ValueError as date_error:
            logger.error(f"Date parsing error: {str(date_error)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid date format. Expected YYYY-MM-DD, got {user.date_of_birth}"
            )

        # Create new user
        user_data = {
            "username": user.username,
            "email": user.email,
            "password_hash": hash_password(user.password),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "gender": user.gender,
            "date_of_birth": date_of_birth,
            "created_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": False,  # Set to False by default
            "provider": "local"
        }
        
        # Insert user into database
        result = db.users_collection.insert_one(user_data)
        user_id = str(result.inserted_id)
        user_data["id"] = user_id
        
        # Create verification token with user ID
        verification_token = create_email_token({"sub": user.email, "user_id": user_id})
        
        # Convert date_of_birth back to string for UserResponse
        user_data["date_of_birth"] = user_data["date_of_birth"].strftime('%Y-%m-%d')
        
        # Send verification email in the background
        try:
            asyncio.create_task(email_service.send_verification_email(user.email, verification_token, user_id))
            logger.info(f"Verification email task created for: {user.email}")
        except Exception as email_error:
            logger.error(f"Failed to create email task: {str(email_error)}")
            # Continue with registration even if email fails
        
        logger.info(f"User registered successfully: {user.username}")
        return UserResponse(**user_data)
    except ValueError as ve:
        logger.error(f"Validation error during registration: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(ve)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    """Login with email/username and password"""
    try:
        # Check if the login identifier is an email or username
        if "@" in user.email:  # Assume it's an email if it contains @
            user_data = db.users_collection.find_one({"email": user.email})
        else:  # Otherwise assume it's a username
            user_data = db.users_collection.find_one({"username": user.email})
            
        if not user_data or not verify_password(user.password, user_data["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not user_data["is_verified"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified"
            )
        
        # Create access token
        access_token = create_access_token({"sub": user_data["email"]})
        logger.info(f"User logged in successfully: {user_data['email']}")
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=1800  # 30 minutes
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during login"
        )

@router.get("/verify-email", response_class=HTMLResponse)
async def verify_email(user_id: str, token: str):
    """Verify email address with HTML response"""
    try:
        # Verify token
        payload = verify_email_token(token)
        token_email = payload.get("sub")
        token_user_id = payload.get("user_id")
        
        # Check if token is valid
        if not token_email or not token_user_id:
            return HTMLResponse(
                content="""
                <html>
                    <head>
                        <title>Email Verification Failed</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                margin-top: 50px;
                                color: #d32f2f;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                border: 1px solid #ddd;
                                border-radius: 5px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Email Verification Failed</h1>
                            <p>Invalid verification token. Please try again or contact support.</p>
                        </div>
                    </body>
                </html>
                """,
                status_code=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if user ID matches
        if token_user_id != user_id:
            return HTMLResponse(
                content="""
                <html>
                    <head>
                        <title>Email Verification Failed</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                margin-top: 50px;
                                color: #d32f2f;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                border: 1px solid #ddd;
                                border-radius: 5px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Email Verification Failed</h1>
                            <p>Invalid verification link. Please try again or contact support.</p>
                        </div>
                    </body>
                </html>
                """,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Update user verification status
        result = db.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_verified": True}}
        )
        
        # Check if user was found and updated
        if result.modified_count == 0:
            return HTMLResponse(
                content="""
                <html>
                    <head>
                        <title>Email Verification Failed</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                margin-top: 50px;
                                color: #d32f2f;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                border: 1px solid #ddd;
                                border-radius: 5px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Email Verification Failed</h1>
                            <p>User not found. Please try again or contact support.</p>
                        </div>
                    </body>
                </html>
                """,
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Return success page
        return HTMLResponse(
            content="""
            <html>
                <head>
                    <title>Email Verified</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            margin-top: 50px;
                            color: #388e3c;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                        }
                        .btn {
                            display: inline-block;
                            background-color: #4caf50;
                            color: white;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Email Verified Successfully</h1>
                        <p>Your email has been verified. You can now login to your account.</p>
                    </div>
                </body>
            </html>
            """
        )
    except Exception as e:
        logger.error(f"Email verification error: {e}")
        return HTMLResponse(
            content="""
            <html>
                <head>
                    <title>Email Verification Failed</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            margin-top: 50px;
                            color: #d32f2f;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Email Verification Failed</h1>
                        <p>An error occurred during email verification. Please try again or contact support.</p>
                    </div>
                </body>
            </html>
            """,
            status_code=status.HTTP_400_BAD_REQUEST
        )

@router.post("/forgot-password")
async def forgot_password(reset_request: PasswordReset):
    """Request password reset"""
    try:
        # Find user by email
        user = db.users_collection.find_one({"email": reset_request.email})
        if not user:
            # Don't reveal if email exists
            return {"message": "If the email exists, a password reset link has been sent"}
        
        # Create password reset token
        reset_token = create_password_reset_token({"sub": reset_request.email})
        
        # Send password reset email
        await email_service.send_password_reset_email(reset_request.email, reset_token)
        
        return {"message": "If the email exists, a password reset link has been sent"}
    except Exception as e:
        logger.error(f"Password reset request error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing password reset request"
        )

@router.post("/reset-password")
async def reset_password(reset_data: PasswordResetConfirm):
    """Reset password with token"""
    try:
        # Verify token
        payload = verify_password_reset_token(reset_data.token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token"
            )
        
        # Update password
        result = db.users_collection.update_one(
            {"email": email},
            {"$set": {"password_hash": hash_password(reset_data.new_password)}}
        )
        
        # Check if user was found and updated
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "Password reset successfully"}
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to reset password"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(request: Request):
    """Get current user information"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        # Extract and verify token
        token = auth_header.split(" ")[1]
        token_data = verify_token(token)
        
        # Find user by email
        user = db.users_collection.find_one({"email": token_data["sub"]})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Convert _id to string id
        user["id"] = str(user["_id"])
        
        # Convert date_of_birth from datetime to string
        if isinstance(user["date_of_birth"], datetime):
            user["date_of_birth"] = user["date_of_birth"].strftime('%Y-%m-%d')
        
        return UserResponse(**user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user information"
        )

@router.put("/me", response_model=UserResponse)
async def update_current_user(request: Request, user_update: dict):
    """Update current user information"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        # Extract and verify token
        token = auth_header.split(" ")[1]
        token_data = verify_token(token)
        
        # Find user by email
        user = db.users_collection.find_one({"email": token_data["sub"]})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update allowed fields
        allowed_fields = ["first_name", "last_name", "gender", "date_of_birth"]
        update_data = {k: v for k, v in user_update.items() if k in allowed_fields}
        
        # Validate date_of_birth if provided
        if "date_of_birth" in update_data:
            try:
                datetime.strptime(update_data["date_of_birth"], '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date format. Expected YYYY-MM-DD"
                )
        
        # Update user in database
        result = db.users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes made to profile"
            )
        
        # Get updated user
        updated_user = db.users_collection.find_one({"_id": user["_id"]})
        updated_user["id"] = str(updated_user["_id"])
        
        # Convert date_of_birth from datetime to string
        if isinstance(updated_user["date_of_birth"], datetime):
            updated_user["date_of_birth"] = updated_user["date_of_birth"].strftime('%Y-%m-%d')
        
        return UserResponse(**updated_user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user profile"
        )

