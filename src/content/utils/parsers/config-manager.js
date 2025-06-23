/**
 * ConfigManager 类
 * 配置集中化管理，统一管理模板、处理器和全局选项
 * 提供配置验证、合并和更新功能
 */

class ConfigManager {
  /**
   * 创建配置管理器实例
   * @param {Object} initialConfig 初始配置
   */
  constructor(initialConfig = {}) {
    this.config = this.mergeWithDefaults(initialConfig);
    this.validators = new Map();
    this.setupDefaultValidators();
  }

  /**
   * 获取默认配置
   * @returns {Object} 默认配置对象
   */
  getDefaultConfig() {
    return {
      templates: {
        // 模板配置将从 TemplateManager 获取
      },
      processors: {
        // 处理器配置
        header: { enabled: true, options: {} },
        paragraph: { enabled: true, options: {} },
        list: { enabled: true, options: {} },
        quote: { enabled: true, options: {} },
        code: { enabled: true, options: {} },
        raw: { enabled: true, options: {} },
        delimiter: { enabled: true, options: {} },
        image: { enabled: true, options: {} }
      },
      options: {
        // 全局选项
        skipEmpty: true,
        wrapInContainer: false,
        includeMetadata: false,
        enableLogging: false,
        strictMode: false,
        fallbackProcessor: 'raw',
        maxBlockSize: 1000000, // 1MB
        timeout: 5000, // 5秒
        encoding: 'utf-8'
      }
    };
  }

  /**
   * 合并配置与默认值
   * @param {Object} userConfig 用户配置
   * @returns {Object} 合并后的配置
   */
  mergeWithDefaults(userConfig) {
    const defaultConfig = this.getDefaultConfig();
    return this.deepMerge(defaultConfig, userConfig);
  }

  /**
   * 深度合并对象
   * @param {Object} target 目标对象
   * @param {Object} source 源对象
   * @returns {Object} 合并后的对象
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (this.isObject(source[key]) && this.isObject(target[key])) {
          result[key] = this.deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  /**
   * 检查是否为对象
   * @param {*} item 要检查的项
   * @returns {boolean} 是否为对象
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * 设置配置验证器
   */
  setupDefaultValidators() {
    // 模板配置验证器
    this.validators.set('templates', (templates) => {
      if (!this.isObject(templates)) {
        return { valid: false, error: '模板配置必须是对象' };
      }
      return { valid: true };
    });

    // 处理器配置验证器
    this.validators.set('processors', (processors) => {
      if (!this.isObject(processors)) {
        return { valid: false, error: '处理器配置必须是对象' };
      }
      
      for (const [type, config] of Object.entries(processors)) {
        if (!this.isObject(config)) {
          return { valid: false, error: `处理器 ${type} 的配置必须是对象` };
        }
        
        if (typeof config.enabled !== 'boolean') {
          return { valid: false, error: `处理器 ${type} 必须有 enabled 布尔属性` };
        }
      }
      
      return { valid: true };
    });

    // 全局选项验证器
    this.validators.set('options', (options) => {
      if (!this.isObject(options)) {
        return { valid: false, error: '全局选项必须是对象' };
      }
      
      const booleanOptions = ['skipEmpty', 'wrapInContainer', 'includeMetadata', 'enableLogging', 'strictMode'];
      const numberOptions = ['maxBlockSize', 'timeout'];
      const stringOptions = ['fallbackProcessor', 'encoding'];
      
      for (const option of booleanOptions) {
        if (options.hasOwnProperty(option) && typeof options[option] !== 'boolean') {
          return { valid: false, error: `选项 ${option} 必须是布尔值` };
        }
      }
      
      for (const option of numberOptions) {
        if (options.hasOwnProperty(option) && typeof options[option] !== 'number') {
          return { valid: false, error: `选项 ${option} 必须是数字` };
        }
      }
      
      for (const option of stringOptions) {
        if (options.hasOwnProperty(option) && typeof options[option] !== 'string') {
          return { valid: false, error: `选项 ${option} 必须是字符串` };
        }
      }
      
      return { valid: true };
    });
  }

  /**
   * 验证配置
   * @param {Object} config 要验证的配置
   * @returns {Object} 验证结果
   */
  validateConfig(config) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (!this.isObject(config)) {
      result.valid = false;
      result.errors.push('配置必须是对象');
      return result;
    }

    // 验证各个部分
    for (const [section, validator] of this.validators) {
      if (config.hasOwnProperty(section)) {
        const validation = validator(config[section]);
        if (!validation.valid) {
          result.valid = false;
          result.errors.push(`${section}: ${validation.error}`);
        }
      }
    }

    // 检查未知的配置项
    const knownSections = ['templates', 'processors', 'options'];
    for (const section in config) {
      if (!knownSections.includes(section)) {
        result.warnings.push(`未知的配置项: ${section}`);
      }
    }

