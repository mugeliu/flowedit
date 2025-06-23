/**
 * ProcessorRegistry 类
 * 专门负责管理块处理器的注册和获取
 */

class ProcessorRegistry {
  /**
   * 创建处理器注册表实例
   * @param {TemplateManager} templateManager 模板管理器实例
   */
  constructor(templateManager) {
    this.templateManager = templateManager;
    this.processors = new Map();
    this.defaultProcessorClass = null;
  }

  /**
   * 设置默认处理器类
   * @param {Class} ProcessorClass 默认处理器类
   */
  setDefaultProcessorClass(ProcessorClass) {
    this.defaultProcessorClass = ProcessorClass;
  }

  /**
   * 注册处理器
   * @param {string} type 块类型
   * @param {BaseBlockProcessor} processor 处理器实例
   */
  registerProcessor(type, processor) {
    this.processors.set(type, processor);
  }

  /**
   * 注册处理器类（延迟实例化）
   * @param {string} type 块类型
   * @param {Class} ProcessorClass 处理器类
   * @param {Object} options 处理器选项
   */
  registerProcessorClass(type, ProcessorClass, options = {}) {
    this.processors.set(type, {
      ProcessorClass,
      options,
      instance: null
    });
  }

  /**
   * 获取处理器
   * @param {string} type 块类型
   * @returns {BaseBlockProcessor} 处理器实例
   */
  getProcessor(type) {
    const entry = this.processors.get(type);
    
    if (!entry) {
      return this.getDefaultProcessor();
    }

    // 如果是处理器实例，直接返回
    if (entry.process && typeof entry.process === 'function') {
      return entry;
    }

    // 如果是处理器类配置，进行延迟实例化
    if (entry.ProcessorClass && !entry.instance) {
      entry.instance = new entry.ProcessorClass(this.templateManager, entry.options);
    }

    return entry.instance || this.getDefaultProcessor();
  }

  /**
   * 获取默认处理器
   * @returns {BaseBlockProcessor} 默认处理器实例
   */
  getDefaultProcessor() {
    if (!this.defaultProcessorClass) {
      throw new Error('Default processor class not set');
    }
    return new this.defaultProcessorClass(this.templateManager);
  }

  /**
   * 检查是否已注册指定类型的处理器
   * @param {string} type 块类型
   * @returns {boolean} 是否已注册
   */
  hasProcessor(type) {
    return this.processors.has(type);
  }

  /**
   * 获取所有已注册的处理器类型
   * @returns {Array<string>} 处理器类型列表
   */
  getRegisteredTypes() {
    return Array.from(this.processors.keys());
  }

  /**
   * 移除指定类型的处理器
   * @param {string} type 块类型
   * @returns {boolean} 是否成功移除
   */
  unregisterProcessor(type) {
    return this.processors.delete(type);
  }

  /**
   * 清空所有处理器
   */
  clear() {
    this.processors.clear();
  }

  /**
   * 获取处理器数量
   * @returns {number} 处理器数量
   */
  size() {
    return this.processors.size;
  }
}

export { ProcessorRegistry };
export default ProcessorRegistry;