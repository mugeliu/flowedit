from src.agents.base_collaborative import BaseCollaborativeAgent
from src.models.schemas import AgentState
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from src.config.settings import settings
from typing import Dict, Any, List
import json
import re


class DesignAdapterAgent(BaseCollaborativeAgent):
    """设计适配Agent - 高级CSS规则生成版本"""
    
    def __init__(self):
        super().__init__("design_adapter")
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.1,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
        
        # CSS规则生成模板系统
        self.css_generation_templates = {
            "section_number": {
                "selector_pattern": ".section-number-{index}",
                "base_properties": [
                    "display: inline-block",
                    "text-align: center",
                    "font-family: {font_family}",
                    "border-radius: {border_radius}"
                ],
                "dynamic_properties": {
                    "background": "{color}",
                    "color": "{text_color}",
                    "font-size": "{font_size}",
                    "font-weight": "{font_weight}",
                    "padding": "{padding}",
                    "margin": "{margin}"
                }
            },
            "quote": {
                "selector_pattern": ".quote-style-{index}",
                "base_properties": [
                    "display: block",
                    "font-style: italic",
                    "word-wrap: break-word"
                ],
                "dynamic_properties": {
                    "background-color": "{background_color}",
                    "border-left": "{border_width} solid {border_color}",
                    "color": "{text_color}",
                    "padding": "{padding}",
                    "margin": "{margin}",
                    "font-size": "{font_size}",
                    "line-height": "{line_height}"
                }
            },
            "emphasis": {
                "selector_pattern": ".emphasis-block",
                "base_properties": [
                    "display: block",
                    "word-wrap: break-word"
                ],
                "dynamic_properties": {
                    "background-color": "{background_color}",
                    "color": "{text_color}",
                    "font-weight": "{font_weight}",
                    "padding": "{padding}",
                    "margin": "{margin}",
                    "border-radius": "{border_radius}"
                }
            }
        }
        
        self.css_prompt = PromptTemplate(
            input_variables=["design_tokens", "content_analysis", "style_feedback"],
            template="""
你是专业的CSS样式工程师，基于设计令牌生成完整、精确的CSS规则。

设计令牌：{design_tokens}
内容分析：{content_analysis}
设计反馈：{style_feedback}

请生成完整的CSS样式规则JSON：
{{
    "container": "font-family: Arial, sans-serif; color: #000000; max-width: 800px; margin: 0 auto; line-height: 1.6; padding: 0;",
    
    "h1": "font-size: 24px; color: #000000; text-align: left; line-height: 1.2; margin: 0 0 40px 0; font-weight: 700; font-family: Arial, sans-serif; letter-spacing: -0.5px; border-left: 6px solid #E53E3E; padding-left: 20px;",
    
    "section-separator": "border: none; height: 3px; background: #000000; margin: 40px 0; width: 60px;",
    
    "section-container": "margin: 40px 0;",
    
    "section-number-1": "background: #E53E3E; color: #FFFFFF; font-size: 28px; font-weight: 700; padding: 18px 22px; font-family: Arial, sans-serif; text-align: center; display: inline-block; margin: 0 0 30px 0;",
    
    "section-number-2": "background: #3182CE; color: #FFFFFF; font-size: 28px; font-weight: 700; padding: 18px 22px; font-family: Arial, sans-serif; text-align: center; display: inline-block; margin: 0 0 30px 0;",
    
    "section-number-3": "background: #D69E2E; color: #000000; font-size: 28px; font-weight: 700; padding: 18px 22px; font-family: Arial, sans-serif; text-align: center; display: inline-block; margin: 0 0 30px 0;",
    
    "paragraph": "font-size: 16px; color: #404040; line-height: 1.7; margin: 0 0 24px 0; font-family: Arial, sans-serif;",
    
    "intro-paragraph": "font-size: 18px; color: #000000; line-height: 1.6; margin: 0 0 24px 0; font-weight: 400; font-family: Arial, sans-serif;",
    
    "quote-1": "background: #F8F8F8; border-left: 4px solid #3182CE; padding: 20px 24px; margin: 0 0 4px 0; font-size: 15px; color: #202020; line-height: 1.6; font-family: Arial, sans-serif; font-style: italic;",
    
    "quote-2": "background: #F8F8F8; border-left: 4px solid #D69E2E; padding: 20px 24px; margin: 0 0 4px 0; font-size: 15px; color: #202020; line-height: 1.6; font-family: Arial, sans-serif; font-style: italic;",
    
    "quote-3": "background: #F8F8F8; border-left: 4px solid #E53E3E; padding: 20px 24px; margin: 0 0 4px 0; font-size: 15px; color: #202020; line-height: 1.6; font-family: Arial, sans-serif; font-style: italic;",
    
    "emphasis-block": "background: #E53E3E; color: #FFFFFF; padding: 16px; margin: 16px 0 0 0; font-size: 14px; line-height: 1.5; font-family: Arial, sans-serif; font-weight: 500;",
    
    "emphasis-text": "font-size: 16px; color: #E53E3E; line-height: 1.6; margin: 0 0 16px 0; font-weight: 500; font-family: Arial, sans-serif;",
    
    "separator-geometric": "text-align: center; margin: 60px 0; font-size: 16px; color: #808080; letter-spacing: 15px;",
    
    "author-info": "background: #F8F8F8; padding: 32px; margin: 40px 0; border: 1px solid #E0E0E0; border-left: 6px solid #000000;",
    
    "author-title": "font-size: 14px; color: #000000; margin: 0 0 16px 0; font-weight: 700; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;",
    
    "author-description": "font-size: 14px; color: #404040; line-height: 1.6; margin: 0; font-family: Arial, sans-serif;"
}}

要求：
1. 基于设计令牌生成完整的CSS规则
2. 为章节标号生成不同颜色的独立样式类
3. 为引用内容生成多色边框样式类
4. 包含完整的排版层次（h1、段落、引用、强调）
5. 确保所有样式都符合微信公众号兼容性
6. 使用内联样式格式，便于直接应用到HTML
7. 包含容器、分割线、作者信息等完整布局样式

只输出JSON格式的CSS规则，不要其他说明文字。
"""
        )
        
        # 微信兼容性规则
        self.wechat_compatibility_rules = {
            "forbidden_properties": [
                "position", "z-index", "transform", "animation", 
                "transition", "overflow", "float", "clear"
            ],
            "allowed_units": ["px", "em", "rem", "%"],
            "safe_properties": [
                "color", "background-color", "font-size", "font-weight", 
                "font-family", "line-height", "margin", "padding",
                "border", "border-left", "border-right", "border-top", "border-bottom",
                "text-align", "display", "width", "max-width", "height",
                "letter-spacing", "text-transform", "font-style"
            ]
        }
    
    def execute(self, state: AgentState) -> AgentState:
        """执行高级CSS规则生成"""
        try:
            design_tokens = state.design_tokens
            content_analysis = state.content_analysis_summary or {}
            
            # 获取StyleDesigner的协作反馈
            style_feedback = self._get_style_feedback(state)
            
            # 使用LLM生成高级CSS规则
            css_rules = self._generate_advanced_css_rules(
                design_tokens, content_analysis, style_feedback
            )
            
            # 基于设计令牌扩展和完善CSS规则
            enhanced_css_rules = self._enhance_css_with_design_tokens(
                css_rules, design_tokens, content_analysis
            )
            
            # 确保微信兼容性
            compatible_css_rules = self._ensure_wechat_compatibility(enhanced_css_rules)
            
            # 优化和验证CSS规则
            final_css_rules = self._optimize_and_validate_css(compatible_css_rules)
            
            # 存储结果到协作状态
            state.css_rules = final_css_rules
            state.current_step = "design_adaptation_completed"
            
            # 为后续Agent提供详细的协作上下文
            state.collaboration_context["css_features"] = {
                "total_rules": len(final_css_rules),
                "has_section_styles": any("section-number" in key for key in final_css_rules.keys()),
                "has_quote_styles": any("quote" in key for key in final_css_rules.keys()),
                "has_emphasis_styles": any("emphasis" in key for key in final_css_rules.keys()),
                "has_typography_hierarchy": any(key in ["h1", "h2", "h3"] for key in final_css_rules.keys()),
                "complexity_score": self._calculate_css_complexity(final_css_rules)
            }
            
            return state
                
        except Exception as e:
            state.errors.append(f"Design adaptation failed: {str(e)}")
            state.last_error = str(e)
            state.current_step = "design_adaptation_failed"
            return state
    
    def _get_style_feedback(self, state: AgentState) -> str:
        """获取StyleDesigner的反馈"""
        # 从agent_feedback中获取StyleDesigner的建议
        style_feedback_list = state.agent_feedback.get("design_adapter", [])
        if style_feedback_list:
            return "; ".join(style_feedback_list)
        
        # 如果没有直接反馈，从design_tokens中推断特性
        if not state.design_tokens:
            return "无设计令牌信息"
        
        tokens = state.design_tokens
        feedback_parts = []
        
        if tokens.get("section_number_styles"):
            colors_count = len(tokens["section_number_styles"].get("colors", []))
            feedback_parts.append(f"需要生成{colors_count}个不同颜色的章节标号样式")
        
        if tokens.get("quote_styles"):
            border_colors = tokens["quote_styles"].get("border_colors", [])
            feedback_parts.append(f"需要生成{len(border_colors)}种引用边框颜色样式")
        
        if tokens.get("typography_hierarchy"):
            feedback_parts.append("需要实现完整的排版层次体系")
        
        return "; ".join(feedback_parts) if feedback_parts else "标准CSS规则生成"
    
    def _generate_advanced_css_rules(self, design_tokens: Dict[str, Any],
                                   content_analysis: Dict[str, Any],
                                   style_feedback: str) -> Dict[str, str]:
        """使用LLM生成高级CSS规则"""
        try:
            prompt_text = self.css_prompt.format(
                design_tokens=json.dumps(design_tokens, ensure_ascii=False, indent=2),
                content_analysis=json.dumps(content_analysis, ensure_ascii=False, indent=2),
                style_feedback=style_feedback
            )
            
            response = self.llm.invoke(prompt_text)
            css_rules = json.loads(response.content)
            
            if isinstance(css_rules, dict) and len(css_rules) > 3:
                return css_rules
            else:
                return self._generate_fallback_css_rules(design_tokens)
                
        except (json.JSONDecodeError, Exception) as e:
            return self._generate_fallback_css_rules(design_tokens)
    
    def _generate_fallback_css_rules(self, design_tokens: Dict[str, Any]) -> Dict[str, str]:
        """生成备用CSS规则"""
        base_font = design_tokens.get("font_family", "Arial, sans-serif")
        primary_color = design_tokens.get("primary_color", "#E53E3E")
        text_color = design_tokens.get("text_color", "#000000")
        bg_color = design_tokens.get("background_color", "#FFFFFF")
        
        css_rules = {
            "container": f"font-family: {base_font}; color: {text_color}; max-width: 800px; margin: 0 auto; line-height: 1.6;",
            "h1": f"font-size: 24px; color: {text_color}; font-weight: 700; margin: 0 0 40px 0; border-left: 6px solid {primary_color}; padding-left: 20px;",
            "paragraph": f"font-size: 16px; color: #404040; line-height: 1.7; margin: 0 0 24px 0; font-family: {base_font};"
        }
        
        # 基于设计令牌生成专项样式
        if design_tokens.get("section_number_styles"):
            section_styles = design_tokens["section_number_styles"]
            colors = section_styles.get("colors", [primary_color])
            
            for i, color in enumerate(colors[:5], 1):  # 最多5个章节
                css_rules[f"section-number-{i}"] = (
                    f"background: {color}; color: {section_styles.get('text_color', '#FFFFFF')}; "
                    f"font-size: {section_styles.get('font_size', '28px')}; "
                    f"font-weight: {section_styles.get('font_weight', '700')}; "
                    f"padding: {section_styles.get('padding', '18px 22px')}; "
                    f"font-family: {base_font}; text-align: center; display: inline-block; "
                    f"margin: 0 0 30px 0;"
                )
        
        if design_tokens.get("quote_styles"):
            quote_styles = design_tokens["quote_styles"]
            border_colors = quote_styles.get("border_colors", [primary_color])
            
            for i, border_color in enumerate(border_colors[:5], 1):  # 最多5种引用样式
                css_rules[f"quote-{i}"] = (
                    f"background: {quote_styles.get('background_color', '#F8F8F8')}; "
                    f"border-left: {quote_styles.get('border_width', '4px')} solid {border_color}; "
                    f"padding: {quote_styles.get('padding', '20px 24px')}; "
                    f"margin: 0 0 4px 0; font-size: 15px; color: #202020; "
                    f"line-height: 1.6; font-family: {base_font}; font-style: italic;"
                )
        
        if design_tokens.get("emphasis_styles"):
            emphasis_styles = design_tokens["emphasis_styles"]
            css_rules["emphasis-block"] = (
                f"background: {emphasis_styles.get('background_color', primary_color)}; "
                f"color: {emphasis_styles.get('text_color', '#FFFFFF')}; "
                f"padding: {emphasis_styles.get('padding', '16px')}; "
                f"margin: 16px 0 0 0; font-weight: 500; font-family: {base_font};"
            )
        
        return css_rules
    
    def _enhance_css_with_design_tokens(self, css_rules: Dict[str, str],
                                      design_tokens: Dict[str, Any],
                                      content_analysis: Dict[str, Any]) -> Dict[str, str]:
        """基于设计令牌增强CSS规则"""
        enhanced = css_rules.copy()
        
        try:
            # 添加排版层次
            if design_tokens.get("typography_hierarchy"):
                typography = design_tokens["typography_hierarchy"]
                
                for element, styles in typography.items():
                    if element not in enhanced:
                        style_parts = []
                        for prop, value in styles.items():
                            css_prop = prop.replace("_", "-")
                            style_parts.append(f"{css_prop}: {value}")
                        enhanced[element] = "; ".join(style_parts) + ";"
            
            # 添加分割线样式
            if design_tokens.get("separator_styles"):
                separator = design_tokens["separator_styles"]
                if separator.get("type") == "geometric":
                    enhanced["separator-geometric"] = (
                        f"text-align: {separator.get('text_align', 'center')}; "
                        f"margin: {separator.get('margin', '60px 0')}; "
                        f"font-size: {separator.get('font_size', '16px')}; "
                        f"color: {separator.get('color', '#808080')}; "
                        f"letter-spacing: {separator.get('letter_spacing', '15px')};"
                    )
            
            # 添加布局系统样式
            if design_tokens.get("layout_system"):
                layout = design_tokens["layout_system"]
                
                # 更新容器样式
                if "container" in enhanced:
                    container_updates = []
                    if "container_max_width" in layout:
                        container_updates.append(f"max-width: {layout['container_max_width']}")
                    if "content_padding" in layout:
                        container_updates.append(f"padding: {layout['content_padding']}")
                    
                    if container_updates:
                        enhanced["container"] = enhanced["container"] + "; " + "; ".join(container_updates) + ";"
                
                # 添加章节容器样式
                if layout.get("section_margin"):
                    enhanced["section-container"] = f"margin: {layout['section_margin']};"
            
            # 添加情感设计相关样式
            if design_tokens.get("emotional_design"):
                emotional = design_tokens["emotional_design"]
                
                if emotional.get("warm_grays"):
                    warm_grays = emotional["warm_grays"]
                    enhanced["muted-text"] = f"color: {warm_grays[1] if len(warm_grays) > 1 else '#808080'}; font-size: 14px;"
            
            return enhanced
            
        except Exception as e:
            return css_rules
    
    def _ensure_wechat_compatibility(self, css_rules: Dict[str, str]) -> Dict[str, str]:
        """确保CSS规则微信兼容性"""
        compatible_rules = {}
        forbidden = self.wechat_compatibility_rules["forbidden_properties"]
        
        for selector, styles in css_rules.items():
            # 清理样式字符串
            cleaned_styles = self._clean_css_string(styles)
            
            # 移除不兼容的属性
            compatible_styles = self._remove_incompatible_properties(cleaned_styles, forbidden)
            
            # 验证CSS单位
            validated_styles = self._validate_css_units(compatible_styles)
            
            if validated_styles:
                compatible_rules[selector] = validated_styles
        
        return compatible_rules
    
    def _clean_css_string(self, styles: str) -> str:
        """清理CSS样式字符串"""
        if not styles:
            return ""
        
        # 移除多余的空格和分号
        cleaned = re.sub(r'\s+', ' ', styles.strip())
        cleaned = re.sub(r';\s*;+', ';', cleaned)
        cleaned = re.sub(r':\s+', ': ', cleaned)
        
        # 确保以分号结尾
        if not cleaned.endswith(';'):
            cleaned += ';'
        
        return cleaned
    
    def _remove_incompatible_properties(self, styles: str, forbidden: List[str]) -> str:
        """移除不兼容的CSS属性"""
        if not styles:
            return ""
        
        properties = []
        for prop in styles.split(';'):
            prop = prop.strip()
            if prop and ':' in prop:
                prop_name = prop.split(':')[0].strip()
                
                # 检查是否为禁用属性
                is_forbidden = any(forbidden_prop in prop_name.lower() 
                                 for forbidden_prop in forbidden)
                
                if not is_forbidden:
                    properties.append(prop)
        
        return "; ".join(properties) + (";" if properties else "")
    
    def _validate_css_units(self, styles: str) -> str:
        """验证CSS单位"""
        if not styles:
            return ""
        
        # 简单验证：确保常用单位存在
        allowed_units = self.wechat_compatibility_rules["allowed_units"]
        
        # 这里可以添加更复杂的单位验证逻辑
        # 目前保持简单，只要不包含明显的错误即可
        
        return styles
    
    def _optimize_and_validate_css(self, css_rules: Dict[str, str]) -> Dict[str, str]:
        """优化和验证CSS规则"""
        optimized = {}
        
        for selector, styles in css_rules.items():
            # 最终清理和去重
            final_styles = self._deduplicate_css_properties(styles)
            
            # 验证样式完整性
            if self._validate_css_rule(final_styles):
                optimized[selector] = final_styles
        
        # 确保必要的基础样式存在
        if "container" not in optimized:
            optimized["container"] = "font-family: Arial, sans-serif; color: #333333; max-width: 800px; margin: 0 auto; line-height: 1.6;"
        
        return optimized
    
    def _deduplicate_css_properties(self, styles: str) -> str:
        """去重CSS属性"""
        if not styles:
            return ""
        
        properties = {}
        for prop in styles.split(';'):
            prop = prop.strip()
            if prop and ':' in prop:
                key, value = prop.split(':', 1)
                properties[key.strip()] = value.strip()
        
        deduplicated = "; ".join([f"{k}: {v}" for k, v in properties.items() if v])
        return deduplicated + (";" if deduplicated else "")
    
    def _validate_css_rule(self, styles: str) -> bool:
        """验证CSS规则有效性"""
        if not styles or not styles.strip():
            return False
        
        # 基本格式检查
        if ':' not in styles:
            return False
        
        # 检查是否有有效的属性值对
        valid_pairs = 0
        for prop in styles.split(';'):
            if ':' in prop and prop.strip():
                valid_pairs += 1
        
        return valid_pairs > 0
    
    def _calculate_css_complexity(self, css_rules: Dict[str, str]) -> float:
        """计算CSS复杂度分数"""
        if not css_rules:
            return 0.0
        
        score = 0.0
        
        # 基础分数
        score += min(len(css_rules) * 0.05, 0.3)
        
        # 专项样式加分
        advanced_selectors = ["section-number", "quote", "emphasis", "typography", "separator"]
        for selector_type in advanced_selectors:
            matching_selectors = [s for s in css_rules.keys() if selector_type in s]
            if matching_selectors:
                score += min(len(matching_selectors) * 0.02, 0.1)
        
        # 样式复杂度加分
        total_properties = sum(styles.count(':') for styles in css_rules.values())
        score += min(total_properties * 0.01, 0.2)
        
        # 颜色使用加分
        color_count = 0
        for styles in css_rules.values():
            color_count += styles.lower().count('color:')
            color_count += styles.lower().count('background')
        score += min(color_count * 0.01, 0.15)
        
        return min(score, 1.0)
    
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
            "has_section_styling": bool(design_tokens.get("section_number_styles")),
            "has_quote_styling": bool(design_tokens.get("quote_styles")),
            "has_typography_hierarchy": bool(design_tokens.get("typography_hierarchy")),
            "style_feedback_available": bool(state.agent_feedback.get("design_adapter"))
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
            "has_typography": any(k in ["h1", "h2", "h3", "paragraph"] for k in css_rules.keys()),
            "complexity_score": self._calculate_css_complexity(css_rules),
            "selectors": list(css_rules.keys())
        }
    
    def get_collaboration_feedback(self, state: AgentState) -> str:
        """为CodeEngineer提供详细反馈"""
        if not state.css_rules:
            return None
        
        css_rules = state.css_rules
        feedback_parts = []
        
        # 章节样式反馈
        section_styles = [k for k in css_rules.keys() if "section-number" in k]
        if section_styles:
            feedback_parts.append(f"已生成{len(section_styles)}个章节标号样式，请为每个章节标号分别应用对应的样式类")
        
        # 引用样式反馈
        quote_styles = [k for k in css_rules.keys() if "quote" in k]
        if quote_styles:
            feedback_parts.append(f"已生成{len(quote_styles)}种引用样式，建议为不同情绪的引用使用不同的样式类")
        
        # 强调样式反馈
        if "emphasis-block" in css_rules:
            feedback_parts.append("已生成强调块样式，建议为重要强调内容使用emphasis-block类")
        
        # 排版层次反馈
        typography_elements = [k for k in css_rules.keys() if k in ["h1", "h2", "h3", "paragraph", "intro-paragraph"]]
        if typography_elements:
            feedback_parts.append(f"已生成{len(typography_elements)}个排版层次样式，请严格按照内容层次应用对应样式")
        
        # 布局样式反馈
        layout_elements = [k for k in css_rules.keys() if k in ["container", "section-container", "separator-geometric"]]
        if layout_elements:
            feedback_parts.append("已生成完整的布局样式体系，请确保HTML结构与样式类正确匹配")
        
        # 复杂度反馈
        complexity = self._calculate_css_complexity(css_rules)
        if complexity > 0.6:
            feedback_parts.append(f"CSS样式复杂度为{complexity:.2f}，请确保所有{len(css_rules)}个样式类都得到正确应用")
        
        return "; ".join(feedback_parts) if feedback_parts else None