from src.agents.base_collaborative import BaseCollaborativeAgent
from src.models.schemas import AgentState
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from src.config.settings import settings
from typing import Dict, Any, List, Tuple
import json
import colorsys
import random


class StyleDesignerAgent(BaseCollaborativeAgent):
    """智能风格设计Agent - 深度优化版本"""
    
    def __init__(self):
        super().__init__("style_designer")
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.2,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
        
        # 高级风格模板 - 基于视觉设计原则
        self.advanced_style_templates = {
            "包豪斯风格": {
                "design_philosophy": "功能主义、几何简洁、色彩对比强烈",
                "base_tokens": {
                    "primary_color": "#E53E3E",      # 经典红色 
                    "secondary_color": "#3182CE",    # 蓝色
                    "accent_color": "#D69E2E",       # 橙黄色
                    "neutral_color": "#000000",      # 纯黑
                    "text_color": "#000000",         # 黑色文本
                    "background_color": "#FFFFFF",   # 纯白背景
                    "font_family": "Arial, sans-serif",
                    "border_radius": "0px",          # 直角设计
                    "spacing_unit": "16px"
                },
                "content_specific_tokens": {
                    "section_number_colors": ["#E53E3E", "#3182CE", "#D69E2E"],
                    "quote_border_colors": ["#3182CE", "#D69E2E", "#E53E3E"],
                    "quote_background": "#F8F8F8",
                    "emphasis_background": "#E53E3E",
                    "emphasis_text": "#FFFFFF",
                    "separator_color": "#808080",
                    "separator_symbol": "■ ■ ■"
                },
                "typography_scale": {
                    "h1": {"size": "24px", "weight": "700", "line_height": "1.2"},
                    "h2": {"size": "20px", "weight": "600", "line_height": "1.3"},
                    "section_number": {"size": "28px", "weight": "700", "line_height": "1.0"},
                    "paragraph": {"size": "16px", "weight": "400", "line_height": "1.7"},
                    "quote": {"size": "15px", "weight": "400", "line_height": "1.6"},
                    "emphasis": {"size": "16px", "weight": "500", "line_height": "1.5"}
                },
                "spacing_system": {
                    "section_margin": "40px 0",
                    "paragraph_margin": "0 0 24px 0",
                    "quote_margin": "0 0 4px 0",
                    "quote_padding": "20px 24px",
                    "section_number_padding": "18px 22px",
                    "emphasis_padding": "16px"
                }
            },
            "现代极简": {
                "design_philosophy": "留白丰富、层次清晰、色彩克制",
                "base_tokens": {
                    "primary_color": "#2563EB",
                    "secondary_color": "#64748B", 
                    "accent_color": "#10B981",
                    "neutral_color": "#F8FAFC",
                    "text_color": "#1E293B",
                    "background_color": "#FFFFFF",
                    "font_family": "system-ui, -apple-system, sans-serif",
                    "border_radius": "8px",
                    "spacing_unit": "20px"
                },
                "content_specific_tokens": {
                    "section_number_colors": ["#2563EB", "#10B981", "#F59E0B"],
                    "quote_border_colors": ["#2563EB", "#64748B"],
                    "quote_background": "#F8FAFC",
                    "emphasis_background": "#EFF6FF",
                    "emphasis_text": "#2563EB"
                }
            },
            "温暖人文": {
                "design_philosophy": "温馨舒适、情感友好、可读性强",
                "base_tokens": {
                    "primary_color": "#DC2626",
                    "secondary_color": "#059669",
                    "accent_color": "#D97706",
                    "neutral_color": "#F3F4F6",
                    "text_color": "#374151",
                    "background_color": "#FEFEFE",
                    "font_family": "Georgia, serif",
                    "border_radius": "6px",
                    "spacing_unit": "18px"
                }
            }
        }
        
        self.design_prompt = PromptTemplate(
            input_variables=["style_name", "base_template", "content_analysis", "content_feedback"],
            template="""
你是专业的视觉设计师，基于风格要求和内容分析生成精确的设计令牌。

目标风格：{style_name}
基础设计模板：{base_template}
内容分析结果：{content_analysis}
内容特征反馈：{content_feedback}

请生成完整的设计令牌JSON：
{{
    "primary_color": "#E53E3E",
    "secondary_color": "#3182CE",
    "accent_color": "#D69E2E", 
    "neutral_color": "#000000",
    "text_color": "#000000",
    "background_color": "#FFFFFF",
    "font_family": "Arial, sans-serif",
    "border_radius": "0px",
    "spacing_unit": "16px",
    
    "section_number_styles": {{
        "colors": ["#E53E3E", "#3182CE", "#D69E2E"],
        "background": "solid",
        "text_color": "#FFFFFF",
        "font_size": "28px",
        "font_weight": "700",
        "padding": "18px 22px",
        "margin": "0 0 30px 0",
        "text_align": "center"
    }},
    
    "quote_styles": {{
        "border_colors": ["#3182CE", "#D69E2E", "#E53E3E", "#3182CE"],
        "background_color": "#F8F8F8",
        "text_color": "#202020",
        "border_width": "4px",
        "border_position": "left",
        "padding": "20px 24px",
        "margin": "0 0 4px 0",
        "font_style": "italic",
        "font_size": "15px",
        "line_height": "1.6"
    }},
    
    "emphasis_styles": {{
        "background_color": "#E53E3E",
        "text_color": "#FFFFFF",
        "font_weight": "500",
        "padding": "16px",
        "margin": "16px 0 0 0",
        "border_radius": "0px"
    }},
    
    "separator_styles": {{
        "type": "geometric",
        "symbol": "■ ■ ■",
        "color": "#808080",
        "font_size": "16px",
        "text_align": "center",
        "margin": "60px 0",
        "letter_spacing": "15px"
    }},
    
    "typography_hierarchy": {{
        "h1": {{
            "font_size": "24px",
            "font_weight": "700",
            "line_height": "1.2",
            "margin": "0 0 40px 0",
            "color": "#000000",
            "border_left": "6px solid #E53E3E",
            "padding_left": "20px"
        }},
        "paragraph": {{
            "font_size": "16px",
            "line_height": "1.7",
            "margin": "0 0 24px 0",
            "color": "#404040"
        }},
        "intro_paragraph": {{
            "font_size": "18px",
            "font_weight": "400",
            "color": "#000000"
        }}
    }},
    
    "layout_system": {{
        "container_max_width": "800px",
        "section_margin": "40px 0",
        "content_padding": "0",
        "reading_width": "auto"
    }},
    
    "emotional_design": {{
        "supportive_palette": true,
        "warm_grays": ["#F8F8F8", "#808080", "#404040"],
        "breathing_space": "generous",
        "visual_rhythm": "structured"
    }}
}}

设计要求：
1. 严格遵循{style_name}的设计原则
2. 根据内容特征调整颜色搭配和层次
3. 确保章节标号醒目突出
4. 为不同类型引用提供颜色区分
5. 创建清晰的视觉层次和节奏感
6. 考虑情感表达和用户体验

只输出JSON格式的设计令牌，不要其他说明文字。
"""
        )
    
    def execute(self, state: AgentState) -> AgentState:
        """执行智能风格设计"""
        try:
            style_name = state.style_requirements.get("style_name", "包豪斯风格")
            style_features = state.style_requirements.get("features", [])
            
            # 获取内容分析结果
            content_analysis = state.content_analysis_summary or {}
            
            # 获取ContentAnalyst的协作反馈
            content_feedback = self._get_content_feedback(state)
            
            # 获取高级设计模板
            design_template = self._get_advanced_template(style_name)
            
            # 基于内容特征调整模板
            adapted_template = self._adapt_template_to_content(
                design_template, content_analysis, style_features
            )
            
            # 使用LLM进行智能设计优化
            optimized_tokens = self._optimize_design_with_llm(
                style_name, adapted_template, content_analysis, content_feedback
            )
            
            # 验证和完善设计令牌
            final_tokens = self._finalize_design_tokens(optimized_tokens, content_analysis)
            
            # 存储结果到协作状态
            state.design_tokens = final_tokens
            state.current_step = "style_analysis_completed"
            
            # 为后续Agent提供详细的协作上下文
            state.collaboration_context["design_features"] = {
                "style_complexity": len(final_tokens),
                "has_advanced_typography": bool(final_tokens.get("typography_hierarchy")),
                "has_section_styling": bool(final_tokens.get("section_number_styles")),
                "has_quote_styling": bool(final_tokens.get("quote_styles")),
                "color_palette_size": len([k for k in final_tokens.keys() if "color" in k]),
                "design_sophistication": self._calculate_design_sophistication(final_tokens)
            }
            
            return state
                
        except Exception as e:
            state.errors.append(f"Style design failed: {str(e)}")
            state.last_error = str(e)
            state.current_step = "style_analysis_failed"
            return state
    
    def _get_content_feedback(self, state: AgentState) -> str:
        """获取内容分析的协作反馈"""
        # 从agent_feedback中获取ContentAnalyst的建议
        content_feedback_list = state.agent_feedback.get("style_designer", [])
        if content_feedback_list:
            return "; ".join(content_feedback_list)
        
        # 如果没有直接反馈，从content_analysis_summary中推断
        if not state.content_analysis_summary:
            return "无内容分析信息"
        
        analysis = state.content_analysis_summary
        structure = analysis.get("structure", {})
        feedback_parts = []
        
        if structure.get("has_sections", False):
            feedback_parts.append(f"内容有{structure.get('section_count', 0)}个章节，需要章节标号样式")
        
        if structure.get("has_quotes", False):
            quotes_data = analysis.get("content_elements", {}).get("quotes", [])
            quote_types = set([q.get("type", "general") for q in quotes_data])
            if len(quote_types) > 1:
                feedback_parts.append("发现多种类型引用，需要颜色区分")
            else:
                feedback_parts.append("包含引用内容，需要引用样式")
        
        if structure.get("has_emphasis", False):
            feedback_parts.append("内容有强调部分，需要强调样式")
        
        emotional_design = analysis.get("styling_requirements", {}).get("emotional_design", {})
        if emotional_design.get("supportive_colors", False):
            feedback_parts.append("需要情感支持性的色彩设计")
        
        return "; ".join(feedback_parts) if feedback_parts else "常规内容结构"
    
    def _get_advanced_template(self, style_name: str) -> Dict[str, Any]:
        """获取高级设计模板"""
        return self.advanced_style_templates.get(
            style_name, 
            self.advanced_style_templates["包豪斯风格"]
        )
    
    def _adapt_template_to_content(self, template: Dict[str, Any], 
                                  content_analysis: Dict[str, Any],
                                  style_features: List[str]) -> Dict[str, Any]:
        """基于内容特征调整设计模板"""
        adapted = template.copy()
        
        try:
            structure = content_analysis.get("structure", {})
            content_elements = content_analysis.get("content_elements", {})
            
            # 根据章节数量调整颜色方案
            section_count = structure.get("section_count", 0)
            if section_count > 0:
                base_colors = adapted["content_specific_tokens"]["section_number_colors"]
                if section_count > len(base_colors):
                    # 扩展颜色方案
                    adapted["content_specific_tokens"]["section_number_colors"] = self._expand_color_palette(
                        base_colors, section_count
                    )
            
            # 根据引用类型调整引用样式
            quotes = content_elements.get("quotes", [])
            if quotes:
                quote_types = set([q.get("type", "general") for q in quotes])
                quote_emotions = set([q.get("emotion", "neutral") for q in quotes])
                
                # 为不同情绪的引用分配不同颜色
                if len(quote_emotions) > 1:
                    adapted["content_specific_tokens"]["quote_border_colors"] = self._assign_emotional_colors(
                        quote_emotions, adapted["content_specific_tokens"]["quote_border_colors"]
                    )
            
            # 根据强调重要性调整强调样式
            emphasis_points = content_elements.get("emphasis_points", [])
            high_importance = [e for e in emphasis_points if e.get("importance") == "high"]
            if high_importance:
                adapted["content_specific_tokens"]["emphasis_background"] = adapted["base_tokens"]["primary_color"]
                adapted["content_specific_tokens"]["emphasis_text"] = "#FFFFFF"
            
            return adapted
            
        except Exception as e:
            return template  # 如果调整失败，返回原模板
    
    def _expand_color_palette(self, base_colors: List[str], target_count: int) -> List[str]:
        """扩展颜色调色板"""
        try:
            expanded = base_colors.copy()
            
            while len(expanded) < target_count:
                # 基于现有颜色生成相近色调
                base_color = random.choice(base_colors)
                new_color = self._generate_color_variant(base_color)
                if new_color not in expanded:
                    expanded.append(new_color)
            
            return expanded[:target_count]
            
        except Exception as e:
            return base_colors
    
    def _generate_color_variant(self, base_color: str) -> str:
        """生成颜色变体"""
        try:
            # 移除#号并转换为RGB
            hex_color = base_color.lstrip('#')
            r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            
            # 转换为HSV
            h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
            
            # 调整色相以生成变体
            h = (h + random.uniform(-0.1, 0.1)) % 1.0
            
            # 转换回RGB
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            
            # 转换为hex
            return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}".upper()
            
        except Exception as e:
            return base_color
    
    def _assign_emotional_colors(self, emotions: set, base_colors: List[str]) -> List[str]:
        """为不同情绪分配颜色"""
        emotion_color_map = {
            "negative": "#E53E3E",    # 红色 - 负面情绪
            "frustrated": "#D69E2E",  # 橙色 - 沮丧
            "reflective": "#3182CE",  # 蓝色 - 反思
            "neutral": "#64748B",     # 灰色 - 中性
            "positive": "#10B981"     # 绿色 - 积极
        }
        
        assigned_colors = []
        for emotion in emotions:
            color = emotion_color_map.get(emotion, base_colors[0])
            assigned_colors.append(color)
        
        # 补充基础颜色到所需长度
        while len(assigned_colors) < len(base_colors):
            assigned_colors.extend(base_colors)
        
        return assigned_colors[:len(base_colors)]
    
    def _optimize_design_with_llm(self, style_name: str, template: Dict[str, Any],
                                 content_analysis: Dict[str, Any], content_feedback: str) -> Dict[str, Any]:
        """使用LLM优化设计令牌"""
        try:
            prompt_text = self.design_prompt.format(
                style_name=style_name,
                base_template=json.dumps(template, ensure_ascii=False, indent=2),
                content_analysis=json.dumps(content_analysis, ensure_ascii=False, indent=2),
                content_feedback=content_feedback
            )
            
            response = self.llm.invoke(prompt_text)
            optimized_tokens = json.loads(response.content)
            
            if isinstance(optimized_tokens, dict) and len(optimized_tokens) > 5:
                return optimized_tokens
            else:
                return self._generate_fallback_tokens(template)
                
        except (json.JSONDecodeError, Exception) as e:
            return self._generate_fallback_tokens(template)
    
    def _generate_fallback_tokens(self, template: Dict[str, Any]) -> Dict[str, Any]:
        """生成备用设计令牌"""
        base_tokens = template.get("base_tokens", {})
        content_tokens = template.get("content_specific_tokens", {})
        typography = template.get("typography_scale", {})
        spacing = template.get("spacing_system", {})
        
        return {
            **base_tokens,
            "section_number_styles": {
                "colors": content_tokens.get("section_number_colors", ["#E53E3E"]),
                "background": "solid",
                "text_color": "#FFFFFF",
                "font_size": typography.get("section_number", {}).get("size", "28px"),
                "font_weight": typography.get("section_number", {}).get("weight", "700"),
                "padding": spacing.get("section_number_padding", "18px 22px"),
                "text_align": "center"
            },
            "quote_styles": {
                "border_colors": content_tokens.get("quote_border_colors", ["#3182CE"]),
                "background_color": content_tokens.get("quote_background", "#F8F8F8"),
                "text_color": "#202020",
                "border_width": "4px",
                "border_position": "left",
                "padding": spacing.get("quote_padding", "20px 24px"),
                "font_style": "italic"
            },
            "emphasis_styles": {
                "background_color": content_tokens.get("emphasis_background", "#E53E3E"),
                "text_color": content_tokens.get("emphasis_text", "#FFFFFF"),
                "font_weight": "500",
                "padding": spacing.get("emphasis_padding", "16px")
            }
        }
    
    def _finalize_design_tokens(self, tokens: Dict[str, Any], 
                               content_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """验证和完善设计令牌"""
        finalized = tokens.copy()
        
        try:
            # 确保必要的基础令牌存在
            required_base_tokens = ["primary_color", "text_color", "background_color", "font_family"]
            for token in required_base_tokens:
                if token not in finalized:
                    finalized[token] = self._get_default_token_value(token)
            
            # 基于内容分析验证和调整特殊样式
            structure = content_analysis.get("structure", {})
            
            if structure.get("has_sections", False) and "section_number_styles" not in finalized:
                finalized["section_number_styles"] = {
                    "colors": ["#E53E3E"],
                    "background": "solid",
                    "text_color": "#FFFFFF"
                }
            
            if structure.get("has_quotes", False) and "quote_styles" not in finalized:
                finalized["quote_styles"] = {
                    "border_colors": ["#3182CE"],
                    "background_color": "#F8F8F8",
                    "border_width": "4px",
                    "border_position": "left"
                }
            
            if structure.get("has_emphasis", False) and "emphasis_styles" not in finalized:
                finalized["emphasis_styles"] = {
                    "background_color": finalized.get("primary_color", "#E53E3E"),
                    "text_color": "#FFFFFF"
                }
            
            return finalized
            
        except Exception as e:
            return tokens
    
    def _get_default_token_value(self, token: str) -> str:
        """获取默认令牌值"""
        defaults = {
            "primary_color": "#E53E3E",
            "secondary_color": "#3182CE",
            "text_color": "#000000",
            "background_color": "#FFFFFF",
            "font_family": "Arial, sans-serif",
            "border_radius": "0px",
            "spacing_unit": "16px"
        }
        return defaults.get(token, "#000000")
    
    def _calculate_design_sophistication(self, tokens: Dict[str, Any]) -> float:
        """计算设计复杂度分数"""
        score = 0.0
        
        # 基础分数
        score += 0.2
        
        # 高级样式结构加分
        advanced_features = ["section_number_styles", "quote_styles", "emphasis_styles", 
                           "typography_hierarchy", "separator_styles", "emotional_design"]
        
        for feature in advanced_features:
            if feature in tokens:
                score += 0.1
        
        # 颜色丰富度加分
        color_keys = [k for k in tokens.keys() if "color" in k]
        score += min(len(color_keys) * 0.05, 0.2)
        
        # 特殊功能加分
        if tokens.get("section_number_styles", {}).get("colors"):
            colors_count = len(tokens["section_number_styles"]["colors"])
            score += min(colors_count * 0.03, 0.15)
        
        return min(score, 1.0)
    
    def validate_preconditions(self, state: AgentState) -> bool:
        """验证执行前置条件"""
        return (
            state.style_requirements is not None and
            "style_name" in state.style_requirements
        )
    
    def validate_output(self, state: AgentState) -> bool:
        """验证输出质量"""
        if not state.design_tokens:
            return False
        
        tokens = state.design_tokens
        required_tokens = ["primary_color", "text_color", "background_color", "font_family"]
        
        return all(token in tokens for token in required_tokens)
    
    def _extract_relevant_input(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输入数据"""
        return {
            "style_name": state.style_requirements.get("style_name", "unknown"),
            "style_features": state.style_requirements.get("features", []),
            "has_content_analysis": bool(state.content_analysis_summary),
            "content_feedback_available": bool(state.agent_feedback.get("style_designer"))
        }
    
    def _extract_relevant_output(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输出数据"""
        if not state.design_tokens:
            return {}
        
        tokens = state.design_tokens
        return {
            "total_tokens": len(tokens),
            "has_advanced_typography": bool(tokens.get("typography_hierarchy")),
            "has_section_styling": bool(tokens.get("section_number_styles")),
            "has_quote_styling": bool(tokens.get("quote_styles")),
            "section_colors_count": len(tokens.get("section_number_styles", {}).get("colors", [])),
            "design_sophistication": self._calculate_design_sophistication(tokens)
        }
    
    def get_collaboration_feedback(self, state: AgentState) -> str:
        """为DesignAdapter提供详细反馈"""
        if not state.design_tokens:
            return None
        
        tokens = state.design_tokens
        feedback_parts = []
        
        # 章节样式反馈
        if tokens.get("section_number_styles"):
            colors_count = len(tokens["section_number_styles"].get("colors", []))
            feedback_parts.append(f"已生成{colors_count}色章节标号样式，建议为每个章节使用不同颜色")
        
        # 引用样式反馈
        if tokens.get("quote_styles"):
            border_colors = tokens["quote_styles"].get("border_colors", [])
            if len(border_colors) > 1:
                feedback_parts.append("已配置多色引用边框，建议为不同引用类型使用对应颜色")
            else:
                feedback_parts.append("已配置引用样式，建议使用左边框+背景的设计")
        
        # 强调样式反馈
        if tokens.get("emphasis_styles"):
            feedback_parts.append("已设置强调样式，建议为重点内容使用醒目的背景色")
        
        # 排版层次反馈
        if tokens.get("typography_hierarchy"):
            feedback_parts.append("已建立完整的排版层次体系，请严格按照层次应用到HTML结构中")
        
        # 整体设计反馈
        sophistication = self._calculate_design_sophistication(tokens)
        if sophistication > 0.7:
            feedback_parts.append("设计复杂度较高，请确保所有高级样式都得到正确应用")
        
        return "; ".join(feedback_parts) if feedback_parts else None