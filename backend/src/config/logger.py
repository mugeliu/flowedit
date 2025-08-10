import logging
import sys
import os
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime
from .settings import settings


class ColoredFormatter(logging.Formatter):
    """带颜色的日志格式器"""
    
    # ANSI颜色代码
    COLORS = {
        'DEBUG': '\033[36m',      # 青色
        'INFO': '\033[32m',       # 绿色
        'WARNING': '\033[33m',    # 黄色
        'ERROR': '\033[31m',      # 红色
        'CRITICAL': '\033[35m',   # 紫色
        'RESET': '\033[0m'        # 重置
    }
    
    def format(self, record):
        # 添加颜色
        if hasattr(record, 'levelname'):
            color = self.COLORS.get(record.levelname, '')
            reset = self.COLORS['RESET']
            record.levelname = f"{color}{record.levelname}{reset}"
        
        return super().format(record)


class StructuredLogger:
    """结构化日志器，支持上下文信息和性能指标"""
    
    def __init__(self, name: str, context: Optional[Dict[str, Any]] = None):
        self.name = name
        self.context = context or {}
        self.logger = logging.getLogger(name)
        self.session_start_time = datetime.now()
    
    def _format_message(self, message: str, extra_context: Optional[Dict[str, Any]] = None) -> str:
        """格式化消息，添加上下文信息"""
        combined_context = {**self.context}
        if extra_context:
            combined_context.update(extra_context)
        
        if combined_context:
            context_parts = []
            for k, v in combined_context.items():
                if isinstance(v, (str, int, float, bool)):
                    context_parts.append(f"{k}={v}")
            if context_parts:
                context_str = " | ".join(context_parts)
                return f"[{context_str}] {message}"
        return message
    
    def _log_with_context(self, level: str, message: str, extra_context: Optional[Dict[str, Any]] = None, **kwargs):
        """带上下文信息的日志记录"""
        formatted_msg = self._format_message(message, extra_context)
        extra = kwargs.get('extra', {})
        extra.update({
            'logger_name': self.name,
            'session_duration': (datetime.now() - self.session_start_time).total_seconds()
        })
        if self.context:
            extra.update(self.context)
        if extra_context:
            extra.update(extra_context)
        kwargs['extra'] = extra
        
        log_method = getattr(self.logger, level)
        log_method(formatted_msg, **kwargs)
    
    def debug(self, message: str, extra_context: Optional[Dict[str, Any]] = None, **kwargs):
        self._log_with_context('debug', message, extra_context, **kwargs)
    
    def info(self, message: str, extra_context: Optional[Dict[str, Any]] = None, **kwargs):
        self._log_with_context('info', message, extra_context, **kwargs)
    
    def warning(self, message: str, extra_context: Optional[Dict[str, Any]] = None, **kwargs):
        self._log_with_context('warning', message, extra_context, **kwargs)
    
    def error(self, message: str, extra_context: Optional[Dict[str, Any]] = None, **kwargs):
        self._log_with_context('error', message, extra_context, **kwargs)
    
    def critical(self, message: str, extra_context: Optional[Dict[str, Any]] = None, **kwargs):
        self._log_with_context('critical', message, extra_context, **kwargs)
    
    def execution_start(self, operation: str, **context):
        """记录操作开始"""
        self.info(f"Starting {operation}", extra_context={'operation': operation, **context})
    
    def execution_end(self, operation: str, success: bool = True, duration: Optional[float] = None, **context):
        """记录操作结束"""
        status = "Completed" if success else "Failed"
        extra_ctx = {'operation': operation, 'success': success, **context}
        if duration is not None:
            extra_ctx['duration_seconds'] = duration
            self.info(f"{status} {operation} in {duration:.3f}s", extra_context=extra_ctx)
        else:
            self.info(f"{status} {operation}", extra_context=extra_ctx)
    
    def performance_metric(self, metric_name: str, value: float, unit: str = "", **context):
        """记录性能指标"""
        self.info(f"{metric_name}: {value:.3f}{unit}", 
                 extra_context={'metric_name': metric_name, 'metric_value': value, 'metric_unit': unit, **context})
    
    def with_context(self, **context) -> 'StructuredLogger':
        """创建带有额外上下文的日志器实例"""
        new_context = {**self.context, **context}
        return StructuredLogger(self.name, new_context)


class AgentLogger(StructuredLogger):
    """Agent专用日志器，继承结构化日志器"""
    
    def __init__(self, agent_name: str, task_id: Optional[str] = None):
        context = {"agent": agent_name}
        if task_id:
            context["task_id"] = task_id[:8]
        super().__init__(f"agent.{agent_name}", context)


class DatabaseLogger(StructuredLogger):
    """数据库操作专用日志器"""
    
    def __init__(self):
        super().__init__("database")
    
    def query_executed(self, query: str, params: tuple = None, execution_time: float = None):
        """记录数据库查询执行"""
        query_summary = query.strip().split('\n')[0][:100]
        context = {'query_type': query_summary.split()[0].upper()}
        if params:
            context['param_count'] = len(params)
        if execution_time:
            context['execution_time'] = execution_time
        
        self.debug(f"Executed query: {query_summary}", extra_context=context)
    
    def connection_event(self, event: str, **context):
        """记录数据库连接事件"""
        self.debug(f"Database {event}", extra_context={'event': event, **context})


