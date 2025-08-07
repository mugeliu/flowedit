from typing import List, Dict, Optional, Any
from typing_extensions import TypedDict, NotRequired
from enum import Enum
from pydantic import BaseModel


class WorkflowType(Enum):
    CREATE_NEW_STYLE = "create_new_style"
    USE_EXISTING_STYLE = "use_existing_style"
    ADJUST_STYLE = "adjust_style"


class ContentElement(TypedDict):
    type: str                    # 必需：'h1', 'h2', 'p', 'em', 'li', 'ul', 'ol' 等
    content: NotRequired[str]    # 可选：文本内容，某些类型可能为空
    level: NotRequired[int]      # 可选：标题层次或重要程度


# 使用灵活的字典类型，无需预定义所有字段
StyleDNA = Dict[str, Any]  # 完全动态的样式配置


class WorkflowState(TypedDict):
    # Input
    raw_content: str
    workflow_type: WorkflowType
    theme_name: Optional[str]
    theme_description: Optional[str]
    adjustment_request: Optional[str]
    
    # Processed Data
    parsed_content: List[ContentElement]
    style_dna: Optional[StyleDNA]
    generated_html: Optional[str]
    validation_errors: List[str]
    
    # Control Flow
    retry_count: int
    is_valid: bool


# Pydantic models for API requests/responses
class CreateStyleRequest(BaseModel):
    theme_name: str
    theme_description: str


class UseStyleRequest(BaseModel):
    raw_content: str
    theme_name: str


class AdjustStyleRequest(BaseModel):
    theme_name: str
    adjustment_request: str


class StyleResponse(BaseModel):
    style_dna: StyleDNA
    theme_name: str
    is_valid: bool
    errors: List[str]


class ContentStructure(BaseModel):
    elements: List[ContentElement]