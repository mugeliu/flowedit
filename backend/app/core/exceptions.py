"""
自定义异常类定义
"""


class StyleGenerationError(Exception):
    """风格生成相关错误"""
    def __init__(self, message: str, code: str = "STYLE_GENERATION_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class WeChatComplianceError(Exception):
    """微信平台合规性错误"""
    def __init__(self, message: str, errors: list = None):
        self.message = message
        self.errors = errors or []
        super().__init__(self.message)


class ContentParsingError(Exception):
    """内容解析错误"""
    def __init__(self, message: str, original_content: str = ""):
        self.message = message
        self.original_content = original_content
        super().__init__(self.message)


class ConfigurationError(Exception):
    """配置错误"""
    def __init__(self, message: str, missing_config: str = ""):
        self.message = message
        self.missing_config = missing_config
        super().__init__(self.message)