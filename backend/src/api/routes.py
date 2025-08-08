from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from src.models.schemas import (
    StyleTransformRequest, TaskResponse, TaskDetails,
    AgentExecutionDetail, TaskStatus
)
from src.workflows.style_transform_v2 import WorkflowManager
from src.database.manager import DatabaseManager
from typing import Dict, Any
import logging
from datetime import datetime

# Initialize router
router = APIRouter(prefix="/api/v1", tags=["Style Transform"])

# Initialize managers
workflow_manager = WorkflowManager()
db_manager = DatabaseManager()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.post("/transform", response_model=TaskResponse)
async def create_style_transform_task(
    request: StyleTransformRequest,
    background_tasks: BackgroundTasks
) -> TaskResponse:
    """
    Create a new style transformation task
    
    Submits HTML content for style transformation and returns a task ID
    for tracking progress and retrieving results.
    """
    logger.info(f"📥 [API] Received new transform request")
    logger.info(f"📄 Content length: {len(request.content)} characters")
    logger.info(f"🎨 Style name: {request.style_name}")
    logger.info(f"✨ Style features: {request.style_features}")
    
    try:
        # Validate request
        if not request.content or not request.content.strip():
            logger.warning(f"⚠️ [API] Invalid request: Empty content")
            raise HTTPException(
                status_code=400,
                detail="Content cannot be empty"
            )
        
        if not request.style_name or not request.style_name.strip():
            logger.warning(f"⚠️ [API] Invalid request: Missing style name")
            raise HTTPException(
                status_code=400,
                detail="Style name is required"
            )
        
        # Prepare style requirements
        style_requirements = {
            "style_name": request.style_name,
            "features": request.style_features
        }
        
        logger.info(f"🚀 [API] Starting workflow for style transformation...")
        
        # Start the workflow
        task_id = await workflow_manager.start_task(
            original_content=request.content,
            style_requirements=style_requirements
        )
        
        logger.info(f"✅ [API] Task created successfully: {task_id}")
        
        response = TaskResponse(
            task_id=task_id,
            status=TaskStatus.RUNNING,
            progress=0.0,
            estimated_time=120  # 2 minutes estimate
        )
        
        logger.info(f"📤 [API] Returning response for task {task_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [API] Failed to create transform task: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create task: {str(e)}"
        )


@router.get("/task/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str) -> TaskResponse:
    """
    Get the current status of a transformation task
    
    Returns the task status, progress, and results if completed.
    """
    try:
        # Get task status from workflow manager
        task_info = workflow_manager.get_task_status(task_id)
        
        if "error" in task_info:
            raise HTTPException(
                status_code=404,
                detail=task_info["error"]
            )
        
        # Convert status string to enum
        status_map = {
            "running": TaskStatus.RUNNING,
            "completed": TaskStatus.COMPLETED,
            "failed": TaskStatus.FAILED
        }
        
        status = status_map.get(task_info["status"], TaskStatus.RUNNING)
        
        return TaskResponse(
            task_id=task_id,
            status=status,
            progress=task_info.get("progress", 0.0),
            result=task_info.get("final_html"),
            error=task_info.get("error_message")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get task status for {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get task status: {str(e)}"
        )


@router.get("/task/{task_id}/steps", response_model=TaskDetails)
async def get_task_execution_details(task_id: str) -> TaskDetails:
    """
    Get detailed execution steps for a transformation task
    
    Returns detailed information about each agent's execution,
    including inputs, outputs, and timing information.
    """
    try:
        # Get detailed task information
        details = workflow_manager.get_task_details(task_id)
        
        if "error" in details:
            raise HTTPException(
                status_code=404,
                detail=details["error"]
            )
        
        task_info = details.get("task_info", {})
        execution_details = details.get("execution_details", {})
        
        # Convert execution details to response format
        steps = []
        current_step = "completed"
        
        for agent_name, executions in execution_details.items():
            for execution in executions:
                # Convert timestamps with error handling
                started_at = None
                completed_at = None
                
                try:
                    if execution["started_at"]:
                        # 处理SQLite时间戳格式
                        timestamp_str = execution["started_at"]
                        if 'T' not in timestamp_str and ' ' in timestamp_str:
                            # SQLite格式：2025-08-08 06:39:19 -> 2025-08-08T06:39:19
                            timestamp_str = timestamp_str.replace(' ', 'T')
                        started_at = datetime.fromisoformat(timestamp_str)
                except Exception as e:
                    logger.warning(f"Failed to parse started_at timestamp '{execution['started_at']}': {e}")
                
                try:
                    if execution["completed_at"]:
                        timestamp_str = execution["completed_at"]
                        if 'T' not in timestamp_str and ' ' in timestamp_str:
                            timestamp_str = timestamp_str.replace(' ', 'T')
                        completed_at = datetime.fromisoformat(timestamp_str)
                except Exception as e:
                    logger.warning(f"Failed to parse completed_at timestamp '{execution['completed_at']}': {e}")
                
                # Map status
                status_map = {
                    "running": "running",
                    "completed": "completed", 
                    "failed": "failed"
                }
                
                step = AgentExecutionDetail(
                    id=execution["id"],
                    agent_name=execution["agent_name"],
                    status=status_map.get(execution["status"], "running"),
                    started_at=started_at,
                    completed_at=completed_at,
                    input_data=execution.get("input_data"),
                    output_data=execution.get("output_data"),
                    error_message=execution.get("error_message"),
                    execution_time=execution.get("execution_time")
                )
                steps.append(step)
                
                # Determine current step
                if execution["status"] == "running":
                    current_step = execution["agent_name"]
        
        # Generate quality report from task info
        quality_report = None
        if task_info.get("status") == "completed":
            quality_report = {
                "quality_score": task_info.get("quality_score", 0.0),
                "summary": f"Task completed with quality score: {task_info.get('quality_score', 0.0)}"
            }
        
        return TaskDetails(
            task_id=task_id,
            steps=steps,
            current_step=current_step,
            quality_report=quality_report
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get task details for {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get task details: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    
    Returns the current health status of the API service.
    """
    try:
        # Test database connection
        db_healthy = True
        try:
            # Simple database test
            test_task = db_manager.get_task("test")
            db_healthy = True
        except Exception:
            db_healthy = False
        
        # Check active workflows
        active_tasks = len(workflow_manager.active_workflows)
        
        return {
            "status": "healthy" if db_healthy else "degraded",
            "timestamp": datetime.now().isoformat(),
            "database": "connected" if db_healthy else "disconnected",
            "active_tasks": active_tasks,
            "version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        # 确保返回JSON响应而不是字典
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
        )


# Note: Exception handlers should be defined on the FastAPI app in main.py