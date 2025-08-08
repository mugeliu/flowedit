from src.agents.base_collaborative import BaseCollaborativeAgent
from src.models.schemas import AgentState
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from src.config.settings import settings
from typing import Dict, Any, List, Tuple
import json
import re
from bs4 import BeautifulSoup


class QualityDirectorAgent(BaseCollaborativeAgent):
    """全面质量评估系统Agent - 深度优化版本"""
    
    def __init__(self):
        super().__init__("quality_director")
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.05,  # 极低温度确保一致性评估
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
        
        # 全面质量评估框架
        self.quality_assessment_framework = {
            "evaluation_dimensions": {
                "wechat_compatibility": {
                    "weight": 0.25,
                    "criteria": [
                        "forbidden_tags_check",
                        "forbidden_attributes_check", 
                        "css_property_compatibility",
                        "inline_styles_usage",
                        "html_structure_validity"
                    ]
                },
                "visual_design_quality": {
                    "weight": 0.22,
                    "criteria": [
                        "style_consistency",
                        "color_scheme_coherence",
                        "typography_hierarchy",
                        "visual_rhythm_balance",
                        "design_sophistication"
                    ]
                },
                "content_adaptation_accuracy": {
                    "weight": 0.20,
                    "criteria": [
                        "content_structure_mapping",
                        "semantic_accuracy",
                        "section_organization",
                        "quote_differentiation",
                        "emphasis_effectiveness"
                    ]
                },
                "mobile_responsiveness": {
                    "weight": 0.18,
                    "criteria": [
                        "responsive_images",
                        "font_size_optimization",
                        "touch_target_sizing",
                        "viewport_optimization",
                        "container_max_width"
                    ]
                },
                "code_technical_quality": {
                    "weight": 0.15,
                    "criteria": [
                        "html_syntax_validity",
                        "css_optimization",
                        "performance_consideration",
                        "accessibility_compliance",
                        "semantic_html_usage"
                    ]
                }
            },
            "quality_thresholds": {
                "exceptional": 0.95,
                "excellent": 0.90,
                "very_good": 0.85,
                "good": 0.80,
                "acceptable": 0.70,
                "needs_improvement": 0.60,
                "poor": 0.0
            },
            "critical_issues": {
                "blocking": [
                    "wechat_incompatible_tags",
                    "javascript_injection",
                    "broken_html_structure",
                    "missing_essential_styles"
                ],
                "major": [
                    "poor_mobile_optimization",
                    "accessibility_violations",
                    "content_structure_mismatch",
                    "style_inconsistencies"
                ],
                "minor": [
                    "suboptimal_font_sizes",
                    "minor_spacing_issues",
                    "color_contrast_warnings",
                    "performance_optimizations"
                ]
            }
        }
        
        # 微信兼容性严格检查规则
        self.wechat_strict_rules = {
            "absolutely_forbidden_tags": [
                "script", "iframe", "object", "embed", "form", "input", 
                "button", "textarea", "select", "audio", "video", "canvas"
            ],
            "forbidden_attributes": [
                "onclick", "onload", "onerror", "onmouseover", "onmouseout",
                "javascript:", "data-*", "contenteditable"
            ],
            "forbidden_css_properties": [
                "position: fixed", "position: absolute", "position: sticky",
                "z-index", "transform", "animation", "transition", "float",
                "clear", "overflow: hidden", "clip", "opacity: 0"
            ],
            "required_inline_styles": True,
            "max_nesting_depth": 15,
            "safe_css_properties": [
                "color", "background-color", "font-size", "font-weight", "font-family",
                "line-height", "margin", "padding", "border", "text-align", "display",
                "width", "max-width", "height", "letter-spacing", "text-transform",
                "font-style", "text-decoration", "border-radius"
            ]
        }
        
        self.comprehensive_quality_prompt = PromptTemplate(
            input_variables=["html_content", "content_analysis", "collaboration_feedback", "technical_analysis"],
            template="""
你是资深的HTML质量评估专家，负责对生成的HTML进行全方位质量评估。

HTML内容（前2000字符）：{html_content}

内容分析数据：{content_analysis}

Agent协作反馈：{collaboration_feedback}

技术分析数据：{technical_analysis}

请按照以下标准进行全面质量评估，输出JSON格式结果：

{{
    "overall_assessment": {{
        "total_score": 0.87,
        "quality_grade": "优秀",
        "pass_criteria": true,
        "executive_summary": "全面质量评估总结，包含关键发现和整体评价"
    }},
    
    "dimensional_scores": {{
        "wechat_compatibility": {{
            "score": 0.95,
            "grade": "优秀", 
            "details": "微信兼容性评估详情"
        }},
        "visual_design_quality": {{
            "score": 0.88,
            "grade": "良好",
            "details": "视觉设计质量评估详情"
        }},
        "content_adaptation_accuracy": {{
            "score": 0.85,
            "grade": "良好",
            "details": "内容适配准确性评估详情"
        }},
        "mobile_responsiveness": {{
            "score": 0.90,
            "grade": "优秀",
            "details": "移动端响应式评估详情"
        }},
        "code_technical_quality": {{
            "score": 0.82,
            "grade": "良好",
            "details": "代码技术质量评估详情"
        }}
    }},
    
    "critical_analysis": {{
        "blocking_issues": [
            "阻断性问题描述"
        ],
        "major_issues": [
            "主要问题描述1",
            "主要问题描述2"
        ],
        "minor_issues": [
            "次要问题描述1",
            "次要问题描述2"
        ],
        "strengths": [
            "发现的优点1：具体描述优势所在",
            "发现的优点2：具体描述优势所在"
        ],
        "innovation_points": [
            "创新点1：设计或实现上的亮点",
            "创新点2：技术处理的巧妙之处"
        ]
    }},
    
    "detailed_recommendations": {{
        "immediate_actions": [
            "需要立即处理的问题和建议"
        ],
        "optimization_suggestions": [
            "进一步优化建议1",
            "进一步优化建议2"
        ],
        "best_practices": [
            "最佳实践建议1",
            "最佳实践建议2"
        ]
    }},
    
    "compliance_verification": {{
        "wechat_compliance": {{
            "status": "通过",
            "violations": [],
            "warnings": []
        }},
        "mobile_compliance": {{
            "status": "通过",
            "issues": [],
            "optimizations": []
        }},
        "accessibility_compliance": {{
            "status": "基本通过",
            "improvements": []
        }}
    }},
    
    "usage_recommendation": {{
        "deployment_readiness": "可以部署",
        "risk_level": "低风险",
        "user_experience_impact": "正面影响",
        "maintenance_considerations": [
            "维护注意事项1",
            "维护注意事项2"
        ]
    }}
}}

评估重点：
1. 微信公众号严格兼容性检查（禁用标签、属性、CSS属性）
2. 视觉设计的专业性和一致性
3. 内容结构映射的准确性和语义保持
4. 移动端用户体验优化
5. HTML/CSS代码的技术质量和性能
6. 整体用户体验和实用性

只输出JSON格式结果，确保结构完整、数据准确。
"""
        )
    
    def execute(self, state: AgentState) -> AgentState:
        """执行全面质量评估系统"""
        try:
            # 获取所有必要数据
            generated_html = state.generated_html or ""
            content_analysis = state.content_analysis_summary or {}
            
            # 收集所有Agent的协作反馈
            collaboration_feedback = self._collect_collaboration_feedback(state)
            
            # 执行技术分析
            technical_analysis = self._perform_technical_analysis(generated_html, state)
            
            # 执行深度自动化检查
            automated_quality_results = self._perform_automated_quality_checks(generated_html, state)
            
            # 使用LLM进行综合质量评估
            llm_assessment = self._perform_llm_comprehensive_assessment(
                generated_html, content_analysis, collaboration_feedback, technical_analysis
            )
            
            # 融合自动化和LLM评估结果
            final_assessment = self._merge_assessment_results(
                llm_assessment, automated_quality_results, technical_analysis
            )
            
            # 执行质量标准验证
            validated_assessment = self._validate_quality_standards(final_assessment, state)
            
            # 生成最终质量报告
            comprehensive_report = self._generate_comprehensive_report(
                validated_assessment, state, technical_analysis
            )
            
            # 计算最终质量分数和等级
            final_score = comprehensive_report.get("overall_assessment", {}).get("total_score", 0.0)
            quality_grade = self._determine_comprehensive_quality_grade(final_score)
            
            # 存储结果到协作状态
            state.quality_score = final_score
            state.quality_report = comprehensive_report
            state.current_step = "comprehensive_quality_assessment_completed"
            
            # 处理质量不达标情况
            blocking_issues = comprehensive_report.get("critical_analysis", {}).get("blocking_issues", [])
            if blocking_issues or final_score < self.quality_assessment_framework["quality_thresholds"]["acceptable"]:
                state.errors.extend([f"Quality failure: {issue}" for issue in blocking_issues[:3]])
                if final_score < 0.5:
                    state.current_step = "quality_assessment_failed"
            
            # 为系统提供详细的协作上下文
            state.collaboration_context["comprehensive_quality"] = {
                "overall_score": final_score,
                "quality_grade": quality_grade,
                "pass_criteria": final_score >= self.quality_assessment_framework["quality_thresholds"]["acceptable"],
                "deployment_readiness": comprehensive_report.get("usage_recommendation", {}).get("deployment_readiness", "需要检查"),
                "risk_level": comprehensive_report.get("usage_recommendation", {}).get("risk_level", "未知"),
                "blocking_issues_count": len(blocking_issues),
                "major_issues_count": len(comprehensive_report.get("critical_analysis", {}).get("major_issues", [])),
                "strengths_count": len(comprehensive_report.get("critical_analysis", {}).get("strengths", [])),
                "innovation_points_count": len(comprehensive_report.get("critical_analysis", {}).get("innovation_points", [])),
                "wechat_compliance_status": comprehensive_report.get("compliance_verification", {}).get("wechat_compliance", {}).get("status", "未知"),
                "mobile_compliance_status": comprehensive_report.get("compliance_verification", {}).get("mobile_compliance", {}).get("status", "未知")
            }
            
            return state
                
        except Exception as e:
            state.errors.append(f"Comprehensive quality assessment failed: {str(e)}")
            state.last_error = str(e)
            state.current_step = "quality_assessment_system_error"
            state.quality_score = 0.3  # 低分表示评估失败
            state.quality_report = self._generate_error_fallback_report(str(e))
            return state
    
    def _collect_collaboration_feedback(self, state: AgentState) -> Dict[str, str]:
        """收集所有Agent的协作反馈"""
        feedback = {}
        
        # 收集各个Agent的反馈
        for agent_name in ["content_analyst", "style_designer", "design_adapter", "code_engineer"]:
            agent_feedback = state.agent_feedback.get("quality_director", [])
            if agent_feedback:
                feedback[agent_name] = "; ".join(agent_feedback)
        
        # 从collaboration_context收集特征信息
        collab_context = state.collaboration_context
        
        if "content_features" in collab_context:
            content_features = collab_context["content_features"]
            feedback["content_analyst_features"] = f"复杂度{content_features.get('structure_complexity', 0)}，特殊元素{content_features.get('has_special_elements', False)}"
        
        if "design_features" in collab_context:
            design_features = collab_context["design_features"]
            feedback["style_designer_features"] = f"设计复杂度{design_features.get('design_sophistication', 0):.2f}，高级排版{design_features.get('has_advanced_typography', False)}"
        
        if "css_features" in collab_context:
            css_features = collab_context["css_features"]
            feedback["design_adapter_features"] = f"CSS规则{css_features.get('total_rules', 0)}个，复杂度{css_features.get('complexity_score', 0):.2f}"
        
        if "html_features" in collab_context:
            html_features = collab_context["html_features"]
            feedback["code_engineer_features"] = f"HTML复杂度{html_features.get('html_complexity_score', 0):.2f}，移动优化{html_features.get('mobile_optimization_score', 0):.2f}"
        
        return feedback
    
    def _perform_technical_analysis(self, html_content: str, state: AgentState) -> Dict[str, Any]:
        """执行技术分析"""
        if not html_content:
            return {"error": "No HTML content for analysis"}
        
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            technical_metrics = {
                "html_structure": {
                    "total_elements": len(soup.find_all()),
                    "div_elements": len(soup.find_all('div')),
                    "p_elements": len(soup.find_all('p')),
                    "section_elements": len(soup.find_all('section')),
                    "header_elements": len(soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])),
                    "styled_elements": len(soup.find_all(attrs={'style': True})),
                    "nesting_depth": self._calculate_nesting_depth(soup)
                },
                "css_analysis": {
                    "inline_styles_count": html_content.count('style='),
                    "total_css_properties": self._count_css_properties(html_content),
                    "unique_colors": len(self._extract_colors(html_content)),
                    "font_families": len(self._extract_font_families(html_content)),
                    "responsive_properties": self._count_responsive_properties(html_content)
                },
                "content_metrics": {
                    "html_size_bytes": len(html_content.encode('utf-8')),
                    "text_content_length": len(soup.get_text()) if soup else 0,
                    "html_to_text_ratio": len(html_content) / max(len(soup.get_text()), 1) if soup else 0,
                    "images_count": len(soup.find_all('img')) if soup else 0,
                    "links_count": len(soup.find_all('a')) if soup else 0
                },
                "performance_indicators": {
                    "estimated_render_complexity": self._estimate_render_complexity(html_content),
                    "css_specificity_score": self._calculate_css_specificity(html_content),
                    "mobile_optimization_indicators": self._analyze_mobile_optimization(html_content)
                }
            }
            
            return technical_metrics
            
        except Exception as e:
            return {"error": f"Technical analysis failed: {str(e)}"}
    
    def _calculate_nesting_depth(self, soup: BeautifulSoup) -> int:
        """计算HTML嵌套深度"""
        if not soup:
            return 0
        
        def get_depth(element, current_depth=0):
            if not element.children:
                return current_depth
            
            max_child_depth = current_depth
            for child in element.children:
                if hasattr(child, 'children'):
                    child_depth = get_depth(child, current_depth + 1)
                    max_child_depth = max(max_child_depth, child_depth)
            
            return max_child_depth
        
        try:
            body = soup.find('body') or soup
            return get_depth(body)
        except Exception as e:
            return 0
    
    def _count_css_properties(self, html_content: str) -> int:
        """计算CSS属性总数"""
        try:
            style_attrs = re.findall(r'style="([^"]*)"', html_content)
            total_properties = 0
            
            for style_attr in style_attrs:
                properties = [prop.strip() for prop in style_attr.split(';') if ':' in prop]
                total_properties += len(properties)
            
            return total_properties
        except Exception as e:
            return 0
    
    def _extract_colors(self, html_content: str) -> set:
        """提取HTML中使用的颜色"""
        try:
            color_patterns = [
                r'#[0-9A-Fa-f]{6}',  # 十六进制颜色
                r'#[0-9A-Fa-f]{3}',  # 短十六进制颜色  
                r'rgb\\([^)]+\\)',   # RGB颜色
                r'rgba\\([^)]+\\)',  # RGBA颜色
            ]
            
            colors = set()
            for pattern in color_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                colors.update(matches)
            
            return colors
        except Exception as e:
            return set()
    
    def _extract_font_families(self, html_content: str) -> set:
        """提取HTML中使用的字体族"""
        try:
            font_pattern = r'font-family:\s*([^;]+)'
            font_matches = re.findall(font_pattern, html_content, re.IGNORECASE)
            
            font_families = set()
            for font_match in font_matches:
                # 清理和标准化字体名称
                fonts = [font.strip().strip('\'"') for font in font_match.split(',')]
                font_families.update(fonts)
            
            return font_families
        except Exception as e:
            return set()
    
    def _count_responsive_properties(self, html_content: str) -> int:
        """计算响应式CSS属性数量"""
        responsive_indicators = [
            'max-width: 100%',
            'width: 100%',
            'box-sizing: border-box',
            'display: block',
            'height: auto'
        ]
        
        count = 0
        html_lower = html_content.lower()
        for indicator in responsive_indicators:
            count += html_lower.count(indicator.lower())
        
        return count
    
    def _estimate_render_complexity(self, html_content: str) -> float:
        """估算渲染复杂度"""
        try:
            complexity_score = 0.0
            
            # 基础复杂度
            complexity_score += len(html_content) / 10000  # 内容长度
            
            # 元素复杂度
            element_count = html_content.count('<')
            complexity_score += element_count / 100
            
            # 样式复杂度
            style_count = html_content.count('style=')
            complexity_score += style_count / 50
            
            # 嵌套复杂度（简单估算）
            nesting_indicators = html_content.count('<div') + html_content.count('<section')
            complexity_score += nesting_indicators / 20
            
            return min(complexity_score, 10.0)  # 限制最大值
            
        except Exception as e:
            return 1.0
    
    def _calculate_css_specificity(self, html_content: str) -> float:
        """计算CSS特异性分数"""
        try:
            # 简化的特异性计算
            specificity_score = 0.0
            
            # 内联样式权重高
            inline_styles = html_content.count('style=')
            specificity_score += inline_styles * 0.1
            
            # ID选择器权重（虽然在内联样式中不常见）
            id_count = html_content.count('id=')
            specificity_score += id_count * 0.05
            
            # 类选择器权重（间接通过class属性估算）
            class_count = html_content.count('class=')
            specificity_score += class_count * 0.02
            
            return min(specificity_score, 5.0)
            
        except Exception as e:
            return 0.0
    
    def _analyze_mobile_optimization(self, html_content: str) -> Dict[str, Any]:
        """分析移动端优化指标"""
        try:
            optimization_metrics = {
                "has_viewport_meta": False,  # 实际项目中需要检查完整HTML
                "has_responsive_images": 'max-width: 100%' in html_content and '<img' in html_content,
                "has_responsive_containers": 'max-width: 100%' in html_content,
                "appropriate_font_sizes": self._check_font_sizes(html_content),
                "touch_friendly_elements": self._check_touch_friendly_elements(html_content),
                "mobile_css_properties": self._count_responsive_properties(html_content)
            }
            
            return optimization_metrics
            
        except Exception as e:
            return {"error": "Mobile optimization analysis failed"}
    
    def _check_font_sizes(self, html_content: str) -> Dict[str, Any]:
        """检查字体大小的移动端适配"""
        try:
            font_sizes = re.findall(r'font-size:\s*(\d+)px', html_content)
            font_sizes = [int(size) for size in font_sizes]
            
            if not font_sizes:
                return {"status": "no_fonts_found", "details": "未发现字体大小设置"}
            
            small_fonts = [size for size in font_sizes if size < 14]
            large_fonts = [size for size in font_sizes if size > 24]
            appropriate_fonts = [size for size in font_sizes if 14 <= size <= 24]
            
            return {
                "total_fonts": len(font_sizes),
                "small_fonts_count": len(small_fonts),
                "appropriate_fonts_count": len(appropriate_fonts),
                "large_fonts_count": len(large_fonts),
                "min_font_size": min(font_sizes),
                "max_font_size": max(font_sizes),
                "average_font_size": sum(font_sizes) / len(font_sizes),
                "mobile_friendly_ratio": len(appropriate_fonts) / len(font_sizes)
            }
            
        except Exception as e:
            return {"error": f"Font size analysis failed: {str(e)}"}
    
    def _check_touch_friendly_elements(self, html_content: str) -> Dict[str, Any]:
        """检查触摸友好的元素设计"""
        try:
            # 检查按钮和链接的尺寸
            buttons = re.findall(r'<(?:button|a)[^>]*style="([^"]*)"', html_content)
            
            touch_friendly_count = 0
            total_interactive_elements = len(buttons)
            
            for button_style in buttons:
                # 检查是否有足够的padding或height
                has_adequate_padding = any(prop in button_style.lower() for prop in ['padding:', 'height:'])
                if has_adequate_padding:
                    touch_friendly_count += 1
            
            return {
                "total_interactive_elements": total_interactive_elements,
                "touch_friendly_elements": touch_friendly_count,
                "touch_friendly_ratio": touch_friendly_count / max(total_interactive_elements, 1),
                "recommendations": self._generate_touch_recommendations(touch_friendly_count, total_interactive_elements)
            }
            
        except Exception as e:
            return {"error": f"Touch friendly analysis failed: {str(e)}"}
    
    def _generate_touch_recommendations(self, touch_friendly_count: int, total_count: int) -> List[str]:
        """生成触摸友好性建议"""
        recommendations = []
        
        if total_count == 0:
            recommendations.append("建议添加交互元素的触摸优化")
        elif touch_friendly_count / total_count < 0.5:
            recommendations.append("建议增加交互元素的padding和最小触摸区域")
            recommendations.append("确保按钮和链接至少44x44px的触摸区域")
        elif touch_friendly_count / total_count < 0.8:
            recommendations.append("大部分交互元素已优化，建议检查剩余元素")
        else:
            recommendations.append("交互元素触摸友好性良好")
        
        return recommendations
    
    def _perform_automated_quality_checks(self, html_content: str, state: AgentState) -> Dict[str, Any]:
        """执行自动化质量检查"""
        if not html_content:
            return {"error": "No HTML content for automated checks"}
        
        try:
            automated_results = {
                "wechat_compatibility_check": self._check_wechat_strict_compatibility(html_content),
                "html_validity_check": self._validate_html_structure(html_content),
                "css_quality_check": self._analyze_css_quality(html_content),
                "accessibility_check": self._perform_accessibility_check(html_content),
                "performance_check": self._analyze_performance_indicators(html_content),
                "mobile_responsiveness_check": self._comprehensive_mobile_check(html_content),
                "content_semantic_check": self._validate_content_semantics(html_content, state)
            }
            
            return automated_results
            
        except Exception as e:
            return {"error": f"Automated quality checks failed: {str(e)}"}
    
    def _check_wechat_strict_compatibility(self, html_content: str) -> Dict[str, Any]:
        """严格的微信兼容性检查"""
        try:
            compatibility_result = {
                "overall_status": "通过",
                "violations": [],
                "warnings": [],
                "score": 1.0
            }
            
            # 检查禁用标签
            for forbidden_tag in self.wechat_strict_rules["absolutely_forbidden_tags"]:
                if f'<{forbidden_tag}' in html_content.lower():
                    compatibility_result["violations"].append(f"发现禁用标签: {forbidden_tag}")
                    compatibility_result["overall_status"] = "不通过"
                    compatibility_result["score"] -= 0.2
            
            # 检查禁用属性
            for forbidden_attr in self.wechat_strict_rules["forbidden_attributes"]:
                if forbidden_attr in html_content.lower():
                    compatibility_result["violations"].append(f"发现禁用属性: {forbidden_attr}")
                    compatibility_result["overall_status"] = "不通过"
                    compatibility_result["score"] -= 0.15
            
            # 检查禁用CSS属性
            for forbidden_css in self.wechat_strict_rules["forbidden_css_properties"]:
                if forbidden_css in html_content.lower():
                    compatibility_result["violations"].append(f"发现禁用CSS属性: {forbidden_css}")
                    compatibility_result["overall_status"] = "不通过"
                    compatibility_result["score"] -= 0.1
            
            # 检查内联样式使用
            if not html_content.count('style='):
                compatibility_result["warnings"].append("未检测到内联样式，可能影响样式显示")
                compatibility_result["score"] -= 0.05
            
            # 检查嵌套深度
            soup = BeautifulSoup(html_content, 'html.parser')
            nesting_depth = self._calculate_nesting_depth(soup)
            if nesting_depth > self.wechat_strict_rules["max_nesting_depth"]:
                compatibility_result["warnings"].append(f"HTML嵌套深度{nesting_depth}超过推荐值{self.wechat_strict_rules['max_nesting_depth']}")
                compatibility_result["score"] -= 0.05
            
            compatibility_result["score"] = max(compatibility_result["score"], 0.0)
            
            return compatibility_result
            
        except Exception as e:
            return {
                "overall_status": "检查失败",
                "violations": [f"兼容性检查异常: {str(e)}"],
                "warnings": [],
                "score": 0.0
            }
    
    def _validate_html_structure(self, html_content: str) -> Dict[str, Any]:
        """验证HTML结构有效性"""
        try:
            validation_result = {
                "overall_validity": "有效",
                "syntax_errors": [],
                "structural_issues": [],
                "score": 1.0
            }
            
            # 基本语法检查
            try:
                soup = BeautifulSoup(html_content, 'html.parser')
            except Exception as parse_error:
                validation_result["syntax_errors"].append(f"HTML解析错误: {str(parse_error)}")
                validation_result["overall_validity"] = "无效"
                validation_result["score"] -= 0.3
            
            # 结构完整性检查
            if not html_content.strip():
                validation_result["structural_issues"].append("HTML内容为空")
                validation_result["overall_validity"] = "无效"
                validation_result["score"] -= 0.5
            
            # 标签匹配检查
            open_tags = re.findall(r'<([a-zA-Z][a-zA-Z0-9]*)', html_content)
            close_tags = re.findall(r'</([a-zA-Z][a-zA-Z0-9]*)', html_content)
            
            self_closing_tags = ['img', 'br', 'hr', 'input', 'meta', 'link']
            
            for tag in open_tags:
                if tag not in self_closing_tags and open_tags.count(tag) != close_tags.count(tag):
                    validation_result["structural_issues"].append(f"标签不匹配: {tag}")
                    validation_result["score"] -= 0.1
            
            # 基本结构检查
            if not re.search(r'<(div|p|section)', html_content, re.IGNORECASE):
                validation_result["structural_issues"].append("缺少基本的容器结构")
                validation_result["score"] -= 0.2
            
            if validation_result["structural_issues"]:
                validation_result["overall_validity"] = "结构有问题"
            
            validation_result["score"] = max(validation_result["score"], 0.0)
            
            return validation_result
            
        except Exception as e:
            return {
                "overall_validity": "检查失败",
                "syntax_errors": [f"验证异常: {str(e)}"],
                "structural_issues": [],
                "score": 0.0
            }
    
    def _analyze_css_quality(self, html_content: str) -> Dict[str, Any]:
        """分析CSS质量"""
        try:
            css_analysis = {
                "overall_quality": "良好",
                "optimization_issues": [],
                "best_practices": [],
                "score": 0.8
            }
            
            # CSS属性质量检查
            style_attrs = re.findall(r'style="([^"]*)"', html_content)
            
            total_properties = 0
            duplicate_properties = 0
            
            for style_attr in style_attrs:
                properties = [prop.strip() for prop in style_attr.split(';') if ':' in prop]
                total_properties += len(properties)
                
                # 检查重复属性
                prop_names = [prop.split(':')[0].strip() for prop in properties]
                if len(prop_names) != len(set(prop_names)):
                    duplicate_properties += 1
            
            if duplicate_properties > 0:
                css_analysis["optimization_issues"].append(f"发现{duplicate_properties}个样式属性重复")
                css_analysis["score"] -= 0.1
            
            # 检查CSS最佳实践
            if 'margin: 0 auto' in html_content:
                css_analysis["best_practices"].append("使用了居中对齐最佳实践")
                css_analysis["score"] += 0.05
            
            if 'line-height:' in html_content:
                css_analysis["best_practices"].append("设置了行高优化可读性")
                css_analysis["score"] += 0.05
            
            if 'box-sizing: border-box' in html_content:
                css_analysis["best_practices"].append("使用了border-box盒模型")
                css_analysis["score"] += 0.1
            
            # 检查单位使用
            if re.search(r':\s*\d+px', html_content):
                css_analysis["best_practices"].append("合理使用像素单位")
            
            css_analysis["score"] = min(css_analysis["score"], 1.0)
            
            return css_analysis
            
        except Exception as e:
            return {
                "overall_quality": "检查失败",
                "optimization_issues": [f"CSS分析异常: {str(e)}"],
                "best_practices": [],
                "score": 0.5
            }
    
    def _perform_accessibility_check(self, html_content: str) -> Dict[str, Any]:
        """执行可访问性检查"""
        try:
            accessibility_result = {
                "overall_accessibility": "基本符合",
                "violations": [],
                "improvements": [],
                "score": 0.7
            }
            
            # 图片alt属性检查
            img_tags = re.findall(r'<img[^>]*>', html_content)
            for img_tag in img_tags:
                if 'alt=' not in img_tag:
                    accessibility_result["violations"].append("图片缺少alt属性")
                    accessibility_result["score"] -= 0.1
            
            # 颜色对比度简单检查（基于常见问题）
            if '#ffffff' in html_content.lower() and '#f0f0f0' in html_content.lower():
                accessibility_result["improvements"].append("建议检查白色背景与浅灰色文本的对比度")
            
            # 字体大小可访问性
            font_sizes = re.findall(r'font-size:\s*(\d+)px', html_content)
            small_fonts = [int(size) for size in font_sizes if int(size) < 16]
            if small_fonts:
                accessibility_result["improvements"].append(f"发现{len(small_fonts)}个小于16px的字体，可能影响可读性")
                accessibility_result["score"] -= 0.05
            
            # 语义化标签使用
            semantic_tags = ['section', 'header', 'main', 'article', 'aside', 'nav']
            semantic_count = sum([html_content.lower().count(f'<{tag}') for tag in semantic_tags])
            
            if semantic_count > 0:
                accessibility_result["improvements"].append(f"使用了{semantic_count}个语义化标签")
                accessibility_result["score"] += 0.1
            else:
                accessibility_result["improvements"].append("建议使用更多语义化标签")
            
            accessibility_result["score"] = max(min(accessibility_result["score"], 1.0), 0.0)
            
            return accessibility_result
            
        except Exception as e:
            return {
                "overall_accessibility": "检查失败",
                "violations": [f"可访问性检查异常: {str(e)}"],
                "improvements": [],
                "score": 0.5
            }
    
    def _analyze_performance_indicators(self, html_content: str) -> Dict[str, Any]:
        """分析性能指标"""
        try:
            performance_analysis = {
                "overall_performance": "良好",
                "optimization_opportunities": [],
                "performance_strengths": [],
                "score": 0.8
            }
            
            # HTML大小分析
            html_size_kb = len(html_content.encode('utf-8')) / 1024
            
            if html_size_kb > 100:
                performance_analysis["optimization_opportunities"].append(f"HTML大小{html_size_kb:.2f}KB较大，建议优化")
                performance_analysis["score"] -= 0.1
            elif html_size_kb < 50:
                performance_analysis["performance_strengths"].append(f"HTML大小{html_size_kb:.2f}KB适中")
                performance_analysis["score"] += 0.05
            
            # CSS内联样式效率
            style_count = html_content.count('style=')
            if style_count > 50:
                performance_analysis["optimization_opportunities"].append(f"内联样式{style_count}个较多，可能影响缓存效率")
                performance_analysis["score"] -= 0.05
            
            # 图片优化检查
            img_count = html_content.lower().count('<img')
            if img_count > 0:
                responsive_img_count = html_content.count('max-width: 100%')
                if responsive_img_count >= img_count:
                    performance_analysis["performance_strengths"].append("图片已优化响应式设计")
                    performance_analysis["score"] += 0.1
                else:
                    performance_analysis["optimization_opportunities"].append("部分图片未优化响应式设计")
                    performance_analysis["score"] -= 0.05
            
            # 嵌套复杂度对性能的影响
            nesting_complexity = self._estimate_render_complexity(html_content)
            if nesting_complexity > 5:
                performance_analysis["optimization_opportunities"].append(f"渲染复杂度{nesting_complexity:.2f}较高")
                performance_analysis["score"] -= 0.1
            
            performance_analysis["score"] = max(min(performance_analysis["score"], 1.0), 0.0)
            
            return performance_analysis
            
        except Exception as e:
            return {
                "overall_performance": "检查失败",
                "optimization_opportunities": [f"性能分析异常: {str(e)}"],
                "performance_strengths": [],
                "score": 0.5
            }
    
    def _comprehensive_mobile_check(self, html_content: str) -> Dict[str, Any]:
        """全面移动端检查"""
        try:
            mobile_analysis = {
                "overall_mobile_readiness": "良好",
                "mobile_issues": [],
                "mobile_optimizations": [],
                "score": 0.8
            }
            
            # 响应式容器检查
            if 'max-width: 100%' in html_content:
                mobile_analysis["mobile_optimizations"].append("使用了响应式容器")
                mobile_analysis["score"] += 0.1
            else:
                mobile_analysis["mobile_issues"].append("缺少响应式容器设计")
                mobile_analysis["score"] -= 0.2
            
            # 字体大小移动端适配
            font_analysis = self._check_font_sizes(html_content)
            if isinstance(font_analysis, dict) and "mobile_friendly_ratio" in font_analysis:
                ratio = font_analysis["mobile_friendly_ratio"]
                if ratio > 0.8:
                    mobile_analysis["mobile_optimizations"].append(f"字体大小移动端适配率{ratio:.2f}")
                    mobile_analysis["score"] += 0.1
                elif ratio < 0.5:
                    mobile_analysis["mobile_issues"].append(f"字体大小移动端适配率仅{ratio:.2f}")
                    mobile_analysis["score"] -= 0.15
            
            # 触摸友好性检查
            touch_analysis = self._check_touch_friendly_elements(html_content)
            if isinstance(touch_analysis, dict) and "touch_friendly_ratio" in touch_analysis:
                touch_ratio = touch_analysis["touch_friendly_ratio"]
                if touch_ratio > 0.7:
                    mobile_analysis["mobile_optimizations"].append("交互元素触摸友好")
                    mobile_analysis["score"] += 0.05
                elif touch_ratio < 0.3:
                    mobile_analysis["mobile_issues"].append("交互元素触摸友好性不足")
                    mobile_analysis["score"] -= 0.1
            
            # 内容布局检查
            if 'word-wrap: break-word' in html_content or 'word-break:' in html_content:
                mobile_analysis["mobile_optimizations"].append("文本换行优化良好")
                mobile_analysis["score"] += 0.05
            
            mobile_analysis["score"] = max(min(mobile_analysis["score"], 1.0), 0.0)
            
            return mobile_analysis
            
        except Exception as e:
            return {
                "overall_mobile_readiness": "检查失败",
                "mobile_issues": [f"移动端检查异常: {str(e)}"],
                "mobile_optimizations": [],
                "score": 0.5
            }
    
    def _validate_content_semantics(self, html_content: str, state: AgentState) -> Dict[str, Any]:
        """验证内容语义准确性"""
        try:
            semantic_analysis = {
                "overall_semantic_accuracy": "良好",
                "semantic_issues": [],
                "semantic_strengths": [],
                "score": 0.8
            }
            
            # 从状态获取原始内容分析
            content_analysis = state.content_analysis_summary or {}
            structure = content_analysis.get("structure", {})
            
            # 章节映射检查
            expected_sections = structure.get("section_count", 0)
            actual_sections = html_content.count('<section')
            
            if expected_sections > 0:
                if actual_sections == expected_sections:
                    semantic_analysis["semantic_strengths"].append(f"章节映射准确（{actual_sections}个章节）")
                    semantic_analysis["score"] += 0.1
                elif actual_sections == 0:
                    semantic_analysis["semantic_issues"].append(f"缺少章节结构（应有{expected_sections}个章节）")
                    semantic_analysis["score"] -= 0.15
                else:
                    semantic_analysis["semantic_issues"].append(f"章节数量不匹配（期望{expected_sections}个，实际{actual_sections}个）")
                    semantic_analysis["score"] -= 0.1
            
            # 引用内容检查
            if structure.get("has_quotes", False):
                quote_indicators = html_content.count('quote-') + html_content.count('border-left:')
                if quote_indicators > 0:
                    semantic_analysis["semantic_strengths"].append("引用内容已正确样式化")
                    semantic_analysis["score"] += 0.1
                else:
                    semantic_analysis["semantic_issues"].append("引用内容缺少样式区分")
                    semantic_analysis["score"] -= 0.1
            
            # 强调内容检查
            if structure.get("has_emphasis", False):
                if 'emphasis' in html_content.lower():
                    semantic_analysis["semantic_strengths"].append("强调内容已突出显示")
                    semantic_analysis["score"] += 0.05
                else:
                    semantic_analysis["semantic_issues"].append("强调内容缺少突出样式")
                    semantic_analysis["score"] -= 0.05
            
            # 标题处理检查
            if '<h1' in html_content:
                semantic_analysis["semantic_strengths"].append("使用了标题标签")
                semantic_analysis["score"] += 0.05
            
            semantic_analysis["score"] = max(min(semantic_analysis["score"], 1.0), 0.0)
            
            return semantic_analysis
            
        except Exception as e:
            return {
                "overall_semantic_accuracy": "检查失败",
                "semantic_issues": [f"语义检查异常: {str(e)}"],
                "semantic_strengths": [],
                "score": 0.5
            }
    
    def _perform_llm_comprehensive_assessment(self, html_content: str, content_analysis: Dict[str, Any],
                                            collaboration_feedback: Dict[str, str], 
                                            technical_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """使用LLM进行综合质量评估"""
        try:
            prompt_text = self.comprehensive_quality_prompt.format(
                html_content=html_content[:2000],  # 限制长度避免token过多
                content_analysis=json.dumps(content_analysis, ensure_ascii=False, indent=2),
                collaboration_feedback=json.dumps(collaboration_feedback, ensure_ascii=False, indent=2),
                technical_analysis=json.dumps(technical_analysis, ensure_ascii=False, indent=2)
            )
            
            response = self.llm.invoke(prompt_text)
            llm_assessment = json.loads(response.content)
            
            # 验证LLM返回的结构
            if self._validate_llm_assessment_structure(llm_assessment):
                return llm_assessment
            else:
                return self._generate_comprehensive_fallback_assessment()
                
        except (json.JSONDecodeError, Exception) as e:
            return self._generate_comprehensive_fallback_assessment()
    
    def _validate_llm_assessment_structure(self, assessment: Dict[str, Any]) -> bool:
        """验证LLM评估结果的结构完整性"""
        required_keys = [
            "overall_assessment", "dimensional_scores", "critical_analysis",
            "detailed_recommendations", "compliance_verification", "usage_recommendation"
        ]
        
        return (
            isinstance(assessment, dict) and
            all(key in assessment for key in required_keys) and
            isinstance(assessment.get("overall_assessment", {}), dict) and
            "total_score" in assessment.get("overall_assessment", {})
        )
    
    def _generate_comprehensive_fallback_assessment(self) -> Dict[str, Any]:
        """生成综合备用评估"""
        return {
            "overall_assessment": {
                "total_score": 0.7,
                "quality_grade": "可接受",
                "pass_criteria": True,
                "executive_summary": "使用备用评估系统，建议进行更详细的人工检查"
            },
            "dimensional_scores": {
                "wechat_compatibility": {"score": 0.7, "grade": "可接受", "details": "基础兼容性检查通过"},
                "visual_design_quality": {"score": 0.7, "grade": "可接受", "details": "设计质量需要进一步验证"},
                "content_adaptation_accuracy": {"score": 0.7, "grade": "可接受", "details": "内容映射基本准确"},
                "mobile_responsiveness": {"score": 0.7, "grade": "可接受", "details": "移动端优化基本完成"},
                "code_technical_quality": {"score": 0.7, "grade": "可接受", "details": "代码质量可接受"}
            },
            "critical_analysis": {
                "blocking_issues": [],
                "major_issues": ["评估系统异常，需要人工验证"],
                "minor_issues": ["建议使用完整评估功能"],
                "strengths": ["基础HTML结构完整", "使用了内联样式"],
                "innovation_points": []
            },
            "detailed_recommendations": {
                "immediate_actions": ["重新运行质量评估系统"],
                "optimization_suggestions": ["进行人工代码审查"],
                "best_practices": ["建立质量检查清单"]
            },
            "compliance_verification": {
                "wechat_compliance": {"status": "需要检查", "violations": [], "warnings": []},
                "mobile_compliance": {"status": "需要检查", "issues": [], "optimizations": []},
                "accessibility_compliance": {"status": "需要检查", "improvements": []}
            },
            "usage_recommendation": {
                "deployment_readiness": "需要进一步验证",
                "risk_level": "中等风险",
                "user_experience_impact": "待确认",
                "maintenance_considerations": ["建立定期质量检查机制"]
            }
        }
    
    def _merge_assessment_results(self, llm_assessment: Dict[str, Any], 
                                automated_results: Dict[str, Any], 
                                technical_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """融合LLM评估和自动化检查结果"""
        try:
            merged_assessment = llm_assessment.copy()
            
            # 融合自动化检查的具体发现
            if "wechat_compatibility_check" in automated_results:
                wechat_check = automated_results["wechat_compatibility_check"]
                if "violations" in wechat_check and wechat_check["violations"]:
                    merged_assessment["critical_analysis"]["blocking_issues"].extend(wechat_check["violations"][:3])
                
                # 更新微信兼容性分数
                if "dimensional_scores" in merged_assessment:
                    automated_score = wechat_check.get("score", 0.7)
                    original_score = merged_assessment["dimensional_scores"]["wechat_compatibility"]["score"]
                    # 取更保守的分数
                    merged_assessment["dimensional_scores"]["wechat_compatibility"]["score"] = min(automated_score, original_score)
            
            # 融合移动端检查结果
            if "mobile_responsiveness_check" in automated_results:
                mobile_check = automated_results["mobile_responsiveness_check"]
                if "mobile_issues" in mobile_check and mobile_check["mobile_issues"]:
                    merged_assessment["critical_analysis"]["major_issues"].extend(mobile_check["mobile_issues"][:2])
            
            # 融合性能分析结果
            if "performance_check" in automated_results:
                perf_check = automated_results["performance_check"]
                if "optimization_opportunities" in perf_check and perf_check["optimization_opportunities"]:
                    merged_assessment["detailed_recommendations"]["optimization_suggestions"].extend(
                        perf_check["optimization_opportunities"][:2]
                    )
            
            # 根据自动化检查调整总分
            automated_penalty = 0.0
            critical_issues = merged_assessment.get("critical_analysis", {})
            
            # 阻断性问题严重扣分
            blocking_count = len(critical_issues.get("blocking_issues", []))
            automated_penalty += blocking_count * 0.15
            
            # 主要问题适中扣分
            major_count = len(critical_issues.get("major_issues", []))
            automated_penalty += major_count * 0.05
            
            # 调整总分
            original_score = merged_assessment.get("overall_assessment", {}).get("total_score", 0.7)
            adjusted_score = max(original_score - automated_penalty, 0.0)
            merged_assessment["overall_assessment"]["total_score"] = round(adjusted_score, 3)
            merged_assessment["overall_assessment"]["quality_grade"] = self._determine_comprehensive_quality_grade(adjusted_score)
            
            return merged_assessment
            
        except Exception as e:
            # 如果融合失败，返回LLM评估结果
            return llm_assessment
    
    def _validate_quality_standards(self, assessment: Dict[str, Any], state: AgentState) -> Dict[str, Any]:
        """验证质量标准符合性"""
        try:
            validated_assessment = assessment.copy()
            
            # 获取当前分数
            current_score = validated_assessment.get("overall_assessment", {}).get("total_score", 0.0)
            
            # 质量标准验证
            quality_standards = self.quality_assessment_framework["quality_thresholds"]
            
            # 阻断性问题检查
            blocking_issues = validated_assessment.get("critical_analysis", {}).get("blocking_issues", [])
            if blocking_issues:
                # 有阻断性问题，分数不能超过可接受阈值
                max_score = quality_standards["acceptable"] - 0.1
                if current_score > max_score:
                    validated_assessment["overall_assessment"]["total_score"] = max_score
                    validated_assessment["overall_assessment"]["quality_grade"] = "需改进"
                
                validated_assessment["overall_assessment"]["pass_criteria"] = False
                validated_assessment["usage_recommendation"]["deployment_readiness"] = "不建议部署"
                validated_assessment["usage_recommendation"]["risk_level"] = "高风险"
            
            # 主要问题过多检查
            major_issues = validated_assessment.get("critical_analysis", {}).get("major_issues", [])
            if len(major_issues) > 5:
                penalty = min((len(major_issues) - 5) * 0.05, 0.2)
                adjusted_score = max(current_score - penalty, 0.0)
                validated_assessment["overall_assessment"]["total_score"] = adjusted_score
                validated_assessment["overall_assessment"]["quality_grade"] = self._determine_comprehensive_quality_grade(adjusted_score)
            
            # 微信兼容性严格检查
            wechat_compliance = validated_assessment.get("compliance_verification", {}).get("wechat_compliance", {})
            if wechat_compliance.get("status") == "不通过":
                validated_assessment["overall_assessment"]["pass_criteria"] = False
                validated_assessment["usage_recommendation"]["deployment_readiness"] = "不可部署"
                validated_assessment["usage_recommendation"]["risk_level"] = "极高风险"
                
                # 强制降低分数
                validated_assessment["overall_assessment"]["total_score"] = min(current_score, 0.3)
                validated_assessment["overall_assessment"]["quality_grade"] = "不合格"
            
            return validated_assessment
            
        except Exception as e:
            return assessment
    
    def _generate_comprehensive_report(self, assessment: Dict[str, Any], state: AgentState, 
                                     technical_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """生成综合质量报告"""
        try:
            comprehensive_report = assessment.copy()
            
            # 添加技术指标摘要
            if "html_structure" in technical_analysis:
                html_metrics = technical_analysis["html_structure"]
                comprehensive_report["technical_summary"] = {
                    "html_elements_count": html_metrics.get("total_elements", 0),
                    "styled_elements_count": html_metrics.get("styled_elements", 0),
                    "structure_complexity": html_metrics.get("nesting_depth", 0),
                    "content_size_bytes": technical_analysis.get("content_metrics", {}).get("html_size_bytes", 0)
                }
            
            # 添加协作评估摘要
            collab_context = state.collaboration_context
            comprehensive_report["collaboration_summary"] = {
                "content_analysis_quality": self._assess_content_analysis_contribution(collab_context),
                "design_system_quality": self._assess_design_system_contribution(collab_context),
                "css_generation_quality": self._assess_css_generation_contribution(collab_context),
                "html_generation_quality": self._assess_html_generation_contribution(collab_context)
            }
            
            # 添加改进优先级
            comprehensive_report["improvement_priorities"] = self._generate_improvement_priorities(assessment)
            
            # 添加质量趋势分析（如果有历史数据）
            comprehensive_report["quality_trends"] = {
                "current_session_quality": assessment.get("overall_assessment", {}).get("total_score", 0.0),
                "improvement_potential": self._estimate_improvement_potential(assessment),
                "quality_stability": "稳定"  # 实际项目中可以基于历史数据
            }
            
            return comprehensive_report
            
        except Exception as e:
            return assessment
    
    def _assess_content_analysis_contribution(self, collab_context: Dict[str, Any]) -> Dict[str, Any]:
        """评估内容分析Agent的贡献"""
        content_features = collab_context.get("content_features", {})
        
        return {
            "structure_detection_accuracy": "高" if content_features.get("structure_complexity", 0) > 0 else "中",
            "special_elements_identification": "完成" if content_features.get("has_special_elements", False) else "未完成",
            "content_type_classification": content_features.get("content_type", "未知"),
            "contribution_score": 0.8 if content_features.get("has_special_elements", False) else 0.6
        }
    
    def _assess_design_system_contribution(self, collab_context: Dict[str, Any]) -> Dict[str, Any]:
        """评估设计系统Agent的贡献"""
        design_features = collab_context.get("design_features", {})
        
        sophistication = design_features.get("design_sophistication", 0)
        
        return {
            "design_sophistication_level": "高" if sophistication > 0.7 else "中" if sophistication > 0.4 else "低",
            "advanced_typography": "支持" if design_features.get("has_advanced_typography", False) else "不支持",
            "style_system_completeness": "完整" if design_features.get("color_palette_size", 0) > 5 else "基础",
            "contribution_score": sophistication
        }
    
    def _assess_css_generation_contribution(self, collab_context: Dict[str, Any]) -> Dict[str, Any]:
        """评估CSS生成Agent的贡献"""
        css_features = collab_context.get("css_features", {})
        
        complexity = css_features.get("complexity_score", 0)
        total_rules = css_features.get("total_rules", 0)
        
        return {
            "css_complexity_handling": "优秀" if complexity > 0.7 else "良好" if complexity > 0.5 else "基础",
            "rule_generation_completeness": "完整" if total_rules > 15 else "充分" if total_rules > 8 else "基础",
            "advanced_features_support": "支持" if css_features.get("has_section_styles", False) else "部分支持",
            "contribution_score": complexity
        }
    
    def _assess_html_generation_contribution(self, collab_context: Dict[str, Any]) -> Dict[str, Any]:
        """评估HTML生成Agent的贡献"""
        html_features = collab_context.get("html_features", {})
        
        complexity = html_features.get("html_complexity_score", 0)
        mobile_score = html_features.get("mobile_optimization_score", 0)
        wechat_score = html_features.get("wechat_compatibility_score", 0)
        
        return {
            "html_structure_quality": "优秀" if complexity > 0.7 else "良好" if complexity > 0.5 else "基础",
            "mobile_optimization_level": "优秀" if mobile_score > 0.8 else "良好" if mobile_score > 0.6 else "需改进",
            "wechat_compatibility_level": "完全兼容" if wechat_score > 0.9 else "基本兼容" if wechat_score > 0.7 else "有问题",
            "contribution_score": (complexity + mobile_score + wechat_score) / 3
        }
    
    def _generate_improvement_priorities(self, assessment: Dict[str, Any]) -> List[Dict[str, Any]]:
        """生成改进优先级列表"""
        priorities = []
        
        # 阻断性问题最高优先级
        blocking_issues = assessment.get("critical_analysis", {}).get("blocking_issues", [])
        for issue in blocking_issues[:3]:
            priorities.append({
                "priority": "最高",
                "category": "阻断性问题",
                "description": issue,
                "impact": "严重影响部署",
                "effort": "中等"
            })
        
        # 微信兼容性问题高优先级
        wechat_violations = assessment.get("compliance_verification", {}).get("wechat_compliance", {}).get("violations", [])
        for violation in wechat_violations[:2]:
            priorities.append({
                "priority": "高",
                "category": "微信兼容性",
                "description": violation,
                "impact": "影响平台展示",
                "effort": "低"
            })
        
        # 移动端优化中优先级
        mobile_issues = assessment.get("compliance_verification", {}).get("mobile_compliance", {}).get("issues", [])
        for issue in mobile_issues[:2]:
            priorities.append({
                "priority": "中",
                "category": "移动端优化",
                "description": issue,
                "impact": "影响用户体验",
                "effort": "中等"
            })
        
        return priorities[:5]  # 返回前5个优先级项目
    
    def _estimate_improvement_potential(self, assessment: Dict[str, Any]) -> float:
        """估算改进潜力"""
        current_score = assessment.get("overall_assessment", {}).get("total_score", 0.0)
        
        # 基于当前问题评估改进潜力
        blocking_issues = len(assessment.get("critical_analysis", {}).get("blocking_issues", []))
        major_issues = len(assessment.get("critical_analysis", {}).get("major_issues", []))
        minor_issues = len(assessment.get("critical_analysis", {}).get("minor_issues", []))
        
        # 计算理论最高可达分数
        potential_improvement = 0.0
        potential_improvement += blocking_issues * 0.15  # 解决阻断性问题可提升
        potential_improvement += major_issues * 0.05     # 解决主要问题可提升
        potential_improvement += minor_issues * 0.02     # 解决次要问题可提升
        
        max_potential_score = min(current_score + potential_improvement, 1.0)
        
        return round(max_potential_score - current_score, 3)
    
    def _determine_comprehensive_quality_grade(self, score: float) -> str:
        """确定综合质量等级"""
        thresholds = self.quality_assessment_framework["quality_thresholds"]
        
        if score >= thresholds["exceptional"]:
            return "卓越"
        elif score >= thresholds["excellent"]:
            return "优秀"
        elif score >= thresholds["very_good"]:
            return "很好"
        elif score >= thresholds["good"]:
            return "良好"
        elif score >= thresholds["acceptable"]:
            return "可接受"
        elif score >= thresholds["needs_improvement"]:
            return "需改进"
        else:
            return "不合格"
    
    def _generate_error_fallback_report(self, error_message: str) -> Dict[str, Any]:
        """生成错误备用报告"""
        return {
            "overall_assessment": {
                "total_score": 0.3,
                "quality_grade": "评估失败",
                "pass_criteria": False,
                "executive_summary": f"质量评估系统异常: {error_message}"
            },
            "dimensional_scores": {
                "wechat_compatibility": {"score": 0.0, "grade": "未知", "details": "评估失败"},
                "visual_design_quality": {"score": 0.0, "grade": "未知", "details": "评估失败"},
                "content_adaptation_accuracy": {"score": 0.0, "grade": "未知", "details": "评估失败"},
                "mobile_responsiveness": {"score": 0.0, "grade": "未知", "details": "评估失败"},
                "code_technical_quality": {"score": 0.0, "grade": "未知", "details": "评估失败"}
            },
            "critical_analysis": {
                "blocking_issues": ["质量评估系统异常"],
                "major_issues": ["需要修复评估系统"],
                "minor_issues": [],
                "strengths": [],
                "innovation_points": []
            },
            "usage_recommendation": {
                "deployment_readiness": "不可部署",
                "risk_level": "极高风险",
                "user_experience_impact": "未知影响",
                "maintenance_considerations": ["修复质量评估系统", "进行人工质量检查"]
            }
        }
    
    def validate_preconditions(self, state: AgentState) -> bool:
        """验证执行前置条件"""
        return (
            state.generated_html is not None and
            len(state.generated_html.strip()) > 50  # 至少50个字符的HTML内容
        )
    
    def validate_output(self, state: AgentState) -> bool:
        """验证输出质量"""
        return (
            state.quality_score is not None and
            0.0 <= state.quality_score <= 1.0 and
            state.quality_report is not None and
            isinstance(state.quality_report, dict) and
            "overall_assessment" in state.quality_report
        )
    
    def _extract_relevant_input(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输入数据"""
        return {
            "html_content_length": len(state.generated_html) if state.generated_html else 0,
            "has_content_analysis": bool(state.content_analysis_summary),
            "collaboration_feedback_count": len(state.agent_feedback),
            "previous_errors_count": len(state.errors),
            "css_rules_available": bool(state.css_rules),
            "design_tokens_available": bool(state.design_tokens)
        }
    
    def _extract_relevant_output(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输出数据"""
        output = {
            "final_quality_score": state.quality_score,
            "quality_grade": self._determine_comprehensive_quality_grade(state.quality_score) if state.quality_score else "未知",
            "pass_criteria": state.quality_score >= self.quality_assessment_framework["quality_thresholds"]["acceptable"] if state.quality_score else False
        }
        
        if state.quality_report:
            comprehensive_quality = state.collaboration_context.get("comprehensive_quality", {})
            output.update({
                "blocking_issues_count": comprehensive_quality.get("blocking_issues_count", 0),
                "major_issues_count": comprehensive_quality.get("major_issues_count", 0),
                "strengths_count": comprehensive_quality.get("strengths_count", 0),
                "deployment_readiness": comprehensive_quality.get("deployment_readiness", "未知"),
                "risk_level": comprehensive_quality.get("risk_level", "未知"),
                "wechat_compliance_status": comprehensive_quality.get("wechat_compliance_status", "未知"),
                "mobile_compliance_status": comprehensive_quality.get("mobile_compliance_status", "未知"),
                "innovation_points_count": comprehensive_quality.get("innovation_points_count", 0)
            })
        
        return output
    
    def get_collaboration_feedback(self, state: AgentState) -> str:
        """提供最终协作总结反馈"""
        if not state.quality_score or not state.quality_report:
            return "质量评估未完成，无法提供综合反馈"
        
        feedback_parts = []
        score = state.quality_score
        grade = self._determine_comprehensive_quality_grade(score)
        
        # 总体评估反馈
        feedback_parts.append(f"【综合质量评估】总分{score:.3f}，等级：{grade}")
        
        # 关键指标反馈
        comprehensive_quality = state.collaboration_context.get("comprehensive_quality", {})
        
        deployment_readiness = comprehensive_quality.get("deployment_readiness", "未知")
        risk_level = comprehensive_quality.get("risk_level", "未知")
        feedback_parts.append(f"【部署状态】{deployment_readiness}，风险等级：{risk_level}")
        
        # 问题统计反馈
        blocking_count = comprehensive_quality.get("blocking_issues_count", 0)
        major_count = comprehensive_quality.get("major_issues_count", 0)
        strengths_count = comprehensive_quality.get("strengths_count", 0)
        
        if blocking_count > 0:
            feedback_parts.append(f"【严重问题】发现{blocking_count}个阻断性问题，需立即处理")
        elif major_count > 0:
            feedback_parts.append(f"【主要问题】发现{major_count}个主要问题，建议优化")
        
        if strengths_count > 0:
            feedback_parts.append(f"【优势特点】识别出{strengths_count}个突出优点")
        
        # 兼容性反馈
        wechat_status = comprehensive_quality.get("wechat_compliance_status", "未知")
        mobile_status = comprehensive_quality.get("mobile_compliance_status", "未知")
        feedback_parts.append(f"【兼容性】微信:{wechat_status}, 移动端:{mobile_status}")
        
        # 创新点反馈
        innovation_count = comprehensive_quality.get("innovation_points_count", 0)
        if innovation_count > 0:
            feedback_parts.append(f"【创新亮点】发现{innovation_count}个设计或技术创新点")
        
        # 使用建议
        usage_recommendation = state.quality_report.get("usage_recommendation", {})
        user_experience_impact = usage_recommendation.get("user_experience_impact", "")
        if user_experience_impact and user_experience_impact != "待确认":
            feedback_parts.append(f"【用户体验】预期产生{user_experience_impact}")
        
        # 最终建议
        if score >= self.quality_assessment_framework["quality_thresholds"]["excellent"]:
            feedback_parts.append("【建议】质量优秀，可直接部署使用")
        elif score >= self.quality_assessment_framework["quality_thresholds"]["good"]:
            feedback_parts.append("【建议】质量良好，建议简单优化后使用")
        elif score >= self.quality_assessment_framework["quality_thresholds"]["acceptable"]:
            feedback_parts.append("【建议】质量可接受，建议优化关键问题后使用")
        else:
            feedback_parts.append("【建议】质量不达标，需要重新生成或大幅优化")
        
        return " | ".join(feedback_parts)