    return result;
  }

  /**
   * 更新配置
   * @param {Object} newConfig 新配置
   * @param {boolean} validate 是否验证配置
   * @returns {Object} 更新结果
   */
  updateConfig(newConfig, validate = true) {
    if (validate) {
      const validation = this.validateConfig(newConfig);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings
        };
      }
    }

    const oldConfig = { ...this.config };
    this.config = this.mergeWithDefaults(newConfig);

    return {
      success: true,
      oldConfig,
      newConfig: this.config,
      errors: [],
      warnings: validate ? this.validateConfig(newConfig).warnings : []
    };
  }

  /**
   * 获取当前配置
   * @returns {Object} 当前配置
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * 获取特定部分的配置
   * @param {string} section 配置部分名称
   * @returns {*} 配置值
   */
  getSection(section) {
    return this.config[section] ? { ...this.config[section] } : undefined;
  }

  /**
   * 设置特定部分的配置
   * @param {string} section 配置部分名称
   * @param {*} value 配置值
   * @param {boolean} validate 是否验证
   * @returns {Object} 设置结果
   */
  setSection(section, value, validate = true) {
    if (validate && this.validators.has(section)) {
      const validation = this.validators.get(section)(value);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }
    }

    const oldValue = this.config[section];
    this.config[section] = value;

    return {
      success: true,
      oldValue,
      newValue: value
    };
  }

  /**
   * 获取模板配置
   * @returns {Object} 模板配置
   */
  getTemplates() {
    return this.getSection('templates');
  }

  /**
   * 设置模板配置
   * @param {Object} templates 模板配置
   * @returns {Object} 设置结果
   */
  setTemplates(templates) {
    return this.setSection('templates', templates);
  }

  /**
   * 获取处理器配置
   * @returns {Object} 处理器配置
   */
  getProcessors() {
    return this.getSection('processors');
  }

  /**
   * 设置处理器配置
   * @param {Object} processors 处理器配置
   * @returns {Object} 设置结果
   */
  setProcessors(processors) {
    return this.setSection('processors', processors);
  }

  /**
   * 获取全局选项
   * @returns {Object} 全局选项
   */
  getOptions() {
    return this.getSection('options');
  }

  /**
   * 设置全局选项
   * @param {Object} options 全局选项
   * @returns {Object} 设置结果
   */
  setOptions(options) {
    return this.setSection('options', options);
  }

  /**
   * 获取特定选项的值
   * @param {string} optionName 选项名称
   * @param {*} defaultValue 默认值
   * @returns {*} 选项值
   */
  getOption(optionName, defaultValue = undefined) {
    const options = this.getOptions();
    return options && options.hasOwnProperty(optionName) ? options[optionName] : defaultValue;
  }

  /**
   * 设置特定选项的值
   * @param {string} optionName 选项名称
   * @param {*} value 选项值
   * @returns {Object} 设置结果
   */
  setOption(optionName, value) {
    const options = this.getOptions() || {};
    options[optionName] = value;
    return this.setOptions(options);
  }

  /**
   * 检查处理器是否启用
   * @param {string} processorType 处理器类型
   * @returns {boolean} 是否启用
   */
  isProcessorEnabled(processorType) {
    const processors = this.getProcessors();
    return processors && processors[processorType] && processors[processorType].enabled;
  }

  /**
   * 启用/禁用处理器
   * @param {string} processorType 处理器类型
   * @param {boolean} enabled 是否启用
   * @returns {Object} 设置结果
   */
  setProcessorEnabled(processorType, enabled) {
    const processors = this.getProcessors() || {};
    if (!processors[processorType]) {
      processors[processorType] = { enabled, options: {} };
    } else {
      processors[processorType].enabled = enabled;
    }
    return this.setProcessors(processors);
  }

  /**
   * 获取处理器选项
   * @param {string} processorType 处理器类型
   * @returns {Object} 处理器选项
   */
  getProcessorOptions(processorType) {
    const processors = this.getProcessors();
    return processors && processors[processorType] && processors[processorType].options || {};
  }

  /**
   * 设置处理器选项
   * @param {string} processorType 处理器类型
   * @param {Object} options 处理器选项
   * @returns {Object} 设置结果
   */
  setProcessorOptions(processorType, options) {
    const processors = this.getProcessors() || {};
    if (!processors[processorType]) {
      processors[processorType] = { enabled: true, options };
    } else {
      processors[processorType].options = options;
    }
    return this.setProcessors(processors);
  }

  /**
   * 重置配置到默认值
   * @returns {Object} 重置结果
   */
  reset() {
    const oldConfig = { ...this.config };
    this.config = this.getDefaultConfig();
    
    return {
      success: true,
      oldConfig,
      newConfig: this.config
    };
  }

  /**
   * 导出配置为JSON字符串
   * @param {boolean} pretty 是否格式化
   * @returns {string} JSON字符串
   */
  exportConfig(pretty = false) {
    return JSON.stringify(this.config, null, pretty ? 2 : 0);
  }

  /**
   * 从JSON字符串导入配置
   * @param {string} jsonString JSON字符串
   * @param {boolean} validate 是否验证
   * @returns {Object} 导入结果
   */
  importConfig(jsonString, validate = true) {
    try {
      const config = JSON.parse(jsonString);
      return this.updateConfig(config, validate);
    } catch (error) {
      return {
        success: false,
        errors: [`JSON解析失败: ${error.message}`],
        warnings: []
      };
    }
  }

  /**
   * 克隆配置管理器
   * @returns {ConfigManager} 新的配置管理器实例
   */
  clone() {
    return new ConfigManager(this.config);
  }
}

export { ConfigManager };
export default ConfigManager;