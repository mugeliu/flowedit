#!/usr/bin/env python3
"""
Database initialization script for StyleFlow Backend
"""

from src.database.manager import DatabaseManager
from src.config.settings import settings
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_database():
    """Initialize database with required tables"""
    try:
        logger.info("Initializing StyleFlow database...")
        
        # Create database manager instance
        db_manager = DatabaseManager()
        
        logger.info("Database tables created successfully!")
        logger.info(f"Database location: {settings.database_url}")
        
        # Test database connection
        test_task_id = db_manager.create_task(
            original_content="<p>Test content</p>",
            style_requirements={"style_name": "test", "features": []}
        )
        
        logger.info(f"Database test successful! Created test task: {test_task_id}")
        
        # Clean up test data
        db_manager.update_task(test_task_id, {"status": "completed"})
        
        logger.info("Database initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


if __name__ == "__main__":
    init_database()