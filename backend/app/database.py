"""
MongoDB database connection and management using Motor (async driver).
"""
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class MongoDB:
    """MongoDB connection manager using Motor async driver."""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
    
    async def connect(self):
        """Establish connection to MongoDB."""
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URI)
            self.db = self.client[settings.MONGODB_DB_NAME]
            
            # Verify connection by pinging the database
            await self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB database: {settings.MONGODB_DB_NAME}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    async def ping(self):
        """Ping MongoDB to verify connection is alive."""
        if not self.client:
            raise Exception("Database client not initialized")
        
        await self.client.admin.command('ping')
        return True
    
    def get_collection(self, collection_name: str):
        """Get a collection from the database."""
        if not self.db:
            raise Exception("Database not initialized")
        return self.db[collection_name]


# Create global MongoDB instance
mongodb = MongoDB()