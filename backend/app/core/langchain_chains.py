from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.exceptions import OutputParserException
from ..models.schemas import ContentStructure
import json
import re


class ContentParserChain:
    def __init__(self, llm):
        # 改用字符串输出解析器，避免严格的Pydantic验证
        self.parser = StrOutputParser()
        
        self.prompt = PromptTemplate(
            template="""
            你是一个专业的内容结构分析师。请分析以下文本内容的层次结构，识别标题、段落、强调文本、列表等元素。

            原始内容：
            {raw_content}

            请严格按照以下JSON格式输出，确保格式正确：

            {{
                "elements": [
                    {{"type": "h1", "content": "标题文字", "level": 1}},
                    {{"type": "p", "content": "段落文字"}},
                    {{"type": "h2", "content": "二级标题", "level": 2}},
                    {{"type": "ul", "content": "列表项1\\n列表项2\\n列表项3"}},
                    {{"type": "em", "content": "强调文字"}},
                    {{"type": "strong", "content": "加粗文字"}}
                ]
            }}

            输出规则：
            1. 每个元素必须包含"type"字段
            2. 大多数元素需要"content"字段存放文字内容
            3. 标题元素(h1,h2,h3)应该包含"level"字段(1,2,3)
            4. 列表内容用换行符\\n分隔多个列表项
            5. 确保JSON格式完全正确，不要有多余的逗号或语法错误
            6. content字段中的引号要用\\\"转义

            请分析内容并输出JSON：
            """,
            input_variables=["raw_content"]
        )
        
        # 使用字符串解析器
        self.chain = self.prompt | llm | self.parser

    def parse_and_clean(self, raw_output: str) -> ContentStructure:
        """解析和清理LLM输出 - 多层次解析策略"""
        print(f"🔄 开始解析LLM输出 (长度: {len(raw_output)} 字符)")
        
        # 策略1: 尝试标准JSON解析
        try:
            return self._parse_json_standard(raw_output)
        except Exception as e1:
            print(f"📝 标准JSON解析失败: {str(e1)[:100]}")
            
            # 策略2: 尝试修复JSON后解析
            try:
                return self._parse_json_with_fixes(raw_output)
            except Exception as e2:
                print(f"🔧 修复JSON解析失败: {str(e2)[:100]}")
                
                # 策略3: 正则表达式备用解析
                try:
                    return self._parse_with_regex(raw_output)
                except Exception as e3:
                    print(f"🎯 正则解析失败: {str(e3)[:100]}")
                    
                    # 所有策略都失败，抛出详细错误
                    error_details = f"""
                    所有解析策略都失败了:
                    1. 标准JSON: {str(e1)[:200]}
                    2. 修复JSON: {str(e2)[:200]}
                    3. 正则解析: {str(e3)[:200]}
                    
                    原始输出预览: {raw_output[:500]}...
                    """
                    raise OutputParserException(error_details)
    
    def _parse_json_standard(self, raw_output: str) -> ContentStructure:
        """策略1: 标准JSON解析"""
        json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
        if json_match:
            json_str = json_match.group()
        else:
            json_str = raw_output.strip()
        
        data = json.loads(json_str)
        return self._build_content_structure(data)
    
    def _parse_json_with_fixes(self, raw_output: str) -> ContentStructure:
        """策略2: 修复常见JSON问题后解析"""
        json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
        if json_match:
            json_str = json_match.group()
        else:
            json_str = raw_output.strip()
        
        # 应用多种JSON修复
        json_str = self._fix_json_comprehensive(json_str)
        data = json.loads(json_str)
        return self._build_content_structure(data)
    
    def _parse_with_regex(self, raw_output: str) -> ContentStructure:
        """策略3: 正则表达式直接解析 - 最后的备选方案"""
        print("🎯 使用正则表达式备用解析策略")
        
        elements = []
        
        # 查找所有可能的元素模式
        patterns = [
            # 标准格式: {"type": "h1", "content": "标题", "level": 1}
            r'\{\s*"type"\s*:\s*"([^"]+)"\s*,\s*"content"\s*:\s*"([^"]*?)"\s*,\s*"level"\s*:\s*(\d+)\s*\}',
            # 无level: {"type": "p", "content": "内容"}
            r'\{\s*"type"\s*:\s*"([^"]+)"\s*,\s*"content"\s*:\s*"([^"]*?)"\s*\}',
            # 只有type: {"type": "ul"}
            r'\{\s*"type"\s*:\s*"([^"]+)"\s*\}',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, raw_output, re.DOTALL)
            for match in matches:
                if len(match) == 3:  # type, content, level
                    element = {
                        'type': match[0],
                        'content': match[1] if match[1] else None,
                        'level': int(match[2])
                    }
                elif len(match) == 2:  # type, content
                    element = {
                        'type': match[0], 
                        'content': match[1] if match[1] else None
                    }
                else:  # only type
                    element = {'type': match[0] if isinstance(match, tuple) else match}
                
                elements.append(element)
        
        # 如果正则也没找到内容，创建基础结构
        if not elements:
            print("⚠️ 正则解析也未找到有效元素，创建基础结构")
            elements = self._create_fallback_structure(raw_output)
        
        return ContentStructure(elements=elements)
    
    def _build_content_structure(self, data: dict) -> ContentStructure:
        """构建内容结构对象"""
        if not isinstance(data, dict) or 'elements' not in data:
            raise ValueError("输出格式不正确，缺少elements字段")
        
        cleaned_elements = []
        for i, element in enumerate(data['elements']):
            if not isinstance(element, dict):
                print(f"⚠️ 跳过非字典元素 {i}: {element}")
                continue
                
            if not element or 'type' not in element:
                print(f"⚠️ 跳过无type字段的元素 {i}: {element}")
                continue
            
            cleaned_element = {'type': str(element['type'])}
            
            # 添加content字段（如果存在且非空）
            if 'content' in element and element['content']:
                cleaned_element['content'] = str(element['content']).strip()
            
            # 添加level字段（如果存在且有效）  
            if 'level' in element and isinstance(element['level'], (int, str)):
                try:
                    cleaned_element['level'] = int(element['level'])
                except ValueError:
                    pass  # 忽略无效的level值
            
            cleaned_elements.append(cleaned_element)
        
        if not cleaned_elements:
            raise ValueError("没有有效的内容元素")
        
        return ContentStructure(elements=cleaned_elements)
    
    def _fix_json_comprehensive(self, json_str: str) -> str:
        """全面的JSON修复"""
        print("应用全面JSON修复")
        
        # 移除多余的逗号
        json_str = re.sub(r',\s*}', '}', json_str)
        json_str = re.sub(r',\s*]', ']', json_str)
        
        # 修复未引用的键名
        json_str = re.sub(r'(\w+)\s*:', r'"\1":', json_str)
        
        # 处理字符串中的未转义引号
        def fix_quotes_in_strings(match):
            content = match.group(1)
            # 转义内部的双引号
            content = content.replace('"', '\\"')
            return f'"{content}"'
        
        json_str = re.sub(r'"([^"]*(?:\\"[^"]*)*)"', fix_quotes_in_strings, json_str)
        
        # 移除多余的换行和空白
        json_str = re.sub(r'\s+', ' ', json_str)
        json_str = json_str.strip()
        
        # 确保正确的JSON结构
        if not json_str.startswith('{'):
            json_str = '{' + json_str
        if not json_str.endswith('}'):
            json_str = json_str + '}'
        
        return json_str
    
    def _create_fallback_structure(self, raw_output: str) -> list:
        """创建备用结构 - 当所有解析都失败时"""
        print("🆘 创建备用内容结构")
        
        # 尝试从原始输出中提取一些基本信息
        lines = raw_output.split('\n')
        elements = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # 简单的启发式规则
            if line.startswith('#'):
                level = len(line) - len(line.lstrip('#'))
                content = line.lstrip('# ').strip()
                if content:
                    elements.append({
                        'type': f'h{min(level, 6)}',
                        'content': content,
                        'level': level
                    })
            elif line and not line.startswith('{') and not line.startswith('}'):
                elements.append({
                    'type': 'p',
                    'content': line[:100]  # 限制长度
                })
        
        # 如果还是没有元素，创建一个基础元素
        if not elements:
            elements.append({
                'type': 'p',
                'content': 'FlowEdit - 内容解析失败，使用备用结构'
            })
        
        return elements


