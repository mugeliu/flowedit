/**
 * 调试配置
 * 修改这里的设置来控制日志输出
 */

/**
 * 调试模式配置
 * 设置为 true 开启详细日志和全局错误监听，false 关闭调试功能
 * 生产环境建议设置为 false
 */
export const DEBUG_MODE = false;

/**
 * 强制日志级别 (可选)
 * 如果设置了此值，将覆盖自动环境检测
 * 可选值: 'DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT'
 * 设置为 null 则使用自动检测
 */
export const FORCE_LOG_LEVEL = null;

/**
 * 模块级别的日志控制
 * 可以为特定模块设置不同的日志级别
 */
export const MODULE_LOG_LEVELS = {
  // 示例：
  // 'Main': 'DEBUG',
  // 'PluginRegistry': 'WARN',
  // 'SmartEditorManager': 'INFO'
};

/**
 * 应用调试配置到日志系统
 * 这个函数会在日志系统初始化时自动调用
 */
export function applyDebugConfig(logger) {
  if (DEBUG_MODE) {
    // 开启调试模式
    logger.setMode && logger.setMode("debug");
    logger.currentLevel = 0; // DEBUG级别
    console.log("[FlowEdit] 通过配置文件开启调试模式");
  }

  if (FORCE_LOG_LEVEL) {
    const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 };
    if (levels[FORCE_LOG_LEVEL] !== undefined) {
      logger.currentLevel = levels[FORCE_LOG_LEVEL];
      console.log(`[FlowEdit] 强制设置日志级别为: ${FORCE_LOG_LEVEL}`);
    }
  }
}
