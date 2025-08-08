from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn
import logging
from contextlib import asynccontextmanager

from src.api.routes import router as api_router
from src.database.manager import DatabaseManager
from src.config.settings import settings


# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting StyleFlow Backend...")
    
    # Initialize database
    try:
        db_manager = DatabaseManager()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    # Log configuration
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"API Host: {settings.api_host}:{settings.api_port}")
    logger.info(f"OpenAI Model: {settings.openai_model}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down StyleFlow Backend...")


# Create FastAPI app
app = FastAPI(
    title="StyleFlow Backend",
    description="AI-powered HTML style transformation service for WeChat Official Account Platform",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else ["https://mp.weixin.qq.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)


@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with service information"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>StyleFlow Backend</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                max-width: 800px; 
                margin: 50px auto; 
                padding: 20px;
                line-height: 1.6;
                background: #f8f9fa;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .badge { 
                background: #27ae60; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 4px; 
                font-size: 12px;
                margin-left: 10px;
            }
            .endpoint { 
                background: #f8f9fa; 
                padding: 10px; 
                margin: 10px 0; 
                border-left: 3px solid #3498db;
                font-family: monospace;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            .feature {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #3498db;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="header">StyleFlow Backend <span class="badge">RUNNING</span></h1>
            
            <p>AI-powered HTML style transformation service for WeChat Official Account Platform</p>
            
            <div class="features">
                <div class="feature">
                    <h3>🎨 Style Transformation</h3>
                    <p>Convert plain HTML into beautifully styled content using AI-driven design systems</p>
                </div>
                <div class="feature">
                    <h3>🤖 Multi-Agent Architecture</h3>
                    <p>5 specialized AI agents working together: Style Designer, Content Analyst, Design Adapter, Code Engineer, Quality Director</p>
                </div>
                <div class="feature">
                    <h3>📱 WeChat Optimized</h3>
                    <p>Ensures compatibility with WeChat platform constraints and mobile viewing experience</p>
                </div>
                <div class="feature">
                    <h3>⚡ Async Processing</h3>
                    <p>Non-blocking task processing with real-time progress tracking</p>
                </div>
            </div>
            
            <h2>API Endpoints</h2>
            <div class="endpoint">POST /api/v1/transform - Create style transformation task</div>
            <div class="endpoint">GET /api/v1/task/{task_id} - Get task status and results</div>
            <div class="endpoint">GET /api/v1/task/{task_id}/steps - Get detailed execution steps</div>
            <div class="endpoint">GET /api/v1/health - Service health check</div>
            
            <h2>Documentation</h2>
            <p>
                <a href="/docs" target="_blank">📚 Interactive API Docs (Swagger UI)</a> | 
                <a href="/redoc" target="_blank">📖 ReDoc Documentation</a>
            </p>
            
            <h2>Architecture</h2>
            <p><strong>Tech Stack:</strong> FastAPI + LangGraph + LangChain + SQLite</p>
            <p><strong>AI Models:</strong> OpenAI GPT-4</p>
            <p><strong>Processing:</strong> Parallel agent execution with quality feedback loops</p>
            
            <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; text-align: center;">
                <p>StyleFlow Backend v1.0.0 | Built for FlowEdit Chrome Extension</p>
            </footer>
        </div>
    </body>
    </html>
    """


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=422,
        content={
            "error_code": "VALIDATION_ERROR",
            "error_message": "Request validation failed",
            "details": str(exc),
            "timestamp": "2024-01-01T00:00:00Z"
        }
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": f"HTTP_{exc.status_code}",
            "error_message": exc.detail,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    import traceback
    from fastapi.responses import JSONResponse
    
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "error_message": "An unexpected error occurred",
            "details": str(exc) if settings.debug else "Internal server error",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )