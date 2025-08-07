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
                max_tokens=2000  # 减少token限制，因为现在不需要生成长JSON
            )
        
        self.llm = llm
        self.parser = StrOutputParser()
        
        # 第一步：生成核心配色方案
        self.color_scheme_prompt = PromptTemplate(
            template="""
            基于风格主题和描述，生成一个核心配色方案：

            风格主题：{theme_name}
            风格特征描述：{theme_description}

            请分析这个风格的视觉特征，生成一个简洁的配色方案。
            只需要输出以下格式的文字（不要JSON格式）：

            主色调: #颜色代码
            辅助色: #颜色代码  
            强调色: #颜色代码
            文字色: #颜色代码
            背景色: #颜色代码
            边框色: #颜色代码

            要求：
            1. 颜色要符合风格主题的特征
            2. 确保颜色对比度适合阅读
            3. 适合微信公众号的移动端展示
            """,
            input_variables=["theme_name", "theme_description"]
        )
        
        # 第二步：生成字体设计参数
        self.typography_prompt = PromptTemplate(
            template="""
            基于风格主题，设计字体排版参数：

            风格主题：{theme_name}
            风格特征描述：{theme_description}

            请设计适合这个风格的字体排版参数。
            只需要输出以下格式的文字（不要JSON格式）：

            标题字号: 数字px
            正文字号: 数字px
            小字号: 数字px
            行高系数: 小数
            字重强调: normal|bold|500|600|700
            标题对齐: left|center|right
            正文对齐: left|center|justify

            要求：
            1. 字体大小要适合移动端阅读
            2. 行高要保证阅读舒适性
            3. 符合风格主题的视觉特征
            """,
            input_variables=["theme_name", "theme_description"]
        )
        
        # 创建链
        self.color_chain = self.color_scheme_prompt | self.llm | self.parser
        self.typography_chain = self.typography_prompt | self.llm | self.parser

    # ===== 色彩处理函数库 - Phase 1优化 =====
    
    def _hex_to_rgb(self, hex_color: str) -> tuple:
        """将hex颜色转换为RGB元组"""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) != 6:
            return (44, 62, 80)  # 默认颜色
        try:
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        except ValueError:
            return (44, 62, 80)  # 默认颜色

    def _rgb_to_hex(self, rgb: tuple) -> str:
        """将RGB元组转换为hex颜色"""
        return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"

    def _to_rgba(self, hex_color: str, alpha: float) -> str:
        """将hex颜色转换为rgba格式"""
        rgb = self._hex_to_rgb(hex_color)
        return f"rgba({rgb[0]}, {rgb[1]}, {rgb[2]}, {alpha})"
    
    def _darken_color(self, hex_color: str, percentage: int) -> str:
        """降低颜色亮度"""
        rgb = self._hex_to_rgb(hex_color)
        factor = (100 - percentage) / 100
        darkened = tuple(int(c * factor) for c in rgb)
        return self._rgb_to_hex(darkened)
    
    def _lighten_color(self, hex_color: str, percentage: int) -> str:
        """提高颜色亮度"""
        rgb = self._hex_to_rgb(hex_color)
        factor = percentage / 100
        lightened = tuple(min(255, int(c + (255 - c) * factor)) for c in rgb)
        return self._rgb_to_hex(lightened)
    
    def _generate_gradient(self, base_color: str, style: str = "professional", direction: str = "135deg") -> str:
        """生成复杂渐变背景"""
        if style == "professional":
            darker = self._darken_color(base_color, 15)
            return f"linear-gradient({direction}, {base_color} 0%, {darker} 100%)"
        elif style == "vibrant":
            lighter = self._lighten_color(base_color, 20)
            darker = self._darken_color(base_color, 25)
            return f"linear-gradient({direction}, {lighter} 0%, {base_color} 50%, {darker} 100%)"
        elif style == "subtle":
            very_light = self._lighten_color(base_color, 8)
            light = self._lighten_color(base_color, 3)
            return f"linear-gradient({direction}, {very_light} 0%, {light} 100%)"
        else:
            return base_color

    def _create_layered_shadow(self, base_color: str, intensity: str = "medium") -> str:
        """创建多层阴影效果"""
        shadow_color = self._to_rgba(base_color, 0.15)
        ambient_color = self._to_rgba(base_color, 0.08)
        
        shadows = {
            "subtle": f"0 1px 3px {shadow_color}",
            "medium": f"0 4px 15px {shadow_color}, 0 8px 30px {ambient_color}",
            "dramatic": f"0 8px 25px {shadow_color}, 0 15px 45px {ambient_color}, 0 25px 60px {self._to_rgba(base_color, 0.05)}"
        }
        return shadows.get(intensity, shadows["medium"])
    
    def _get_contrast_color(self, hex_color: str) -> str:
        """根据背景色自动选择合适的文字颜色"""
        rgb = self._hex_to_rgb(hex_color)
        # 计算相对亮度
        luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
        return "#ffffff" if luminance < 0.5 else "#000000"

    def generate_style_dna(self, theme_name: str, theme_description: str) -> dict:
        """分步生成风格DNA - 新的主方法"""
        print(f"🎨 开始分步生成风格DNA: {theme_name}")
        
        # 第一步：生成配色方案
        print("📝 步骤1: 生成配色方案")
        color_result = self.color_chain.invoke({
            "theme_name": theme_name,
            "theme_description": theme_description
        })
        colors = self._parse_colors(color_result)
        print(f"✅ 配色方案生成完成: {colors}")
        
        # 第二步：生成字体参数
        print("📝 步骤2: 生成字体参数")
        typography_result = self.typography_chain.invoke({
            "theme_name": theme_name,
            "theme_description": theme_description
        })
        typography = self._parse_typography(typography_result)
        print(f"✅ 字体参数生成完成: {typography}")
        
        # 第三步：组装完整的风格DNA
        print("📝 步骤3: 组装完整风格DNA")
        style_dna = self._build_complete_style_dna(theme_name, colors, typography)
        print(f"✅ 风格DNA生成完成，包含 {len(style_dna)} 个样式配置")
        
        # 返回包含原始输出的结果
        return {
            "style_dna": style_dna,
            "generation_steps": {
                "color_output": color_result,
                "typography_output": typography_result,
                "parsed_colors": colors,
                "parsed_typography": typography
            }
        }

    def _parse_colors(self, color_output: str) -> dict:
        """解析配色方案输出"""
        colors = {
            "primary": "#2c3e50",
            "secondary": "#34495e", 
            "accent": "#3498db",
            "text": "#333333",
            "background": "#ffffff",
            "border": "#e9ecef"
        }
        
        # 使用正则表达式提取颜色
        patterns = {
            "primary": r"主色调:\s*(#[0-9a-fA-F]{6})",
            "secondary": r"辅助色:\s*(#[0-9a-fA-F]{6})",
            "accent": r"强调色:\s*(#[0-9a-fA-F]{6})",
            "text": r"文字色:\s*(#[0-9a-fA-F]{6})",
            "background": r"背景色:\s*(#[0-9a-fA-F]{6})",
            "border": r"边框色:\s*(#[0-9a-fA-F]{6})"
        }
        
        for key, pattern in patterns.items():
            match = re.search(pattern, color_output)
            if match:
                colors[key] = match.group(1)
        
        return colors

    def _parse_typography(self, typography_output: str) -> dict:
        """解析字体参数输出"""
        typography = {
            "title_size": "28px",
            "body_size": "16px", 
            "small_size": "14px",
            "line_height": "1.6",
            "font_weight": "bold",
            "title_align": "center",
            "body_align": "justify"
        }
        
        # 使用正则表达式提取参数
        patterns = {
            "title_size": r"标题字号:\s*(\d+px)",
            "body_size": r"正文字号:\s*(\d+px)",
            "small_size": r"小字号:\s*(\d+px)",
            "line_height": r"行高系数:\s*([0-9.]+)",
            "font_weight": r"字重强调:\s*(normal|bold|\d+)",
            "title_align": r"标题对齐:\s*(left|center|right)",
            "body_align": r"正文对齐:\s*(left|center|justify)"
        }
        
        for key, pattern in patterns.items():
            match = re.search(pattern, typography_output)
            if match:
                typography[key] = match.group(1)
        
        return typography

    def _build_complete_style_dna(self, theme_name: str, colors: dict, typography: dict) -> dict:
        """基于参数组装完整的风格DNA - 生成专业级复杂样式"""
        
        # 系统字体栈
        system_font = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif"
        mono_font = "'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace"
        
        # 基于字体大小计算em值
        title_size_num = int(typography["title_size"][:-2])  # 移除px
        title_em = round(title_size_num / 16, 2)  # 转换为em
        body_size_num = int(typography["body_size"][:-2])
        body_em = round(body_size_num / 16, 2)
        small_size_num = int(typography["small_size"][:-2])
        small_em = round(small_size_num / 16, 2)
        
        # 生成复杂渐变和阴影
        primary_gradient = self._generate_gradient(colors["primary"], "professional")
        secondary_gradient = self._generate_gradient(colors["secondary"], "subtle")
        accent_gradient = self._generate_gradient(colors["accent"], "vibrant")
        primary_shadow = self._create_layered_shadow(colors["primary"], "medium")
        accent_shadow = self._create_layered_shadow(colors["accent"], "medium")
        
        return {
            "theme_name": theme_name,
            
            # 内联样式 - 专业级复杂度
            "strong_styles": {
                "font-weight": "700",
                "color": self._get_contrast_color(colors["accent"]),
                "background": accent_gradient,
                "padding": "0.15em 0.4em",
                "border-radius": "6px",
                "box-shadow": f"0 2px 8px {self._to_rgba(colors['accent'], 0.3)}",
                "font-family": system_font,
                "font-size": "1.02em",
                "letter-spacing": "0.02em"
            },
            "b_styles": {
                "font-weight": "700",
                "color": self._get_contrast_color(colors["accent"]),
                "background": accent_gradient,
                "padding": "0.15em 0.4em", 
                "border-radius": "6px",
                "box-shadow": f"0 2px 8px {self._to_rgba(colors['accent'], 0.3)}",
                "font-family": system_font,
                "font-size": "1.02em",
                "letter-spacing": "0.02em"
            },
            "em_styles": {
                "font-style": "normal",
                "font-weight": "800",
                "color": self._get_contrast_color(colors["secondary"]),
                "background": secondary_gradient,
                "padding": "0.1em 0.3em",
                "border-radius": "4px",
                "box-shadow": f"0 2px 6px {self._to_rgba(colors['secondary'], 0.25)}",
                "font-family": system_font,
                "font-size": "1.01em",
                "letter-spacing": "0.03em"
            },
            "i_styles": {
                "font-style": "normal", 
                "font-weight": "800",
                "color": self._get_contrast_color(colors["secondary"]),
                "background": secondary_gradient,
                "padding": "0.1em 0.3em",
                "border-radius": "4px",
                "box-shadow": f"0 2px 6px {self._to_rgba(colors['secondary'], 0.25)}",
                "font-family": system_font,
                "font-size": "1.01em",
                "letter-spacing": "0.03em"
            },
            "u_styles": {
                "text-decoration": "none",
                "font-weight": "800",
                "color": colors["text"],
                "background": f"linear-gradient(135deg, {colors['accent']} 0%, {self._lighten_color(colors['accent'], 15)} 100%)",
                "background-size": "100% 0.2em",
                "background-position": "0 85%",
                "background-repeat": "no-repeat",
                "padding-bottom": "0.1em",
                "letter-spacing": "0.02em",
                "font-family": system_font
            },
            "code_styles": {
                "font-family": mono_font,
                "font-size": "0.95em",
                "font-weight": "700",
                "background": f"linear-gradient(135deg, {colors['text']} 0%, {self._darken_color(colors['text'], 10)} 100%)",
                "color": self._get_contrast_color(colors['text']),
                "padding": "0.25em 0.5em",
                "border-radius": "8px",
                "letter-spacing": "0.05em",
                "box-shadow": f"0 3px 12px {self._to_rgba(colors['text'], 0.3)}"
            },
            "mark_styles": {
                "background": f"linear-gradient(135deg, {colors['accent']} 0%, {self._lighten_color(colors['accent'], 20)} 100%)",
                "color": self._get_contrast_color(colors['accent']),
                "padding": "0.15em 0.35em",
                "font-weight": "800",
                "border-radius": "6px",
                "letter-spacing": "0.02em",
                "box-shadow": f"0 2px 8px {self._to_rgba(colors['accent'], 0.3)}",
                "font-family": system_font
            },
            "a_styles": {
                "color": colors["accent"],
                "text-decoration": "none",
                "font-weight": "800", 
                "background": f"linear-gradient(135deg, {self._to_rgba(colors['accent'], 0.1)} 0%, {self._to_rgba(colors['accent'], 0.05)} 100%)",
                "padding": "0.1em 0.25em",
                "border-radius": "4px",
                "letter-spacing": "0.01em",
                "border-bottom": f"2px solid {colors['accent']}",
                "font-family": system_font
            },
            "sup_styles": {
                "color": colors["secondary"],
                "font-size": "0.7em",
                "font-weight": "700",
                "vertical-align": "super",
                "background": f"{self._to_rgba(colors['background'], 0.8)}",
                "padding": "0.1em 0.2em",
                "border-radius": "3px",
                "font-family": system_font
            },
            
            # 标题样式 - 专业级复杂视觉效果
            "h1_styles": {
                "font-size": f"{title_em}em",
                "font-weight": "900",
                "line-height": "1.02",
                "color": self._get_contrast_color(colors["primary"]),
                "font-family": system_font,
                "margin": f"{title_em * 0.9}em 0 {title_em * 0.7}em 0",
                "text-align": typography["title_align"],
                "padding": "0.5em 1em",
                "background": primary_gradient,
                "border-radius": "12px",
                "text-transform": "uppercase" if "brutal" in theme_name.lower() else "none",
                "letter-spacing": "0.01em",
                "text-shadow": f"1.5px 1.5px 3px {self._to_rgba('#000000', 0.15)}",
                "box-shadow": primary_shadow,
                "position": "relative"
            },
            "h2_styles": {
                "font-size": f"{round(title_em * 0.84, 2)}em",
                "font-weight": "900",
                "line-height": "1.1",
                "color": self._get_contrast_color(colors["secondary"]),
                "font-family": system_font,
                "margin": f"{title_em * 0.7}em 0 {title_em * 0.55}em 0",
                "padding": "0.8em 1.2em",
                "background": secondary_gradient,
                "border-radius": "12px",
                "text-transform": "uppercase" if "brutal" in theme_name.lower() else "none",
                "letter-spacing": "0.006em",
                "text-shadow": f"1px 1px 2px {self._to_rgba('#000000', 0.15)}",
                "box-shadow": f"0 8px 20px {self._to_rgba(colors['secondary'], 0.2)}",
                "overflow": "hidden"
            },
            "h3_styles": {
                "font-size": f"{round(title_em * 0.72, 2)}em",
                "font-weight": "900",
                "line-height": "1.2",
                "color": self._get_contrast_color(colors["accent"]),
                "font-family": system_font,
                "margin": f"{title_em * 0.6}em 0 {title_em * 0.45}em 0",
                "padding": "0.6em 1.1em",
                "background": accent_gradient,
                "border-radius": "10px",
                "text-transform": "uppercase" if "brutal" in theme_name.lower() else "none",
                "letter-spacing": "0.006em",
                "text-shadow": f"1px 1px 2px {self._to_rgba('#ffffff', 0.25)}",
                "box-shadow": f"0 6px 18px {self._to_rgba(colors['accent'], 0.2)}"
            },
            "h4_styles": {
                "font-size": f"{round(title_em * 0.625, 2)}em",
                "font-weight": "800",
                "line-height": "1.35",
                "color": colors["primary"],
                "font-family": system_font,
                "margin": f"{title_em * 0.5}em 0 {title_em * 0.35}em 0",
                "padding": "0.4em 0.8em",
                "background": f"linear-gradient(135deg, {self._to_rgba(colors['primary'], 0.1)} 0%, {self._to_rgba(colors['primary'], 0.05)} 100%)",
                "border-left": f"4px solid {colors['primary']}",
                "border-radius": "0 8px 8px 0"
            },
            
            # 段落样式 - 增强视觉层次
            "p_styles": {
                "font-size": f"{body_em}em",
                "color": colors["text"],
                "line-height": str(float(typography["line_height"]) + 0.1),
                "font-family": system_font,
                "margin": f"0 0 {body_em * 0.875}em 0",
                "text-align": typography["body_align"],
                "font-weight": "400",
                "letter-spacing": "0.008em"
            },
            
            # 引用样式 - 专业级设计
            "quote_styles": {
                "margin": f"{body_em * 1.125}em 0",
                "padding": "1.6em",
                "background": f"linear-gradient(135deg, {self._to_rgba(colors['accent'], 0.08)} 0%, {self._to_rgba(colors['primary'], 0.05)} 100%)",
                "border-radius": "14px",
                "font-family": system_font,
                "box-shadow": f"0 8px 28px {self._to_rgba(colors['accent'], 0.15)}",
                "overflow": "hidden",
                "color": colors["text"],
                "font-style": "italic",
                "font-size": f"{round(body_em * 1.05, 2)}em",
                "line-height": "1.3",
                "font-weight": "500",
                "text-align": "center",
                "letter-spacing": "0.012em"
            },
            
            # 分隔符 - 创意几何设计
            "delimiter_styles": {
                "display": "flex",
                "align-items": "center",
                "justify-content": "center",
                "margin": f"{body_em * 1.8}em 0",
                "background": f"linear-gradient(90deg, {colors['primary']} 0%, {colors['accent']} 50%, {colors['secondary']} 100%)",
                "height": "4px",
                "width": "70px",
                "border-radius": "2px",
                "box-shadow": f"0 3px 12px {self._to_rgba(colors['primary'], 0.25)}"
            },
            
            # 图片样式 - 专业包装
            "image_styles": {
                "display": "inline-block",
                "margin": f"{body_em * 1.25}em 0",
                "text-align": "center",
                "border-radius": "16px",
                "overflow": "hidden",
                "box-shadow": f"0 10px 35px {self._to_rgba('#000000', 0.12)}",
                "background": f"linear-gradient(135deg, {colors['background']} 0%, {self._lighten_color(colors['background'], 5)} 100%)",
                "padding": "0.5em"
            },
            
            # 代码块样式 - 专业开发风格
            "code_block_styles": {
                "margin": f"{body_em * 1.2}em 0",
                "background": f"linear-gradient(135deg, {colors['text']} 0%, {self._darken_color(colors['text'], 5)} 100%)",
                "border-radius": "14px",
                "overflow": "hidden",
                "box-shadow": f"0 8px 30px {self._to_rgba(colors['text'], 0.25)}",
                "padding": "1em",
                "font-family": mono_font,
                "font-size": f"{small_em}em",
                "line-height": "1.45",
                "color": self._get_contrast_color(colors['text']),
                "font-weight": "600",
                "letter-spacing": "0.015em"
            },
            
            # 列表样式 - 现代视觉设计
            "ordered_list_styles": {
                "margin": f"{body_em}em 0",
                "padding-left": "0",
                "list-style": "none",
                "background": f"linear-gradient(135deg, {self._to_rgba(colors['primary'], 0.04)} 0%, {self._to_rgba(colors['accent'], 0.04)} 100%)",
                "border-radius": "12px",
                "padding": f"{body_em * 1.2}em",
                "box-shadow": f"0 6px 24px {self._to_rgba(colors['primary'], 0.08)}"
            },
            "unordered_list_styles": {
                "margin": f"{body_em}em 0", 
                "padding-left": "0",
                "list-style": "none",
                "background": f"linear-gradient(135deg, {self._to_rgba(colors['secondary'], 0.04)} 0%, {self._to_rgba(colors['accent'], 0.04)} 100%)",
                "border-radius": "12px",
                "padding": f"{body_em * 1.2}em",
                "box-shadow": f"0 6px 24px {self._to_rgba(colors['secondary'], 0.08)}"
            },
            "li_styles": {
                "padding": f"{body_em * 0.6}em 0",
                "line-height": "1.45",
                "color": colors["text"],
                "display": "flex",
                "align-items": "flex-start",
                "font-weight": "700",
                "border-bottom": f"2px solid {self._to_rgba(colors['primary'], 0.08)}",
                "margin-bottom": f"{body_em * 0.4}em",
                "letter-spacing": "0.008em",
                "font-family": system_font
            },
            
            # 容器样式 - 精致包装
            "section_styles": {
                "margin": f"{body_em * 1.25}em 0",
                "padding": f"{body_em * 1.5}em",
                "background": f"linear-gradient(135deg, {colors['background']} 0%, {self._lighten_color(colors['background'], 3)} 100%)",
                "font-family": system_font,
                "border-radius": "16px",
                "box-shadow": f"0 8px 32px {self._to_rgba('#000000', 0.08)}",
                "overflow": "hidden"
            },
            "blockquote_styles": {
                "margin": f"{body_em * 1.5}em 0",
                "padding": f"{body_em * 1.2}em {body_em * 1.8}em",
                "background": f"linear-gradient(135deg, {self._to_rgba(colors['accent'], 0.1)} 0%, {self._to_rgba(colors['secondary'], 0.08)} 100%)",
                "border-left": f"4px solid {colors['accent']}",
                "color": colors["primary"],
                "font-style": "italic",
                "font-family": system_font,
                "border-radius": "0 12px 12px 0",
                "box-shadow": f"0 6px 20px {self._to_rgba(colors['accent'], 0.15)}",
                "font-weight": "500"
            },
            
            # 表格样式 - 现代数据展示
            "table_styles": {
                "width": "100%",
                "margin": f"{body_em * 1.25}em 0",
                "border-collapse": "collapse",
                "font-family": system_font,
                "border-radius": "12px",
                "overflow": "hidden",
                "box-shadow": f"0 8px 25px {self._to_rgba('#000000', 0.1)}"
            },
            "th_styles": {
                "background": primary_gradient,
                "padding": f"{body_em}em",
                "font-weight": "800",
                "color": self._get_contrast_color(colors['primary']),
                "text-align": "center",
                "font-family": system_font,
                "font-size": f"{small_em}em",
                "text-transform": "uppercase",
                "letter-spacing": "0.08em",
                "text-shadow": f"1px 1px 2px {self._to_rgba('#000000', 0.15)}"
            },
            "td_styles": {
                "padding": f"{body_em}em",
                "color": colors["text"],
                "text-align": "left",
                "font-family": system_font,
                "line-height": "1.5",
                "border-top": f"1px solid {self._to_rgba(colors['border'], 0.5)}"
            },
            
            # 分隔线 - 渐变效果
            "hr_styles": {
                "margin": f"{body_em * 2}em 0",
                "border": "none",
                "height": "2px",
                "background": f"linear-gradient(90deg, transparent, {colors['accent']}, transparent)",
                "border-radius": "1px"
            },
            
            # 特殊样式区域 - 专业突出显示
            "highlight_section_styles": {
                "background": f"linear-gradient(135deg, {self._to_rgba(colors['accent'], 0.1)} 0%, {self._to_rgba(colors['primary'], 0.05)} 100%)",
                "padding": f"{body_em * 1.5}em",
                "margin": f"{body_em * 1.5}em 0",
                "border-radius": "16px",
                "border-left": f"5px solid {colors['accent']}",
                "font-family": system_font,
                "box-shadow": f"0 8px 25px {self._to_rgba(colors['accent'], 0.15)}",
                "overflow": "hidden"
            },
            
            # 提示样式 - 保持实用性但增强视觉
            "note_styles": {
                "background": f"linear-gradient(135deg, {self._to_rgba('#27ae60', 0.1)} 0%, {self._to_rgba('#2ecc71', 0.05)} 100%)",
                "color": "#2d5a2d",
                "padding": f"{body_em * 1.2}em",
                "margin": f"{body_em * 1.2}em 0",
                "border-left": "4px solid #27ae60",
                "border-radius": "0 12px 12px 0",
                "font-family": system_font,
                "box-shadow": f"0 6px 20px {self._to_rgba('#27ae60', 0.15)}"
            },
            "warning_styles": {
                "background": f"linear-gradient(135deg, {self._to_rgba('#ffc107', 0.1)} 0%, {self._to_rgba('#ffad3d', 0.05)} 100%)",
                "color": "#856404",
                "padding": f"{body_em * 1.2}em",
                "margin": f"{body_em * 1.2}em 0",
                "border-left": "4px solid #ffc107",
                "border-radius": "0 12px 12px 0",
                "font-family": system_font,
                "box-shadow": f"0 6px 20px {self._to_rgba('#ffc107', 0.15)}"
            },
            "danger_styles": {
                "background": f"linear-gradient(135deg, {self._to_rgba('#dc3545', 0.1)} 0%, {self._to_rgba('#c82333', 0.05)} 100%)",
                "color": "#721c24",
                "padding": f"{body_em * 1.2}em",
                "margin": f"{body_em * 1.2}em 0",
                "border-left": "4px solid #dc3545",
                "border-radius": "0 12px 12px 0",
                "font-family": system_font,
                "box-shadow": f"0 6px 20px {self._to_rgba('#dc3545', 0.15)}"
            }
        }



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