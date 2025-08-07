import os
from typing import Optional
from dotenv import load_dotenv

# 确保在创建Settings实例前加载环境变量
load_dotenv()


class Settings:
    """应用配置管理"""
    
    def __init__(self):
        # AI配置
        self.openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
        self.openai_base_url: Optional[str] = os.getenv("OPENAI_BASE_URL")
        self.default_model: str = os.getenv("DEFAULT_MODEL", "gpt-3.5-turbo")
        self.temperature: float = float(os.getenv("TEMPERATURE", "0.7"))
        self.max_tokens: int = int(os.getenv("MAX_TOKENS", "2000"))
        
        # 数据库配置
        self.database_url: str = os.getenv("DATABASE_URL", "sqlite:///./style_dna.db")
        
        # 服务配置
        self.host: str = os.getenv("HOST", "127.0.0.1")
        self.port: int = int(os.getenv("PORT", "8000"))
        self.debug: bool = os.getenv("DEBUG", "false").lower() == "true"
        self.reload: bool = os.getenv("RELOAD", "false").lower() == "true"
        
        # 日志配置
        self.log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    def validate(self) -> bool:
        """验证配置是否有效"""
        if not self.openai_api_key:
            print("警告: OPENAI_API_KEY 未设置")
            return False
        
        if self.temperature < 0 or self.temperature > 2:
            print("警告: TEMPERATURE 应该在 0-2 之间")
            return False
        
        return True


# 全局配置实例
settings = Settings()