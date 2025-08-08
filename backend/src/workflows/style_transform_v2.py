from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from src.models.schemas import AgentState
from src.agents.style_designer import StyleDesignerAgent
from src.agents.content_analyst import ContentAnalystAgent
from src.agents.design_adapter import DesignAdapterAgent
from src.agents.code_engineer import CodeEngineerAgent
from src.agents.quality_director import QualityDirectorAgent
from src.database.manager import DatabaseManager
import asyncio
import time
import uuid
import logging

# 配置详细的日志记录
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # 控制台输出
    ]
)
logger = logging.getLogger(__name__)


class OptimizedStyleTransformWorkflow:
    """优化后的LangGraph工作流编排器"""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.db_manager = db_manager or DatabaseManager()
        self.agents = self._initialize_agents()
        self.graph = self._build_workflow_graph()
        
    def _initialize_agents(self) -> Dict:
        """初始化所有agents"""
        return {
            "style_designer": StyleDesignerAgent(),
            "content_analyst": ContentAnalystAgent(),
            "design_adapter": DesignAdapterAgent(),
            "code_engineer": CodeEngineerAgent(),
            "quality_director": QualityDirectorAgent()
        }
    
    def _build_workflow_graph(self) -> StateGraph:
        """构建LangGraph工作流"""
        from typing import TypedDict, Optional, List, Annotated
        from langgraph.graph import StateGraph
        from operator import add
        
        # 定义状态schema - 修复并发更新问题
        class WorkflowState(TypedDict):
            task_id: str
            original_content: str
            style_requirements: dict
            content_analysis_summary: Optional[dict]
            design_tokens: Optional[dict]
            css_rules: Optional[dict]
            generated_html: Optional[str]
            quality_score: Optional[float]
            current_step: str
            iteration_count: int
            errors: Annotated[List[str], add]  # 使用Annotated解决并发更新问题
        
        workflow = StateGraph(WorkflowState)
        
        # 添加所有优化后的节点
        workflow.add_node("content_analysis", self._content_analysis_node)
        workflow.add_node("style_analysis", self._style_analysis_node) 
        workflow.add_node("design_adaptation", self._design_adaptation_node)
        workflow.add_node("code_generation", self._code_generation_node)
        workflow.add_node("quality_assessment", self._quality_assessment_node)
        
        # 设置入口点
        workflow.set_entry_point("content_analysis")
        
        # 添加完整的工作流边 - 串行执行避免并发问题
        workflow.add_edge("content_analysis", "style_analysis") 
        workflow.add_edge("style_analysis", "design_adaptation")
        workflow.add_edge("design_adaptation", "code_generation")
        workflow.add_edge("code_generation", "quality_assessment")
        workflow.add_edge("quality_assessment", END)
        
        return workflow.compile()
    
    async def execute_workflow(self, task_id: str, original_content: str, 
                              style_requirements: Dict) -> Dict[str, Any]:
        """执行完整工作流"""
        start_time = time.time()
        
        logger.info(f"🚀 [WORKFLOW START] Task ID: {task_id}")
        logger.info(f"📄 Content length: {len(original_content)} characters")
        logger.info(f"🎨 Style requirements: {style_requirements}")
        
        try:
            # 初始化状态
            initial_state = {
                "task_id": task_id,
                "original_content": original_content,
                "style_requirements": style_requirements,
                "content_analysis_summary": None,
                "design_tokens": None,
                "css_rules": None,
                "generated_html": None,
                "quality_score": None,
                "current_step": "START",
                "iteration_count": 0,
                "errors": []
            }
            
            logger.info(f"🔄 [WORKFLOW] Starting LangGraph execution for task {task_id}")
            
            # 记录工作流开始
            self.db_manager.log_agent_execution(
                agent_name="workflow_start",
                task_id=task_id,
                input_data={"content_length": len(original_content), "style": style_requirements},
                status="running"
            )
            
            # 执行工作流
            final_state_dict = await self.graph.ainvoke(initial_state)
            
            # 计算处理时间
            processing_time = time.time() - start_time
            
            # 确定最终状态
            if final_state_dict.get("errors"):
                status = "failed"
                error_message = "; ".join(final_state_dict["errors"])
                logger.error(f"❌ [WORKFLOW FAILED] Task {task_id} failed with errors: {error_message}")
            else:
                status = "completed"
                error_message = None
                logger.info(f"✅ [WORKFLOW SUCCESS] Task {task_id} completed successfully")
                
            logger.info(f"⏱️ [WORKFLOW] Processing time: {processing_time:.2f} seconds")
            if final_state_dict.get("quality_score"):
                logger.info(f"📊 [QUALITY] Final score: {final_state_dict.get('quality_score'):.3f}")
            
            # 更新数据库中的任务
            self.db_manager.update_task(task_id, {
                "status": status,
                "final_html": final_state_dict.get("generated_html"),
                "quality_score": final_state_dict.get("quality_score"),
                "processing_time": processing_time,
                "error_message": error_message
            })
            
            # 记录工作流完成
            self.db_manager.log_agent_execution(
                agent_name="workflow_complete",
                task_id=task_id,
                output_data={
                    "final_status": status,
                    "quality_score": final_state_dict.get("quality_score"),
                    "processing_time": processing_time
                },
                status="completed"
            )
            
            return {
                "success": status == "completed",
                "final_state": final_state_dict,
                "processing_time": processing_time,
                "status": status,
                "error_message": error_message
            }
            
        except Exception as e:
            processing_time = time.time() - start_time
            error_message = str(e)
            
            logger.error(f"💥 [WORKFLOW EXCEPTION] Task {task_id} failed with exception: {error_message}")
            logger.error(f"⏱️ [WORKFLOW] Failed after {processing_time:.2f} seconds")
            
            # 更新任务为失败状态
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
    
    async def _content_analysis_node(self, state: Dict) -> Dict:
        """内容分析节点 - 使用协作机制"""
        task_id = state.get("task_id", "unknown")
        logger.info(f"🔍 [AGENT START] ContentAnalystAgent - Task {task_id}")
        
        try:
            agent_state = AgentState(**state)
            agent = self.agents["content_analyst"]
            
            logger.info(f"📝 [CONTENT ANALYST] Analyzing content structure and elements...")
            
            # 使用协作机制执行
            start_time = time.time()
            result = await asyncio.to_thread(agent.execute_with_collaboration, agent_state)
            execution_time = time.time() - start_time
            
            logger.info(f"⏱️ [CONTENT ANALYST] Execution time: {execution_time:.2f}s")
            
            if result.errors:
                logger.warning(f"⚠️ [CONTENT ANALYST] Completed with {len(result.errors)} errors: {result.errors}")
            else:
                logger.info(f"✅ [CONTENT ANALYST] Analysis completed successfully")
                
            # 记录分析结果概要
            if result.content_analysis_summary:
                structure = result.content_analysis_summary.get("structure", {})
                logger.info(f"📊 [CONTENT ANALYST] Found {structure.get('section_count', 0)} sections, "
                           f"{structure.get('total_paragraphs', 0)} paragraphs")
                if structure.get("has_quotes"):
                    logger.info(f"💬 [CONTENT ANALYST] Detected quotes and emphasis content")
            
            # 更新状态
            state["content_analysis_summary"] = result.content_analysis_summary
            state["current_step"] = result.current_step
            state["errors"].extend(result.errors)
            state["warnings"] = getattr(result, 'warnings', [])
            
            # 传递协作上下文
            state["collaboration_context"] = getattr(result, 'collaboration_context', {})
            state["agent_execution_log"] = getattr(result, 'agent_execution_log', [])
            state["quality_checkpoints"] = getattr(result, 'quality_checkpoints', [])
            state["agent_feedback"] = getattr(result, 'agent_feedback', {})
            
            return state
        except Exception as e:
            logger.error(f"❌ [CONTENT ANALYST] Failed with exception: {str(e)}")
            state["errors"].append(f"Content analysis node failed: {str(e)}")
            state["current_step"] = "content_analysis_failed"
            return state
    
    async def _style_analysis_node(self, state: Dict) -> Dict:
        """风格分析节点 - 使用协作机制"""
        task_id = state.get("task_id", "unknown")
        logger.info(f"🎨 [AGENT START] StyleDesignerAgent - Task {task_id}")
        
        try:
            agent_state = AgentState(**state)
            agent = self.agents["style_designer"]
            
            logger.info(f"🎨 [STYLE DESIGNER] Generating design tokens and style system...")
            
            # 传递ContentAnalyst的反馈给StyleDesigner
            if hasattr(agent, 'get_collaboration_feedback'):
                content_agent = self.agents["content_analyst"]
                if hasattr(content_agent, 'get_collaboration_feedback'):
                    feedback = content_agent.get_collaboration_feedback(agent_state)
                    if feedback:
                        logger.info(f"🔗 [STYLE DESIGNER] Received feedback from ContentAnalyst: {feedback[:100]}...")
                        agent.provide_feedback_to_agent(agent_state, "style_designer", feedback)
            
            # 使用协作机制执行
            start_time = time.time()
            result = await asyncio.to_thread(agent.execute_with_collaboration, agent_state)
            execution_time = time.time() - start_time
            
            logger.info(f"⏱️ [STYLE DESIGNER] Execution time: {execution_time:.2f}s")
            
            if result.errors:
                logger.warning(f"⚠️ [STYLE DESIGNER] Completed with {len(result.errors)} errors: {result.errors}")
            else:
                logger.info(f"✅ [STYLE DESIGNER] Design tokens generated successfully")
                
            # 记录设计结果概要
            if result.design_tokens:
                tokens = result.design_tokens
                logger.info(f"🎨 [STYLE DESIGNER] Generated design system with primary color: {tokens.get('primary_color', 'N/A')}")
                if tokens.get("section_number_styles"):
                    colors = tokens["section_number_styles"].get("colors", [])
                    logger.info(f"🔢 [STYLE DESIGNER] Created {len(colors)} section number styles")
                if tokens.get("quote_styles"):
                    logger.info(f"💬 [STYLE DESIGNER] Created quote styling system")
            
            # 更新状态
            state["design_tokens"] = result.design_tokens
            state["current_step"] = result.current_step
            state["errors"].extend(result.errors)
            state["warnings"] = getattr(result, 'warnings', [])
            
            # 传递协作上下文
            state["collaboration_context"] = getattr(result, 'collaboration_context', {})
            state["agent_execution_log"] = getattr(result, 'agent_execution_log', [])
            state["quality_checkpoints"] = getattr(result, 'quality_checkpoints', [])
            state["agent_feedback"] = getattr(result, 'agent_feedback', {})
            
            return state
        except Exception as e:
            logger.error(f"❌ [STYLE DESIGNER] Failed with exception: {str(e)}")
            state["errors"].append(f"Style analysis node failed: {str(e)}")
            state["current_step"] = "style_analysis_failed"
            return state
    
    def _wait_parallel_node(self, state: Dict) -> Dict:
        """等待并行任务完成的同步节点（保留用于兼容性）"""
        # 检查必要的分析结果是否都已完成
        if not state.get("content_analysis_summary"):
            state["errors"].append("Content analysis not completed")
            return state
        
        if not state.get("design_tokens"):
            state["errors"].append("Style analysis not completed")
            return state
        
        state["current_step"] = "parallel_completed"
        return state
    
    async def _design_adaptation_node(self, state: Dict) -> Dict:
        """设计适配节点 - 使用协作机制"""
        task_id = state.get("task_id", "unknown")
        logger.info(f"⚙️ [AGENT START] DesignAdapterAgent - Task {task_id}")
        
        try:
            agent_state = AgentState(**state)
            agent = self.agents["design_adapter"]
            
            logger.info(f"⚙️ [DESIGN ADAPTER] Converting design tokens to CSS rules...")
            
            # 传递StyleDesigner的反馈给DesignAdapter
            if hasattr(agent, 'get_collaboration_feedback'):
                style_agent = self.agents["style_designer"]
                if hasattr(style_agent, 'get_collaboration_feedback'):
                    feedback = style_agent.get_collaboration_feedback(agent_state)
                    if feedback:
                        logger.info(f"🔗 [DESIGN ADAPTER] Received feedback from StyleDesigner: {feedback[:100]}...")
                        agent.provide_feedback_to_agent(agent_state, "design_adapter", feedback)
            
            # 使用协作机制执行
            start_time = time.time()
            result = await asyncio.to_thread(agent.execute_with_collaboration, agent_state)
            execution_time = time.time() - start_time
            
            logger.info(f"⏱️ [DESIGN ADAPTER] Execution time: {execution_time:.2f}s")
            
            if result.errors:
                logger.warning(f"⚠️ [DESIGN ADAPTER] Completed with {len(result.errors)} errors: {result.errors}")
            else:
                logger.info(f"✅ [DESIGN ADAPTER] CSS rules generated successfully")
                
            # 记录CSS结果概要
            if result.css_rules:
                css_rules = result.css_rules
                logger.info(f"📝 [DESIGN ADAPTER] Generated {len(css_rules)} CSS rules")
                section_styles = [k for k in css_rules.keys() if "section-number" in k]
                quote_styles = [k for k in css_rules.keys() if "quote" in k]
                if section_styles:
                    logger.info(f"🔢 [DESIGN ADAPTER] Created {len(section_styles)} section number styles")
                if quote_styles:
                    logger.info(f"💬 [DESIGN ADAPTER] Created {len(quote_styles)} quote styles")
            
            # 更新状态
            state["css_rules"] = result.css_rules
            state["current_step"] = result.current_step
            state["errors"].extend(result.errors)
            state["warnings"] = getattr(result, 'warnings', [])
            
            # 传递协作上下文
            state["collaboration_context"] = getattr(result, 'collaboration_context', {})
            state["agent_execution_log"] = getattr(result, 'agent_execution_log', [])
            state["quality_checkpoints"] = getattr(result, 'quality_checkpoints', [])
            state["agent_feedback"] = getattr(result, 'agent_feedback', {})
            
            return state
        except Exception as e:
            logger.error(f"❌ [DESIGN ADAPTER] Failed with exception: {str(e)}")
            state["errors"].append(f"Design adaptation node failed: {str(e)}")
            state["current_step"] = "design_adaptation_failed"
            return state
    
    async def _code_generation_node(self, state: Dict) -> Dict:
        """代码生成节点 - 使用协作机制"""
        task_id = state.get("task_id", "unknown")
        logger.info(f"🔧 [AGENT START] CodeEngineerAgent - Task {task_id}")
        
        try:
            agent_state = AgentState(**state)
            agent = self.agents["code_engineer"]
            
            logger.info(f"🔧 [CODE ENGINEER] Generating styled HTML structure...")
            
            # 传递DesignAdapter的反馈给CodeEngineer
            if hasattr(agent, 'get_collaboration_feedback'):
                design_agent = self.agents["design_adapter"]
                if hasattr(design_agent, 'get_collaboration_feedback'):
                    feedback = design_agent.get_collaboration_feedback(agent_state)
                    if feedback:
                        logger.info(f"🔗 [CODE ENGINEER] Received feedback from DesignAdapter: {feedback[:100]}...")
                        agent.provide_feedback_to_agent(agent_state, "code_engineer", feedback)
            
            # 使用协作机制执行
            start_time = time.time()
            result = await asyncio.to_thread(agent.execute_with_collaboration, agent_state)
            execution_time = time.time() - start_time
            
            logger.info(f"⏱️ [CODE ENGINEER] Execution time: {execution_time:.2f}s")
            
            if result.errors:
                logger.warning(f"⚠️ [CODE ENGINEER] Completed with {len(result.errors)} errors: {result.errors}")
            else:
                logger.info(f"✅ [CODE ENGINEER] HTML generated successfully")
                
            # 记录HTML结果概要
            if result.generated_html:
                html = result.generated_html
                logger.info(f"📄 [CODE ENGINEER] Generated HTML length: {len(html)} characters")
                sections = html.count('<section')
                paragraphs = html.count('<p')
                styles = html.count('style=')
                logger.info(f"🏗️ [CODE ENGINEER] Structure: {sections} sections, {paragraphs} paragraphs, {styles} styled elements")
            
            # 更新状态
            state["generated_html"] = result.generated_html
            state["current_step"] = result.current_step
            state["errors"].extend(result.errors)
            state["warnings"] = getattr(result, 'warnings', [])
            
            # 传递协作上下文
            state["collaboration_context"] = getattr(result, 'collaboration_context', {})
            state["agent_execution_log"] = getattr(result, 'agent_execution_log', [])
            state["quality_checkpoints"] = getattr(result, 'quality_checkpoints', [])
            state["agent_feedback"] = getattr(result, 'agent_feedback', {})
            
            return state
        except Exception as e:
            logger.error(f"❌ [CODE ENGINEER] Failed with exception: {str(e)}")
            state["errors"].append(f"Code generation node failed: {str(e)}")
            state["current_step"] = "code_generation_failed"
            return state
    
    async def _quality_assessment_node(self, state: Dict) -> Dict:
        """质量评估节点 - 使用协作机制"""
        task_id = state.get("task_id", "unknown")
        logger.info(f"📊 [AGENT START] QualityDirectorAgent - Task {task_id}")
        
        try:
            agent_state = AgentState(**state)
            agent = self.agents["quality_director"]
            
            logger.info(f"📊 [QUALITY DIRECTOR] Performing comprehensive quality assessment...")
            
            # 传递CodeEngineer的反馈给QualityDirector
            if hasattr(agent, 'get_collaboration_feedback'):
                code_agent = self.agents["code_engineer"]
                if hasattr(code_agent, 'get_collaboration_feedback'):
                    feedback = code_agent.get_collaboration_feedback(agent_state)
                    if feedback:
                        logger.info(f"🔗 [QUALITY DIRECTOR] Received feedback from CodeEngineer: {feedback[:100]}...")
                        agent.provide_feedback_to_agent(agent_state, "quality_director", feedback)
            
            # 使用协作机制执行
            start_time = time.time()
            result = await asyncio.to_thread(agent.execute_with_collaboration, agent_state)
            execution_time = time.time() - start_time
            
            logger.info(f"⏱️ [QUALITY DIRECTOR] Execution time: {execution_time:.2f}s")
            
            if result.errors:
                logger.warning(f"⚠️ [QUALITY DIRECTOR] Completed with {len(result.errors)} errors: {result.errors}")
            else:
                logger.info(f"✅ [QUALITY DIRECTOR] Quality assessment completed successfully")
                
            # 记录质量评估结果
            if result.quality_score is not None:
                score = result.quality_score
                logger.info(f"📊 [QUALITY DIRECTOR] Final Quality Score: {score:.3f}")
                
                # 根据分数给出评级
                if score >= 0.9:
                    grade = "优秀"
                elif score >= 0.8:
                    grade = "良好"
                elif score >= 0.7:
                    grade = "可接受"
                else:
                    grade = "需改进"
                    
                logger.info(f"🏆 [QUALITY DIRECTOR] Quality Grade: {grade}")
                
            # 记录质量报告摘要
            if hasattr(result, 'quality_report') and result.quality_report:
                report = result.quality_report
                overall = report.get("overall_assessment", {})
                logger.info(f"📋 [QUALITY DIRECTOR] Pass Criteria: {overall.get('pass_criteria', 'Unknown')}")
                
                # 记录发现的问题
                critical_analysis = report.get("critical_analysis", {})
                blocking_issues = critical_analysis.get("blocking_issues", [])
                major_issues = critical_analysis.get("major_issues", [])
                strengths = critical_analysis.get("strengths", [])
                
                if blocking_issues:
                    logger.warning(f"🚨 [QUALITY DIRECTOR] Found {len(blocking_issues)} blocking issues")
                if major_issues:
                    logger.warning(f"⚠️ [QUALITY DIRECTOR] Found {len(major_issues)} major issues")
                if strengths:
                    logger.info(f"✨ [QUALITY DIRECTOR] Identified {len(strengths)} strengths")
            
            # 更新状态
            state["quality_score"] = result.quality_score
            state["quality_report"] = getattr(result, 'quality_report', None)
            state["current_step"] = result.current_step
            state["errors"].extend(result.errors)
            state["warnings"] = getattr(result, 'warnings', [])
            
            # 传递协作上下文
            state["collaboration_context"] = getattr(result, 'collaboration_context', {})
            state["agent_execution_log"] = getattr(result, 'agent_execution_log', [])
            state["quality_checkpoints"] = getattr(result, 'quality_checkpoints', [])
            state["agent_feedback"] = getattr(result, 'agent_feedback', {})
            
            # 如果质量评估完成，标记整个工作流完成
            if not result.errors and result.quality_score is not None:
                state["current_step"] = "completed"
                logger.info(f"🎯 [QUALITY DIRECTOR] Workflow completed successfully with score {result.quality_score:.3f}")
            
            return state
        except Exception as e:
            logger.error(f"❌ [QUALITY DIRECTOR] Failed with exception: {str(e)}")
            state["errors"].append(f"Quality assessment node failed: {str(e)}")
            state["current_step"] = "quality_assessment_failed"
            return state
    
    def _mock_final_node(self, state: Dict) -> Dict:
        """模拟最终节点（保留用于兼容性）"""
        try:
            if state.get("errors"):
                return state
            
            # 生成简单的带样式的HTML
            design_tokens = state.get("design_tokens", {})
            original_content = state.get("original_content", "")
            
            # 基本的内联样式应用
            style = f"""
                color: {design_tokens.get('text_color', '#333333')};
                background-color: {design_tokens.get('background_color', '#ffffff')};
                font-family: {design_tokens.get('font_family', 'Arial, sans-serif')};
                padding: {design_tokens.get('spacing_unit', '16px')};
                max-width: 800px;
                margin: 0 auto;
            """.strip().replace('\n', ' ')
            
            generated_html = f'<div style="{style}">{original_content}</div>'
            
            state["generated_html"] = generated_html
            state["quality_score"] = 0.8  # 模拟质量分数
            state["current_step"] = "completed"
            
            return state
        except Exception as e:
            state["errors"].append(f"Final processing failed: {str(e)}")
            return state


