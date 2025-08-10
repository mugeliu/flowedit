from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from src.models.schemas import AgentState
from src.agents.style_designer import StyleDesignerAgent
from src.agents.content_analyst import ContentAnalystAgent
from src.agents.design_adapter import DesignAdapterAgent
from src.agents.code_engineer import CodeEngineerAgent
from src.agents.quality_director import QualityDirectorAgent
from src.database.manager import DatabaseManager
from src.config.logger import get_agent_logger, get_logger
import asyncio
import time


class StyleTransformWorkflow:
    """LangGraph workflow orchestrator for style transformation"""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.db_manager = db_manager or DatabaseManager()
        self.agents = self._initialize_agents()
        self.graph = self._build_workflow_graph()
        
    def _initialize_agents(self) -> Dict:
        """Initialize all agents"""
        return {
            "style_designer": StyleDesignerAgent(),
            "content_analyst": ContentAnalystAgent(),
            "design_adapter": DesignAdapterAgent(),
            "code_engineer": CodeEngineerAgent(),
            "quality_director": QualityDirectorAgent()
        }
    
    def _build_workflow_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        from langgraph.graph import StateGraph
        from typing import TypedDict, Optional, List
        
        # Define the state schema as a TypedDict for LangGraph
        class WorkflowState(TypedDict):
            original_content: str
            style_requirements: dict
            content_analysis: Optional[dict]
            design_system: Optional[dict]
            adapted_design: Optional[dict]
            generated_html: Optional[str]
            current_step: str
            iteration_count: int
            quality_score: float
            errors: List[str]
            warnings: List[str]
        
        workflow = StateGraph(WorkflowState)
        
        # Add nodes
        workflow.add_node("parallel_analysis", self._parallel_analysis_node)
        workflow.add_node("design_adapter", self._design_adapter_node)
        workflow.add_node("code_engineer", self._code_engineer_node)
        workflow.add_node("quality_director", self._quality_director_node)
        
        # Set entry point
        workflow.set_entry_point("parallel_analysis")
        
        # Add edges
        workflow.add_edge("parallel_analysis", "design_adapter")
        workflow.add_edge("design_adapter", "code_engineer")
        workflow.add_edge("code_engineer", "quality_director")
        workflow.add_conditional_edges(
            "quality_director",
            self._quality_decision,
            {
                "quality_pass": END,
                "quality_retry": "design_adapter",
                "quality_fail": END
            }
        )
        
        return workflow.compile()
    
    async def execute_workflow(self, task_id: str, original_content: str, 
                              style_requirements: Dict) -> Dict[str, Any]:
        """Execute the complete workflow"""
        logger = get_agent_logger("Workflow", task_id)
        start_time = time.time()
        
        try:
            logger.info(f"Starting workflow execution - Content length: {len(original_content)}")
            
            # Initialize state
            initial_state = AgentState(
                task_id=task_id,  # 添加必需的task_id字段
                original_content=original_content,
                style_requirements=style_requirements,
                current_step="START",
                iteration_count=0,
                errors=[]
            )
            
            # Log workflow start
            self.db_manager.log_agent_execution(
                agent_name="workflow_start",
                task_id=task_id,
                input_data={"content_length": len(original_content), "style": style_requirements},
                status="running"
            )
            
            # Execute workflow
            logger.info("Executing LangGraph workflow...")
            final_state_dict = await self.graph.ainvoke(initial_state.dict())
            
            # Convert back to AgentState
            final_state = AgentState(**final_state_dict)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            logger.info(f"Workflow completed in {processing_time:.2f} seconds")
            
            # Determine final status
            if final_state.errors:
                status = "failed"
                error_message = "; ".join(final_state.errors)
                logger.error(f"Workflow failed with errors: {error_message}")
            else:
                status = "completed"
                error_message = None
                logger.info(f"Workflow completed successfully with quality score: {final_state.quality_score:.2f}")
            
            # Update task in database
            self.db_manager.update_task(task_id, {
                "status": status,
                "final_html": final_state.generated_html,
                "quality_score": final_state.quality_score,
                "processing_time": processing_time,
                "error_message": error_message
            })
            
            # Log workflow completion
            self.db_manager.log_agent_execution(
                agent_name="workflow_complete",
                task_id=task_id,
                output_data={
                    "final_status": status,
                    "quality_score": final_state.quality_score,
                    "processing_time": processing_time
                },
                status="completed"
            )
            
            return {
                "success": status == "completed",
                "final_state": final_state,
                "processing_time": processing_time,
                "status": status,
                "error_message": error_message
            }
            
        except Exception as e:
            processing_time = time.time() - start_time
            error_message = str(e)
            logger.error(f"Workflow execution failed: {error_message}", exc_info=True)
            
            # Update task as failed
            self.db_manager.update_task(task_id, {
                "status": "failed",
                "processing_time": processing_time,
                "error_message": error_message
            })
            
            return {
                "success": False,
                "error": error_message,
                "processing_time": processing_time,
                "status": "failed"
            }
    
    async def _parallel_analysis_node(self, state: Dict) -> Dict:
        """Execute style designer and content analyst in parallel"""
        logger = get_logger("workflow.parallel_analysis")
        
        try:
            logger.info("Starting parallel analysis node")
            
            # Convert dict to AgentState if needed
            if isinstance(state, dict):
                # Ensure all required fields are present
                if "original_content" not in state or "style_requirements" not in state:
                    error_msg = f"Missing required fields in state: {list(state.keys())}"
                    logger.error(error_msg)
                    return {
                        "task_id": state.get("task_id", ""),
                        "original_content": state.get("original_content", ""),
                        "style_requirements": state.get("style_requirements", {}),
                        "current_step": "parallel_analysis_failed",
                        "iteration_count": state.get("iteration_count", 0),
                        "quality_score": state.get("quality_score", 0.0),
                        "errors": state.get("errors", []) + [error_msg],
                        "content_analysis_summary": None,
                        "design_tokens": None,
                        "css_rules": None,
                        "generated_html": None
                    }
                agent_state = AgentState(**state)
            else:
                agent_state = state
            
            logger.info("Executing style designer and content analyst in parallel")
            
            # Execute both agents in parallel
            style_task = asyncio.create_task(self._run_style_designer(agent_state))
            content_task = asyncio.create_task(self._run_content_analyst(agent_state))
            
            # Wait for both to complete
            style_result, content_result = await asyncio.gather(style_task, content_task)
            
            logger.info("Parallel analysis completed, combining results")
            
            # Combine results
            if hasattr(style_result, 'design_tokens'):
                agent_state.design_tokens = style_result.design_tokens
            if hasattr(content_result, 'content_analysis_summary'):
                agent_state.content_analysis_summary = content_result.content_analysis_summary
            agent_state.current_step = "parallel_analysis_complete"
            
            # Combine errors
            agent_state.errors.extend(style_result.errors)
            agent_state.errors.extend(content_result.errors)
            
            logger.info(f"Parallel analysis completed - Errors: {len(agent_state.errors)}")
            
            # Return as dict for LangGraph
            return agent_state.dict()
            
        except Exception as e:
            error_msg = f"Parallel analysis failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            # Ensure we return a complete state dict
            base_state = {
                "task_id": state.get("task_id", ""),
                "original_content": state.get("original_content", ""),
                "style_requirements": state.get("style_requirements", {}),
                "current_step": "parallel_analysis_failed",
                "iteration_count": state.get("iteration_count", 0),
                "quality_score": state.get("quality_score", 0.0),
                "errors": state.get("errors", []) + [error_msg],
                "content_analysis_summary": None,
                "design_tokens": None,
                "css_rules": None,
                "generated_html": None
            }
            return base_state
    
    async def _run_style_designer(self, state: AgentState) -> AgentState:
        """Run style designer agent"""
        return await asyncio.to_thread(self.agents["style_designer"].execute, state.copy())
    
    async def _run_content_analyst(self, state: AgentState) -> AgentState:
        """Run content analyst agent"""
        return await asyncio.to_thread(self.agents["content_analyst"].execute, state.copy())
    
    async def _design_adapter_node(self, state: Dict) -> Dict:
        """Execute design adapter agent"""
        logger = get_logger("workflow.design_adapter")
        
        try:
            # Convert dict to AgentState if needed
            if isinstance(state, dict):
                # Ensure all required fields are present
                if "original_content" not in state or "style_requirements" not in state or "task_id" not in state:
                    error_msg = f"Missing required fields in state: {list(state.keys())}"
                    logger.error(error_msg)
                    return {
                        "task_id": state.get("task_id", ""),
                        "original_content": state.get("original_content", ""),
                        "style_requirements": state.get("style_requirements", {}),
                        "current_step": "design_adapter_failed",
                        "iteration_count": state.get("iteration_count", 0),
                        "quality_score": state.get("quality_score", 0.0),
                        "errors": state.get("errors", []) + ["Missing required fields in state"],
                        "content_analysis_summary": state.get("content_analysis_summary"),
                        "design_tokens": state.get("design_tokens"),
                        "css_rules": None,
                        "generated_html": None
                    }
                agent_state = AgentState(**state)
            else:
                agent_state = state
                
            agent_state.iteration_count += 1
            result = await asyncio.to_thread(self.agents["design_adapter"].execute, agent_state)
            return result.dict()
        except Exception as e:
            error_msg = f"Design adaptation failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            base_state = {
                "original_content": state.get("original_content", ""),
                "style_requirements": state.get("style_requirements", {}),
                "current_step": "design_adapter_failed",
                "iteration_count": state.get("iteration_count", 0),
                "quality_score": state.get("quality_score", 0.0),
                "errors": state.get("errors", []) + [error_msg],
                
                "content_analysis": state.get("content_analysis"),
                "design_system": state.get("design_system"),
                "adapted_design": None,
                "generated_html": None
            }
            return base_state
    
    async def _code_engineer_node(self, state: Dict) -> Dict:
        """Execute code engineer agent"""
        logger = get_logger("workflow.code_engineer")
        
        try:
            # Convert dict to AgentState if needed
            if isinstance(state, dict):
                # Ensure all required fields are present
                if "original_content" not in state or "style_requirements" not in state:
                    error_msg = f"Missing required fields in state: {list(state.keys())}"
                    logger.error(error_msg)
                    base_state = {
                        "original_content": state.get("original_content", ""),
                        "style_requirements": state.get("style_requirements", {}),
                        "current_step": "code_engineer_failed",
                        "iteration_count": state.get("iteration_count", 0),
                        "quality_score": state.get("quality_score", 0.0),
                        "errors": state.get("errors", []) + ["Missing required fields in state"],
                        
                        "content_analysis": state.get("content_analysis"),
                        "design_system": state.get("design_system"),
                        "adapted_design": state.get("adapted_design"),
                        "generated_html": None
                    }
                    return base_state
                agent_state = AgentState(**state)
            else:
                agent_state = state
                
            result = await asyncio.to_thread(self.agents["code_engineer"].execute, agent_state)
            return result.dict()
        except Exception as e:
            error_msg = f"Code generation failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            base_state = {
                "original_content": state.get("original_content", ""),
                "style_requirements": state.get("style_requirements", {}),
                "current_step": "code_engineer_failed",
                "iteration_count": state.get("iteration_count", 0),
                "quality_score": state.get("quality_score", 0.0),
                "errors": state.get("errors", []) + [error_msg],
                
                "content_analysis": state.get("content_analysis"),
                "design_system": state.get("design_system"),
                "adapted_design": state.get("adapted_design"),
                "generated_html": None
            }
            return base_state
    
    async def _quality_director_node(self, state: Dict) -> Dict:
        """Execute quality director agent"""
        logger = get_logger("workflow.quality_director")
        
        try:
            # Convert dict to AgentState if needed
            if isinstance(state, dict):
                # Ensure all required fields are present
                if "original_content" not in state or "style_requirements" not in state:
                    error_msg = f"Missing required fields in state: {list(state.keys())}"
                    logger.error(error_msg)
                    base_state = {
                        "original_content": state.get("original_content", ""),
                        "style_requirements": state.get("style_requirements", {}),
                        "current_step": "quality_director_failed",
                        "iteration_count": state.get("iteration_count", 0),
                        "quality_score": 0.0,
                        "errors": state.get("errors", []) + ["Missing required fields in state"],
                        
                        "content_analysis": state.get("content_analysis"),
                        "design_system": state.get("design_system"),
                        "adapted_design": state.get("adapted_design"),
                        "generated_html": state.get("generated_html")
                    }
                    return base_state
                agent_state = AgentState(**state)
            else:
                agent_state = state
                
            result = await asyncio.to_thread(self.agents["quality_director"].execute, agent_state)
            return result.dict()
        except Exception as e:
            error_msg = f"Quality assessment failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            base_state = {
                "original_content": state.get("original_content", ""),
                "style_requirements": state.get("style_requirements", {}),
                "current_step": "quality_director_failed",
                "iteration_count": state.get("iteration_count", 0),
                "quality_score": 0.0,
                "errors": state.get("errors", []) + [error_msg],
                
                "content_analysis": state.get("content_analysis"),
                "design_system": state.get("design_system"),
                "adapted_design": state.get("adapted_design"),
                "generated_html": state.get("generated_html")
            }
            return base_state
    
    def _quality_decision(self, state: Dict) -> str:
        """Decide workflow continuation based on quality score"""
        # Convert dict to AgentState for easier access
        if isinstance(state, dict):
            agent_state = AgentState(**state)
        else:
            agent_state = state
            
        quality_score = agent_state.quality_score
        iteration_count = agent_state.iteration_count
        max_iterations = 3
        
        # If we have critical errors, fail immediately
        if agent_state.errors and any("failed" in error.lower() for error in agent_state.errors):
            return "quality_fail"
        
        # If max iterations reached, end regardless of quality
        if iteration_count >= max_iterations:
            return "quality_pass" if quality_score >= 0.6 else "quality_fail"
        
        # Quality-based decision
        if quality_score >= 0.8:
            return "quality_pass"
        elif quality_score >= 0.6:
            return "quality_retry"
        else:
            return "quality_fail"
    
    def get_task_progress(self, task_id: str) -> Dict[str, Any]:
        """Get current task progress"""
        try:
            # Get task info
            task = self.db_manager.get_task(task_id)
            if not task:
                return {"error": "Task not found"}
            
            # Get agent executions
            executions = self.db_manager.get_agent_executions(task_id)
            
            # Calculate progress based on completed steps
            total_steps = 5  # parallel_analysis, design_adapter, code_engineer, quality_director, workflow_complete
            completed_steps = len([ex for ex in executions if ex["status"] == "completed"])
            progress = min(completed_steps / total_steps, 1.0)
            
            # Determine current step
            running_executions = [ex for ex in executions if ex["status"] == "running"]
            current_step = running_executions[0]["agent_name"] if running_executions else "completed"
            
            return {
                "task_id": task_id,
                "status": task["status"],
                "progress": progress,
                "current_step": current_step,
                "quality_score": task["quality_score"],
                "final_html": task["final_html"],
                "error_message": task["error_message"],
                "executions": executions
            }
            
        except Exception as e:
            return {"error": f"Failed to get task progress: {str(e)}"}
    
    def get_task_execution_details(self, task_id: str) -> Dict[str, Any]:
        """Get detailed execution information for a task"""
        try:
            task = self.db_manager.get_task(task_id)
            if not task:
                return {"error": "Task not found"}
            
            executions = self.db_manager.get_agent_executions(task_id)
            
            # Group executions by agent
            execution_details = {}
            for execution in executions:
                agent_name = execution["agent_name"]
                if agent_name not in execution_details:
                    execution_details[agent_name] = []
                execution_details[agent_name].append(execution)
            
            return {
                "task_id": task_id,
                "task_info": task,
                "execution_details": execution_details,
                "total_executions": len(executions)
            }
            
        except Exception as e:
            return {"error": f"Failed to get execution details: {str(e)}"}


class WorkflowManager:
    """Manager for handling multiple workflow instances"""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.db_manager = db_manager or DatabaseManager()
        self.active_workflows = {}
    
    async def start_task(self, original_content: str, style_requirements: Dict) -> str:
        """Start a new style transformation task"""
        try:
            # Create task in database
            task_id = self.db_manager.create_task(original_content, style_requirements)
            
            # Create workflow instance
            workflow = StyleTransformWorkflow(self.db_manager)
            self.active_workflows[task_id] = workflow
            
            # Start workflow execution (async)
            asyncio.create_task(self._execute_task_workflow(task_id, workflow, original_content, style_requirements))
            
            return task_id
            
        except Exception as e:
            raise Exception(f"Failed to start task: {str(e)}")
    
    async def _execute_task_workflow(self, task_id: str, workflow: StyleTransformWorkflow,
                                   original_content: str, style_requirements: Dict):
        """Execute workflow for a task"""
        try:
            await workflow.execute_workflow(task_id, original_content, style_requirements)
        except Exception as e:
            # Log error
            self.db_manager.update_task(task_id, {
                "status": "failed",
                "error_message": str(e)
            })
        finally:
            # Clean up workflow instance
            if task_id in self.active_workflows:
                del self.active_workflows[task_id]
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get task status and progress"""
        try:
            workflow = self.active_workflows.get(task_id)
            if workflow:
                return workflow.get_task_progress(task_id)
            else:
                # Task completed or not found, get from database
                task = self.db_manager.get_task(task_id)
                if not task:
                    return {"error": "Task not found"}
                
                return {
                    "task_id": task_id,
                    "status": task["status"],
                    "progress": 1.0 if task["status"] in ["completed", "failed"] else 0.0,
                    "final_html": task["final_html"],
                    "quality_score": task["quality_score"],
                    "error_message": task["error_message"]
                }
                
        except Exception as e:
            return {"error": f"Failed to get task status: {str(e)}"}
    
    def get_task_details(self, task_id: str) -> Dict[str, Any]:
        """Get detailed task execution information"""
        try:
            workflow = StyleTransformWorkflow(self.db_manager)
            return workflow.get_task_execution_details(task_id)
        except Exception as e:
            return {"error": f"Failed to get task details: {str(e)}"}