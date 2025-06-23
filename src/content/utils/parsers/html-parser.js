/**
 * HtmlParser 类
 * 专门负责解析逻辑，统一的解析器入口
 * 重构后的版本，依赖ProcessorRegistry，职责更加清晰
 */

import TemplateManager from './template-manager.js';
import ProcessorRegistry from './processor-registry.js';

class HtmlParser {
  /**
   * 创建HTML解析器实例
   * @param {Object} config 配置对象
   * @param {Object} config.templates 自定义模板配置（可选）
   * @param {Object} config.processors 自定义处理器配置（可选）
   * @param {Object} config.options 全局选项（可选）
   */
  constructor(config = {}) {
    const { templates = {}, processors = {}, options = {} } = config;
    
    // 初始化模板管理器
    this.templateManager = new TemplateManager(templates);
    
    // 初始化处理器注册表
    this.processorRegistry = new ProcessorRegistry(this.templateManager);
    
    // 注册自定义处理器
    if (Object.keys(processors).length > 0) {
      this.processorRegistry.registerProcessors(processors);
    }
    
    // 保存全局选项
    this.options = {
      skipEmpty: true,
      wrapInContainer: false,
      includeMetadata: false,
      ...options
    };
  }

  /**
   * 解析单个块
   * @param {Object} block EditorJS块数据
   * @returns {string} HTML字符串
   */
  parseBlock(block) {
    if (!block || !block.type) {
      console.warn("无效的块数据:", block);
      return "";
    }

    const processor = this.processorRegistry.getProcessor(block.type);
    return processor.process(block.data || {}, block);
  }

  /**
   * 解析整个文档
   * @param {Object} editorData EditorJS输出数据
   * @param {Object} options 解析选项（可选）
   * @returns {string} 完整的HTML文档
   */
  parseDocument(editorData, options = {}) {
    const mergedOptions = { ...this.options, ...options };
    
    if (!editorData || !Array.isArray(editorData.blocks)) {
      console.warn("无效的EditorJS数据");
      return "";
    }

    // 解析所有块
    const htmlBlocks = editorData.blocks
      .map((block) => this.parseBlock(block))
      .filter((html) => mergedOptions.skipEmpty ? html.trim() : true);

    const content = htmlBlocks.join("\n");

    // 根据选项决定是否包装在容器中
    if (mergedOptions.wrapInContainer) {
      return `<section class="editorjs-content">${content}</section>`;
    }

    return content;
  }

  /**
   * 解析并返回元数据
   * @param {Object} editorData EditorJS输出数据
   * @param {Object} options 解析选项（可选）
   * @returns {Object} 包含HTML和元数据的对象
   */
  parseWithMeta(editorData, options = {}) {
    const mergedOptions = { ...this.options, ...options };
    
    if (!editorData || !Array.isArray(editorData.blocks)) {
      console.warn("无效的EditorJS数据");
      return {
        html: "",
        metadata: {
          blockCount: 0,
          isEmpty: true,
          hasHead: false,
          hasEnding: false
        }
      };
    }

    // 解析所有块
    const htmlBlocks = editorData.blocks
      .map((block) => this.parseBlock(block))
      .filter((html) => mergedOptions.skipEmpty ? html.trim() : true);

    const content = htmlBlocks.join("\n");
    
    // 获取头部和尾部模板
    const head = this.templateManager.getHeadTemplate();
    const ending = this.templateManager.getEndingTemplate();
    const endinsert = `<section><span leaf=""><br class="ProseMirror-trailingBreak"></span></section>`;

    // 构建完整HTML
    const parts = [head, content, ending, endinsert].filter(part => part.trim());
    const fullHtml = parts.join("\n");

    // 构建元数据
    const metadata = {
      blockCount: editorData.blocks.length,
      processedBlockCount: htmlBlocks.length,
      isEmpty: htmlBlocks.length === 0,
      hasHead: !!head,
      hasEnding: !!ending,
      blockTypes: [...new Set(editorData.blocks.map(block => block.type))],
      totalLength: fullHtml.length
    };

    return {
      html: mergedOptions.wrapInContainer ? `<section class="editorjs-content">${fullHtml}</section>` : fullHtml,
      metadata
    };
  }

  /**
   * 注册自定义模板
   * @param {string} blockType 块类型
   * @param {string|Object} template 模板字符串或模板对象
   * @param {string} variant 模板变体（可选）
   */
  registerTemplate(blockType, template, variant = "default") {
    this.templateManager.registerTemplate(blockType, template, variant);
  }

