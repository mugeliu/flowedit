import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.routes import router
from app.db.database import create_tables
from app.services.cache import style_cache
from app.utils.monitor import logger
from app.core.config import settings

# 加载环境变量
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化数据库
    create_tables()
    logger.info("数据库初始化完成")
    
    # 验证配置（非阻塞）
    try:
        if not settings.validate():
            logger.warning("配置验证存在警告，请检查环境变量")
        else:
            logger.info(f"AI风格化内容生成服务启动完成 - 模型: {settings.default_model}")
    except Exception as e:
        logger.warning(f"配置验证失败: {e}")
    
    yield
    # 关闭时清理资源
    style_cache.clear()
    logger.info("应用关闭完成")


app = FastAPI(
    title="AI Style Generation Service",
    description="基于LangChain和LangGraph的智能内容风格化系统",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该限制具体域名
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(router, prefix="/api")


@app.get("/", tags=["Root"])
async def root():
    """根路径健康检查"""
    return {
        "service": "AI Style Generation Service",
        "version": "1.0.0",
        "status": "running",
        "description": "基于LangChain和LangGraph的智能内容风格化系统"
    }


# 启动命令
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app", 
        host=settings.host, 
        port=settings.port, 
        reload=settings.reload,
        log_level="info"
    )