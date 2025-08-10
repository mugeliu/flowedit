from abc import ABC, abstractmethod
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from typing import Dict, List, Any
from src.models.schemas import AgentState
from src.config.settings import settings
from src.config.logger import get_agent_logger
import time


class BaseAgent(ABC):
    """Base class for all agents"""
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        # 默认主要模型
        self.llm_model = ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            temperature=settings.temperature,
            base_url=settings.openai_base_url
        )
        # 多模型实例
        self.fast_model = ChatOpenAI(
            model=settings.fast_model,
            api_key=settings.openai_api_key,
            temperature=0.1,  # 快速模型用低温度
            base_url=settings.openai_base_url
        )
        self.complex_model = ChatOpenAI(
            model=settings.complex_model,
            api_key=settings.openai_api_key,
            temperature=settings.temperature,
            base_url=settings.openai_base_url
        )
        self.preprocessing_model = ChatOpenAI(
            model=settings.preprocessing_model,
            api_key=settings.openai_api_key,
            temperature=0.1,  # 预处理用低温度确保稳定性
            base_url=settings.openai_base_url
        )
        self.validation_model = ChatOpenAI(
            model=settings.validation_model,
            api_key=settings.openai_api_key,
            temperature=0.1,  # 验证用低温度确保准确性
            base_url=settings.openai_base_url
        )
        
        self.tools = self._initialize_tools()
        self.prompt_template = self._get_prompt_template()
        self.logger = None  # 将在执行时初始化
        
    @abstractmethod
    def _initialize_tools(self) -> List:
        """Initialize tools for this agent"""
        pass
    
    @abstractmethod
    def _get_prompt_template(self) -> PromptTemplate:
        """Get the prompt template for this agent"""
        pass
    
    @abstractmethod
    def execute(self, state: AgentState) -> AgentState:
        """Execute agent logic and return updated state"""
        pass
    
    def validate_input(self, state: AgentState) -> bool:
        """Validate input state"""
        return True
    
    def format_prompt(self, state: AgentState) -> str:
        """Format prompt with state data"""
        return self.prompt_template.format(**state.dict())
    
    def parse_output(self, raw_output: str) -> Dict:
        """Parse agent output"""
        try:
            import json
            # Try to parse as JSON first
            return json.loads(raw_output)
        except:
            # Return as text if not valid JSON
            return {"content": raw_output}
    
    def handle_error(self, error: Exception) -> Dict:
        """Handle errors during execution"""
        return {
            "error": str(error),
            "agent": self.agent_name,
            "status": "failed"
        }
    
    def call_llm(self, prompt: str, task_id: str = None, model_type: str = "default") -> str:
        """调用指定类型的大模型并记录日志
        
        Args:
            prompt: 提示词
            task_id: 任务ID  
            model_type: 模型类型 ("default", "fast", "complex", "preprocessing", "validation")
        """
        if not self.logger:
            self.logger = get_agent_logger(self.agent_name, task_id)
        
        # 选择对应的模型实例
        model_map = {
            "default": self.llm_model,
            "fast": self.fast_model,
            "complex": self.complex_model, 
            "preprocessing": self.preprocessing_model,
            "validation": self.validation_model
        }
        
        selected_model = model_map.get(model_type, self.llm_model)
        model_name = getattr(selected_model, 'model_name', model_type)
        
        self.logger.info(f"Calling {model_name} LLM (type: {model_type})")
        start_time = time.time()
        
        try:
            # 调用选定的模型
            response = selected_model.predict(prompt)
            
            execution_time = time.time() - start_time
            self.logger.info(f"LLM call completed in {execution_time:.1f}s - Response length: {len(response)} chars")
            
            return response
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"LLM call failed after {execution_time:.1f}s: {str(e)}")
            raise
    
    def update_state(self, state: AgentState, result: Dict) -> AgentState:
        """Update state with agent results"""
        # Update current step
        state.current_step = self.agent_name
        
        # Add any errors
        if "error" in result:
            state.errors.append(f"{self.agent_name}: {result['error']}")
        
        # Add warnings if any
        if "warnings" in result:
            state.warnings.extend(result["warnings"])
            
        return state