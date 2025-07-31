from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config.settings import settings
from app.api import routes
from app.utils.logger import setup_logger


# 设置日志
logger = setup_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    logger.info("Starting FlowEdit Backend Service...")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"Default model: {settings.default_model}")
    logger.info(f"Allowed origins: {settings.origins_list}")
    
    yield
    
    # 关闭时
    logger.info("Shutting down FlowEdit Backend Service...")


# 创建FastAPI应用实例
app = FastAPI(
    title="FlowEdit Backend Service",
    description="AI-powered content processing service for FlowEdit Chrome Extension",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# 注册路由
app.include_router(routes.router, prefix="/api")


@app.get("/", tags=["Root"])
async def root():
    """根路径"""
    return {
        "service": "FlowEdit Backend",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if settings.debug else "disabled"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )