from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers import PydanticOutputParser
from langchain.schema.output_parser import OutputParserException
from ..models.schemas import ContentStructure


class ContentParserChain:
    def __init__(self, llm):
        self.parser = PydanticOutputParser(pydantic_object=ContentStructure)
        
        self.prompt = PromptTemplate(
            template="""
            分析以下文本内容的层次结构，识别标题、段落、强调文本、列表等元素：

            原始内容：
            {raw_content}

            请按照以下结构输出：
            {format_instructions}

            要求：
            1. 准确识别内容层次（H1、H2、正文、强调、列表等）
            2. 保持原始内容的语义完整性
            3. 为每个元素分配合适的重要级别
            """,
            input_variables=["raw_content"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )
        
        self.chain = LLMChain(llm=llm, prompt=self.prompt, output_parser=self.parser)


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
        
        self.chain = LLMChain(llm=llm, prompt=self.prompt)


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
        
        self.chain = LLMChain(llm=llm, prompt=self.prompt)