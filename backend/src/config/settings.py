from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # OpenAI Configuration
    openai_api_key: str
    openai_model: str = "gpt-4"
    openai_base_url: Optional[str] = None  # 支持自定义API端点
    default_model: Optional[str] = None    # 支持旧配置兼容
    max_tokens: int = 4000
    temperature: float = 0.7
    
    # Database Configuration
    database_url: str = "sqlite:///./style_flow.db"
    
    # Application Configuration
    debug: bool = True
    log_level: str = "INFO"
    reload: bool = False
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    host: Optional[str] = None  # 兼容旧配置
    port: Optional[int] = None  # 兼容旧配置
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # 忽略额外的未定义字段
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # 处理兼容性映射
        if self.host and not kwargs.get('api_host'):
            self.api_host = self.host
        if self.port and not kwargs.get('api_port'):
            self.api_port = self.port
        if self.default_model and not kwargs.get('openai_model'):
            self.openai_model = self.default_model


settings = Settings()