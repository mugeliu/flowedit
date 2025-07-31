"""
自定义异常类
"""


class FlowEditException(Exception):
    """FlowEdit基础异常类"""
    pass


class ValidationError(FlowEditException):
    """验证错误"""
    pass


class AIServiceError(FlowEditException):
    """AI服务错误"""
    pass


class ModelNotAvailableError(AIServiceError):
    """模型不可用错误"""
    pass


class ContentTooLongError(ValidationError):
    """内容过长错误"""
    pass


class InvalidContentTypeError(ValidationError):
    """无效的内容类型错误"""
    pass