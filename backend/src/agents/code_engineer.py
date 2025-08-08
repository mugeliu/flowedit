from src.agents.base_collaborative import BaseCollaborativeAgent
from src.models.schemas import AgentState
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from src.config.settings import settings
from typing import Dict, Any, List, Tuple
import re
import html
import json
from bs4 import BeautifulSoup


class CodeEngineerAgent(BaseCollaborativeAgent):
    """智能HTML结构生成Agent - 深度优化版本"""
    
    def __init__(self):
        super().__init__("code_engineer")
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.05,  # 更低的温度确保一致性
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
        
        # 高级HTML模板生成系统
        self.html_generation_templates = {
            "article_structure": {
                "container": '<div style="{container_style}">\n{content}\n</div>',
                "section": '<section style="{section_style}">\n{content}\n</section>',
                "section_header": '<p style="{section_header_style}">\n  <strong style="{section_number_style}">{section_number}</strong>\n</p>',
                "paragraph": '<p style="{paragraph_style}">{content}</p>',
                "intro_paragraph": '<p style="{intro_paragraph_style}">{content}</p>',
                "quote": '<p style="{quote_style}">{content}</p>',
                "emphasis_block": '<p style="{emphasis_style}">{content}</p>',
                "separator": '<p style="{separator_style}">{content}</p>',
                "separator_line": '<hr style="{separator_line_style}">',
                "author_info": '<section style="{author_info_style}">\n  <p style="{author_title_style}"><strong>{author_title}</strong></p>\n  <p style="{author_description_style}">{author_description}</p>\n</section>'
            },
            "content_patterns": {
                "section_number": r'^(0[1-9]|[1-9][0-9]?)$',
                "quote_content": r'^["""][^"""]*["""]+$|^"[^"]*"+$',
                "emphasis_strong": r'[！]{2,}|给我[^，。！？]{2,20}！|别[^，。！？]{5,30}',
                "author_info": r'我是[^，。]{2,10}',
                "philosophical_quote": r'^["""][^"""]{20,100}["""]+$'
            }
        }
        
        # WeChat兼容性规则
        self.wechat_html_rules = {
            "forbidden_tags": ["script", "iframe", "object", "embed", "form", "input", "button"],
            "forbidden_attributes": ["onclick", "onload", "onerror", "javascript:"],
            "required_inline_styles": True,
            "max_nesting_depth": 10,
            "mobile_optimization": {
                "max_width": "100%",
                "responsive_images": True,
                "font_size_minimum": "12px"
            }
        }
        
        self.html_prompt = PromptTemplate(
            input_variables=["content_structure", "css_rules", "design_analysis", "template_guidance"],
            template="""
你是专业的HTML结构生成工程师，基于深度内容分析和CSS规则生成完美的结构化HTML。

内容结构分析：{content_structure}

CSS样式规则：{css_rules}

设计分析要求：{design_analysis}

模板指导：{template_guidance}

请生成符合以下结构的完整HTML：

<!-- 文章标题 -->
<h1 style="{h1_style}">
  {article_title}
</h1>

<!-- 包豪斯分割线 -->
<hr style="{separator_line_style}">

<!-- 第一部分 -->
<section style="{section_style}">
  <!-- 章节标号 - 小型方形色块 -->
  <p style="{section_header_style}">
    <strong style="{section_number_1_style}">01</strong>
  </p>
  
  <!-- 开场白 -->
  <p style="{intro_paragraph_style}">{intro_content}</p>
  
  <p style="{paragraph_style}">{regular_content}</p>

  <!-- 引用内容 - 包豪斯矩形块 -->
  <p style="{quote_1_style}">{quote_content_1}</p>
  
  <p style="{quote_2_style}">{quote_content_2}</p>
  
  <!-- 总结段落 -->
  <p style="{emphasis_text_style}">{emphasis_content}</p>
</section>

<!-- 包豪斯几何分割 -->
<p style="{separator_geometric_style}">{geometric_separator}</p>

<!-- 后续章节按相同结构... -->

<!-- 作者介绍 -->
<section style="{author_info_style}">
  <p style="{author_title_style}"><strong>{author_title}</strong></p>
  <p style="{author_description_style}">{author_description}</p>
</section>

生成要求：
1. 严格按照内容结构分析进行HTML元素映射
2. 为章节标号使用不同的section-number-X样式类
3. 为不同引用使用不同的quote-X样式类
4. 确保强调内容使用appropriate emphasis样式
5. 包含完整的容器和分隔结构
6. 所有样式必须内联，符合微信公众号要求
7. 优化移动端显示效果

只输出最终的HTML代码，不要任何说明文字。
"""
        )
    
    def execute(self, state: AgentState) -> AgentState:
        """执行智能HTML结构生成"""
        try:
            # 获取协作数据
            original_content = state.original_content
            css_rules = state.css_rules or {}
            content_analysis = state.content_analysis_summary or {}
            
            # 获取DesignAdapter的协作反馈
            design_feedback = self._get_design_feedback(state)
            
            # 深度内容结构解析
            parsed_structure = self._parse_content_structure(original_content, content_analysis)
            
            # 智能模板选择和定制
            template_config = self._select_and_customize_template(
                parsed_structure, css_rules, content_analysis
            )
            
            # 使用LLM生成高质量HTML
            generated_html = self._generate_advanced_html(
                parsed_structure, css_rules, template_config, design_feedback
            )
            
            # 高级后处理和优化
            optimized_html = self._advanced_post_processing(
                generated_html, css_rules, parsed_structure
            )
            
            # 确保微信兼容性和移动优化
            compatible_html = self._ensure_full_compatibility(optimized_html)
            
            # 最终质量检查和清理
            final_html = self._final_quality_assurance(compatible_html, css_rules)
            
            # 存储结果到协作状态
            state.generated_html = final_html
            state.current_step = "html_generation_completed"
            
            # 为后续Agent提供详细的协作上下文
            state.collaboration_context["html_features"] = {
                "html_complexity_score": self._calculate_html_complexity(final_html),
                "structure_elements": self._analyze_generated_structure(final_html),
                "style_application_rate": self._calculate_style_coverage(final_html, css_rules),
                "mobile_optimization_score": self._assess_mobile_optimization(final_html),
                "wechat_compatibility_score": self._assess_wechat_compatibility(final_html),
                "content_semantic_accuracy": self._assess_content_mapping_accuracy(final_html, parsed_structure)
            }
            
            return state
                
        except Exception as e:
            state.errors.append(f"HTML generation failed: {str(e)}")
            state.last_error = str(e)
            state.current_step = "html_generation_failed"
            return state
    
    def _get_design_feedback(self, state: AgentState) -> str:
        """获取DesignAdapter的详细反馈"""
        # 从agent_feedback中获取DesignAdapter的建议
        design_feedback_list = state.agent_feedback.get("code_engineer", [])
        if design_feedback_list:
            return "; ".join(design_feedback_list)
        
        # 如果没有直接反馈，从css_rules和collaboration_context中推断要求
        if not state.css_rules:
            return "无CSS样式信息"
        
        feedback_parts = []
        rules = state.css_rules
        css_features = state.collaboration_context.get("css_features", {})
        
        # 章节样式反馈
        section_styles = [k for k in rules.keys() if "section-number" in k]
        if section_styles:
            feedback_parts.append(f"检测到{len(section_styles)}个章节标号样式，每个章节需要使用对应的样式类")
        
        # 引用样式反馈
        quote_styles = [k for k in rules.keys() if "quote" in k and k != "quote"]
        if quote_styles:
            feedback_parts.append(f"检测到{len(quote_styles)}种引用样式，不同引用需要使用不同边框颜色")
        
        # 强调样式反馈
        if "emphasis-block" in rules or "emphasis-text" in rules:
            feedback_parts.append("检测到强调样式，重要内容需要使用醒目的强调块样式")
        
        # 排版层次反馈
        typography_elements = [k for k in rules.keys() if k in ["h1", "paragraph", "intro-paragraph"]]
        if typography_elements:
            feedback_parts.append(f"检测到{len(typography_elements)}个排版层次，需要严格按层次应用")
        
        # 布局系统反馈
        if "container" in rules and "section-container" in rules:
            feedback_parts.append("检测到完整布局系统，需要正确嵌套容器结构")
        
        # 复杂度反馈
        complexity_score = css_features.get("complexity_score", 0)
        if complexity_score > 0.6:
            feedback_parts.append(f"CSS复杂度为{complexity_score:.2f}，需要确保所有高级样式得到精确应用")
        
        return "; ".join(feedback_parts) if feedback_parts else "标准HTML样式应用"
    
    def _parse_content_structure(self, original_content: str, content_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """深度解析内容结构"""
        try:
            # 提取文本内容
            if '<' in original_content and '>' in original_content:
                soup = BeautifulSoup(original_content, 'html.parser')
                text_content = soup.get_text()
            else:
                text_content = original_content
            
            # 按段落分割
            paragraphs = [p.strip() for p in text_content.split('\n') if p.strip()]
            
            structure = {
                "paragraphs": paragraphs,
                "sections": [],
                "quotes": [],
                "emphasis_points": [],
                "author_info": None,
                "title": None,
                "separators": []
            }
            
            # 识别文章标题（通常在第一或第二段）
            for i, para in enumerate(paragraphs[:3]):
                if ("失业" in para and "打不死" in para) or (len(para) > 10 and len(para) < 50 and "：" in para):
                    structure["title"] = para
                    break
            
            # 识别章节
            current_section = None
            section_content = []
            
            for i, para in enumerate(paragraphs):
                # 检测章节标号
                if re.match(self.html_generation_templates["content_patterns"]["section_number"], para.strip()):
                    # 保存上一个章节
                    if current_section is not None:
                        current_section["content"] = section_content
                        structure["sections"].append(current_section)
                    
                    # 开始新章节
                    current_section = {
                        "number": para.strip(),
                        "index": len(structure["sections"]) + 1,
                        "content": [],
                        "quotes": [],
                        "emphasis": []
                    }
                    section_content = []
                
                elif current_section is not None:
                    section_content.append({
                        "text": para,
                        "type": self._classify_paragraph_type(para),
                        "index": len(section_content)
                    })
                    
                    # 检测引用
                    if self._is_quote_content(para):
                        current_section["quotes"].append({
                            "text": para,
                            "index": len(current_section["quotes"]),
                            "emotion": self._detect_quote_emotion(para)
                        })
                        structure["quotes"].append(para)
                    
                    # 检测强调内容
                    if self._is_emphasis_content(para):
                        current_section["emphasis"].append({
                            "text": para,
                            "index": len(current_section["emphasis"]),
                            "importance": self._detect_emphasis_importance(para)
                        })
                        structure["emphasis_points"].append(para)
                
                # 检测作者信息
                if "我是" in para and len(para) > 20:
                    structure["author_info"] = para
            
            # 保存最后一个章节
            if current_section is not None:
                current_section["content"] = section_content
                structure["sections"].append(current_section)
            
            # 从content_analysis增强结构信息
            if content_analysis.get("structure", {}):
                analysis_structure = content_analysis["structure"]
                structure["content_type"] = analysis_structure.get("content_type", "general")
                structure["emotional_tone"] = content_analysis.get("content_elements", {}).get("tone_analysis", {})
            
            return structure
            
        except Exception as e:
            # 如果解析失败，返回基础结构
            return {
                "paragraphs": [p.strip() for p in original_content.split('\n') if p.strip()][:10],
                "sections": [],
                "quotes": [],
                "emphasis_points": [],
                "author_info": None,
                "title": "内容标题",
                "separators": []
            }
    
    def _classify_paragraph_type(self, paragraph: str) -> str:
        """分类段落类型"""
        if self._is_quote_content(paragraph):
            return "quote"
        elif self._is_emphasis_content(paragraph):
            return "emphasis"
        elif len(paragraph) < 50 and "：" in paragraph:
            return "subtitle"
        elif paragraph.startswith("hi") or paragraph.startswith("大家"):
            return "intro"
        elif "我是" in paragraph and len(paragraph) > 30:
            return "author_info"
        else:
            return "paragraph"
    
    def _is_quote_content(self, text: str) -> bool:
        """判断是否为引用内容"""
        return bool(re.search(self.html_generation_templates["content_patterns"]["quote_content"], text.strip()))
    
    def _is_emphasis_content(self, text: str) -> bool:
        """判断是否为强调内容"""
        return bool(re.search(self.html_generation_templates["content_patterns"]["emphasis_strong"], text))
    
    def _detect_quote_emotion(self, quote: str) -> str:
        """检测引用情绪"""
        negative_words = ["烦躁", "萎靡", "不知道", "焦虑"]
        positive_words = ["开心", "兴趣", "提升"]
        reflective_words = ["时间", "形而上", "思考", "意识"]
        
        if any(word in quote for word in negative_words):
            return "negative"
        elif any(word in quote for word in positive_words):
            return "positive"
        elif any(word in quote for word in reflective_words):
            return "reflective"
        else:
            return "neutral"
    
    def _detect_emphasis_importance(self, text: str) -> str:
        """检测强调重要性"""
        high_importance_indicators = ["！！", "给我", "别把自己"]
        if any(indicator in text for indicator in high_importance_indicators):
            return "high"
        elif "！" in text:
            return "medium"
        else:
            return "low"
    
    def _select_and_customize_template(self, parsed_structure: Dict[str, Any], 
                                     css_rules: Dict[str, str],
                                     content_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """选择和定制HTML模板"""
        template_config = {
            "article_type": "personal_sharing",
            "section_count": len(parsed_structure.get("sections", [])),
            "has_quotes": len(parsed_structure.get("quotes", [])) > 0,
            "has_emphasis": len(parsed_structure.get("emphasis_points", [])) > 0,
            "has_author_info": parsed_structure.get("author_info") is not None,
            "style_complexity": "high" if len(css_rules) > 10 else "medium"
        }
        
        # 根据内容特征定制模板结构
        template_config["sections_template"] = []
        for i, section in enumerate(parsed_structure.get("sections", [])):
            section_template = {
                "number": section.get("number", f"0{i+1}"),
                "index": i + 1,
                "has_quotes": len(section.get("quotes", [])) > 0,
                "quote_count": len(section.get("quotes", [])),
                "has_emphasis": len(section.get("emphasis", [])) > 0,
                "content_paragraphs": len(section.get("content", []))
            }
            template_config["sections_template"].append(section_template)
        
        return template_config
    
    def _generate_advanced_html(self, parsed_structure: Dict[str, Any],
                              css_rules: Dict[str, str],
                              template_config: Dict[str, Any],
                              design_feedback: str) -> str:
        """生成高级HTML结构"""
        try:
            # 构建内容结构描述
            content_structure = {
                "title": parsed_structure.get("title", "文章标题"),
                "sections": template_config.get("sections_template", []),
                "total_quotes": len(parsed_structure.get("quotes", [])),
                "total_emphasis": len(parsed_structure.get("emphasis_points", [])),
                "has_author_info": template_config.get("has_author_info", False)
            }
            
            # 构建模板指导
            template_guidance = self._build_template_guidance(css_rules, template_config)
            
            prompt_text = self.html_prompt.format(
                content_structure=json.dumps(content_structure, ensure_ascii=False, indent=2),
                css_rules=json.dumps(css_rules, ensure_ascii=False, indent=2),
                design_analysis=design_feedback,
                template_guidance=template_guidance
            )
            
            response = self.llm.invoke(prompt_text)
            
            # 安全获取响应内容，防止NoneType错误
            if response and hasattr(response, 'content') and response.content:
                generated_html = response.content.strip()
                
                # 清理可能的markdown标记
                if generated_html.startswith('```html'):
                    generated_html = generated_html.replace('```html', '').replace('```', '')
                elif generated_html.startswith('```'):
                    generated_html = generated_html.replace('```', '')
                
                # 如果LLM生成的HTML不够完整，使用模板生成
                if len(generated_html) < 500 or not self._validate_html_structure(generated_html):
                    return self._generate_template_based_html(parsed_structure, css_rules, template_config)
                
                return generated_html.strip()
            else:
                # 如果响应为空或None，使用模板生成
                return self._generate_template_based_html(parsed_structure, css_rules, template_config)
                
        except Exception as e:
            return self._generate_template_based_html(parsed_structure, css_rules, template_config)
    
    def _build_template_guidance(self, css_rules: Dict[str, str], template_config: Dict[str, Any]) -> str:
        """构建模板指导说明"""
        guidance_parts = []
        
        # 章节样式指导
        section_styles = [k for k in css_rules.keys() if "section-number" in k]
        if section_styles:
            guidance_parts.append(f"使用{len(section_styles)}个不同的章节标号样式: {', '.join(section_styles)}")
        
        # 引用样式指导
        quote_styles = [k for k in css_rules.keys() if "quote-" in k]
        if quote_styles:
            guidance_parts.append(f"使用{len(quote_styles)}种引用样式: {', '.join(quote_styles)}")
        
        # 强调样式指导
        emphasis_styles = [k for k in css_rules.keys() if "emphasis" in k]
        if emphasis_styles:
            guidance_parts.append(f"使用强调样式: {', '.join(emphasis_styles)}")
        
        # 布局指导
        if "container" in css_rules:
            guidance_parts.append("使用container样式包装整体内容")
        
        if "separator-geometric" in css_rules:
            guidance_parts.append("使用几何分割符分隔章节")
        
        return "; ".join(guidance_parts) if guidance_parts else "使用标准HTML结构"
    
    def _validate_html_structure(self, html: str) -> bool:
        """验证HTML结构的完整性"""
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            # 检查基本结构元素
            has_container = soup.find(['div', 'section']) is not None
            has_paragraphs = len(soup.find_all('p')) > 0
            has_styles = 'style=' in html
            
            return has_container and has_paragraphs and has_styles
            
        except Exception as e:
            return False
    
    def _generate_template_based_html(self, parsed_structure: Dict[str, Any],
                                    css_rules: Dict[str, str],
                                    template_config: Dict[str, Any]) -> str:
        """基于模板生成HTML"""
        html_parts = []
        container_style = css_rules.get("container", "font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; line-height: 1.6;")
        
        # 文章标题
        title = parsed_structure.get("title", "文章标题")
        if "h1" in css_rules:
            html_parts.append(f'<h1 style="{css_rules["h1"]}">{html.escape(title)}</h1>')
        
        # 分割线
        if "section-separator" in css_rules:
            html_parts.append(f'<hr style="{css_rules["section-separator"]}">')
        
        # 生成章节
        sections = parsed_structure.get("sections", [])
        for i, section in enumerate(sections):
            section_html = self._generate_section_html(section, css_rules, i + 1)
            html_parts.append(section_html)
            
            # 添加几何分割符（除了最后一个章节）
            if i < len(sections) - 1 and "separator-geometric" in css_rules:
                separator_content = "■ ■ ■"
                html_parts.append(f'<p style="{css_rules["separator-geometric"]}">{separator_content}</p>')
        
        # 作者信息
        author_info = parsed_structure.get("author_info")
        if author_info and "author-info" in css_rules:
            author_html = f'<section style="{css_rules["author-info"]}">'
            if "author-title" in css_rules:
                author_html += f'<p style="{css_rules["author-title"]}"><strong>AUTHOR INFO</strong></p>'
            if "author-description" in css_rules:
                author_html += f'<p style="{css_rules["author-description"]}">{html.escape(author_info)}</p>'
            author_html += '</section>'
            html_parts.append(author_html)
        
        # 包装在容器中
        content = '\n'.join(html_parts)
        return f'<div style="{container_style}">\n{content}\n</div>'
    
    def _generate_section_html(self, section: Dict[str, Any], css_rules: Dict[str, str], section_index: int) -> str:
        """生成单个章节的HTML"""
        section_parts = []
        section_style = css_rules.get("section-container", "margin: 40px 0;")
        
        # 章节标号
        section_number = section.get("number", f"0{section_index}")
        section_number_style = css_rules.get(f"section-number-{section_index}", css_rules.get("section-number-1", ""))
        if section_number_style:
            section_parts.append(f'<p style="text-align: center; margin: 0 0 30px 0;">')
            section_parts.append(f'  <strong style="{section_number_style}">{section_number}</strong>')
            section_parts.append(f'</p>')
        
        # 章节内容
        content_items = section.get("content", [])
        quote_index = 1
        
        for item in content_items:
            item_text = item.get("text", "")
            item_type = item.get("type", "paragraph")
            
            if item_type == "quote":
                quote_style = css_rules.get(f"quote-{quote_index}", css_rules.get("quote-1", ""))
                if quote_style:
                    section_parts.append(f'<p style="{quote_style}">{html.escape(item_text)}</p>')
                    quote_index += 1
            elif item_type == "emphasis":
                emphasis_style = css_rules.get("emphasis-text", css_rules.get("emphasis-block", ""))
                if emphasis_style:
                    section_parts.append(f'<p style="{emphasis_style}">{html.escape(item_text)}</p>')
            elif item_type == "intro":
                intro_style = css_rules.get("intro-paragraph", css_rules.get("paragraph", ""))
                section_parts.append(f'<p style="{intro_style}">{html.escape(item_text)}</p>')
            else:
                para_style = css_rules.get("paragraph", "font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;")
                section_parts.append(f'<p style="{para_style}">{html.escape(item_text)}</p>')
        
        section_content = '\n  '.join(section_parts)
        return f'<section style="{section_style}">\n  {section_content}\n</section>'
    
    def _advanced_post_processing(self, html_content: str, css_rules: Dict[str, str], 
                                parsed_structure: Dict[str, Any]) -> str:
        """高级后处理和优化"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # 确保移动端优化
            self._optimize_for_mobile(soup)
            
            # 优化图像显示
            self._optimize_images(soup)
            
            # 优化表格显示
            self._optimize_tables(soup)
            
            # 添加缺失的样式
            self._add_missing_styles(soup, css_rules)
            
            return str(soup)
            
        except Exception as e:
            return html_content
    
    def _optimize_for_mobile(self, soup: BeautifulSoup):
        """移动端优化"""
        # 为所有容器添加最大宽度
        for container in soup.find_all(['div', 'section']):
            current_style = container.get('style', '')
            if 'max-width' not in current_style:
                mobile_styles = 'max-width: 100%; box-sizing: border-box;'
                if current_style:
                    container['style'] = current_style + '; ' + mobile_styles
                else:
                    container['style'] = mobile_styles
    
    def _optimize_images(self, soup: BeautifulSoup):
        """优化图像显示"""
        for img in soup.find_all('img'):
            current_style = img.get('style', '')
            mobile_styles = 'max-width: 100%; height: auto; display: block; margin: 16px auto;'
            
            if current_style:
                img['style'] = current_style + '; ' + mobile_styles
            else:
                img['style'] = mobile_styles
    
    def _optimize_tables(self, soup: BeautifulSoup):
        """优化表格显示"""
        for table in soup.find_all('table'):
            current_style = table.get('style', '')
            table_styles = 'width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;'
            
            if current_style:
                table['style'] = current_style + '; ' + table_styles
            else:
                table['style'] = table_styles
    
    def _add_missing_styles(self, soup: BeautifulSoup, css_rules: Dict[str, str]):
        """添加缺失的样式"""
        # 确保所有p标签都有样式
        for p in soup.find_all('p'):
            if not p.get('style'):
                default_style = css_rules.get("paragraph", "font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;")
                p['style'] = default_style
    
    def _ensure_full_compatibility(self, html_content: str) -> str:
        """确保完全的微信兼容性"""
        # 移除禁用的标签
        for forbidden_tag in self.wechat_html_rules["forbidden_tags"]:
            pattern = f'<{forbidden_tag}[^>]*>.*?</{forbidden_tag}>'
            html_content = re.sub(pattern, '', html_content, flags=re.IGNORECASE | re.DOTALL)
        
        # 移除禁用的属性
        for forbidden_attr in self.wechat_html_rules["forbidden_attributes"]:
            pattern = f'{forbidden_attr}="[^"]*"'
            html_content = re.sub(pattern, '', html_content, flags=re.IGNORECASE)
        
        # 移除不兼容的CSS属性
        incompatible_patterns = [
            r'position\s*:\s*(fixed|absolute)[^;]*;?',
            r'z-index\s*:[^;]*;?',
            r'transform\s*:[^;]*;?',
            r'animation\s*:[^;]*;?',
            r'transition\s*:[^;]*;?',
            r'overflow\s*:\s*hidden[^;]*;?',
            r'float\s*:[^;]*;?',
            r'clear\s*:[^;]*;?'
        ]
        
        for pattern in incompatible_patterns:
            html_content = re.sub(pattern, '', html_content, flags=re.IGNORECASE)
        
        # 清理多余的分号和空格
        html_content = re.sub(r';\s*;', ';', html_content)
        html_content = re.sub(r'style="[^"]*;\s*"', lambda m: m.group(0).replace('; "', '"'), html_content)
        
        return html_content
    
    def _final_quality_assurance(self, html_content: str, css_rules: Dict[str, str]) -> str:
        """最终质量检查和清理"""
        try:
            # 基本HTML结构验证
            if not self._validate_html_structure(html_content):
                # 如果验证失败，生成基础HTML
                return self._generate_basic_fallback_html(css_rules)
            
            # 清理多余的空白字符
            cleaned = re.sub(r'\n\s*\n', '\n', html_content)
            cleaned = re.sub(r'>\s+<', '><', cleaned)
            
            # 确保样式属性格式正确
            cleaned = re.sub(r'style="([^"]*)"', self._clean_style_attribute, cleaned)
            
            # 最终格式化
            cleaned = self._format_html_structure(cleaned)
            
            return cleaned.strip()
            
        except Exception as e:
            return self._generate_basic_fallback_html(css_rules)
    
    def _generate_basic_fallback_html(self, css_rules: Dict[str, str]) -> str:
        """生成基础备用HTML"""
        container_style = css_rules.get("container", 
            "font-family: Arial, sans-serif; color: #333333; max-width: 800px; margin: 0 auto; padding: 16px; line-height: 1.6;")
        
        paragraph_style = css_rules.get("paragraph",
            "font-size: 16px; color: #404040; line-height: 1.7; margin: 0 0 24px 0;")
        
        basic_content = f'<p style="{paragraph_style}">内容生成中，请稍后...</p>'
        
        return f'<div style="{container_style}">\n{basic_content}\n</div>'
    
    def _clean_style_attribute(self, match) -> str:
        """清理样式属性"""
        style_content = match.group(1)
        
        # 移除多余的分号和空格
        properties = [prop.strip() for prop in style_content.split(';') if prop.strip()]
        
        # 去重并重新组织
        unique_props = {}
        for prop in properties:
            if ':' in prop:
                key, value = prop.split(':', 1)
                unique_props[key.strip()] = value.strip()
        
        cleaned_style = '; '.join([f'{k}: {v}' for k, v in unique_props.items() if v])
        return f'style="{cleaned_style}"'
    
    def _format_html_structure(self, html_content: str) -> str:
        """格式化HTML结构"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            return soup.prettify()
        except Exception as e:
            return html_content
    
    def _calculate_html_complexity(self, html: str) -> float:
        """计算HTML复杂度"""
        if not html:
            return 0.0
        
        score = 0.0
        
        # 基础分数
        score += 0.1
        
        # 元素数量加分
        element_count = html.count('<')
        score += min(element_count * 0.01, 0.3)
        
        # 样式数量加分
        style_count = html.count('style=')
        score += min(style_count * 0.02, 0.25)
        
        # 结构复杂度加分
        section_count = html.count('<section')
        score += min(section_count * 0.05, 0.2)
        
        # 内容长度加分
        score += min(len(html) / 10000, 0.15)
        
        return min(score, 1.0)
    
    def _analyze_generated_structure(self, html: str) -> Dict[str, Any]:
        """分析生成的HTML结构"""
        if not html:
            return {}
        
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            return {
                "total_elements": len(soup.find_all()),
                "paragraphs": len(soup.find_all('p')),
                "sections": len(soup.find_all('section')),
                "headers": len(soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])),
                "styled_elements": len(soup.find_all(attrs={'style': True})),
                "has_container": len(soup.find_all('div')) > 0,
                "has_separators": len(soup.find_all('hr')) > 0
            }
            
        except Exception as e:
            return {"parsing_error": str(e)}
    
    def _calculate_style_coverage(self, html: str, css_rules: Dict[str, str]) -> float:
        """计算样式覆盖率"""
        if not html or not css_rules:
            return 0.0
        
        applied_styles = 0
        total_styles = len(css_rules)
        
        for style_name in css_rules.keys():
            if style_name in html:
                applied_styles += 1
        
        return applied_styles / total_styles if total_styles > 0 else 0.0
    
    def _assess_mobile_optimization(self, html: str) -> float:
        """评估移动端优化程度"""
        if not html:
            return 0.0
        
        score = 0.0
        
        # 检查响应式设计
        if 'max-width: 100%' in html:
            score += 0.3
        
        # 检查盒模型
        if 'box-sizing: border-box' in html:
            score += 0.2
        
        # 检查字体大小
        if 'font-size:' in html:
            score += 0.2
        
        # 检查边距处理
        if 'margin:' in html:
            score += 0.15
        
        # 检查行高
        if 'line-height:' in html:
            score += 0.15
        
        return min(score, 1.0)
    
    def _assess_wechat_compatibility(self, html: str) -> float:
        """评估微信兼容性"""
        if not html:
            return 0.0
        
        score = 1.0
        
        # 检查禁用标签
        for forbidden_tag in self.wechat_html_rules["forbidden_tags"]:
            if f'<{forbidden_tag}' in html.lower():
                score -= 0.2
        
        # 检查禁用属性
        for forbidden_attr in self.wechat_html_rules["forbidden_attributes"]:
            if forbidden_attr in html.lower():
                score -= 0.15
        
        # 检查不兼容CSS属性
        incompatible_css = ['position: fixed', 'position: absolute', 'z-index', 'transform', 'animation']
        for css_prop in incompatible_css:
            if css_prop in html.lower():
                score -= 0.1
        
        # 检查内联样式使用
        if html.count('style=') > 0:
            score += 0.2
        
        return max(score, 0.0)
    
    def _assess_content_mapping_accuracy(self, html: str, parsed_structure: Dict[str, Any]) -> float:
        """评估内容映射准确性"""
        if not html or not parsed_structure:
            return 0.0
        
        score = 0.0
        
        # 检查章节映射
        expected_sections = len(parsed_structure.get("sections", []))
        actual_sections = html.count('<section')
        if expected_sections > 0:
            section_accuracy = min(actual_sections / expected_sections, 1.0)
            score += section_accuracy * 0.3
        
        # 检查引用映射
        expected_quotes = len(parsed_structure.get("quotes", []))
        # 简化检查：包含引用样式的元素
        quote_indicators = html.count('quote-') + html.count('border-left:')
        if expected_quotes > 0:
            quote_accuracy = min(quote_indicators / expected_quotes, 1.0)
            score += quote_accuracy * 0.3
        
        # 检查标题映射
        if parsed_structure.get("title") and '<h1' in html:
            score += 0.2
        
        # 检查作者信息映射
        if parsed_structure.get("author_info") and 'author' in html.lower():
            score += 0.2
        
        return min(score, 1.0)
    
    def validate_preconditions(self, state: AgentState) -> bool:
        """验证执行前置条件"""
        return (
            state.original_content is not None and
            len(state.original_content.strip()) > 10 and
            state.css_rules is not None and
            isinstance(state.css_rules, dict) and
            len(state.css_rules) > 0
        )
    
    def validate_output(self, state: AgentState) -> bool:
        """验证输出质量"""
        if not state.generated_html:
            return False
        
        html = state.generated_html
        return (
            len(html.strip()) > 100 and
            '<' in html and '>' in html and
            html.count('<') > 3 and  # 至少有几个HTML元素
            'style=' in html  # 包含内联样式
        )
    
    def _extract_relevant_input(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输入数据"""
        return {
            "content_length": len(state.original_content),
            "css_rules_count": len(state.css_rules) if state.css_rules else 0,
            "has_content_analysis": bool(state.content_analysis_summary),
            "has_design_feedback": bool(state.agent_feedback.get("code_engineer"))
        }
    
    def _extract_relevant_output(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输出数据"""
        if not state.generated_html:
            return {}
        
        html_features = state.collaboration_context.get("html_features", {})
        
        return {
            "html_length": len(state.generated_html),
            "inline_styles_count": state.generated_html.count('style='),
            "complexity_score": html_features.get("html_complexity_score", 0),
            "mobile_optimization_score": html_features.get("mobile_optimization_score", 0),
            "wechat_compatibility_score": html_features.get("wechat_compatibility_score", 0),
            "content_mapping_accuracy": html_features.get("content_semantic_accuracy", 0)
        }
    
    def get_collaboration_feedback(self, state: AgentState) -> str:
        """为QualityDirector提供详细反馈"""
        if not state.generated_html:
            return None
            
        feedback_parts = []
        html = state.generated_html
        html_features = state.collaboration_context.get("html_features", {})
        
        # HTML复杂度反馈
        complexity = html_features.get("html_complexity_score", 0)
        if complexity > 0.7:
            feedback_parts.append(f"生成了高复杂度HTML结构(复杂度{complexity:.2f})，请重点检查元素完整性")
        
        # 样式应用反馈
        style_coverage = html_features.get("style_application_rate", 0)
        if style_coverage > 0.8:
            feedback_parts.append(f"CSS样式应用率达到{style_coverage:.2f}，样式覆盖良好")
        elif style_coverage < 0.5:
            feedback_parts.append(f"CSS样式应用率仅为{style_coverage:.2f}，可能存在样式缺失")
        
        # 移动端优化反馈
        mobile_score = html_features.get("mobile_optimization_score", 0)
        if mobile_score > 0.8:
            feedback_parts.append("已充分优化移动端显示效果")
        elif mobile_score < 0.6:
            feedback_parts.append("移动端优化不足，建议检查响应式设计")
        
        # 微信兼容性反馈
        wechat_score = html_features.get("wechat_compatibility_score", 0)
        if wechat_score > 0.9:
            feedback_parts.append("完全符合微信公众号兼容性要求")
        elif wechat_score < 0.7:
            feedback_parts.append("可能存在微信兼容性问题，需要检查禁用属性")
        
        # 内容映射准确性反馈
        mapping_accuracy = html_features.get("content_semantic_accuracy", 0)
        if mapping_accuracy > 0.8:
            feedback_parts.append("内容结构映射准确，语义保持良好")
        elif mapping_accuracy < 0.6:
            feedback_parts.append("内容映射可能存在偏差，建议检查结构对应关系")
        
        # 结构元素反馈
        structure_elements = html_features.get("structure_elements", {})
        if structure_elements:
            sections = structure_elements.get("sections", 0)
            paragraphs = structure_elements.get("paragraphs", 0)
            styled_elements = structure_elements.get("styled_elements", 0)
            feedback_parts.append(f"生成了{sections}个章节、{paragraphs}个段落、{styled_elements}个样式元素")
        
        return "; ".join(feedback_parts) if feedback_parts else None