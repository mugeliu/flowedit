from typing import List, Dict, Optional
from typing_extensions import TypedDict
from enum import Enum
from pydantic import BaseModel


class WorkflowType(Enum):
    CREATE_NEW_STYLE = "create_new_style"
    USE_EXISTING_STYLE = "use_existing_style"
    ADJUST_STYLE = "adjust_style"


class ContentElement(TypedDict):
    type: str  # 'h1', 'h2', 'p', 'em', 'li', etc.
    content: str
    level: int


class StyleDNA(TypedDict):
    theme_name: str
    h1_styles: Dict[str, str]
    h2_styles: Dict[str, str]
    p_styles: Dict[str, str]
    em_styles: Dict[str, str]
    li_styles: Dict[str, str]
    section_styles: Dict[str, str]


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
    raw_content: str
    theme_name: str
    theme_description: str


class UseStyleRequest(BaseModel):
    raw_content: str
    theme_name: str


class AdjustStyleRequest(BaseModel):
    theme_name: str
    adjustment_request: str


class StyleResponse(BaseModel):
    html_content: str
    style_dna: StyleDNA
    theme_name: str
    is_valid: bool
    errors: List[str]


class ContentStructure(BaseModel):
    elements: List[ContentElement]