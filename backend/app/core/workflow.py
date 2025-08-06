from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import Dict, Any
import json
import os

from ..models.schemas import WorkflowState, WorkflowType, StyleDNA
from .langchain_chains import ContentParserChain, StyleDNAGeneratorChain, HTMLGeneratorChain
from .wechat_validator import WeChatValidator
from .config import settings
from .exceptions import StyleGenerationError, WeChatComplianceError, ContentParsingError
from ..services.style_dna_service import StyleDNAService


def create_style_workflow():
    # 初始化LLM - 支持非OpenAI大模型
    llm = ChatOpenAI(
        model=settings.default_model,
        temperature=settings.temperature,
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        max_tokens=settings.max_tokens
    )
    
    # 初始化链和工具
    content_parser = ContentParserChain(llm)
    style_generator = StyleDNAGeneratorChain(llm)
    html_generator = HTMLGeneratorChain(llm)
    validator = WeChatValidator()
    
    # 定义节点函数
    def input_router(state: WorkflowState) -> Dict[str, Any]:
        """路由到对应的工作流分支"""
        return {"workflow_type": state["workflow_type"]}
    
    def parse_content(state: WorkflowState) -> Dict[str, Any]:
        """解析内容结构"""
        try:
            # 获取LLM的原始字符串输出
            raw_output = content_parser.chain.invoke({"raw_content": state["raw_content"]})
            
            # 使用自定义解析方法清理数据
            result = content_parser.parse_and_clean(raw_output)
            
            # 验证解析结果
            if not hasattr(result, 'elements') or not result.elements:
                raise ContentParsingError("解析结果为空或格式不正确", state["raw_content"])
            
            return {"parsed_content": result.elements}
            
        except Exception as e:
            # 如果是我们已知的错误，直接抛出
            if isinstance(e, ContentParsingError):
                raise
            # 其他错误包装后抛出
            error_msg = f"内容解析失败: {str(e)}"
            if "ValidationError" in str(e):
                error_msg += " (数据格式验证失败，可能是LLM输出格式不正确)"
            elif "OutputParserException" in str(e):
                error_msg += " (LLM输出解析失败，请检查内容格式)"
            raise ContentParsingError(error_msg, state["raw_content"])
    
    def generate_style_dna(state: WorkflowState) -> Dict[str, Any]:
        """生成新的风格DNA"""
        if state["workflow_type"] == WorkflowType.CREATE_NEW_STYLE:
            try:
                result = style_generator.chain.invoke({
                    "theme_name": state["theme_name"],
                    "theme_description": state["theme_description"],
                    "content_structure": state["parsed_content"]
                })
                # 解析JSON结果
                style_dna = json.loads(result)
                return {"style_dna": style_dna}
            except Exception as e:
                raise StyleGenerationError(f"风格DNA生成失败: {str(e)}")
        return {}
    
    def load_existing_style(state: WorkflowState) -> Dict[str, Any]:
        """加载已有风格DNA"""
        if state["workflow_type"] == WorkflowType.USE_EXISTING_STYLE:
            from ..db.database import get_db
            db = next(get_db())
            service = StyleDNAService(db)
            style_dna = service.get_style_dna(state["theme_name"])
            db.close()
            
            if not style_dna:
                raise StyleGenerationError(f"未找到风格主题: {state['theme_name']}")
            
            return {"style_dna": style_dna}
        return {}
    
    def adjust_style_dna(state: WorkflowState) -> Dict[str, Any]:
        """调整风格DNA"""
        if state["workflow_type"] == WorkflowType.ADJUST_STYLE:
            # 基于调整请求修改风格DNA
            # 这里简化实现，实际可以用LLM来智能调整
            current_dna = state.get("style_dna", {})
            adjustment = state.get("adjustment_request", "")
            
            # 简单的调整逻辑示例
            if "更大" in adjustment or "大一点" in adjustment:
                for key in current_dna:
                    if key.endswith("_styles") and "font-size" in current_dna[key]:
                        current_size = current_dna[key]["font-size"]
                        if "px" in current_size:
                            size = int(current_size.replace("px", ""))
                            current_dna[key]["font-size"] = f"{size + 2}px"
            
            return {"style_dna": current_dna}
        return {}
    
    def generate_html(state: WorkflowState) -> Dict[str, Any]:
        """生成HTML"""
        try:
            result = html_generator.chain.invoke({
                "parsed_content": state["parsed_content"],
                "style_dna": state["style_dna"]
            })
            return {"generated_html": result}
        except Exception as e:
            raise StyleGenerationError(f"HTML生成失败: {str(e)}")
    
    def validate_wechat_compliance(state: WorkflowState) -> Dict[str, Any]:
        """验证微信平台合规性"""
        validation_result = validator.validate(state["generated_html"])
        return {
            "is_valid": validation_result["is_valid"],
            "validation_errors": validation_result["errors"]
        }
    
    def fix_html_issues(state: WorkflowState) -> Dict[str, Any]:
        """修复HTML合规问题"""
        if state["retry_count"] < 3:
            # 简单的修复逻辑
            html = state["generated_html"]
            errors = state["validation_errors"]
            
            # 基本修复：替换div为section
            if any("div标签" in error for error in errors):
                html = html.replace("<div", "<section").replace("</div>", "</section>")
            
            # 移除id属性
            if any("id属性" in error for error in errors):
                import re
                html = re.sub(r'\s*id="[^"]*"', '', html)
            
            return {
                "generated_html": html,
                "retry_count": state["retry_count"] + 1
            }
        else:
            # 超过重试次数，返回错误
            return {"is_valid": False}
    
    # 构建工作流图
    workflow = StateGraph(WorkflowState)
    
    # 添加节点
    workflow.add_node("input_router", input_router)
    workflow.add_node("parse_content", parse_content)
    workflow.add_node("generate_style_dna", generate_style_dna)
    workflow.add_node("load_existing_style", load_existing_style)
    workflow.add_node("adjust_style_dna", adjust_style_dna)
    workflow.add_node("generate_html", generate_html)
    workflow.add_node("validate_compliance", validate_wechat_compliance)
    workflow.add_node("fix_html", fix_html_issues)
    
    # 定义边和条件
    workflow.set_entry_point("input_router")
    
    workflow.add_edge("input_router", "parse_content")
    
    # 根据工作流类型分支
    workflow.add_conditional_edges(
        "parse_content",
        lambda x: x["workflow_type"].value,
        {
            "create_new_style": "generate_style_dna",
            "use_existing_style": "load_existing_style",
            "adjust_style": "adjust_style_dna"
        }
    )
    
    workflow.add_edge("generate_style_dna", "generate_html")
    workflow.add_edge("load_existing_style", "generate_html")
    workflow.add_edge("adjust_style_dna", "generate_html")
    
    workflow.add_edge("generate_html", "validate_compliance")
    
    # 验证结果分支
    workflow.add_conditional_edges(
        "validate_compliance",
        lambda x: "valid" if x["is_valid"] else "invalid",
        {
            "valid": END,
            "invalid": "fix_html"
        }
    )
    
    workflow.add_conditional_edges(
        "fix_html",
        lambda x: "retry" if x["retry_count"] < 3 else "failed",
        {
            "retry": "generate_html",
            "failed": END
        }
    )
    
    return workflow.compile()