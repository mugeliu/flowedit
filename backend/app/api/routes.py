from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import logging
from typing import Dict, Any

from app.models.schemas import ProcessRequest, ProcessResponse, HealthResponse
from app.services.ai_service import AIService
from app.utils.exceptions import AIServiceError, ValidationError
from app.config.settings import settings


# 设置日志
logger = logging.getLogger(__name__)

# 创建路由器
router = APIRouter()

# 创建AI服务实例
ai_service = AIService()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """
    健康检查端点
    
    返回服务的当前状态和版本信息
    """
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat()
    )


@router.post("/process", response_model=ProcessResponse, tags=["Process"])
async def process_content(request: ProcessRequest) -> ProcessResponse:
    """
    处理用户内容的核心端点
    
    接收用户内容和提示词，通过AI模型处理后返回结果
    
    Args:
        request: 包含内容、用户提示词、内容类型等信息的请求对象
        
    Returns:
        ProcessResponse: 包含处理结果或错误信息的响应对象
        
    Raises:
        HTTPException: 当处理失败时抛出相应的HTTP异常
    """
    try:
        logger.info(f"Processing request - content_type: {request.content_type}, "
                   f"content_length: {len(request.content)}, "
                   f"model: {request.model or settings.default_model}")
        
        # 验证请求
        if not request.content.strip():
            raise ValidationError("Content cannot be empty")
            
        if not request.user_prompt.strip():
            raise ValidationError("User prompt cannot be empty")
        
        # 调用AI服务处理内容
        result = await ai_service.process_content(
            content=request.content,
            user_prompt=request.user_prompt,
            content_type=request.content_type.value,
            model=request.model
        )
        
        logger.info(f"Processing completed successfully - tokens_used: {result.get('tokens_used', 'N/A')}")
        
        return ProcessResponse(
            success=True,
            data=result
        )
        
    except ValidationError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
        
    except AIServiceError as e:
        logger.error(f"AI service error: {str(e)}")
        return ProcessResponse(
            success=False,
            error=f"AI service error: {str(e)}"
        )
        
    except Exception as e:
        logger.exception(f"Unexpected error processing content: {str(e)}")
        return ProcessResponse(
            success=False,
            error=f"Internal server error: {str(e)}"
        )


@router.get("/status", tags=["Status"])
async def get_status() -> Dict[str, Any]:
    """
    获取服务状态详情
    
    返回更详细的服务状态信息，包括配置和性能指标
    """
    return {
        "service": "FlowEdit Backend",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
        "config": {
            "default_model": settings.default_model,
            "max_tokens": settings.max_tokens,
            "temperature": settings.temperature,
            "debug_mode": settings.debug
        },
        "features": {
            "models_available": ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
            "content_types": ["text", "html"],
            "system_prompt": "Built-in system prompt active"
        }
    }