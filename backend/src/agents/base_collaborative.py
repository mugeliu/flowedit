from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from src.models.schemas import AgentState
from src.agents.base import BaseAgent
import time
from datetime import datetime
from src.config.logger import get_agent_logger


class BaseCollaborativeAgent(BaseAgent):
    """Agent协作基类 - 统一协作接口和机制"""
    
    def __init__(self, agent_name: str):
        super().__init__(agent_name)
        self.execution_id = None
    
    def _initialize_tools(self) -> List:
        """协作Agent默认不需要特殊工具"""
        return []
    
    def _get_prompt_template(self):
        """协作Agent使用自定义prompt"""
        return None
    
    @abstractmethod
    def execute(self, state: AgentState) -> AgentState:
        """子类必须实现的执行方法"""
        pass
    
    def pre_execute_hook(self, state: AgentState) -> AgentState:
        """执行前钩子 - 协作准备"""
        self.execution_id = f"{self.agent_name}_{int(time.time())}"
        
        # 初始化logger
        self.logger = get_agent_logger(self.agent_name, state.task_id)
        
        # 记录Agent开始执行
        self.logger.info(f"Starting execution", extra_context={
            "execution_id": self.execution_id,
            "step": state.current_step,
            "iteration": state.iteration_count
        })
        
        # 记录执行开始
        execution_record = {
            "agent_name": self.agent_name,
            "execution_id": self.execution_id,
            "started_at": datetime.now().isoformat(),
            "input_summary": self._get_input_summary(state),
            "status": "running"
        }
        state.agent_execution_log.append(execution_record)
        
        # 设置协作上下文
        state.collaboration_context[self.agent_name] = {
            "execution_id": self.execution_id,
            "started_at": execution_record["started_at"],
            "input_data": self._extract_relevant_input(state)
        }
        
        # 记录输入数据摘要
        self.logger.debug(f"Input summary", extra_context=execution_record["input_summary"])
        
        return state
    
    def post_execute_hook(self, state: AgentState, success: bool = True, error: str = None) -> AgentState:
        """执行后钩子 - 协作记录"""
        execution_time = None
        
        # 更新执行记录
        for record in state.agent_execution_log:
            if record.get("execution_id") == self.execution_id:
                record["completed_at"] = datetime.now().isoformat()
                record["status"] = "completed" if success else "failed"
                record["output_summary"] = self._get_output_summary(state)
                if error:
                    record["error"] = error
                # 计算执行时间
                start_time = datetime.fromisoformat(record["started_at"])
                end_time = datetime.fromisoformat(record["completed_at"])
                execution_time = (end_time - start_time).total_seconds()
                break
        
        # 记录执行完成
        if self.logger:
            status_msg = "completed successfully" if success else f"failed: {error}"
            self.logger.info(f"Execution {status_msg}", extra_context={
                "execution_id": self.execution_id,
                "execution_time": execution_time,
                "success": success,
                "output_summary": self._get_output_summary(state)
            })
        
        # 添加质量检查点
        if success:
            quality_checkpoint = {
                "agent_name": self.agent_name,
                "checkpoint_time": datetime.now().isoformat(),
                "quality_indicators": self._get_quality_indicators(state),
                "data_integrity": self._check_data_integrity(state)
            }
            state.quality_checkpoints.append(quality_checkpoint)
            
            if self.logger:
                self.logger.debug(f"Quality checkpoint added", extra_context=quality_checkpoint)
        
        # 更新协作上下文
        if self.agent_name in state.collaboration_context:
            state.collaboration_context[self.agent_name].update({
                "completed_at": datetime.now().isoformat(),
                "success": success,
                "output_data": self._extract_relevant_output(state)
            })
        
        return state
    
    def execute_with_collaboration(self, state: AgentState) -> AgentState:
        """带协作机制的执行包装器"""
        try:
            # 执行前处理
            state = self.pre_execute_hook(state)
            
            # 验证前置条件
            if self.logger:
                self.logger.debug("Validating preconditions")
            
            if not self.validate_preconditions(state):
                error_msg = f"{self.agent_name}: Preconditions not met"
                if self.logger:
                    self.logger.error(error_msg)
                state.errors.append(error_msg)
                state.last_error = error_msg
                return self.post_execute_hook(state, success=False, error=error_msg)
            
            # 执行主逻辑
            if self.logger:
                self.logger.info("Executing main logic")
            
            state = self.execute(state)
            
            # 验证执行结果
            if self.logger:
                self.logger.debug("Validating output")
            
            if not self.validate_output(state):
                error_msg = f"{self.agent_name}: Output validation failed"
                if self.logger:
                    self.logger.error(error_msg)
                state.errors.append(error_msg)
                state.last_error = error_msg
                return self.post_execute_hook(state, success=False, error=error_msg)
            
            # 执行后处理
            state = self.post_execute_hook(state, success=True)
            
            # 发送协作反馈给下一个Agent
            self._send_collaboration_feedback(state)
            
            return state
            
        except Exception as e:
            error_msg = f"{self.agent_name} execution failed: {str(e)}"
            if self.logger:
                self.logger.error(error_msg, exc_info=True)
            state.errors.append(error_msg)
            state.last_error = error_msg
            return self.post_execute_hook(state, success=False, error=error_msg)
    
    def validate_preconditions(self, state: AgentState) -> bool:
        """验证执行前置条件"""
        return True  # 子类可重写
    
    def validate_output(self, state: AgentState) -> bool:
        """验证执行输出"""
        return True  # 子类可重写
    
    def _get_input_summary(self, state: AgentState) -> Dict[str, Any]:
        """获取输入摘要"""
        return {
            "task_id": state.task_id,
            "current_step": state.current_step,
            "has_previous_results": len(state.agent_execution_log) > 0
        }
    
    def _get_output_summary(self, state: AgentState) -> Dict[str, Any]:
        """获取输出摘要"""
        return {
            "current_step": state.current_step,
            "errors_count": len(state.errors),
            "warnings_count": len(state.warnings)
        }
    
    def _extract_relevant_input(self, state: AgentState) -> Dict[str, Any]:
        """提取与当前Agent相关的输入数据"""
        return {}  # 子类可重写
    
    def _extract_relevant_output(self, state: AgentState) -> Dict[str, Any]:
        """提取与当前Agent相关的输出数据"""
        return {}  # 子类可重写
    
    def _get_quality_indicators(self, state: AgentState) -> Dict[str, Any]:
        """获取质量指标"""
        return {
            "execution_successful": True,
            "data_completeness": 1.0
        }
    
    def _check_data_integrity(self, state: AgentState) -> Dict[str, Any]:
        """检查数据完整性"""
        return {
            "integrity_score": 1.0,
            "issues": []
        }
    
    def _send_collaboration_feedback(self, state: AgentState):
        """发送协作反馈给下一个Agent"""
        try:
            # 定义Agent执行顺序和反馈目标
            feedback_chain = {
                "content_analyst": "style_designer",
                "style_designer": "design_adapter", 
                "design_adapter": "code_engineer",
                "code_engineer": "quality_director"
            }
            
            # 获取当前Agent应该反馈给的目标Agent
            target_agent = feedback_chain.get(self.agent_name)
            if target_agent:
                # 获取协作反馈内容
                feedback_content = self.get_collaboration_feedback(state)
                if feedback_content:
                    # 发送反馈
                    self.provide_feedback_to_agent(state, target_agent, feedback_content)
                    
                    if self.logger:
                        self.logger.info(f"Sent collaboration feedback to {target_agent}", 
                                       extra_context={"feedback_length": len(feedback_content), "target_agent": target_agent})
                        
        except Exception as e:
            if self.logger:
                self.logger.warning(f"Failed to send collaboration feedback: {str(e)}")

    def _get_received_feedback(self, state: AgentState) -> str:
        """获取其他Agent发送给当前Agent的反馈"""
        try:
            agent_feedback_list = state.agent_feedback.get(self.agent_name, [])
            if agent_feedback_list:
                combined_feedback = " | ".join(agent_feedback_list)
                if self.logger:
                    self.logger.info(f"Received collaboration feedback", 
                                   extra_context={"feedback_count": len(agent_feedback_list), "total_length": len(combined_feedback)})
                return combined_feedback
            return ""
        except Exception as e:
            if self.logger:
                self.logger.warning(f"Failed to get received feedback: {str(e)}")
            return ""

    def get_collaboration_feedback(self, state: AgentState) -> Optional[str]:
        """获取对其他Agent的协作反馈"""
        return ""  # 子类可重写
    
    def provide_feedback_to_agent(self, state: AgentState, target_agent: str, feedback: str):
        """向其他Agent提供反馈"""
        if target_agent not in state.agent_feedback:
            state.agent_feedback[target_agent] = []
        state.agent_feedback[target_agent].append(f"From {self.agent_name}: {feedback}")