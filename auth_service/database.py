import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class Database:
    client = None
    db = None
    users_collection = None

    @classmethod
    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        reraise=True
    )
    def connect_db(cls):
        """Connect to MongoDB with retry logic"""
        try:
            # Use the MONGODB_URL from environment variables
            mongodb_url = os.getenv("MONGODB_URL")
            if not mongodb_url:
                logger.warning("MONGODB_URL environment variable not set, using default")
                mongodb_url = "mongodb://mongodb:27017/bookshop"
            
            logger.info(f"Connecting to MongoDB at {mongodb_url}")
            
            cls.client = MongoClient(mongodb_url, serverSelectionTimeoutMS=5000)
            # Test the connection
            cls.client.admin.command('ping')
            
            cls.db = cls.client.get_database()
            cls.users_collection = cls.db.users_collection
            
            logger.info("Successfully connected to MongoDB")
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error connecting to MongoDB: {e}")
            raise

    @classmethod
    def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")

    @classmethod
    def health_check(cls) -> bool:
        try:
            if not cls.client:
                return False
            cls.client.admin.command('ping')
            return True
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False

# Initialize database connection
db = Database()
db.connect_db()