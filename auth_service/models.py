from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum

# ===== USER MODELS =====

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class UserBase(BaseModel):
    """Base user model with common fields"""
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    gender: str
    date_of_birth: str  # Format: YYYY-MM-DD
    
    @field_validator('date_of_birth')
    def validate_date_format(cls, v):
        """Validate date format is YYYY-MM-DD"""
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

class UserCreate(UserBase):
    """Model for user registration"""
    password: str

class UserLogin(BaseModel):
    """Model for user login (email/username and password)"""
    email: str  # Can be either email or username
    password: str

class UserResponse(UserBase):
    """Model for user response data"""
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime

# ===== TOKEN MODELS =====

class Token(BaseModel):
    """Model for access token response"""
    access_token: str
    token_type: str
    expires_in: int

# ===== PASSWORD RESET MODELS =====

class PasswordReset(BaseModel):
    """Model for password reset request"""
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    """Model for password reset confirmation"""
    token: str
    new_password: str
