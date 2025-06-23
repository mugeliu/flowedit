/**
 * ProcessorRegistry 类
 * 专门负责管理块处理器的注册和获取
 * 重构后的版本，依赖TemplateManager，职责更加清晰
 */

import {
  BaseBlockProcessor,
  HeaderBlockProcessor,
  CodeBlockProcessor,
  RawBlockProcessor,
  QuoteBlockProcessor,
  ListBlockProcessor,
  DelimiterBlockProcessor,
  ImageBlockProcessor
} from './block-processor.js';

class ProcessorRegistry {
  /**
   * 创建处理器注册表实例
   * @param {TemplateManager} templateManager 模板管理器实例
   */
  constructor(templateManager) {
    this.templateManager = templateManager;
    this.processors = new Map();
    this.defaultProcessorClass = BaseBlockProcessor;
    
    // 自动初始化默认处理器
    this.initializeDefaultProcessors();
  }

  /**
   * 初始化默认处理器
   */
  initializeDefaultProcessors() {
    // 注册所有默认处理器
    this.registerProcessor('header', new HeaderBlockProcessor(this.templateManager));
    this.registerProcessor('code', new CodeBlockProcessor(this.templateManager));
    this.registerProcessor('raw', new RawBlockProcessor(this.templateManager));
    this.registerProcessor('quote', new QuoteBlockProcessor(this.templateManager));
    this.registerProcessor('List', new ListBlockProcessor(this.templateManager));
    this.registerProcessor('list', new ListBlockProcessor(this.templateManager)); // 兼容小写
    this.registerProcessor('delimiter', new DelimiterBlockProcessor(this.templateManager));
    this.registerProcessor('image', new ImageBlockProcessor(this.templateManager));
    this.registerProcessor('paragraph', new BaseBlockProcessor(this.templateManager));
  }

  /**
   * 设置默认处理器类
   * @param {Class} ProcessorClass 默认处理器类
   */
  setDefaultProcessorClass(ProcessorClass) {
    this.defaultProcessorClass = ProcessorClass;
  }

  /**
   * 注册处理器实例
   * @param {string} type 块类型
   * @param {BaseBlockProcessor} processor 处理器实例
   */
  registerProcessor(type, processor) {
    if (!(processor instanceof BaseBlockProcessor)) {
      throw new Error(`处理器必须是 BaseBlockProcessor 的实例: ${type}`);
    }
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
      // 如果没有找到处理器，返回默认处理器
      return this.getDefaultProcessor();
    }
    
    // 如果是处理器实例，直接返回
    if (entry instanceof BaseBlockProcessor) {
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
    return new this.defaultProcessorClass(this.templateManager);
  }

  /**
   * 检查处理器是否存在
   * @param {string} type 块类型
   * @returns {boolean} 处理器是否存在
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
   * 移除处理器
   * @param {string} type 块类型
   * @returns {boolean} 是否成功移除
   */
  removeProcessor(type) {
    return this.processors.delete(type);
  }

  /**
   * 清空所有处理器
   */
  clearProcessors() {
    this.processors.clear();
  }

  /**
   * 重新初始化所有处理器（当模板管理器更新时使用）
   */
  reinitializeProcessors() {
    // 清空现有处理器
    this.clearProcessors();
    
    // 重新初始化默认处理器
    this.initializeDefaultProcessors();
  }

  /**
   * 批量注册处理器
   * @param {Object} processorMap 处理器映射 {type: processor}
   */
  registerProcessors(processorMap) {
    Object.entries(processorMap).forEach(([type, processor]) => {
      if (typeof processor === 'function') {
        // 如果是类，注册为处理器类
        this.registerProcessorClass(type, processor);
      } else {
        // 如果是实例，直接注册
        this.registerProcessor(type, processor);
      }
    });
  }

  /**
   * 获取处理器统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const types = this.getRegisteredTypes();
    const instanceCount = types.filter(type => {
      const entry = this.processors.get(type);
      return entry instanceof BaseBlockProcessor;
    }).length;
    
    const classCount = types.filter(type => {
      const entry = this.processors.get(type);
      return entry && entry.ProcessorClass;
    }).length;
    
    return {
      totalTypes: types.length,
      instanceCount,
      classCount,
      types
    };
  }

  /**
   * 更新模板管理器（重新初始化所有处理器）
   * @param {TemplateManager} newTemplateManager 新的模板管理器
   */
  updateTemplateManager(newTemplateManager) {
    this.templateManager = newTemplateManager;
    this.reinitializeProcessors();
  }
}

export { ProcessorRegistry };
export default ProcessorRegistry;