"""
HTML渲染服务 - 基于代码的模板填充系统
不使用LLM，确保样式一致性和性能优化
"""

import re
from typing import Dict, List, Any, Optional
from ..models.schemas import ContentStructure


class HTMLRendererService:
    """基于StyleDNA和内容结构生成完整HTML的渲染引擎"""
    
    def __init__(self):
        self.system_font = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif"
    
    def render_complete_html(self, content_structure: ContentStructure, style_dna: dict) -> str:
        """
        将内容结构和StyleDNA渲染为完整的微信兼容HTML
        
        Args:
            content_structure: 解析后的内容结构
            style_dna: 生成的样式DNA配置
            
        Returns:
            完整的HTML字符串，符合微信规范
        """
        print(f"🎨 开始渲染HTML，内容元素数量: {len(content_structure.elements)}")
        
        html_parts = []
        
        # 生成容器开始标签
        container_style = self._build_inline_styles(style_dna.get("section_styles", {}))
        html_parts.append(f'<section style="{container_style}">')
        
        # 渲染每个内容元素
        for i, element in enumerate(content_structure.elements):
            element_html = self._render_element(element, style_dna, i)
            if element_html:
                html_parts.append(element_html)
        
        # 容器结束标签
        html_parts.append('</section>')
        
        result_html = '\n'.join(html_parts)
        print(f"✅ HTML渲染完成，总长度: {len(result_html)} 字符")
        
        return result_html
    
    def _render_element(self, element: dict, style_dna: dict, index: int) -> str:
        """渲染单个内容元素"""
        element_type = element.get('type', 'p')
        content = element.get('content', '')
        level = element.get('level', 1)
        
        # 根据元素类型选择渲染方法
        renderer_map = {
            'h1': self._render_header,
            'h2': self._render_header, 
            'h3': self._render_header,
            'h4': self._render_header,
            'h5': self._render_header,
            'h6': self._render_header,
            'p': self._render_paragraph,
            'ul': self._render_list,
            'ol': self._render_list,
            'li': self._render_list_item,
            'blockquote': self._render_blockquote,
            'code': self._render_code_block,
            'quote': self._render_quote,
            'strong': self._render_inline_element,
            'em': self._render_inline_element,
            'b': self._render_inline_element,
            'i': self._render_inline_element,
            'u': self._render_inline_element,
            'mark': self._render_inline_element,
            'a': self._render_inline_element,
            'sup': self._render_inline_element,
            'delimiter': self._render_delimiter,
            'hr': self._render_hr
        }
        
        renderer = renderer_map.get(element_type, self._render_paragraph)
        return renderer(element, style_dna)
    
    def _render_header(self, element: dict, style_dna: dict) -> str:
        """渲染标题元素"""
        element_type = element.get('type', 'h1')
        content = element.get('content', '')
        level = element.get('level', 1)
        
        # 确保level在合理范围内
        level = max(1, min(6, level))
        header_tag = f"h{level}"
        
        # 获取对应的标题样式
        style_key = f"{header_tag}_styles"
        header_styles = style_dna.get(style_key, {})
        
        if not header_styles:
            # 回退到通用标题样式
            header_styles = {
                "font-size": "1.5em",
                "font-weight": "700", 
                "color": "#2c3e50",
                "margin": "1em 0 0.5em 0",
                "font-family": self.system_font
            }
        
        inline_styles = self._build_inline_styles(header_styles)
        processed_content = self._process_inline_content(content, style_dna)
        
        return f'<{header_tag} style="{inline_styles}">{processed_content}</{header_tag}>'
    
    def _render_paragraph(self, element: dict, style_dna: dict) -> str:
        """渲染段落元素"""
        content = element.get('content', '')
        if not content.strip():
            return ''
        
        p_styles = style_dna.get("p_styles", {
            "font-size": "1em",
            "color": "#333333",
            "line-height": "1.7",
            "margin": "0 0 1em 0",
            "font-family": self.system_font
        })
        
        inline_styles = self._build_inline_styles(p_styles)
        processed_content = self._process_inline_content(content, style_dna)
        
        return f'<p style="{inline_styles}">{processed_content}</p>'
    
    def _render_list(self, element: dict, style_dna: dict) -> str:
        """渲染列表元素"""
        element_type = element.get('type', 'ul')
        content = element.get('content', '')
        
        if not content.strip():
            return ''
        
        # 分割列表项
        items = [item.strip() for item in content.split('\n') if item.strip()]
        if not items:
            return ''
        
        # 获取列表样式
        if element_type == 'ol':
            list_styles = style_dna.get("ordered_list_styles", {})
        else:
            list_styles = style_dna.get("unordered_list_styles", {})
        
        li_styles = style_dna.get("li_styles", {})
        
        # 构建样式
        list_inline_styles = self._build_inline_styles(list_styles)
        li_inline_styles = self._build_inline_styles(li_styles)
        
        # 生成列表项HTML
        list_items_html = []
        for i, item in enumerate(items):
            processed_item = self._process_inline_content(item, style_dna)
            
            if element_type == 'ol':
                # 有序列表 - 添加数字装饰
                list_items_html.append(
                    f'<li style="{li_inline_styles}">'
                    f'<section style="margin-right: 1em; margin-top: 0.1em; flex-shrink: 0;">'
                    f'<span style="width: 1.5em; height: 1.5em; background: {style_dna.get("colors", {}).get("accent", "#3498db")}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75em; font-weight: 600; color: white; box-shadow: 0 2px 6px rgba(52, 152, 219, 0.25);">{i+1}</span>'
                    f'</section>'
                    f'<span style="flex: 1; margin-top: 0.1em;">{processed_item}</span>'
                    f'</li>'
                )
            else:
                # 无序列表 - 添加项目符号
                list_items_html.append(
                    f'<li style="{li_inline_styles}">'
                    f'<section style="margin-right: 1em; margin-top: 0.4em; flex-shrink: 0; text-align: center;">'
                    f'<span style="width: 0.4em; height: 0.4em; background: {style_dna.get("colors", {}).get("accent", "#3498db")}; border-radius: 50%; display: inline-block;"></span>'
                    f'</section>'
                    f'<span style="flex: 1;">{processed_item}</span>'
                    f'</li>'
                )
        
        return f'<{element_type} style="{list_inline_styles}">{"".join(list_items_html)}</{element_type}>'
    
    def _render_list_item(self, element: dict, style_dna: dict) -> str:
        """渲染单个列表项（通常在_render_list中处理）"""
        content = element.get('content', '')
        li_styles = style_dna.get("li_styles", {})
        inline_styles = self._build_inline_styles(li_styles)
        processed_content = self._process_inline_content(content, style_dna)
        
        return f'<li style="{inline_styles}">{processed_content}</li>'
    
    def _render_blockquote(self, element: dict, style_dna: dict) -> str:
        """渲染引用块"""
        content = element.get('content', '')
        if not content.strip():
            return ''
        
        blockquote_styles = style_dna.get("blockquote_styles", {})
        inline_styles = self._build_inline_styles(blockquote_styles)
        processed_content = self._process_inline_content(content, style_dna)
        
        return f'<blockquote style="{inline_styles}">{processed_content}</blockquote>'
    
    def _render_quote(self, element: dict, style_dna: dict) -> str:
        """渲染引用样式（区别于blockquote）"""
        content = element.get('content', '')
        if not content.strip():
            return ''
        
        quote_styles = style_dna.get("quote_styles", {})
        inline_styles = self._build_inline_styles(quote_styles)
        processed_content = self._process_inline_content(content, style_dna)
        
        # 专业引用格式 - 带左侧引号装饰
        accent_color = self._extract_color_from_styles(style_dna, "accent", "#3498db")
        
        return (
            f'<section style="{inline_styles}">'
            f'<section style="display: flex; align-items: flex-start;">'
            f'<span style="font-size: 1.5em; color: rgba(52, 152, 219, 0.4); font-family: serif; line-height: 0.8; margin-right: 0.4em; margin-top: -0.05em;">"</span>'
            f'<section style="flex: 1;">'
            f'<p style="margin: 0; font-style: italic; font-size: 0.95em; line-height: 1.55;">{processed_content}</p>'
            f'</section>'
            f'</section>'
            f'</section>'
        )
    
    def _render_code_block(self, element: dict, style_dna: dict) -> str:
        """渲染代码块"""
        content = element.get('content', '')
        if not content.strip():
            return ''
        
        code_styles = style_dna.get("code_block_styles", {})
        inline_styles = self._build_inline_styles(code_styles)
        
        # 转义HTML特殊字符
        escaped_content = (content.replace('&', '&amp;')
                                 .replace('<', '&lt;')
                                 .replace('>', '&gt;'))
        
        # 专业代码块样式 - 带顶部装饰
        return (
            f'<section style="{inline_styles}">'
            f'<section style="background: linear-gradient(90deg, #34495e 0%, #2c3e50 100%); padding: 0.6em 1em; border-bottom: 1px solid #e1e7ef; display: flex; align-items: center; justify-content: space-between;">'
            f'<section style="display: flex; align-items: center;">'
            f'<span style="width: 0.5em; height: 0.5em; background: #ef4444; border-radius: 50%; margin-right: 0.4em;"></span>'
            f'<span style="width: 0.5em; height: 0.5em; background: #f59e0b; border-radius: 50%; margin-right: 0.4em;"></span>'
            f'<span style="width: 0.5em; height: 0.5em; background: #10b981; border-radius: 50%;"></span>'
            f'</section>'
            f'<span style="font-size: 0.65em; color: #bdc3c7; font-weight: 500;">CODE</span>'
            f'</section>'
            f'<section style="padding: 1em; font-family: \\"SF Mono\\", Menlo, Monaco, Consolas, monospace; font-size: 0.8em; line-height: 1.45; color: #ecf0f1; overflow-x: auto;">'
            f'<span>{escaped_content}</span>'
            f'</section>'
            f'</section>'
        )
    
    def _render_inline_element(self, element: dict, style_dna: dict) -> str:
        """渲染内联元素"""
        element_type = element.get('type', 'span')
        content = element.get('content', '')
        
        style_key = f"{element_type}_styles"
        element_styles = style_dna.get(style_key, {})
        inline_styles = self._build_inline_styles(element_styles)
        
        return f'<{element_type} style="{inline_styles}">{content}</{element_type}>'
    
    def _render_delimiter(self, element: dict, style_dna: dict) -> str:
        """渲染分隔符"""
        delimiter_styles = style_dna.get("delimiter_styles", {})
        inline_styles = self._build_inline_styles(delimiter_styles)
        
        # 创意分隔符设计
        primary_color = self._extract_color_from_styles(style_dna, "primary", "#2c3e50")
        accent_color = self._extract_color_from_styles(style_dna, "accent", "#3498db")
        
        return (
            f'<section style="display: flex; align-items: center; justify-content: center; margin: 1.8em 0;">'
            f'<section style="display: flex; align-items: center;">'
            f'<span style="width: 0.4em; height: 0.4em; background: {primary_color}; border-radius: 50%; margin: 0 0.5em;"></span>'
            f'<span style="width: 0.25em; height: 0.25em; background: {accent_color}; border-radius: 50%; margin: 0 0.4em;"></span>'
            f'<span style="width: 0.4em; height: 0.4em; background: {primary_color}; border-radius: 50%; margin: 0 0.5em;"></span>'
            f'</section>'
            f'</section>'
        )
    
    def _render_hr(self, element: dict, style_dna: dict) -> str:
        """渲染水平分隔线"""
        hr_styles = style_dna.get("hr_styles", {})
        inline_styles = self._build_inline_styles(hr_styles)
        
        return f'<section style="{inline_styles}"></section>'
    
    def _process_inline_content(self, content: str, style_dna: dict) -> str:
        """
        处理内容中的内联样式标记
        如 **粗体** *斜体* __下划线__ `代码` 等
        """
        if not content:
            return content
        
        # 处理粗体 **text** 或 __text__
        content = re.sub(
            r'\*\*(.*?)\*\*',
            lambda m: self._wrap_with_inline_style(m.group(1), 'strong', style_dna),
            content
        )
        content = re.sub(
            r'__(.*?)__',
            lambda m: self._wrap_with_inline_style(m.group(1), 'strong', style_dna),
            content
        )
        
        # 处理斜体 *text* 或 _text_
        content = re.sub(
            r'\*(.*?)\*',
            lambda m: self._wrap_with_inline_style(m.group(1), 'em', style_dna),
            content
        )
        content = re.sub(
            r'(?<!\*)\b_(.*?)_\b(?!\*)',
            lambda m: self._wrap_with_inline_style(m.group(1), 'em', style_dna),
            content
        )
        
        # 处理代码 `code`
        content = re.sub(
            r'`([^`]+)`',
            lambda m: self._wrap_with_inline_style(m.group(1), 'code', style_dna),
            content
        )
        
        return content
    
    def _wrap_with_inline_style(self, text: str, style_type: str, style_dna: dict) -> str:
        """用内联样式包装文本"""
        style_key = f"{style_type}_styles"
        element_styles = style_dna.get(style_key, {})
        
        if not element_styles:
            # 回退到默认样式
            default_styles = {
                'strong': {'font-weight': 'bold'},
                'em': {'font-style': 'italic'},
                'code': {'font-family': 'monospace', 'background': '#f0f0f0', 'padding': '0.2em 0.4em'}
            }
            element_styles = default_styles.get(style_type, {})
        
        inline_styles = self._build_inline_styles(element_styles)
        return f'<{style_type} style="{inline_styles}">{text}</{style_type}>'
    
    def _build_inline_styles(self, styles: dict) -> str:
        """将样式字典转换为内联样式字符串"""
        if not styles:
            return ""
        
        style_pairs = []
        for property_name, value in styles.items():
            if value is not None and value != "":
                # 确保CSS属性名称正确
                css_property = property_name.replace('_', '-')
                style_pairs.append(f"{css_property}: {value}")
        
        return "; ".join(style_pairs)
    
    def _extract_color_from_styles(self, style_dna: dict, color_type: str, default: str) -> str:
        """从样式DNA中提取指定类型的颜色"""
        # 尝试从不同位置获取颜色
        colors = style_dna.get("colors", {})
        if color_type in colors:
            return colors[color_type]
        
        # 尝试从其他样式中提取
        for style_key, style_config in style_dna.items():
            if isinstance(style_config, dict):
                color_value = style_config.get("color")
                if color_value and color_type.lower() in style_key.lower():
                    return color_value
        
        return default