class StyleDNAGeneratorChain:
    def __init__(self, llm=None):
        if llm is None:
            from .config import settings
            from langchain_openai import ChatOpenAI
            
            llm = ChatOpenAI(
                model=settings.default_model,
                openai_api_key=settings.openai_api_key,
                openai_api_base=settings.openai_base_url,
                temperature=settings.temperature,
                max_tokens=settings.max_tokens
            )
        
        self.parser = StrOutputParser()
        self.prompt = PromptTemplate(
            template="""
            基于以下风格描述，生成符合微信公众号平台限制的完整风格DNA配置：

            风格主题：{theme_name}
            风格特征描述：{theme_description}

            微信平台CSS限制：
            - 允许：font-size, color, font-weight, line-height, margin, padding, background-color, border, text-align, display, text-decoration
            - 禁止：position, transform, z-index, div标签, class/id属性
            - 必须：内联样式，使用section替代div

            生成JSON格式的完整风格DNA，必须包含以下所有基础样式：
            {{
              "theme_name": "{theme_name}",
              
              "strong_styles": {{"color": "#e74c3c", "font-weight": "bold"}},
              "b_styles": {{"color": "#2c3e50", "font-weight": "bold"}},
              "em_styles": {{"color": "#e67e22", "font-style": "italic", "font-weight": "500"}},
              "i_styles": {{"color": "#8e44ad", "font-style": "italic"}},
              "u_styles": {{"color": "#3498db", "text-decoration": "underline"}},
              "code_styles": {{"background-color": "#f8f9fa", "color": "#e74c3c", "padding": "2px 4px", "font-size": "14px", "border": "1px solid #e9ecef"}},
              "mark_styles": {{"background-color": "#fff3cd", "color": "#856404", "padding": "2px 4px"}},
              "a_styles": {{"color": "#3498db", "text-decoration": "underline"}},
              "sup_styles": {{"font-size": "12px", "color": "#7f8c8d"}},
              
              "h1_styles": {{"font-size": "28px", "color": "#2c3e50", "font-weight": "bold", "margin": "24px 0 20px 0", "line-height": "1.4", "text-align": "center"}},
              "h2_styles": {{"font-size": "24px", "color": "#34495e", "font-weight": "bold", "margin": "20px 0 16px 0", "line-height": "1.4"}},
              "h3_styles": {{"font-size": "20px", "color": "#34495e", "font-weight": "bold", "margin": "18px 0 14px 0", "line-height": "1.4"}},
              "h4_styles": {{"font-size": "18px", "color": "#7f8c8d", "font-weight": "bold", "margin": "16px 0 12px 0", "line-height": "1.4"}},
              
              "p_styles": {{"font-size": "16px", "color": "#333333", "line-height": "1.8", "margin": "0 0 16px 0", "text-align": "justify"}},
              
              "quote_styles": {{"font-size": "16px", "color": "#7f8c8d", "font-style": "italic", "margin": "20px 0", "padding": "16px 20px", "background-color": "#f8f9fa", "border-left": "4px solid #3498db"}},
              
              "delimiter_styles": {{"text-align": "center", "margin": "24px 0", "color": "#bdc3c7", "font-size": "18px"}},
              
              "image_styles": {{"display": "block", "margin": "20px auto", "max-width": "100%", "border": "1px solid #e9ecef"}},
              
              "code_block_styles": {{"background-color": "#f8f9fa", "color": "#333333", "padding": "16px", "margin": "16px 0", "font-size": "14px", "line-height": "1.6", "border": "1px solid #e9ecef"}},
              
              "ordered_list_styles": {{"margin": "16px 0", "padding-left": "20px"}},
              "unordered_list_styles": {{"margin": "16px 0", "padding-left": "20px"}},
              "li_styles": {{"font-size": "16px", "color": "#333333", "margin-bottom": "8px", "line-height": "1.6"}},
              
              "section_styles": {{"margin": "20px 0", "padding": "16px", "background-color": "#ffffff"}},
              "blockquote_styles": {{"margin": "20px 0", "padding": "16px 20px", "background-color": "#f8f9fa", "border-left": "4px solid #3498db", "color": "#7f8c8d"}},
              
              "table_styles": {{"width": "100%", "margin": "16px 0", "border": "1px solid #e9ecef"}},
              "th_styles": {{"background-color": "#f8f9fa", "padding": "12px", "font-weight": "bold", "color": "#2c3e50", "text-align": "center", "border": "1px solid #e9ecef"}},
              "td_styles": {{"padding": "12px", "color": "#333333", "border": "1px solid #e9ecef", "text-align": "left"}},
              
              "hr_styles": {{"margin": "24px 0", "border": "none", "border-top": "2px solid #ecf0f1"}},
              
              "highlight_section_styles": {{"background-color": "#f8f9fa", "padding": "20px", "margin": "20px 0", "border": "1px solid #e9ecef"}},
              
              "note_styles": {{"background-color": "#e8f5e8", "color": "#2d5a2d", "padding": "16px", "margin": "16px 0", "border-left": "4px solid #27ae60"}},
              "warning_styles": {{"background-color": "#fff3cd", "color": "#856404", "padding": "16px", "margin": "16px 0", "border-left": "4px solid #ffc107"}},
              "danger_styles": {{"background-color": "#f8d7da", "color": "#721c24", "padding": "16px", "margin": "16px 0", "border-left": "4px solid #dc3545"}}
            }}

            要求：
            1. 创造性地体现风格特征，避免模板化
            2. 严格遵循微信平台CSS限制  
            3. 适配移动端阅读体验（字体大小合适，行距舒适）
            4. 保持视觉层次清晰，颜色搭配和谐
            5. 确保所有基础样式都有定义
            6. 根据风格主题调整颜色方案和排版风格
            
            重要：
            - 只输出有效的JSON格式，不要任何解释文字
            - 不要使用注释，确保JSON语法正确
            - 所有字符串值必须用双引号包围
            - 确保JSON结构完整，没有遗漏的括号或逗号
            """,
            input_variables=["theme_name", "theme_description"]
        )
        
        # 使用RunnableSequence替代已废弃的LLMChain
        self.chain = self.prompt | llm | self.parser

    def parse_and_clean_style_dna(self, raw_output: str) -> dict:
        """解析和清理LLM输出的Style DNA - 多层次解析策略"""
        print(f"开始解析Style DNA输出 (长度: {len(raw_output)} 字符)")
        
        # 策略1: 尝试标准JSON解析
        try:
            return self._parse_json_standard(raw_output)
        except Exception as e1:
            print(f"标准JSON解析失败: {str(e1)[:100]}")
            
            # 策略2: 尝试修复JSON后解析
            try:
                return self._parse_json_with_fixes(raw_output)
            except Exception as e2:
                print(f"修复JSON解析失败: {str(e2)[:100]}")
                
                # 策略3: 尝试从JSON片段重建
                try:
                    return self._rebuild_from_fragments(raw_output)
                except Exception as e3:
                    print(f"片段重建失败: {str(e3)[:100]}")
                    
                    # 策略4: 创建基础样式DNA
                    try:
                        return self._create_fallback_style_dna()
                    except Exception as e4:
                        # 所有策略都失败，抛出详细错误
                        error_details = f"""
                        所有解析策略都失败了:
                        1. 标准JSON: {str(e1)[:100]}
                        2. 修复JSON: {str(e2)[:100]}
                        3. 片段重建: {str(e3)[:100]}
                        4. 创建备用: {str(e4)[:100]}
                        
                        原始输出预览: {raw_output[:500]}...
                        """
                        raise json.JSONDecodeError(error_details, raw_output, 0)

    def _parse_json_standard(self, raw_output: str) -> dict:
        """策略1: 标准JSON解析"""
        # 查找JSON内容
        json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
        if json_match:
            json_str = json_match.group()
        else:
            json_str = raw_output.strip()
        
        data = json.loads(json_str)
        return self._validate_style_dna_structure(data)

    def _parse_json_with_fixes(self, raw_output: str) -> dict:
        """策略2: 修复常见JSON问题后解析"""
        json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
        if json_match:
            json_str = json_match.group()
        else:
            json_str = raw_output.strip()
        
        # 应用多种JSON修复
        json_str = self._fix_json_comprehensive(json_str)
        data = json.loads(json_str)
        return self._validate_style_dna_structure(data)

    def _rebuild_from_fragments(self, raw_output: str) -> dict:
        """策略3: 从JSON片段重建Style DNA"""
        print("尝试从片段重建Style DNA")
        
        style_dna = {}
        
        # 提取样式片段的正则模式
        patterns = [
            # 普通样式: "h1_styles": {"color": "#333", "font-size": "24px"}
            r'"([a-zA-Z_]+_styles)"\s*:\s*(\{[^}]*\})',
            # theme_name: "theme_name": "主题名"
            r'"(theme_name)"\s*:\s*"([^"]*)"',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, raw_output)
            for match in matches:
                if len(match) == 2:
                    key, value = match
                    try:
                        if key == "theme_name":
                            style_dna[key] = value
                        else:
                            # 解析样式对象
                            style_obj = json.loads(value)
                            style_dna[key] = style_obj
                    except json.JSONDecodeError:
                        continue
        
        # 确保包含基础样式
        return self._ensure_basic_styles(style_dna)

    def _create_fallback_style_dna(self) -> dict:
        """策略4: 创建备用Style DNA"""
        print("创建备用Style DNA")
        
        return {
            "theme_name": "默认样式",
            "strong_styles": {"color": "#e74c3c", "font-weight": "bold"},
            "b_styles": {"color": "#2c3e50", "font-weight": "bold"},
            "em_styles": {"color": "#e67e22", "font-style": "italic", "font-weight": "500"},
            "i_styles": {"color": "#8e44ad", "font-style": "italic"},
            "u_styles": {"color": "#3498db", "text-decoration": "underline"},
            "code_styles": {"background-color": "#f8f9fa", "color": "#e74c3c", "padding": "2px 4px", "font-size": "14px", "border": "1px solid #e9ecef"},
            "mark_styles": {"background-color": "#fff3cd", "color": "#856404", "padding": "2px 4px"},
            "a_styles": {"color": "#3498db", "text-decoration": "underline"},
            "sup_styles": {"font-size": "12px", "color": "#7f8c8d"},
            "h1_styles": {"font-size": "28px", "color": "#2c3e50", "font-weight": "bold", "margin": "24px 0 20px 0", "line-height": "1.4", "text-align": "center"},
            "h2_styles": {"font-size": "24px", "color": "#34495e", "font-weight": "bold", "margin": "20px 0 16px 0", "line-height": "1.4"},
            "h3_styles": {"font-size": "20px", "color": "#34495e", "font-weight": "bold", "margin": "18px 0 14px 0", "line-height": "1.4"},
            "h4_styles": {"font-size": "18px", "color": "#7f8c8d", "font-weight": "bold", "margin": "16px 0 12px 0", "line-height": "1.4"},
            "p_styles": {"font-size": "16px", "color": "#333333", "line-height": "1.8", "margin": "0 0 16px 0", "text-align": "justify"},
            "quote_styles": {"font-size": "16px", "color": "#7f8c8d", "font-style": "italic", "margin": "20px 0", "padding": "16px 20px", "background-color": "#f8f9fa", "border-left": "4px solid #3498db"},
            "delimiter_styles": {"text-align": "center", "margin": "24px 0", "color": "#bdc3c7", "font-size": "18px"},
            "image_styles": {"display": "block", "margin": "20px auto", "max-width": "100%", "border": "1px solid #e9ecef"},
            "code_block_styles": {"background-color": "#f8f9fa", "color": "#333333", "padding": "16px", "margin": "16px 0", "font-size": "14px", "line-height": "1.6", "border": "1px solid #e9ecef"},
            "ordered_list_styles": {"margin": "16px 0", "padding-left": "20px"},
            "unordered_list_styles": {"margin": "16px 0", "padding-left": "20px"},
            "li_styles": {"font-size": "16px", "color": "#333333", "margin-bottom": "8px", "line-height": "1.6"}
        }

    def _validate_style_dna_structure(self, data: dict) -> dict:
        """验证并确保Style DNA结构完整"""
        if not isinstance(data, dict):
            raise ValueError("输出格式不正确，期望JSON对象")
        
        # 确保包含基础样式
        return self._ensure_basic_styles(data)

    def _ensure_basic_styles(self, style_dna: dict) -> dict:
        """确保包含所有必需的基础样式"""
        required_styles = [
            "strong_styles", "b_styles", "em_styles", "i_styles", "u_styles", 
            "code_styles", "mark_styles", "a_styles", "sup_styles",
            "h1_styles", "h2_styles", "h3_styles", "h4_styles", "p_styles",
            "quote_styles", "delimiter_styles", "image_styles", "code_block_styles",
            "ordered_list_styles", "unordered_list_styles", "li_styles"
        ]
        
        fallback = self._create_fallback_style_dna()
        
        # 补充缺失的样式
        for style_key in required_styles:
            if style_key not in style_dna or not isinstance(style_dna[style_key], dict):
                style_dna[style_key] = fallback[style_key]
                print(f"补充缺失的样式: {style_key}")
        
        # 确保theme_name存在
        if "theme_name" not in style_dna:
            style_dna["theme_name"] = "未知主题"
        
        return style_dna

    def _fix_json_comprehensive(self, json_str: str) -> str:
        """全面的JSON修复"""
        print("应用全面JSON修复")
        
        # 1. 移除多余的逗号
        json_str = re.sub(r',\s*}', '}', json_str)
        json_str = re.sub(r',\s*]', ']', json_str)
        
        # 2. 修复未引用的键名
        json_str = re.sub(r'(\w+)\s*:', r'"\1":', json_str)
        
        # 3. 修复字符串中的未转义引号和控制字符
        def fix_string_content(match):
            content = match.group(1)
            # 转义内部的双引号
            content = content.replace('\\"', '"').replace('"', '\\"')
            # 转义换行符
            content = content.replace('\n', '\\n').replace('\r', '\\r')
            return f'"{content}"'
        
        # 更细致的字符串匹配和修复
        json_str = re.sub(r'"([^"\\]*(?:\\.[^"\\]*)*)"', fix_string_content, json_str)
        
        # 4. 修复常见的JSON结构问题
        json_str = re.sub(r'\s+', ' ', json_str)  # 压缩空白
        json_str = json_str.strip()
        
        # 5. 确保正确的JSON结构边界
        if not json_str.startswith('{'):
            json_str = '{' + json_str
        if not json_str.endswith('}'):
            # 找到最后一个有效的右括号位置
            last_brace = json_str.rfind('}')
            if last_brace > 0:
                json_str = json_str[:last_brace + 1]
            else:
                json_str = json_str + '}'
        
        # 6. 尝试修复不完整的JSON对象
        try:
            # 快速验证修复后的JSON
            json.loads(json_str)
        except json.JSONDecodeError as e:
            # 如果仍然有问题，尝试截断到错误位置
            error_pos = e.pos
            if error_pos > 100:  # 只有在有足够内容时才截断
                json_str = json_str[:error_pos]
                # 尝试找到最后一个完整的键值对
                last_comma = json_str.rfind(',')
                if last_comma > 0:
                    json_str = json_str[:last_comma] + '}'
                else:
                    json_str = json_str + '}'
        
        return json_str


class HTMLGeneratorChain:
    def __init__(self, llm):
        self.prompt = PromptTemplate(
            template="""
            基于内容结构和风格DNA，生成符合微信公众号规范的HTML代码：

            内容结构：{parsed_content}
            风格DNA：{style_dna}

            微信HTML规范：
            1. 必须使用section替代div作为容器
            2. 所有样式必须内联（style属性）
            3. 禁用id属性，不使用class
            4. 只使用允许的HTML标签：p, h1-h6, section, ul, ol, li, strong, em, span
            5. 单位推荐：px, vw（避免百分比负值）

            输出格式：
            - 仅输出HTML内容片段，不包含完整页面结构
            - 每个内容元素应用对应的风格DNA样式
            - 确保在移动端显示良好

            HTML输出：
            """,
            input_variables=["parsed_content", "style_dna"]
        )
        
        # 使用RunnableSequence替代已废弃的LLMChain
        self.chain = self.prompt | llm | StrOutputParser()