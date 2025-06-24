/**
 * 配置工具函数
 * 提供纯函数式的配置管理，移除类的抽象层
 */

/**
 * 获取默认配置
 * @returns {Object} 默认配置对象
 */
export function getDefaultConfig() {
  return {
    templates: {
      // 模板配置将从 TemplateManager 获取
    },
    processors: {
      // 处理器配置
      header: { enabled: true },
      paragraph: { enabled: true },
      list: { enabled: true },
      quote: { enabled: true },
      code: { enabled: true },
      raw: { enabled: true },
      delimiter: { enabled: true },
      image: { enabled: true },
    },
    options: {
      // 全局选项
      skipEmpty: true,
      wrapInContainer: true,
      includeMetadata: false,
      strictMode: false,
    },
  };
}

/**
 * 合并配置对象
 * @param {Object} userConfig 用户配置
 * @returns {Object} 合并后的配置
 */
export function mergeConfig(userConfig = {}) {
  const defaultConfig = getDefaultConfig();
  return {
    ...defaultConfig,
    ...userConfig,
    // 深度合并 processors 和 options
    processors: { ...defaultConfig.processors, ...userConfig.processors },
    options: { ...defaultConfig.options, ...userConfig.options },
    templates: { ...defaultConfig.templates, ...userConfig.templates },
  };
}

/**
 * 创建配置对象
 * @param {Object} userConfig 用户配置（可选）
 * @returns {Object} 最终配置对象
 */
export function createConfig(userConfig) {
  // 如果传入配置则使用传入的配置，否则使用默认配置
  return userConfig ? mergeConfig(userConfig) : getDefaultConfig();
}

// 默认导出创建配置函数
export default createConfig;
