FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create .env file with default values
RUN echo "MONGODB_URL=mongodb://mongodb:27017/bookshop\n\
JWT_SECRET_KEY=your-secret-key-here\n\
JWT_ALGORITHM=HS256\n\
SMTP_SERVER=smtp.gmail.com\n\
SMTP_PORT=587\n\
SENDER_EMAIL=your-email@gmail.com\n\
SENDER_PASSWORD=your-app-password" > .env

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8001

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]