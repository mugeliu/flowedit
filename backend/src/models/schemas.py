from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentExecutionStatus(str, Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class KnowledgeType(str, Enum):
    STYLE = "style"
    PATTERN = "pattern"
    TEMPLATE = "template"


class StyleTransformRequest(BaseModel):
    content: str
    style_name: str
    style_features: List[str] = []


class TaskResponse(BaseModel):
    task_id: str
    status: TaskStatus
    progress: float = 0.0
    result: Optional[str] = None
    error: Optional[str] = None
    estimated_time: Optional[int] = None


class AgentExecutionDetail(BaseModel):
    id: str
    agent_name: str
    status: AgentExecutionStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    input_data: Optional[Dict] = None
    output_data: Optional[Dict] = None
    error_message: Optional[str] = None
    execution_time: Optional[float] = None


class TaskDetails(BaseModel):
    task_id: str
    steps: List[AgentExecutionDetail]
    current_step: str
    quality_report: Optional[Dict] = None


# 全新的AgentState - 专为协作优化设计
class AgentState(BaseModel):
    # 核心标识
    task_id: str
    
    # 输入数据
    original_content: str
    style_requirements: Dict[str, Any]
    
    # Agent协作数据流 - 每个Agent的输出成为下个Agent的输入
    content_analysis_summary: Optional[Dict[str, Any]] = None
    design_tokens: Optional[Dict[str, Any]] = None
    css_rules: Optional[Dict[str, Any]] = None
    generated_html: Optional[str] = None
    quality_score: Optional[float] = None
    quality_report: Optional[Dict[str, Any]] = None
    
    # 协作机制核心
    agent_execution_log: List[Dict[str, Any]] = []  # 每个Agent的执行记录
    intermediate_results: Dict[str, Any] = {}       # 中间结果存储
    collaboration_context: Dict[str, Any] = {}      # Agent间共享上下文信息
    
    # 执行控制
    current_step: str = "initialized"
    iteration_count: int = 0
    retry_count: int = 0
    
    # 错误处理和质量控制
    errors: List[str] = []
    warnings: List[str] = []
    last_error: Optional[str] = None
    quality_checkpoints: List[Dict[str, Any]] = []
    agent_feedback: Dict[str, List[str]] = {}
    
    class Config:
        extra = "allow"  # 允许动态添加字段