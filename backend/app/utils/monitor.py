import logging
import time
from datetime import datetime
from functools import wraps
from typing import Dict, Any
import json

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('style_generation.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('style_generation')


class WorkflowMonitor:
    def __init__(self):
        self.execution_stats = {
            'total_executions': 0,
            'success_count': 0,
            'error_count': 0,
            'workflow_types': {},
            'avg_duration': 0,
            'last_executions': []
        }
    
    def log_execution(self, workflow_type: str, duration: float, status: str, error_msg: str = None):
        """记录工作流执行情况"""
        self.execution_stats['total_executions'] += 1
        
        if status == 'success':
            self.execution_stats['success_count'] += 1
        else:
            self.execution_stats['error_count'] += 1
        
        # 记录各类型工作流统计
        if workflow_type not in self.execution_stats['workflow_types']:
            self.execution_stats['workflow_types'][workflow_type] = {
                'count': 0,
                'success': 0,
                'error': 0,
                'avg_duration': 0
            }
        
        type_stats = self.execution_stats['workflow_types'][workflow_type]
        type_stats['count'] += 1
        type_stats[status] += 1
        type_stats['avg_duration'] = (type_stats['avg_duration'] * (type_stats['count'] - 1) + duration) / type_stats['count']
        
        # 更新总体平均时长
        self.execution_stats['avg_duration'] = (
            self.execution_stats['avg_duration'] * (self.execution_stats['total_executions'] - 1) + duration
        ) / self.execution_stats['total_executions']
        
        # 记录最近执行记录（保留最近10条）
        execution_record = {
            'timestamp': datetime.now().isoformat(),
            'workflow_type': workflow_type,
            'duration': duration,
            'status': status,
            'error_msg': error_msg
        }
        
        self.execution_stats['last_executions'].append(execution_record)
        if len(self.execution_stats['last_executions']) > 10:
            self.execution_stats['last_executions'].pop(0)
        
        # 记录日志
        log_msg = f"工作流执行: {workflow_type}, 耗时: {duration:.2f}s, 状态: {status}"
        if error_msg:
            log_msg += f", 错误: {error_msg}"
        
        if status == 'success':
            logger.info(log_msg)
        else:
            logger.error(log_msg)
    
    def get_stats(self) -> Dict[str, Any]:
        """获取执行统计信息"""
        return self.execution_stats.copy()


# 全局监控实例
workflow_monitor = WorkflowMonitor()


def monitor_workflow(func):
    """工作流监控装饰器"""
    @wraps(func)
    def wrapper(workflow_type_str: str, initial_state: Dict, *args, **kwargs):
        start_time = time.time()
        status = 'success'
        error_msg = None
        
        try:
            result = func(workflow_type_str, initial_state, *args, **kwargs)
            return result
        except Exception as e:
            status = 'error'
            error_msg = str(e)
            logger.exception(f"工作流执行失败: {workflow_type_str}")
            raise
        finally:
            duration = time.time() - start_time
            workflow_monitor.log_execution(workflow_type_str, duration, status, error_msg)
    
    return wrapper