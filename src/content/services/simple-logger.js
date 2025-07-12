/**
 * 简化的日志服务
 * 专注于实用性，避免过度设计
 */

import { applyDebugConfig } from "../config/debug-config.js";

/**
 * 日志级别
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
};

/**
 * 简化的日志器类
 */
class SimpleLogger {
  constructor() {
    this.currentLevel = LogLevel.INFO;
    this.prefix = "[FlowEdit]";

    // 根据环境自动设置
    this.setEnvironment();
  }

  /**
   * 自动设置环境
   */
  setEnvironment() {
    // 检查是否是调试模式（只通过localStorage）
    const isDev = localStorage.getItem("flowedit_debug") === "true";

    if (isDev) {
      this.currentLevel = LogLevel.DEBUG;
    } else if (window.location?.hostname === "mp.weixin.qq.com") {
      this.currentLevel = LogLevel.WARN; // 生产环境只显示警告和错误
    } else {
      this.currentLevel = LogLevel.INFO; // 本地开发显示更多
    }
  }

  /**
   * 输出日志
   */
  log(level, module, message, ...args) {
    if (level < this.currentLevel) return;

    const timestamp = new Date().toLocaleTimeString();
    const levelNames = ["DEBUG", "INFO", "WARN", "ERROR"];
    const levelName = levelNames[level];
    const moduleTag = module ? `[${module}]` : "";

    const fullMessage = `${this.prefix} ${timestamp} [${levelName}] ${moduleTag} ${message}`;

    // 安全地输出参数，避免复杂对象导致的错误
    const safeArgs = args.map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return "[Object]";
        }
      }
      return arg;
    });

    // 使用对应的console方法
    try {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(fullMessage, ...safeArgs);
          break;
        case LogLevel.INFO:
          console.info(fullMessage, ...safeArgs);
          break;
        case LogLevel.WARN:
          console.warn(fullMessage, ...safeArgs);
          break;
        case LogLevel.ERROR:
          console.error(fullMessage, ...safeArgs);
          break;
      }
    } catch (e) {
      // 如果日志输出失败，使用最基本的console.log
      console.log(`${fullMessage} [日志输出错误: ${e.message}]`);
    }
  }

  debug(module, message, ...args) {
    this.log(LogLevel.DEBUG, module, message, ...args);
  }

  info(module, message, ...args) {
    this.log(LogLevel.INFO, module, message, ...args);
  }

  warn(module, message, ...args) {
    this.log(LogLevel.WARN, module, message, ...args);
  }

  error(module, message, ...args) {
    this.log(LogLevel.ERROR, module, message, ...args);
  }

  /**
   * 创建模块专用日志器
   */
  createModuleLogger(moduleName) {
    return {
      debug: (message, ...args) => this.debug(moduleName, message, ...args),
      info: (message, ...args) => this.info(moduleName, message, ...args),
      warn: (message, ...args) => this.warn(moduleName, message, ...args),
      error: (message, ...args) => this.error(moduleName, message, ...args),
    };
  }
}

// 全局实例
export const logger = new SimpleLogger();

// 应用配置文件中的调试设置
applyDebugConfig(logger);

// 便捷函数
export const createLogger = (moduleName) =>
  logger.createModuleLogger(moduleName);

// 简单的运行时日志控制（不需要刷新页面）
export const setDebugMode = (enabled) => {
  if (enabled) {
    logger.currentLevel = LogLevel.DEBUG;
    localStorage.setItem("flowedit_debug", "true");
    console.log("[FlowEdit] 调试模式已开启");
  } else {
    logger.setEnvironment(); // 重新设置环境默认值
    localStorage.removeItem("flowedit_debug");
    console.log("[FlowEdit] 调试模式已关闭");
  }
};

// 显示当前状态
if (typeof window !== "undefined") {
  const isDev = localStorage.getItem("flowedit_debug") === "true";
  const levelNames = ["DEBUG", "INFO", "WARN", "ERROR", "SILENT"];
  const currentLevelName = levelNames[logger.currentLevel] || "UNKNOWN";
  console.log(
    `[FlowEdit] 当前日志级别: ${currentLevelName} | 调试模式: ${
      isDev ? "开启" : "关闭"
    }`
  );
}

export default logger;