class WorkflowLogger(StructuredLogger):
    """工作流专用日志器"""
    
    def __init__(self, workflow_name: str, task_id: Optional[str] = None):
        context = {"workflow": workflow_name}
        if task_id:
            context["task_id"] = task_id[:8]
        super().__init__(f"workflow.{workflow_name}", context)
    
    def step_start(self, step_name: str, **context):
        """记录工作流步骤开始"""
        self.info(f"Starting step: {step_name}", extra_context={'step': step_name, **context})
    
    def step_end(self, step_name: str, success: bool = True, duration: Optional[float] = None, **context):
        """记录工作流步骤结束"""
        status = "Completed" if success else "Failed"
        extra_ctx = {'step': step_name, 'success': success, **context}
        if duration:
            extra_ctx['duration_seconds'] = duration
            self.info(f"{status} Step {step_name} completed in {duration:.3f}s", extra_context=extra_ctx)
        else:
            self.info(f"{status} Step {step_name} completed", extra_context=extra_ctx)


def setup_logging():
    """配置增强的日志系统"""
    
    # 创建logs目录
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # 根日志器配置
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.log_level.upper()))
    
    # 清除现有处理器，避免重复配置
    root_logger.handlers.clear()
    
    # 控制台处理器（带颜色，简洁格式）
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.WARNING)  # 只显示警告和错误
    console_formatter = ColoredFormatter(
        fmt='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt='%H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # API专用控制台处理器（只显示关键API操作）
    api_console_handler = logging.StreamHandler(sys.stdout)
    api_console_handler.setLevel(logging.INFO)
    api_console_formatter = ColoredFormatter(
        fmt='API %(asctime)s | %(message)s',
        datefmt='%H:%M:%S'
    )
    api_console_handler.setFormatter(api_console_formatter)
    
    # 为API路由添加专用处理器
    api_logger = logging.getLogger("api.routes")
    api_logger.addHandler(api_console_handler)
    api_logger.setLevel(logging.INFO)
    
    # 为工作流添加专用控制台处理器
    workflow_console_handler = logging.StreamHandler(sys.stdout)
    workflow_console_handler.setLevel(logging.INFO)
    workflow_console_formatter = ColoredFormatter(
        fmt='WORKFLOW %(asctime)s | %(message)s',
        datefmt='%H:%M:%S'
    )
    workflow_console_handler.setFormatter(workflow_console_formatter)
    
    workflow_logger = logging.getLogger("workflow")
    workflow_logger.addHandler(workflow_console_handler)
    workflow_logger.setLevel(logging.INFO)
    
    # 文件处理器（详细格式，包含更多调试信息）
    file_handler = logging.FileHandler(log_dir / "backend.log", encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        fmt='%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_formatter)
    root_logger.addHandler(file_handler)
    
    # Agent专用日志文件
    agent_handler = logging.FileHandler(log_dir / "agents.log", encoding='utf-8')
    agent_handler.setLevel(logging.DEBUG)
    agent_handler.setFormatter(file_formatter)
    
    # 为agent日志器添加专用处理器
    agent_logger = logging.getLogger("agent")
    agent_logger.addHandler(agent_handler)
    agent_logger.setLevel(logging.DEBUG)
    agent_logger.propagate = True  # 同时写入主日志
    
    # 工作流专用日志文件
    workflow_handler = logging.FileHandler(log_dir / "workflows.log", encoding='utf-8')
    workflow_handler.setLevel(logging.DEBUG)
    workflow_handler.setFormatter(file_formatter)
    
    workflow_logger = logging.getLogger("workflow")
    workflow_logger.addHandler(workflow_handler)
    workflow_logger.setLevel(logging.DEBUG)
    workflow_logger.propagate = True
    
    # 数据库专用日志文件
    db_handler = logging.FileHandler(log_dir / "database.log", encoding='utf-8')
    db_handler.setLevel(logging.DEBUG)
    db_handler.setFormatter(file_formatter)
    
    db_logger = logging.getLogger("database")
    db_logger.addHandler(db_handler)
    db_logger.setLevel(logging.DEBUG)
    db_logger.propagate = True
    
    # 错误日志文件（所有严重错误）
    error_handler = logging.FileHandler(log_dir / "errors.log", encoding='utf-8')
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)
    root_logger.addHandler(error_handler)
    
    # 禁用或降低第三方库的日志级别
    third_party_loggers = {
        "httpx": logging.WARNING,
        "urllib3": logging.WARNING,
        "requests": logging.WARNING,
        "langchain": logging.INFO,
        "langchain_core": logging.WARNING,
        "langchain_openai": logging.WARNING,
        "openai": logging.WARNING,
        "sqlite3": logging.WARNING,
        "asyncio": logging.WARNING
    }
    
    for logger_name, level in third_party_loggers.items():
        logging.getLogger(logger_name).setLevel(level)
    
    # 记录日志系统初始化
    logging.info("Enhanced logging system initialized")
    logging.info(f"Log directory: {log_dir.absolute()}")
    logging.info(f"Log level: {settings.log_level.upper()}")


def get_logger(name: str, context: Optional[Dict[str, Any]] = None) -> StructuredLogger:
    """获取结构化日志器"""
    return StructuredLogger(name, context)


def get_agent_logger(agent_name: str, task_id: Optional[str] = None) -> AgentLogger:
    """获取Agent专用日志器"""
    return AgentLogger(agent_name, task_id)


def get_database_logger() -> DatabaseLogger:
    """获取数据库专用日志器"""
    return DatabaseLogger()


def get_workflow_logger(workflow_name: str, task_id: Optional[str] = None) -> WorkflowLogger:
    """获取工作流专用日志器"""
    return WorkflowLogger(workflow_name, task_id)


# 在模块加载时初始化日志系统
if not hasattr(logging.getLogger(), '_logging_configured'):
    setup_logging()
    logging.getLogger()._logging_configured = True