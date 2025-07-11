/**
 * 简化的错误处理机制
 * 去除复杂的策略模式，专注于基本的错误捕获和日志记录
 */

import { createLogger } from './simple-logger.js';

const logger = createLogger('ErrorHandler');

/**
 * 简化的错误处理器
 */
class SimpleErrorHandler {
  constructor() {
    this.setupGlobalHandlers();
  }

  /**
   * 设置全局错误监听
   */
  setupGlobalHandlers() {
    // 未捕获的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      logger.error(`未处理的Promise错误: ${event.reason}`);
    });

    // 未捕获的JavaScript错误
    window.addEventListener('error', (event) => {
      logger.error(`JavaScript错误: ${event.message}`, {
        file: event.filename,
        line: event.lineno,
        col: event.colno
      });
    });
  }

  /**
   * 处理错误
   * @param {Error|string} error - 错误对象或消息
   * @param {string} context - 错误上下文
   */
  handle(error, context = '') {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : '';
    
    logger.error(`${context ? `[${context}] ` : ''}${message}`, stack ? { stack } : {});
  }

  /**
   * 包装异步函数，自动捕获错误
   */
  wrapAsync(fn, context = '') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error, context);
        throw error; // 重新抛出，让调用方决定如何处理
      }
    };
  }

  /**
   * 包装同步函数，自动捕获错误
   */
  wrapSync(fn, context = '') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error, context);
        throw error;
      }
    };
  }

  /**
   * 创建模块专用错误处理器
   */
  createModuleHandler(moduleName) {
    return {
      handle: (error) => this.handle(error, moduleName),
      wrapAsync: (fn) => this.wrapAsync(fn, moduleName),
      wrapSync: (fn) => this.wrapSync(fn, moduleName)
    };
  }
}

// 全局实例
export const errorHandler = new SimpleErrorHandler();

// 便捷函数
export const createErrorHandler = (moduleName) => errorHandler.createModuleHandler(moduleName);
export const handleError = (error, context) => errorHandler.handle(error, context);

export default errorHandler;