  /**
   * 注册自定义处理器
   * @param {string} type 块类型
   * @param {BaseBlockProcessor|Class} processor 处理器实例或类
   * @param {Object} options 处理器选项（当传入类时使用）
   */
  registerProcessor(type, processor, options = {}) {
    if (typeof processor === 'function') {
      this.processorRegistry.registerProcessorClass(type, processor, options);
    } else {
      this.processorRegistry.registerProcessor(type, processor);
    }
  }

  /**
   * 设置模板配置
   * @param {Object} templates 新的模板配置
   */
  setTemplates(templates) {
    this.templateManager.setTemplates(templates);
    // 更新处理器注册表中的模板管理器引用
    this.processorRegistry.updateTemplateManager(this.templateManager);
  }

  /**
   * 获取当前模板配置
   * @returns {Object} 当前模板配置
   */
  getTemplates() {
    return this.templateManager.getTemplates();
  }

  /**
   * 获取可用的模板列表
   * @returns {Object} 模板配置
   */
  getAvailableTemplates() {
    return this.templateManager.getAvailableTemplates();
  }

  /**
   * 获取处理器统计信息
   * @returns {Object} 统计信息
   */
  getProcessorStats() {
    return this.processorRegistry.getStats();
  }

  /**
   * 检查块类型是否支持
   * @param {string} blockType 块类型
   * @returns {boolean} 是否支持
   */
  isBlockTypeSupported(blockType) {
    return this.processorRegistry.hasProcessor(blockType);
  }

  /**
   * 获取支持的块类型列表
   * @returns {Array<string>} 支持的块类型
   */
  getSupportedBlockTypes() {
    return this.processorRegistry.getRegisteredTypes();
  }

  /**
   * 验证EditorJS数据格式
   * @param {Object} editorData EditorJS数据
   * @returns {Object} 验证结果
   */
  validateEditorData(editorData) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!editorData) {
      result.isValid = false;
      result.errors.push("EditorJS数据为空");
      return result;
    }

    if (!Array.isArray(editorData.blocks)) {
      result.isValid = false;
      result.errors.push("EditorJS数据缺少blocks数组");
      return result;
    }

    // 检查每个块
    editorData.blocks.forEach((block, index) => {
      if (!block || typeof block !== 'object') {
        result.errors.push(`块 ${index} 不是有效对象`);
        result.isValid = false;
        return;
      }

      if (!block.type) {
        result.errors.push(`块 ${index} 缺少type字段`);
        result.isValid = false;
        return;
      }

      if (!this.isBlockTypeSupported(block.type)) {
        result.warnings.push(`块 ${index} 的类型 "${block.type}" 不被支持，将使用默认处理器`);
      }
    });

    return result;
  }

  /**
   * 安全解析（包含错误处理）
   * @param {Object} editorData EditorJS数据
   * @param {Object} options 解析选项
   * @returns {Object} 解析结果
   */
  safeParse(editorData, options = {}) {
    try {
      // 验证数据
      const validation = this.validateEditorData(editorData);
      
      if (!validation.isValid) {
        return {
          success: false,
          html: "",
          errors: validation.errors,
          warnings: validation.warnings
        };
      }

      // 解析数据
      const result = options.includeMetadata 
        ? this.parseWithMeta(editorData, options)
        : { html: this.parseDocument(editorData, options) };

      return {
        success: true,
        html: result.html,
        metadata: result.metadata || null,
        errors: [],
        warnings: validation.warnings
      };
    } catch (error) {
      console.error("HTML解析失败:", error);
      return {
        success: false,
        html: "",
        errors: [error.message],
        warnings: []
      };
    }
  }

  /**
   * 更新全局选项
   * @param {Object} newOptions 新的选项
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * 获取当前选项
   * @returns {Object} 当前选项
   */
  getOptions() {
    return { ...this.options };
  }

  /**
   * 重置解析器到初始状态
   * @param {Object} config 新的配置（可选）
   */
  reset(config = {}) {
    const { templates = {}, processors = {}, options = {} } = config;
    
    // 重新初始化模板管理器
    this.templateManager = new TemplateManager(templates);
    
    // 重新初始化处理器注册表
    this.processorRegistry = new ProcessorRegistry(this.templateManager);
    
    // 注册自定义处理器
    if (Object.keys(processors).length > 0) {
      this.processorRegistry.registerProcessors(processors);
    }
    
    // 重置选项
    this.options = {
      skipEmpty: true,
      wrapInContainer: false,
      includeMetadata: false,
      ...options
    };
  }
}

export { HtmlParser };
export default HtmlParser;