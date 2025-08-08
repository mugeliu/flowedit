from abc import ABC, abstractmethod
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from typing import Dict, List, Any
from src.models.schemas import AgentState
from src.config.settings import settings


class BaseAgent(ABC):
    """Base class for all agents"""
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.llm_model = ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            temperature=settings.temperature,
            base_url=settings.openai_base_url
        )
        self.tools = self._initialize_tools()
        self.prompt_template = self._get_prompt_template()
        
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