class WorkflowManager:
    """管理多个工作流实例的管理器"""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.db_manager = db_manager or DatabaseManager()
        self.active_workflows = {}
    
    async def start_task(self, original_content: str, style_requirements: Dict) -> str:
        """启动新的样式转换任务"""
        try:
            logger.info(f"🚀 [TASK MANAGER] Starting new task creation...")
            logger.info(f"📄 Content length: {len(original_content)} characters")
            logger.info(f"🎨 Style requirements: {style_requirements}")
            
            # 在数据库中创建任务
            task_id = self.db_manager.create_task(original_content, style_requirements)
            logger.info(f"📋 [TASK MANAGER] Created task in database: {task_id}")
            
            # 创建工作流实例
            workflow = OptimizedStyleTransformWorkflow(self.db_manager)
            self.active_workflows[task_id] = workflow
            logger.info(f"⚙️ [TASK MANAGER] Created workflow instance for task {task_id}")
            
            # 启动工作流执行（异步）
            logger.info(f"🏃 [TASK MANAGER] Launching async workflow execution for task {task_id}")
            asyncio.create_task(self._execute_task_workflow(task_id, workflow, original_content, style_requirements))
            
            logger.info(f"✅ [TASK MANAGER] Task {task_id} successfully queued for execution")
            return task_id
            
        except Exception as e:
            logger.error(f"❌ [TASK MANAGER] Failed to start task: {str(e)}")
            raise Exception(f"Failed to start task: {str(e)}")
    
    async def _execute_task_workflow(self, task_id: str, workflow: OptimizedStyleTransformWorkflow,
                                   original_content: str, style_requirements: Dict):
        """执行任务的工作流"""
        logger.info(f"🔄 [TASK EXECUTOR] Starting workflow execution for task {task_id}")
        
        try:
            result = await workflow.execute_workflow(task_id, original_content, style_requirements)
            
            if result.get("success"):
                logger.info(f"🎉 [TASK EXECUTOR] Task {task_id} completed successfully!")
                logger.info(f"📊 Processing time: {result.get('processing_time', 0):.2f}s")
            else:
                logger.error(f"❌ [TASK EXECUTOR] Task {task_id} failed: {result.get('error_message', 'Unknown error')}")
                
        except Exception as e:
            logger.error(f"💥 [TASK EXECUTOR] Task {task_id} failed with exception: {str(e)}")
            # 记录错误
            self.db_manager.update_task(task_id, {
                "status": "failed",
                "error_message": str(e)
            })
        finally:
            # 清理工作流实例
            if task_id in self.active_workflows:
                del self.active_workflows[task_id]
                logger.info(f"🧹 [TASK EXECUTOR] Cleaned up workflow instance for task {task_id}")
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """获取任务状态和进度"""
        try:
            workflow = self.active_workflows.get(task_id)
            if workflow:
                # 任务正在执行中，从数据库获取最新状态
                task = self.db_manager.get_task(task_id)
                if not task:
                    return {"error": "Task not found"}
                
                executions = self.db_manager.get_agent_executions(task_id)
                total_steps = 5  # content_analysis, style_analysis, design_adaptation, code_generation, quality_assessment
                completed_steps = len([ex for ex in executions if ex["status"] == "completed"])
                progress = min(completed_steps / total_steps, 1.0)
                
                return {
                    "task_id": task_id,
                    "status": task["status"],
                    "progress": progress,
                    "final_html": task["final_html"],
                    "quality_score": task["quality_score"],
                    "error_message": task["error_message"]
                }
            else:
                # 任务已完成或不存在，从数据库获取
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
        """获取详细任务执行信息"""
        try:
            # 获取任务信息
            task = self.db_manager.get_task(task_id)
            if not task:
                return {"error": "Task not found"}
            
            # 获取agent执行记录
            executions = self.db_manager.get_agent_executions(task_id)
            
            # 按agent分组执行记录
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
            return {"error": f"Failed to get task details: {str(e)}"}