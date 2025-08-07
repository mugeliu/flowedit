from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from ..models.schemas import (
    CreateStyleRequest, UseStyleRequest, AdjustStyleRequest, 
    StyleResponse, WorkflowType, WorkflowState
)
from ..core.workflow import create_style_workflow
from ..core.exceptions import StyleGenerationError, WeChatComplianceError, ContentParsingError
from ..services.style_dna_service import StyleDNAService
from ..services.html_renderer import HTMLRendererService
from ..db.database import get_db
from ..utils.monitor import monitor_workflow, workflow_monitor


router = APIRouter()

# 延迟创建工作流实例，避免在模块导入时初始化
_workflow = None

def get_workflow():
    """获取或创建工作流实例"""
    global _workflow
    if _workflow is None:
        _workflow = create_style_workflow()
    return _workflow


@monitor_workflow
def execute_style_workflow(workflow_type_str: str, initial_state: dict):
    """执行风格生成工作流"""
    workflow = get_workflow()
    return workflow.invoke(initial_state)


@router.post("/v1/styles/create", response_model=StyleResponse)
async def create_new_style(request: CreateStyleRequest, db: Session = Depends(get_db)):
    """创建风格DNA并保存到数据库 - 使用新的分步生成方法"""
    try:
        # 使用新的分步生成方法
        from ..core.langchain_chains import StyleDNAGeneratorChain
        
        generator = StyleDNAGeneratorChain()
        
        # 调用新的生成方法，获取包含详细步骤的结果
        result = generator.generate_style_dna(
            theme_name=request.theme_name,
            theme_description=request.theme_description
        )
        
        # 提取样式DNA（兼容原有返回格式）
        style_dna = result["style_dna"]
        
        # 保存风格DNA到数据库
        style_service = StyleDNAService(db)
        style_service.create_style_dna(request.theme_name, style_dna)
        
        return StyleResponse(
            style_dna=style_dna,
            theme_name=request.theme_name,
            is_valid=True,
            errors=[]
        )
        
    except Exception as e:
        print(f"❌ 创建样式失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"创建样式失败: {str(e)}")


@router.post("/v1/styles/apply", response_model=StyleResponse)
async def apply_existing_style(request: UseStyleRequest, db: Session = Depends(get_db)):
    """使用已有风格生成HTML - 优化版本，基于代码渲染"""
    try:
        # 检查风格是否存在
        style_service = StyleDNAService(db)
        existing_style = style_service.get_style_dna(request.theme_name)
        
        if not existing_style:
            raise HTTPException(
                status_code=404,
                detail=f"未找到风格主题: {request.theme_name}"
            )
        
        # 使用内容解析器解析内容结构
        from ..core.langchain_chains import ContentParserChain, StyleDNAGeneratorChain
        
        # 初始化解析器和渲染器
        llm = StyleDNAGeneratorChain().llm  # 复用已有的LLM实例
        parser = ContentParserChain(llm)
        renderer = HTMLRendererService()
        
        print(f"🔄 开始解析内容: {request.raw_content[:100]}...")
        
        # 解析内容结构
        content_result = parser.chain.invoke({"raw_content": request.raw_content})
        content_structure = parser.parse_and_clean(content_result)
        
        print(f"✅ 内容解析完成，元素数量: {len(content_structure.elements)}")
        
        # 基于代码渲染HTML
        html_content = renderer.render_complete_html(content_structure, existing_style)
        
        return StyleResponse(
            html_content=html_content,
            style_dna=existing_style,
            theme_name=request.theme_name,
            is_valid=True,
            errors=[]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 应用样式失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"应用样式失败: {str(e)}")


@router.post("/v1/styles/apply-fast", response_model=StyleResponse)
async def apply_existing_style_fast(request: UseStyleRequest, db: Session = Depends(get_db)):
    """使用已有风格生成HTML - 超快版本，纯代码处理"""
    try:
        # 检查风格是否存在
        style_service = StyleDNAService(db)
        existing_style = style_service.get_style_dna(request.theme_name)
        
        if not existing_style:
            raise HTTPException(
                status_code=404,
                detail=f"未找到风格主题: {request.theme_name}"
            )
        
        # 纯代码解析内容结构，不使用LLM
        content_structure = parse_content_with_regex(request.raw_content)
        
        # 基于代码渲染HTML
        renderer = HTMLRendererService()
        html_content = renderer.render_complete_html(content_structure, existing_style)
        
        return StyleResponse(
            html_content=html_content,
            style_dna=existing_style,
            theme_name=request.theme_name,
            is_valid=True,
            errors=[]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 快速应用样式失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"快速应用样式失败: {str(e)}")


def parse_content_with_regex(raw_content: str):
    """纯代码解析内容结构，不依赖LLM"""
    from ..models.schemas import ContentStructure
    import re
    
    elements = []
    lines = raw_content.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # 解析标题
        if line.startswith('#'):
            level = min(6, len(line) - len(line.lstrip('#')))
            content = line.lstrip('# ').strip()
            if content:
                elements.append({
                    'type': f'h{level}',
                    'content': content,
                    'level': level
                })
        
        # 解析列表
        elif line.startswith('-') or line.startswith('*') or line.startswith('+'):
            content = line[1:].strip()
            if content:
                elements.append({
                    'type': 'li',
                    'content': content
                })
        
        # 解析有序列表
        elif re.match(r'^\d+\.', line):
            content = re.sub(r'^\d+\.\s*', '', line)
            if content:
                elements.append({
                    'type': 'li',
                    'content': content
                })
        
        # 解析引用
        elif line.startswith('>'):
            content = line[1:].strip()
            if content:
                elements.append({
                    'type': 'blockquote',
                    'content': content
                })
        
        # 解析代码块
        elif line.startswith('```') or line.startswith('~~~'):
            elements.append({
                'type': 'code',
                'content': 'Code block placeholder'
            })
        
        # 普通段落
        else:
            elements.append({
                'type': 'p',
                'content': line
            })
    
    # 如果没有解析到任何元素，创建一个默认段落
    if not elements:
        elements.append({
            'type': 'p',
            'content': raw_content or 'FlowEdit - 样式化内容'
        })
    
    return ContentStructure(elements=elements)


@router.post("/v1/styles/adjust", response_model=StyleResponse)
async def adjust_style(request: AdjustStyleRequest, db: Session = Depends(get_db)):
    """调整已有风格并生成HTML"""
    try:
        # 检查风格是否存在
        style_service = StyleDNAService(db)
        existing_style = style_service.get_style_dna(request.theme_name)
        
        if not existing_style:
            raise HTTPException(
                status_code=404,
                detail=f"未找到风格主题: {request.theme_name}"
            )
        
        initial_state = {
            "raw_content": "",  # 调整风格时不需要内容
            "workflow_type": WorkflowType.ADJUST_STYLE,
            "theme_name": request.theme_name,
            "adjustment_request": request.adjustment_request,
            "style_dna": existing_style,
            "retry_count": 0,
            "parsed_content": [],
            "generated_html": None,
            "validation_errors": [],
            "is_valid": False
        }
        
        result = execute_style_workflow(
            WorkflowType.ADJUST_STYLE.value,
            initial_state
        )
        
        # 更新数据库中的风格DNA
        style_service.update_style_dna(
            request.theme_name,
            result["style_dna"]
        )
        
        return StyleResponse(
            html_content="",  # 调整风格时不返回HTML
            style_dna=result["style_dna"],
            theme_name=request.theme_name,
            is_valid=True,
            errors=[]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")


@router.get("/v1/styles/themes")
async def list_themes(db: Session = Depends(get_db)):
    """获取所有可用的风格主题"""
    try:
        style_service = StyleDNAService(db)
        themes = style_service.list_themes()
        return {"themes": themes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")


@router.get("/v1/monitor/stats")
async def get_monitor_stats():
    """获取监控统计信息"""
    return workflow_monitor.get_stats()


@router.get("/v1/monitor/health")
async def health_check(db: Session = Depends(get_db)):
    """健康检查"""
    try:
        # 检查数据库连接
        db.execute("SELECT 1")
        
        stats = workflow_monitor.get_stats()
        
        return {
            "status": "healthy",
            "database": "connected",
            "total_executions": stats['total_executions'],
            "success_rate": stats['success_count'] / max(stats['total_executions'], 1) * 100,
            "uptime": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }