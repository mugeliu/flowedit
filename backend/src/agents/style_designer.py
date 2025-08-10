from src.agents.base_collaborative import BaseCollaborativeAgent
from src.models.schemas import AgentState
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from src.config.settings import settings
from typing import Dict, Any
import json


class StyleDesignerAgent(BaseCollaborativeAgent):
    """风格设计Agent - 纯大模型驱动版本"""
    
    def __init__(self):
        super().__init__("style_designer")
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.3,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
        
        self.design_prompt = PromptTemplate(
            input_variables=["style_name", "content_analysis", "collaboration_feedback"],
            template="""
你是世界级的包豪斯风格设计大师，深刻理解包豪斯设计运动的核心理念和视觉语言。

包豪斯设计核心原则：
- 功能决定形式 (Form follows function)
- 几何化的简洁美学
- 主色彩强烈对比（红、蓝、黄 + 黑白）
- 不对称但平衡的构图
- 工业化的字体选择
- 结构性的空间组织

目标风格：{style_name}

内容分析结果：
{content_analysis}

ContentAnalyst协作反馈：
{collaboration_feedback}

请根据内容的结构特征和协作反馈，设计符合包豪斯美学的完整视觉系统，输出JSON格式的设计token：

{{
    "design_philosophy": "基于内容特征的包豪斯设计理念阐述",
    
    "color_system": {{
        "primary_color": "主色（经典包豪斯红）",
        "secondary_color": "辅助色（包豪斯蓝）", 
        "accent_color": "强调色（包豪斯黄）",
        "neutral_color": "中性色（黑或白）",
        "text_color": "文本颜色",
        "background_color": "背景色",
        "section_colors": ["章节标号色彩序列，根据章节数量设计"],
        "quote_colors": ["引用边框色彩序列，根据引用类型情感设计"],
        "emphasis_color": "重点强调背景色"
    }},
    
    "typography_system": {{
        "font_family": "工业化字体选择",
        "title_typography": {{
            "font_size": "主标题字号",
            "font_weight": "字重",
            "line_height": "行高",
            "letter_spacing": "字间距",
            "color": "标题颜色",
            "decoration": "装饰元素（如左边框）"
        }},
        "section_number_typography": {{
            "font_size": "章节标号字号（要醒目）",
            "font_weight": "字重",
            "color": "文字颜色"
        }},
        "paragraph_typography": {{
            "font_size": "正文字号",
            "line_height": "行高",
            "color": "文字颜色"
        }},
        "quote_typography": {{
            "font_size": "引用字号",
            "line_height": "引用行高",
            "font_style": "字体样式"
        }},
        "emphasis_typography": {{
            "font_weight": "强调字重",
            "color": "强调文字颜色"
        }}
    }},
    
    "geometric_elements": {{
        "section_number_geometry": {{
            "shape": "几何形状设计（色块/边框等）",
            "padding": "内边距",
            "margin": "外边距",
            "alignment": "对齐方式",
            "background_style": "背景处理方式"
        }},
        "quote_geometry": {{
            "border_design": "边框设计（位置、宽度、样式）",
            "background_treatment": "背景处理",
            "padding": "内边距",
            "margin": "外边距"
        }},
        "emphasis_geometry": {{
            "background_shape": "背景几何形状",
            "padding": "内边距",
            "margin": "外边距",
            "border_radius": "圆角设置"
        }},
        "separator_geometry": {{
            "type": "分隔符类型",
            "symbol": "几何符号",
            "spacing": "间距设计",
            "alignment": "对齐方式"
        }}
    }},
    
    "layout_structure": {{
        "container_design": {{
            "max_width": "容器最大宽度",
            "margin": "容器边距",
            "padding": "容器内边距"
        }},
        "section_layout": {{
            "margin": "章节间距",
            "padding": "章节内边距",
            "structure": "章节内部结构设计"
        }},
        "content_flow": {{
            "reading_rhythm": "阅读节奏设计",
            "visual_breaks": "视觉间断设计",
            "hierarchy_spacing": "层次间距系统"
        }}
    }},
    
    "emotional_design_mapping": {{
        "content_emotion_response": "基于内容情感的设计响应策略",
        "color_emotion_associations": {{
            "supportive_elements": "支持性元素的颜色选择",
            "challenging_elements": "挑战性元素的颜色选择",
            "reflective_elements": "反思性元素的颜色选择"
        }},
        "visual_comfort_adjustments": "视觉舒适度调整策略"
    }}
}}

请深度分析内容的结构、情感特征和视觉需求，运用包豪斯设计美学创造出既符合设计原则又契合内容特性的完整视觉系统。

关键要求：
1. 充分理解包豪斯"形式追随功能"的核心理念
2. 基于内容的实际结构特征进行针对性设计
3. 运用包豪斯经典色彩体系（红蓝黄+黑白）
4. 创造强烈的视觉层次和几何美感
5. 考虑内容的情感属性，用色彩传达情感支持

只输出JSON格式的设计token，不要任何解释文字。
"""
        )
    
    def execute(self, state: AgentState) -> AgentState:
        """执行包豪斯风格设计 - 完全基于大模型"""
        try:
            style_name = state.style_requirements.get("style_name", "包豪斯风格")
            content_analysis = state.content_analysis_summary or {}
            
            # 获取ContentAnalyst的协作反馈
            received_feedback = self._get_received_feedback(state)
            
            # 使用大模型进行包豪斯风格设计（包含协作反馈）
            design_tokens = self._perform_llm_bauhaus_design(style_name, content_analysis, received_feedback, state)
            
            # 存储结果到协作状态
            state.design_tokens = design_tokens
            state.current_step = "style_design_completed"
            
            # 为后续Agent提供详细的协作上下文
            state.collaboration_context["design_features"] = {
                "style_complexity": len(design_tokens),
                "has_bauhaus_elements": bool(design_tokens.get("geometric_elements")),
                "has_color_system": bool(design_tokens.get("color_system")),
                "has_typography_system": bool(design_tokens.get("typography_system")),
                "design_completeness": "comprehensive" if len(design_tokens) > 8 else "basic"
            }
            
            return state
                
        except Exception as e:
            state.errors.append(f"Style design failed: {str(e)}")
            state.last_error = str(e)
            state.current_step = "style_design_failed"
            return state
    
    def _perform_llm_bauhaus_design(self, style_name: str, content_analysis: Dict[str, Any], received_feedback: str, state: AgentState) -> Dict[str, Any]:
        """使用复杂模型进行包豪斯风格设计"""
        prompt_text = self.design_prompt.format(
            style_name=style_name,
            content_analysis=json.dumps(content_analysis, ensure_ascii=False, indent=2),
            collaboration_feedback=received_feedback or "无特殊要求，按标准包豪斯风格设计"
        )
        
        response = self.call_llm(prompt_text, state.task_id, model_type="complex")
        
        try:
            design_tokens = json.loads(response)
            
            # 验证设计token的完整性
            if not isinstance(design_tokens, dict):
                raise ValueError("GPT-4返回的不是有效的字典格式")
            
            required_keys = ["color_system", "typography_system", "geometric_elements", "layout_structure"]
            missing_keys = [key for key in required_keys if key not in design_tokens]
            if missing_keys:
                raise ValueError(f"GPT-4返回结果缺少必要字段: {missing_keys}")
            
            if len(design_tokens) < 5:
                raise ValueError("GPT-4返回的设计token不够完整")
            
            return design_tokens
                
        except json.JSONDecodeError as e:
            raise ValueError(f"GPT-4返回的不是有效JSON格式: {str(e)}")
        except Exception as e:
            raise ValueError(f"设计token验证失败: {str(e)}")
    
    
    def validate_preconditions(self, state: AgentState) -> bool:
        """验证执行前置条件"""
        return (
            state.style_requirements is not None and
            "style_name" in state.style_requirements and
            state.content_analysis_summary is not None
        )
    
    def validate_output(self, state: AgentState) -> bool:
        """验证输出质量"""
        return (
            state.design_tokens is not None and
            isinstance(state.design_tokens, dict) and
            "color_system" in state.design_tokens and
            "typography_system" in state.design_tokens
        )
    
    def _extract_relevant_input(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输入数据"""
        return {
            "style_name": state.style_requirements.get("style_name", "unknown"),
            "has_content_analysis": bool(state.content_analysis_summary),
            "content_sections": state.content_analysis_summary.get("structure", {}).get("total_sections", 0) if state.content_analysis_summary else 0
        }
    
    def _extract_relevant_output(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输出数据"""
        if not state.design_tokens:
            return {}
        
        tokens = state.design_tokens
        return {
            "design_components": len(tokens),
            "has_color_system": bool(tokens.get("color_system")),
            "has_typography_system": bool(tokens.get("typography_system")),
            "has_geometric_elements": bool(tokens.get("geometric_elements")),
            "has_layout_structure": bool(tokens.get("layout_structure")),
            "has_emotional_mapping": bool(tokens.get("emotional_design_mapping"))
        }
    
    def get_collaboration_feedback(self, state: AgentState) -> str:
        """为DesignAdapter提供协作反馈"""
        if not state.design_tokens:
            return ""
        
        tokens = state.design_tokens
        feedback_parts = []
        
        # 颜色系统反馈
        color_system = tokens.get("color_system", {})
        if color_system.get("section_colors"):
            feedback_parts.append(f"已设计{len(color_system['section_colors'])}色章节系统，请为每个章节分配不同颜色")
        
        if color_system.get("quote_colors"):
            feedback_parts.append(f"已设计{len(color_system['quote_colors'])}色引用系统，请根据引用情感分配对应颜色")
        
        # 几何元素反馈
        geometric = tokens.get("geometric_elements", {})
        if geometric:
            feedback_parts.append("已设计完整的几何元素系统，请严格按照包豪斯几何美学实现")
        
        # 排版系统反馈
        typography = tokens.get("typography_system", {})
        if typography:
            feedback_parts.append("已建立完整的包豪斯排版层次，请确保工业化字体和强烈对比得到体现")
        
        # 情感设计反馈
        emotional = tokens.get("emotional_design_mapping", {})
        if emotional:
            feedback_parts.append("已考虑内容情感特征，请在色彩和空间设计中体现情感支持")
        
        return "; ".join(feedback_parts) if feedback_parts else "基础包豪斯设计已完成"