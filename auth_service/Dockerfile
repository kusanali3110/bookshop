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
BASE_URL=http://localhost:8001\n\
jwtSecretKey=your-secret-key-here\n\
JWT_ALGORITHM=HS256\n\
smtpServer=smtp.gmail.com\n\
mtpPort=587\n\
senderEmail=your-email@gmail.com\n\
senderPassword=your-app-password" > .env

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8001

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]