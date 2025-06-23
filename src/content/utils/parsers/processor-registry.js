/**
 * ProcessorRegistry 类
 * 专门负责管理块处理器的注册和获取
 * 简化版本，专注核心功能
 */

import {
  BaseBlockProcessor,
  HeaderBlockProcessor,
  CodeBlockProcessor,
  RawBlockProcessor,
  QuoteBlockProcessor,
  ListBlockProcessor,
  DelimiterBlockProcessor,
  ImageBlockProcessor,
} from "./block-processor.js";

class ProcessorRegistry {
  /**
   * 创建处理器注册表实例
   * @param {TemplateManager} templateManager 模板管理器实例
   */
  constructor(templateManager) {
    this.templateManager = templateManager;
    this.processors = new Map();

    // 自动初始化默认处理器
    this.initializeDefaultProcessors();
  }

  /**
   * 初始化默认处理器
   */
  initializeDefaultProcessors() {
    // 注册所有默认处理器
    this.processors.set(
      "header",
      new HeaderBlockProcessor(this.templateManager)
    );
    this.processors.set("code", new CodeBlockProcessor(this.templateManager));
    this.processors.set("raw", new RawBlockProcessor(this.templateManager));
    this.processors.set("quote", new QuoteBlockProcessor(this.templateManager));
    this.processors.set("list", new ListBlockProcessor(this.templateManager));
    this.processors.set("List", new ListBlockProcessor(this.templateManager)); // 支持大写L
    this.processors.set(
      "delimiter",
      new DelimiterBlockProcessor(this.templateManager)
    );
    this.processors.set("image", new ImageBlockProcessor(this.templateManager));
    this.processors.set(
      "paragraph",
      new BaseBlockProcessor(this.templateManager)
    );
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
   * 获取处理器
   * @param {string} type 块类型
   * @returns {BaseBlockProcessor} 处理器实例
   */
  getProcessor(type) {
    return (
      this.processors.get(type) || new BaseBlockProcessor(this.templateManager)
    );
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
   * 批量注册处理器
   * @param {Object} processorMap 处理器映射 {type: processor}
   */
  registerProcessors(processorMap) {
    Object.entries(processorMap).forEach(([type, processor]) => {
      this.registerProcessor(type, processor);
    });
  }
}

export { ProcessorRegistry };
export default ProcessorRegistry;
