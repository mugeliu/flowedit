#!/usr/bin/env python3
"""
Database initialization script for StyleFlow Backend
"""

from src.database.manager import DatabaseManager
from src.config.settings import settings
from src.config.logger import get_logger

# Setup application logger
logger = get_logger("init_db")


def init_database():
    """Initialize database with required tables"""
    try:
        logger.execution_start("database_initialization_script")
        
        # Create database manager instance
        db_manager = DatabaseManager()
        
        logger.info("Database tables created successfully")
        logger.info(f"Database location: {settings.database_url}")
        
        # Test database connection
        test_task_id = db_manager.create_task(
            original_content="<p>Test content</p>",
            style_requirements={"style_name": "test", "features": []}
        )
        
        logger.info(f"Database test successful! Created test task: {test_task_id[:8]}")
        
        # Clean up test data
        db_manager.update_task(test_task_id, {"status": "completed"})
        
        logger.execution_end("database_initialization_script", True)
        
    except Exception as e:
        logger.execution_end("database_initialization_script", False)
        logger.error(f"Database initialization failed: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    init_database()