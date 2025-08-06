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
        print("🔧 应用全面JSON修复")
        
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
    def __init__(self, llm):
        self.prompt = PromptTemplate(
            template="""
            基于以下风格描述，生成符合微信公众号平台限制的风格DNA配置：

            风格主题：{theme_name}
            风格特征描述：{theme_description}
            内容结构：{content_structure}

            微信平台CSS限制：
            - 允许：font-size, color, font-weight, line-height, margin, padding, background-color, border, text-align, display
            - 禁止：position, transform, z-index, div标签, class/id属性
            - 必须：内联样式，使用section替代div

            生成JSON格式的风格DNA，包含各内容层次的样式配置：
            {{
              "theme_name": "{theme_name}",
              "h1_styles": {{"font-size": "24px", "color": "#2c3e50", ...}},
              "h2_styles": {{"font-size": "20px", "color": "#34495e", ...}},
              "p_styles": {{"font-size": "16px", "color": "#333333", ...}},
              "em_styles": {{"color": "#e74c3c", "font-style": "italic", ...}},
              "li_styles": {{"font-size": "16px", "margin-bottom": "8px", ...}},
              "section_styles": {{"margin": "20px 0", "padding": "16px", ...}}
            }}

            要求：
            1. 创造性地体现风格特征，避免模板化
            2. 严格遵循微信平台CSS限制
            3. 适配移动端阅读体验
            4. 保持视觉层次清晰
            """,
            input_variables=["theme_name", "theme_description", "content_structure"]
        )
        
        # 使用RunnableSequence替代已废弃的LLMChain
        self.chain = self.prompt | llm | StrOutputParser()


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