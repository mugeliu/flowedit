from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Dict, Any, List
from abc import ABC, abstractmethod


class BaseCustomTool(BaseTool, ABC):
    """Base class for all custom tools"""
    
    def validate_input(self, input_data: Dict) -> bool:
        """Validate input data"""
        return True
    
    def validate_output(self, output_data: Dict) -> bool:
        """Validate output data"""
        return True
    
    def _run(self, **kwargs) -> Dict[str, Any]:
        """Run the tool synchronously"""
        if not self.validate_input(kwargs):
            return {"error": "Invalid input data"}
        
        try:
            result = self.execute(**kwargs)
            if not self.validate_output(result):
                return {"error": "Invalid output data"}
            return result
        except Exception as e:
            return {"error": str(e)}
    
    async def _arun(self, **kwargs) -> Dict[str, Any]:
        """Run the tool asynchronously"""
        return self._run(**kwargs)
    
    @abstractmethod
    def execute(self, **kwargs) -> Dict[str, Any]:
        """Execute the tool logic"""
        pass