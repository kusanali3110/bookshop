from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import List
import os
from pathlib import Path
import logging
import traceback
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import aiosmtplib

logger = logging.getLogger(__name__)

# ===== EMAIL CONFIGURATION =====

# Get email configuration from environment variables
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
MAIL_USERNAME = os.getenv("senderEmail")
MAIL_PASSWORD = os.getenv("senderPassword")
MAIL_FROM = os.getenv("senderEmail")
MAIL_PORT = int(os.getenv("smtpPort", "587"))
MAIL_SERVER = os.getenv("smtpServer", "smtp.gmail.com")
MAIL_FROM_NAME = "Bookshop Auth Service"
MAIL_STARTTLS = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
MAIL_SSL_TLS = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"

# Configure email settings
conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_FROM_NAME=MAIL_FROM_NAME,
    MAIL_STARTTLS=MAIL_STARTTLS,
    MAIL_SSL_TLS=MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
)

# ===== EMAIL TEMPLATES =====

def get_verification_email_template(token: str) -> str:
    """Generate HTML template for email verification"""
    return f"""
    <html>
        <body>
            <h1>Verify Your Email</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="{BASE_URL}/auth/verify-email?token={token}">
                Verify Email
            </a>
            <p>If you did not request this verification, please ignore this email.</p>
        </body>
    </html>
    """

def get_password_reset_template(token: str) -> str:
    """Generate HTML template for password reset"""
    return f"""
    <html>
        <body>
            <h1>Reset Your Password</h1>
            <p>Please click the link below to reset your password:</p>
            <a href="{BASE_URL}/auth/reset-password?token={token}">
                Reset Password
            </a>
            <p>If you did not request this password reset, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
        </body>
    </html>
    """

# ===== EMAIL SENDING FUNCTIONS =====

async def send_verification_email(email: EmailStr, token: str) -> bool:
    """Send verification email to user"""
    try:
        message = MessageSchema(
            subject="Verify Your Email",
            recipients=[email],
            body=get_verification_email_template(token),
            subtype="html"
        )
        
        fm = FastMail(conf)
        await fm.send_message(message)
        return True
    except Exception as e:
        logger.error(f"Error sending verification email: {str(e)}")
        return False

async def send_password_reset_email(email: EmailStr, token: str) -> bool:
    """Send password reset email to user"""
    try:
        message = MessageSchema(
            subject="Reset Your Password",
            recipients=[email],
            body=get_password_reset_template(token),
            subtype="html"
        )
        
        fm = FastMail(conf)
        await fm.send_message(message)
        return True
    except Exception as e:
        logger.error(f"Error sending password reset email: {str(e)}")
        return False

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("smtpServer", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("smtpPort", "587"))
        self.sender_email = os.getenv("senderEmail")
        self.sender_password = os.getenv("senderPassword")
        self.from_name = "Bookshop Authentication Service"
        
        if not all([self.sender_email, self.sender_password]):
            logger.warning("Email configuration is missing. Email functionality will be disabled.")
            self.enabled = False
        else:
            self.enabled = True
            logger.info(f"Email service initialized with {self.sender_email}")

    async def _send_email(self, recipient: str, subject: str, body: str) -> None:
        if not self.enabled:
            logger.warning(f"Email service is disabled. Would have sent to {recipient}: {subject}")
            return
            
        try:
            message = MessageSchema(
                subject=subject,
                recipients=[recipient],
                body=body,
                subtype="html"
            )
            
            fm = FastMail(conf)
            await fm.send_message(message)
            logger.info(f"Email sent successfully to {recipient}")
        except Exception as e:
            error_details = traceback.format_exc()
            logger.error(f"Failed to send email: {str(e)}\n{error_details}")
            # Don't raise the exception, just log it
            # This allows the application to continue even if email fails

    async def send_verification_email(self, recipient: str, token: str, user_id: str) -> None:
        verification_url = f"{BASE_URL}/api/auth/verify-email?user_id={user_id}&token={token}"
        subject = "Verify Your Email"
        body = f"""
        <html>
            <body>
                <h2>Welcome to BookShop!</h2>
                <p>Please click the link below to verify your email address:</p>
                <p><a href="{verification_url}">Verify Email</a></p>
                <p>If you did not create an account, please ignore this email.</p>
                <p>This link will expire in 24 hours.</p>
            </body>
        </html>
        """
        await self._send_email(recipient, subject, body)

    async def send_password_reset_email(self, recipient: str, token: str) -> None:
        reset_url = f"{BASE_URL}/api/auth/reset-password?token={token}"
        subject = "Password Reset Request"
        body = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password. Click the link below to proceed:</p>
                <p><a href="{reset_url}">Reset Password</a></p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
            </body>
        </html>
        """
        await self._send_email(recipient, subject, body)

# Create a singleton instance
email_service = EmailService() 