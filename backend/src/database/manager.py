import sqlite3
import json
import uuid
import time
from datetime import datetime
from contextlib import contextmanager
from typing import Dict, List, Optional, Any
from src.config.settings import settings
from src.config.logger import get_database_logger


class DatabaseManager:
    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.database_url.replace("sqlite:///", "")
        self.logger = get_database_logger()
        self.init_database()
    
    def init_database(self):
        """Initialize database with required tables"""
        start_time = time.time()
        self.logger.execution_start("database_initialization", db_path=self.db_path)
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Tasks table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS tasks (
                        id TEXT PRIMARY KEY,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        status TEXT CHECK(status IN ('running', 'completed', 'failed')) DEFAULT 'running',
                        original_content TEXT NOT NULL,
                        style_requirements TEXT,
                        final_html TEXT,
                        quality_score REAL,
                        processing_time REAL,
                        error_message TEXT
                    )
                """)
                
                # Agent executions table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS agent_executions (
                        id TEXT PRIMARY KEY,
                        task_id TEXT REFERENCES tasks(id),
                        agent_name TEXT NOT NULL,
                        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        completed_at TIMESTAMP,
                        status TEXT CHECK(status IN ('running', 'completed', 'failed')) DEFAULT 'running',
                        input_data TEXT,
                        output_data TEXT,
                        error_message TEXT,
                        execution_time REAL
                    )
                """)
                
                # Knowledge base table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS knowledge_base (
                        id TEXT PRIMARY KEY,
                        type TEXT NOT NULL,
                        category TEXT NOT NULL,
                        content TEXT NOT NULL,
                        metadata TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        usage_count INTEGER DEFAULT 0
                    )
                """)
                
                # Quality feedback table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS quality_feedback (
                        id TEXT PRIMARY KEY,
                        task_id TEXT REFERENCES tasks(id),
                        quality_score REAL NOT NULL,
                        feedback_data TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                conn.commit()
                
            duration = time.time() - start_time
            self.logger.execution_end("database_initialization", True, duration)
            
        except Exception as e:
            duration = time.time() - start_time
            self.logger.execution_end("database_initialization", False, duration)
            self.logger.error(f"Database initialization failed: {str(e)}", exc_info=True)
            raise
    
    @contextmanager
    def get_connection(self):
        """Get database connection with context manager"""
        start_time = time.time()
        conn = None
        try:
            self.logger.debug("Opening database connection")
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            yield conn
            
        except Exception as e:
            if conn:
                conn.rollback()
                self.logger.error(f"Database operation failed, rolling back: {str(e)}", exc_info=True)
            raise e
        finally:
            if conn:
                conn.close()
                duration = time.time() - start_time
                self.logger.debug(f"Database connection closed", extra_context={'duration_seconds': duration})
    
    def create_task(self, original_content: str, style_requirements: Dict) -> str:
        """Create a new task"""
        task_id = str(uuid.uuid4())
        start_time = time.time()
        
        self.logger.execution_start("create_task", task_id=task_id[:8], content_length=len(original_content))
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO tasks (id, original_content, style_requirements)
                    VALUES (?, ?, ?)
                """, (task_id, original_content, json.dumps(style_requirements)))
                conn.commit()
                
            duration = time.time() - start_time
            self.logger.execution_end("create_task", True, duration, task_id=task_id[:8])
            return task_id
            
        except Exception as e:
            duration = time.time() - start_time
            self.logger.execution_end("create_task", False, duration, task_id=task_id[:8])
            self.logger.error(f"Failed to create task {task_id[:8]}: {str(e)}", exc_info=True)
            raise
    
    def update_task(self, task_id: str, updates: Dict[str, Any]):
        """Update task with new data"""
        start_time = time.time()
        self.logger.execution_start("update_task", task_id=task_id[:8], update_fields=list(updates.keys()))
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                set_clauses = []
                values = []
                
                for key, value in updates.items():
                    if key in ['status', 'final_html', 'quality_score', 'processing_time', 'error_message']:
                        set_clauses.append(f"{key} = ?")
                        if isinstance(value, (dict, list)):
                            values.append(json.dumps(value))
                        else:
                            values.append(value)
                
                if set_clauses:
                    query = f"UPDATE tasks SET {', '.join(set_clauses)} WHERE id = ?"
                    values.append(task_id)
                    cursor.execute(query, values)
                    conn.commit()
                    
                    duration = time.time() - start_time
                    self.logger.execution_end("update_task", True, duration, 
                                            task_id=task_id[:8], fields_updated=len(set_clauses))
                else:
                    self.logger.warning("No valid fields to update", extra_context={'task_id': task_id[:8]})
                    
        except Exception as e:
            duration = time.time() - start_time
            self.logger.execution_end("update_task", False, duration, task_id=task_id[:8])
            self.logger.error(f"Failed to update task {task_id[:8]}: {str(e)}", exc_info=True)
            raise
    
    def get_task(self, task_id: str) -> Optional[Dict]:
        """Get task by ID"""
        start_time = time.time()
        self.logger.debug(f"Retrieving task", extra_context={'task_id': task_id[:8]})
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
                row = cursor.fetchone()
                
                duration = time.time() - start_time
                
                if row:
                    task = dict(row)
                    if task['style_requirements']:
                        task['style_requirements'] = json.loads(task['style_requirements'])
                    self.logger.debug(f"Task retrieved successfully", 
                                    extra_context={'task_id': task_id[:8], 'duration_seconds': duration, 'status': task['status']})
                    return task
                else:
                    self.logger.warning(f"Task not found", extra_context={'task_id': task_id[:8], 'duration_seconds': duration})
                    return None
                    
        except Exception as e:
            duration = time.time() - start_time
            self.logger.error(f"Failed to retrieve task {task_id[:8]}: {str(e)}", 
                            extra_context={'duration_seconds': duration}, exc_info=True)
            raise
    
    def log_agent_execution(self, agent_name: str, task_id: str, 
                           input_data: Dict = None, output_data: Dict = None,
                           status: str = "running", error_message: str = None) -> str:
        """Log agent execution"""
        execution_id = str(uuid.uuid4())
        start_time = time.time()
        
        self.logger.execution_start("log_agent_execution", 
                                  agent_name=agent_name, task_id=task_id[:8], execution_id=execution_id[:8])
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO agent_executions 
                    (id, task_id, agent_name, status, input_data, output_data, error_message)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    execution_id, task_id, agent_name, status,
                    json.dumps(input_data) if input_data else None,
                    json.dumps(output_data) if output_data else None,
                    error_message
                ))
                conn.commit()
                
            duration = time.time() - start_time
            self.logger.execution_end("log_agent_execution", True, duration,
                                    agent_name=agent_name, task_id=task_id[:8], execution_id=execution_id[:8])
            return execution_id
            
        except Exception as e:
            duration = time.time() - start_time
            self.logger.execution_end("log_agent_execution", False, duration,
                                    agent_name=agent_name, task_id=task_id[:8])
            self.logger.error(f"Failed to log agent execution: {str(e)}", exc_info=True)
            raise
    
    def update_agent_execution(self, execution_id: str, 
                              output_data: Dict = None, status: str = None,
                              error_message: str = None, execution_time: float = None):
        """Update agent execution with results"""
        start_time = time.time()
        self.logger.execution_start("update_agent_execution", execution_id=execution_id[:8])
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                updates = []
                values = []
                
                if status:
                    updates.append("status = ?")
                    values.append(status)
                if output_data:
                    updates.append("output_data = ?")
                    values.append(json.dumps(output_data))
                if error_message:
                    updates.append("error_message = ?")
                    values.append(error_message)
                if execution_time is not None:
                    updates.append("execution_time = ?")
                    values.append(execution_time)
                if status in ["completed", "failed"]:
                    updates.append("completed_at = CURRENT_TIMESTAMP")
                
                if updates:
                    query = f"UPDATE agent_executions SET {', '.join(updates)} WHERE id = ?"
                    values.append(execution_id)
                    cursor.execute(query, values)
                    conn.commit()
                    
                    duration = time.time() - start_time
                    self.logger.execution_end("update_agent_execution", True, duration,
                                            execution_id=execution_id[:8], fields_updated=len(updates))
                else:
                    self.logger.warning("No fields to update", extra_context={'execution_id': execution_id[:8]})
                    
        except Exception as e:
            duration = time.time() - start_time
            self.logger.execution_end("update_agent_execution", False, duration, execution_id=execution_id[:8])
            self.logger.error(f"Failed to update agent execution {execution_id[:8]}: {str(e)}", exc_info=True)
            raise
    
    def get_agent_executions(self, task_id: str) -> List[Dict]:
        """Get all agent executions for a task"""
        start_time = time.time()
        self.logger.debug("Retrieving agent executions", extra_context={'task_id': task_id[:8]})
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT * FROM agent_executions 
                    WHERE task_id = ? 
                    ORDER BY started_at
                """, (task_id,))
                rows = cursor.fetchall()
                
                executions = []
                for row in rows:
                    execution = dict(row)
                    if execution['input_data']:
                        execution['input_data'] = json.loads(execution['input_data'])
                    if execution['output_data']:
                        execution['output_data'] = json.loads(execution['output_data'])
                    executions.append(execution)
                
                duration = time.time() - start_time
                self.logger.debug(f"Retrieved {len(executions)} agent executions", 
                                extra_context={'task_id': task_id[:8], 'duration_seconds': duration, 'execution_count': len(executions)})
                
                return executions
                
        except Exception as e:
            duration = time.time() - start_time
            self.logger.error(f"Failed to retrieve agent executions for task {task_id[:8]}: {str(e)}", 
                            extra_context={'duration_seconds': duration}, exc_info=True)
            raise
    
    def save_knowledge(self, knowledge_type: str, category: str, content: Dict, metadata: Dict = None):
        """Save knowledge to knowledge base"""
        knowledge_id = str(uuid.uuid4())
        start_time = time.time()
        
        self.logger.execution_start("save_knowledge", 
                                  knowledge_type=knowledge_type, category=category, knowledge_id=knowledge_id[:8])
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO knowledge_base (id, type, category, content, metadata)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    knowledge_id, knowledge_type, category,
                    json.dumps(content),
                    json.dumps(metadata) if metadata else None
                ))
                conn.commit()
                
            duration = time.time() - start_time
            self.logger.execution_end("save_knowledge", True, duration,
                                    knowledge_type=knowledge_type, category=category, knowledge_id=knowledge_id[:8])
            return knowledge_id
            
        except Exception as e:
            duration = time.time() - start_time
            self.logger.execution_end("save_knowledge", False, duration, knowledge_id=knowledge_id[:8])
            self.logger.error(f"Failed to save knowledge {knowledge_id[:8]}: {str(e)}", exc_info=True)
            raise
    
    def get_knowledge(self, knowledge_type: str, category: str = None) -> List[Dict]:
        """Get knowledge from knowledge base"""
        start_time = time.time()
        self.logger.debug("Retrieving knowledge", 
                         extra_context={'knowledge_type': knowledge_type, 'category': category})
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                if category:
                    cursor.execute("""
                        SELECT * FROM knowledge_base 
                        WHERE type = ? AND category = ?
                        ORDER BY usage_count DESC
                    """, (knowledge_type, category))
                else:
                    cursor.execute("""
                        SELECT * FROM knowledge_base 
                        WHERE type = ?
                        ORDER BY usage_count DESC
                    """, (knowledge_type,))
                
                rows = cursor.fetchall()
                knowledge_list = []
                for row in rows:
                    knowledge = dict(row)
                    knowledge['content'] = json.loads(knowledge['content'])
                    if knowledge['metadata']:
                        knowledge['metadata'] = json.loads(knowledge['metadata'])
                    knowledge_list.append(knowledge)
                
                duration = time.time() - start_time
                self.logger.debug(f"Retrieved {len(knowledge_list)} knowledge entries", 
                                extra_context={'knowledge_type': knowledge_type, 'category': category, 
                                             'duration_seconds': duration, 'result_count': len(knowledge_list)})
                
                return knowledge_list
                
        except Exception as e:
            duration = time.time() - start_time
            self.logger.error(f"Failed to retrieve knowledge: {str(e)}", 
                            extra_context={'knowledge_type': knowledge_type, 'category': category, 'duration_seconds': duration}, 
                            exc_info=True)
            raise
    
    def record_quality_feedback(self, task_id: str, quality_score: float, feedback_data: Dict):
        """Record quality feedback"""
        feedback_id = str(uuid.uuid4())
        start_time = time.time()
        
        self.logger.execution_start("record_quality_feedback", 
                                  task_id=task_id[:8], quality_score=quality_score, feedback_id=feedback_id[:8])
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO quality_feedback (id, task_id, quality_score, feedback_data)
                    VALUES (?, ?, ?, ?)
                """, (feedback_id, task_id, quality_score, json.dumps(feedback_data)))
                conn.commit()
                
            duration = time.time() - start_time
            self.logger.execution_end("record_quality_feedback", True, duration,
                                    task_id=task_id[:8], quality_score=quality_score, feedback_id=feedback_id[:8])
            return feedback_id
            
        except Exception as e:
            duration = time.time() - start_time
            self.logger.execution_end("record_quality_feedback", False, duration, 
                                    task_id=task_id[:8], feedback_id=feedback_id[:8])
            self.logger.error(f"Failed to record quality feedback {feedback_id[:8]}: {str(e)}", exc_info=True)
            raise