from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum


class ContentType(str, Enum):
    TEXT = "text"
    HTML = "html"


class ProcessRequest(BaseModel):
    content: str = Field(..., description="用户输入的文本或HTML内容")
    user_prompt: str = Field(..., description="用户自定义提示词")
    content_type: ContentType = Field(default=ContentType.TEXT, description="内容类型：text或html")
    model: Optional[str] = Field(default=None, description="指定使用的AI模型，如gpt-4o-mini")


class ProcessResponse(BaseModel):
    success: bool = Field(..., description="处理是否成功")
    data: Optional[dict] = Field(default=None, description="处理结果数据")
    error: Optional[str] = Field(default=None, description="错误信息")


class ProcessResult(BaseModel):
    processed_content: str = Field(..., description="处理后的内容")
    model_used: str = Field(..., description="使用的AI模型")
    tokens_used: Optional[int] = Field(default=None, description="消耗的token数量")
    processing_time: float = Field(..., description="处理耗时（秒）")


class HealthResponse(BaseModel):
    status: str = Field(..., description="服务状态")
    version: str = Field(..., description="服务版本")
    timestamp: str = Field(..., description="检查时间")