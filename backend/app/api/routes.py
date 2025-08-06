from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from ..models.schemas import (
    CreateStyleRequest, UseStyleRequest, AdjustStyleRequest, 
    StyleResponse, WorkflowType, WorkflowState
)
from ..core.workflow import create_style_workflow
from ..core.exceptions import StyleGenerationError, WeChatComplianceError, ContentParsingError
from ..services.style_dna_service import StyleDNAService
from ..db.database import get_db
from ..utils.monitor import monitor_workflow, workflow_monitor


router = APIRouter()

# 延迟创建工作流实例，避免在模块导入时初始化
_workflow = None

def get_workflow():
    """获取或创建工作流实例"""
    global _workflow
    if _workflow is None:
        _workflow = create_style_workflow()
    return _workflow


@monitor_workflow
def execute_style_workflow(workflow_type_str: str, initial_state: dict):
    """执行风格生成工作流"""
    workflow = get_workflow()
    return workflow.invoke(initial_state)


@router.post("/v1/styles/create", response_model=StyleResponse)
async def create_new_style(request: CreateStyleRequest, db: Session = Depends(get_db)):
    """创建新风格并生成HTML"""
    try:
        initial_state = {
            "raw_content": request.raw_content,
            "workflow_type": WorkflowType.CREATE_NEW_STYLE,
            "theme_name": request.theme_name,
            "theme_description": request.theme_description,
            "retry_count": 0,
            "parsed_content": [],
            "style_dna": None,
            "generated_html": None,
            "validation_errors": [],
            "is_valid": False
        }
        
        result = execute_style_workflow(
            WorkflowType.CREATE_NEW_STYLE.value, 
            initial_state
        )
        
        if not result.get("is_valid", False):
            raise HTTPException(
                status_code=400, 
                detail=result.get("validation_errors", ["生成的HTML不符合微信规范"])
            )
        
        # 保存风格DNA到数据库
        style_service = StyleDNAService(db)
        style_service.create_style_dna(
            request.theme_name,
            result["style_dna"]
        )
        
        return StyleResponse(
            html_content=result["generated_html"],
            style_dna=result["style_dna"],
            theme_name=result["style_dna"]["theme_name"],
            is_valid=result["is_valid"],
            errors=result.get("validation_errors", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")


@router.post("/v1/styles/apply", response_model=StyleResponse)
async def apply_existing_style(request: UseStyleRequest, db: Session = Depends(get_db)):
    """使用已有风格生成HTML"""
    try:
        # 检查风格是否存在
        style_service = StyleDNAService(db)
        existing_style = style_service.get_style_dna(request.theme_name)
        
        if not existing_style:
            raise HTTPException(
                status_code=404,
                detail=f"未找到风格主题: {request.theme_name}"
            )
        
        initial_state = {
            "raw_content": request.raw_content,
            "workflow_type": WorkflowType.USE_EXISTING_STYLE,
            "theme_name": request.theme_name,
            "retry_count": 0,
            "parsed_content": [],
            "style_dna": None,
            "generated_html": None,
            "validation_errors": [],
            "is_valid": False
        }
        
        result = execute_style_workflow(
            WorkflowType.USE_EXISTING_STYLE.value,
            initial_state
        )
        
        return StyleResponse(
            html_content=result["generated_html"],
            style_dna=result["style_dna"],
            theme_name=result["style_dna"]["theme_name"],
            is_valid=result.get("is_valid", True),
            errors=result.get("validation_errors", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")


@router.post("/v1/styles/adjust", response_model=StyleResponse)
async def adjust_style(request: AdjustStyleRequest, db: Session = Depends(get_db)):
    """调整已有风格并生成HTML"""
    try:
        # 检查风格是否存在
        style_service = StyleDNAService(db)
        existing_style = style_service.get_style_dna(request.theme_name)
        
        if not existing_style:
            raise HTTPException(
                status_code=404,
                detail=f"未找到风格主题: {request.theme_name}"
            )
        
        initial_state = {
            "raw_content": "",  # 调整风格时不需要内容
            "workflow_type": WorkflowType.ADJUST_STYLE,
            "theme_name": request.theme_name,
            "adjustment_request": request.adjustment_request,
            "style_dna": existing_style,
            "retry_count": 0,
            "parsed_content": [],
            "generated_html": None,
            "validation_errors": [],
            "is_valid": False
        }
        
        result = execute_style_workflow(
            WorkflowType.ADJUST_STYLE.value,
            initial_state
        )
        
        # 更新数据库中的风格DNA
        style_service.update_style_dna(
            request.theme_name,
            result["style_dna"]
        )
        
        return StyleResponse(
            html_content="",  # 调整风格时不返回HTML
            style_dna=result["style_dna"],
            theme_name=request.theme_name,
            is_valid=True,
            errors=[]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")


@router.get("/v1/styles/themes")
async def list_themes(db: Session = Depends(get_db)):
    """获取所有可用的风格主题"""
    try:
        style_service = StyleDNAService(db)
        themes = style_service.list_themes()
        return {"themes": themes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")


@router.get("/v1/monitor/stats")
async def get_monitor_stats():
    """获取监控统计信息"""
    return workflow_monitor.get_stats()


@router.get("/v1/monitor/health")
async def health_check(db: Session = Depends(get_db)):
    """健康检查"""
    try:
        # 检查数据库连接
        db.execute("SELECT 1")
        
        stats = workflow_monitor.get_stats()
        
        return {
            "status": "healthy",
            "database": "connected",
            "total_executions": stats['total_executions'],
            "success_rate": stats['success_count'] / max(stats['total_executions'], 1) * 100,
            "uptime": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }