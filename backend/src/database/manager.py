import sqlite3
import json
import uuid
from datetime import datetime
from contextlib import contextmanager
from typing import Dict, List, Optional, Any
from src.config.settings import settings


class DatabaseManager:
    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.database_url.replace("sqlite:///", "")
        self.init_database()
    
    def init_database(self):
        """Initialize database with required tables"""
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
    
    @contextmanager
    def get_connection(self):
        """Get database connection with context manager"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def create_task(self, original_content: str, style_requirements: Dict) -> str:
        """Create a new task"""
        task_id = str(uuid.uuid4())
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO tasks (id, original_content, style_requirements)
                VALUES (?, ?, ?)
            """, (task_id, original_content, json.dumps(style_requirements)))
            conn.commit()
        return task_id
    
    def update_task(self, task_id: str, updates: Dict[str, Any]):
        """Update task with new data"""
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
    
    def get_task(self, task_id: str) -> Optional[Dict]:
        """Get task by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            row = cursor.fetchone()
            if row:
                task = dict(row)
                if task['style_requirements']:
                    task['style_requirements'] = json.loads(task['style_requirements'])
                return task
            return None
    
    def log_agent_execution(self, agent_name: str, task_id: str, 
                           input_data: Dict = None, output_data: Dict = None,
                           status: str = "running", error_message: str = None) -> str:
        """Log agent execution"""
        execution_id = str(uuid.uuid4())
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
        return execution_id
    
    def update_agent_execution(self, execution_id: str, 
                              output_data: Dict = None, status: str = None,
                              error_message: str = None, execution_time: float = None):
        """Update agent execution with results"""
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
    
    def get_agent_executions(self, task_id: str) -> List[Dict]:
        """Get all agent executions for a task"""
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
            
            return executions
    
    def save_knowledge(self, knowledge_type: str, category: str, content: Dict, metadata: Dict = None):
        """Save knowledge to knowledge base"""
        knowledge_id = str(uuid.uuid4())
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
        return knowledge_id
    
    def get_knowledge(self, knowledge_type: str, category: str = None) -> List[Dict]:
        """Get knowledge from knowledge base"""
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
            
            return knowledge_list
    
    def record_quality_feedback(self, task_id: str, quality_score: float, feedback_data: Dict):
        """Record quality feedback"""
        feedback_id = str(uuid.uuid4())
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO quality_feedback (id, task_id, quality_score, feedback_data)
                VALUES (?, ?, ?, ?)
            """, (feedback_id, task_id, quality_score, json.dumps(feedback_data)))
            conn.commit()
        return feedback_id