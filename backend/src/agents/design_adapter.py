from src.agents.base_collaborative import BaseCollaborativeAgent
from src.models.schemas import AgentState
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from src.config.settings import settings
from typing import Dict, Any
import json


class DesignAdapterAgent(BaseCollaborativeAgent):
    """设计适配Agent - 纯大模型驱动版本"""
    
    def __init__(self):
        super().__init__("design_adapter")
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.1,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
        
        self.css_prompt = PromptTemplate(
            input_variables=["design_tokens", "content_analysis", "collaboration_feedback"],
            template="""
你是专精CSS和包豪斯风格的前端技术专家，需要将包豪斯设计token转换为精确的CSS样式规则。

设计token系统：
{design_tokens}

内容分析结果：
{content_analysis}

StyleDesigner协作反馈：
{collaboration_feedback}

请基于设计token、内容特征和协作反馈，生成完整的CSS样式规则JSON，确保符合微信公众号平台兼容性：

{{
    "container": "font-family: Arial, sans-serif; color: #000000; max-width: 800px; margin: 0 auto; line-height: 1.6",
    
    "h1": "font-size: 24px; color: #000000; font-weight: 700; margin: 0 0 40px 0; border-left: 6px solid #E53E3E; padding-left: 20px",
    
    "section-container": "margin: 40px 0; max-width: 100%; box-sizing: border-box",
    
    "section-number-center": "text-align: center; margin: 0 0 30px 0",
    
    "section-number-1": "background: #E53E3E; color: #FFFFFF; font-size: 28px; font-weight: 700; padding: 18px 22px; font-family: Arial, sans-serif; text-align: center; display: inline-block; margin: 0 0 30px 0",
    
    "section-number-2": "background: #3182CE; color: #FFFFFF; font-size: 28px; font-weight: 700; padding: 18px 22px; font-family: Arial, sans-serif; text-align: center; display: inline-block; margin: 0 0 30px 0",
    
    "section-number-3": "background: #D69E2E; color: #FFFFFF; font-size: 28px; font-weight: 700; padding: 18px 22px; font-family: Arial, sans-serif; text-align: center; display: inline-block; margin: 0 0 30px 0",
    
    "paragraph": "font-size: 16px; color: #404040; line-height: 1.7; margin: 0 0 24px 0; font-family: Arial, sans-serif",
    
    "quote-block": "background: #F8F8F8; border-left: 4px solid #3182CE; padding: 20px 24px; margin: 0 0 4px 0; font-size: 15px; color: #202020; line-height: 1.6; font-family: Arial, sans-serif; font-style: italic",
    
    "emphasis-block": "background: #E53E3E; color: #FFFFFF; padding: 16px; margin: 16px 0 0 0; font-weight: 500; font-family: Arial, sans-serif",
    
    "separator-geometric": "text-align: center; margin: 60px 0; font-size: 16px; color: #808080; letter-spacing: 15px"
}}

技术要求：
1. 严格基于提供的设计token生成CSS规则
2. 确保所有样式兼容微信公众号（避免position、z-index、transform等）
3. 根据内容分析的章节数量生成对应数量的section-number样式
4. 根据内容分析的引用情感类型生成多样化的引用样式
5. 使用内联样式格式，所有值都是完整的CSS属性声明
6. 包含完整的布局、排版、色彩、几何元素的CSS实现
7. 确保强烈的包豪斯视觉对比和几何美感

重点关注：
- 章节标号的色彩序列应用
- 引用内容的边框色彩区分
- 强调内容的背景色突出
- 整体的包豪斯几何结构

只输出JSON格式的CSS规则，每个key是CSS选择器，每个value是完整的CSS样式声明。
"""
        )
    
    def execute(self, state: AgentState) -> AgentState:
        """执行CSS规则生成 - 完全基于大模型"""
        try:
            design_tokens = state.design_tokens or {}
            content_analysis = state.content_analysis_summary or {}
            
            # 获取StyleDesigner的协作反馈
            received_feedback = self._get_received_feedback(state)
            
            # 使用大模型生成CSS规则（包含协作反馈）
            css_rules = self._perform_llm_css_generation(design_tokens, content_analysis, received_feedback, state)
            
            # 存储结果到协作状态
            state.css_rules = css_rules
            state.current_step = "css_generation_completed"
            
            # 为后续Agent提供详细的协作上下文
            state.collaboration_context["css_features"] = {
                "total_rules": len(css_rules),
                "has_section_styles": any("section-number" in key for key in css_rules.keys()),
                "has_quote_styles": any("quote" in key for key in css_rules.keys()),
                "has_emphasis_styles": any("emphasis" in key for key in css_rules.keys()),
                "has_typography_hierarchy": any(key in ["h1", "paragraph"] for key in css_rules.keys()),
                "css_completeness": "comprehensive" if len(css_rules) > 8 else "basic"
            }
            
            return state
                
        except Exception as e:
            state.errors.append(f"CSS generation failed: {str(e)}")
            state.last_error = str(e)
            state.current_step = "css_generation_failed"
            return state
    
    def _perform_llm_css_generation(self, design_tokens: Dict[str, Any], content_analysis: Dict[str, Any], received_feedback: str, state: AgentState) -> Dict[str, str]:
        """使用复杂模型生成CSS规则"""
        prompt_text = self.css_prompt.format(
            design_tokens=json.dumps(design_tokens, ensure_ascii=False, indent=2),
            content_analysis=json.dumps(content_analysis, ensure_ascii=False, indent=2),
            collaboration_feedback=received_feedback or "无特殊反馈，按标准设计token实现"
        )
        
        response = self.call_llm(prompt_text, state.task_id, model_type="complex")
        
        try:
            css_rules = json.loads(response)
            
            # 验证CSS规则的完整性
            if not isinstance(css_rules, dict):
                raise ValueError("GPT-4返回的不是有效的字典格式")
            
            if len(css_rules) < 3:
                raise ValueError("GPT-4返回的CSS规则不够完整")
            
            # 检查必要的基础样式
            required_selectors = ["container", "h1", "paragraph"]
            missing_selectors = [sel for sel in required_selectors if sel not in css_rules]
            if missing_selectors:
                raise ValueError(f"GPT-4返回结果缺少必要的CSS选择器: {missing_selectors}")
            
            return css_rules
                
        except json.JSONDecodeError as e:
            raise ValueError(f"GPT-4返回的不是有效JSON格式: {str(e)}")
        except Exception as e:
            raise ValueError(f"CSS规则验证失败: {str(e)}")
    
    
    def validate_preconditions(self, state: AgentState) -> bool:
        """验证执行前置条件"""
        return (
            state.design_tokens is not None and
            isinstance(state.design_tokens, dict) and
            len(state.design_tokens) > 0
        )
    
    def validate_output(self, state: AgentState) -> bool:
        """验证输出质量"""
        return (
            state.css_rules is not None and
            isinstance(state.css_rules, dict) and
            len(state.css_rules) > 0 and
            "container" in state.css_rules
        )
    
    def _extract_relevant_input(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输入数据"""
        design_tokens = state.design_tokens or {}
        return {
            "design_tokens_count": len(design_tokens),
            "has_color_system": bool(design_tokens.get("color_system")),
            "has_typography_system": bool(design_tokens.get("typography_system")),
            "has_geometric_elements": bool(design_tokens.get("geometric_elements"))
        }
    
    def _extract_relevant_output(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输出数据"""
        if not state.css_rules:
            return {}
        
        css_rules = state.css_rules
        return {
            "total_css_rules": len(css_rules),
            "section_styles_count": len([k for k in css_rules.keys() if "section-number" in k]),
            "quote_styles_count": len([k for k in css_rules.keys() if "quote" in k]),
            "has_typography": any(k in ["h1", "paragraph"] for k in css_rules.keys()),
            "selectors": list(css_rules.keys())
        }
    
    def get_collaboration_feedback(self, state: AgentState) -> str:
        """为CodeEngineer提供协作反馈"""
        if not state.css_rules:
            return ""
        
        css_rules = state.css_rules
        feedback_parts = []
        
        # 章节样式反馈
        section_styles = [k for k in css_rules.keys() if "section-number" in k]
        if section_styles:
            feedback_parts.append(f"已生成{len(section_styles)}个章节标号样式，请为每个章节标号分别应用对应的样式类")
        
        # 引用样式反馈
        quote_styles = [k for k in css_rules.keys() if "quote" in k]
        if quote_styles:
            feedback_parts.append(f"已生成{len(quote_styles)}种引用样式，建议根据引用情感特征选择对应样式")
        
        # 强调样式反馈
        if "emphasis-block" in css_rules:
            feedback_parts.append("已生成强调块样式，请为重要强调内容使用emphasis-block内联样式")
        
        # 布局样式反馈
        if "container" in css_rules and "section-container" in css_rules:
            feedback_parts.append("已生成完整的包豪斯布局样式体系，请确保HTML结构正确应用样式")
        
        return "; ".join(feedback_parts) if feedback_parts else "基础CSS规则已生成"