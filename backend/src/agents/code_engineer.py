from src.agents.base_collaborative import BaseCollaborativeAgent
from src.models.schemas import AgentState
from src.config.logger import get_agent_logger
from typing import Dict, Any, List
import html
import json
from bs4 import BeautifulSoup


class CodeEngineerAgent(BaseCollaborativeAgent):
    """代码工程师Agent - 基于大模型分析结果的精确代码组装版本"""
    
    def __init__(self):
        super().__init__("code_engineer")
        
    def execute(self, state: AgentState) -> AgentState:
        """执行精确的HTML组装 - 基于前面大模型的分析结果"""
        logger = get_agent_logger("CodeEngineer", state.task_id)
        
        try:
            logger.info("Starting code-based HTML assembly")
            
            # 获取前面大模型分析的结果
            content_analysis = state.content_analysis_summary or {}
            design_tokens = state.design_tokens or {}
            css_rules = state.css_rules or {}
            original_content = state.original_content
            
            # 获取DesignAdapter的协作反馈
            received_feedback = self._get_received_feedback(state)
            if received_feedback:
                logger.info(f"Using DesignAdapter feedback: {received_feedback[:100]}...")
            
            logger.debug(f"Input - Content: {len(original_content)}, CSS rules: {len(css_rules)}")
            
            # 基于大模型分析结果和协作反馈进行精确的代码组装
            structured_content = self._parse_content_based_on_analysis(original_content, content_analysis)
            html_structure = self._assemble_html_based_on_design(structured_content, design_tokens, css_rules, received_feedback)
            final_html = self._apply_css_and_finalize(html_structure, css_rules)
            
            # 存储结果
            state.generated_html = final_html
            state.current_step = "html_assembly_completed"
            
            # 协作上下文
            state.collaboration_context["html_features"] = {
                "html_length": len(final_html),
                "structure_elements": self._count_structure_elements(final_html),
                "assembly_method": "code_based_with_llm_analysis"
            }
            
            logger.info(f"HTML assembly completed: {len(final_html)} chars")
            return state
                
        except Exception as e:
            logger.error(f"HTML assembly failed: {str(e)}")
            state.errors.append(f"HTML assembly failed: {str(e)}")
            state.last_error = str(e)
            state.current_step = "html_assembly_failed"
            return state
    
    def _parse_content_based_on_analysis(self, original_content: str, content_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """基于大模型分析结果解析内容结构"""
        try:
            # 提取文本内容
            if '<' in original_content and '>' in original_content:
                soup = BeautifulSoup(original_content, 'html.parser')
                text_content = soup.get_text()
            else:
                text_content = original_content
            
            # 按行分割并清理
            lines = [line.strip() for line in text_content.split('\n') if line.strip()]
            
            # 基于大模型分析结果构建结构化数据
            structure = content_analysis.get("structure", {})
            content_elements = content_analysis.get("content_elements", {})
            
            parsed = {
                "title": structure.get("title", lines[0] if lines else ""),
                "sections": [],
                "quotes": content_elements.get("quotes", []),
                "emphasis_points": content_elements.get("emphasis_points", []),
                "author_info": content_elements.get("author_info", {}),
                "all_lines": lines
            }
            
            # 根据大模型识别的章节结构组织内容
            sections_data = structure.get("sections", [])
            current_section_content = []
            section_index = 0
            
            for line in lines:
                # 检查是否为章节标号（基于大模型分析）
                if line in ["01", "02", "03"] or any(s.get("section_number") == line for s in sections_data):
                    # 保存上一章节内容
                    if current_section_content and section_index < len(sections_data):
                        if section_index < len(parsed["sections"]):
                            parsed["sections"][section_index]["content"] = current_section_content
                        section_index += 1
                    
                    # 开始新章节
                    section_info = None
                    for s in sections_data:
                        if s.get("section_number") == line:
                            section_info = s
                            break
                    
                    if not section_info and section_index < len(sections_data):
                        section_info = sections_data[section_index]
                    
                    new_section = {
                        "number": line,
                        "index": len(parsed["sections"]) + 1,
                        "title": section_info.get("title", "") if section_info else "",
                        "content": []
                    }
                    parsed["sections"].append(new_section)
                    current_section_content = []
                else:
                    # 添加到当前章节内容
                    current_section_content.append(line)
            
            # 保存最后一个章节的内容
            if current_section_content and parsed["sections"]:
                parsed["sections"][-1]["content"] = current_section_content
            
            return parsed
            
        except Exception as e:
            # 备用解析方案
            lines = [line.strip() for line in original_content.split('\n') if line.strip()]
            return {
                "title": lines[0] if lines else "",
                "sections": [{"number": "01", "index": 1, "content": lines[1:] if len(lines) > 1 else []}],
                "quotes": [],
                "emphasis_points": [],
                "author_info": {},
                "all_lines": lines
            }
    
    def _assemble_html_based_on_design(self, structured_content: Dict[str, Any], 
                                     design_tokens: Dict[str, Any], 
                                     css_rules: Dict[str, str],
                                     received_feedback: str = "") -> Dict[str, Any]:
        """基于设计token和协作反馈组装HTML结构"""
        html_structure = {
            "container": {
                "tag": "div",
                "style_key": "container",
                "children": []
            }
        }
        
        # 添加标题
        title = structured_content.get("title", "")
        if title:
            html_structure["container"]["children"].append({
                "tag": "h1",
                "style_key": "h1",
                "content": title
            })
        
        # 组装章节
        sections = structured_content.get("sections", [])
        color_system = design_tokens.get("color_system", {})
        section_colors = color_system.get("section_colors", ["#E53E3E", "#3182CE", "#D69E2E"])
        quote_colors = color_system.get("quote_colors", ["#3182CE", "#D69E2E", "#E53E3E"])
        
        for section in sections:
            section_element = self._assemble_section_element(
                section, section_colors, quote_colors, structured_content
            )
            html_structure["container"]["children"].append(section_element)
        
        return html_structure
    
    def _assemble_section_element(self, section: Dict[str, Any], 
                                section_colors: List[str], 
                                quote_colors: List[str],
                                structured_content: Dict[str, Any]) -> Dict[str, Any]:
        """组装单个章节元素"""
        section_index = section.get("index", 1)
        section_number = section.get("number", f"0{section_index}")
        
        section_element = {
            "tag": "section",
            "style_key": "section-container",
            "children": [
                # 章节标号
                {
                    "tag": "p",
                    "style_key": "section-number-center",
                    "children": [{
                        "tag": "strong",
                        "style_key": f"section-number-{section_index}",
                        "content": section_number
                    }]
                }
            ]
        }
        
        # 添加章节内容
        content_lines = section.get("content", [])
        quotes = structured_content.get("quotes", [])
        emphasis_points = structured_content.get("emphasis_points", [])
        
        quote_index = 1
        for line in content_lines:
            # 检查是否为引用（基于大模型分析）
            is_quote = any(quote.get("text", "") == line for quote in quotes)
            is_emphasis = any(emp.get("text", "") == line for emp in emphasis_points)
            
            if is_quote:
                section_element["children"].append({
                    "tag": "p",
                    "style_key": f"quote-{quote_index}" if f"quote-{quote_index}" in ["quote-1", "quote-2", "quote-3"] else "quote-block",
                    "content": line
                })
                quote_index += 1
            elif is_emphasis:
                section_element["children"].append({
                    "tag": "p",
                    "style_key": "emphasis-block",
                    "content": line
                })
            else:
                section_element["children"].append({
                    "tag": "p",
                    "style_key": "paragraph",
                    "content": line
                })
        
        return section_element
    
    def _apply_css_and_finalize(self, html_structure: Dict[str, Any], css_rules: Dict[str, str]) -> str:
        """应用CSS样式并生成最终HTML"""
        def render_element(element):
            if isinstance(element, str):
                return html.escape(element)
            
            tag = element.get("tag", "div")
            style_key = element.get("style_key", "")
            content = element.get("content", "")
            children = element.get("children", [])
            
            # 获取样式
            style = css_rules.get(style_key, "")
            style_attr = f' style="{style}"' if style else ""
            
            # 处理内容和子元素
            if content:
                inner_html = html.escape(str(content))
            elif children:
                inner_html = "\n".join([render_element(child) for child in children])
            else:
                inner_html = ""
            
            # 自闭合标签处理
            if tag in ["hr", "br", "img"]:
                return f"<{tag}{style_attr}>"
            else:
                if tag == "p" and inner_html.strip():
                    # 对于p标签，如果有子元素，需要特殊处理
                    if children and len(children) == 1 and children[0].get("tag"):
                        # 嵌套结构的p标签
                        return f"<{tag}{style_attr}>\n  {inner_html}\n</{tag}>"
                    else:
                        return f"<{tag}{style_attr}>{inner_html}</{tag}>"
                else:
                    return f"<{tag}{style_attr}>\n{inner_html}\n</{tag}>"
        
        return render_element(html_structure["container"])
    
    def _count_structure_elements(self, html: str) -> Dict[str, int]:
        """统计HTML结构元素"""
        try:
            soup = BeautifulSoup(html, 'html.parser')
            return {
                "total_elements": len(soup.find_all()),
                "paragraphs": len(soup.find_all('p')),
                "sections": len(soup.find_all('section')),
                "headers": len(soup.find_all(['h1', 'h2', 'h3'])),
                "styled_elements": len(soup.find_all(attrs={'style': True}))
            }
        except Exception:
            return {"parsing_error": True}
    
    def validate_preconditions(self, state: AgentState) -> bool:
        """验证执行前置条件"""
        return (
            state.original_content is not None and
            len(state.original_content.strip()) > 10 and
            state.css_rules is not None and
            isinstance(state.css_rules, dict) and
            state.content_analysis_summary is not None
        )
    
    def validate_output(self, state: AgentState) -> bool:
        """验证输出质量"""
        return (
            state.generated_html is not None and
            len(state.generated_html.strip()) > 100 and
            '<' in state.generated_html and '>' in state.generated_html and
            'style=' in state.generated_html
        )
    
    def _extract_relevant_input(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输入数据"""
        return {
            "content_length": len(state.original_content),
            "css_rules_count": len(state.css_rules) if state.css_rules else 0,
            "has_content_analysis": bool(state.content_analysis_summary),
            "has_design_tokens": bool(state.design_tokens)
        }
    
    def _extract_relevant_output(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输出数据"""
        if not state.generated_html:
            return {}
        
        return {
            "html_length": len(state.generated_html),
            "inline_styles_count": state.generated_html.count('style='),
            "structure_elements": self._count_structure_elements(state.generated_html)
        }
    
    def get_collaboration_feedback(self, state: AgentState) -> str:
        """为QualityDirector提供协作反馈 - 使用快速模型生成"""
        if not state.generated_html:
            return ""
        
        html = state.generated_html
        structure_elements = self._count_structure_elements(html)
        
        # 使用快速模型生成协作反馈
        feedback_prompt = f"""基于以下HTML组装结果，生成给QualityDirector的简洁反馈：

HTML长度: {len(html)}
结构元素统计: {json.dumps(structure_elements, ensure_ascii=False)}
包含样式数量: {html.count('style=')}

请生成一句话的反馈，说明：
1. 组装了几个章节结构
2. 应用了多少个样式
3. 包豪斯设计系统实现情况

直接输出反馈文本："""
        
        try:
            feedback = self.call_llm(feedback_prompt, state.task_id, model_type="fast")
            return feedback.strip()
        except Exception:
            # 快速模型失败时的代码备选方案
            feedback_parts = []
            
            if structure_elements.get("sections", 0) > 0:
                feedback_parts.append(f"已组装{structure_elements['sections']}个包豪斯章节结构")
            
            if structure_elements.get("styled_elements", 0) > 0:
                feedback_parts.append(f"已应用{structure_elements['styled_elements']}个内联样式")
            
            if "section-number" in html:
                feedback_parts.append("章节标号色彩系统已正确应用")
            
            if "border-left:" in html:
                feedback_parts.append("包豪斯几何边框系统已实现")
            
            if "background:" in html:
                feedback_parts.append("色块强调系统已应用")
            
            return "; ".join(feedback_parts) if feedback_parts else "基础HTML组装完成"