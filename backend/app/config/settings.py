from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # API Keys
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    
    # Application Settings
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    allowed_origins: str = "chrome-extension://*,http://localhost:*,https://mp.weixin.qq.com"
    
    # AI Model Settings
    openai_base_url: str = ""
    default_model: str = "gpt-4o-mini"
    max_tokens: int = 2000
    temperature: float = 0.7
    request_timeout: int = 180  # 请求超时时间（秒）
    max_content_length: int = 15000  # 最大内容长度（字符）
    
    @property
    def origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    class Config:
        env_file = ".env"


settings = Settings()