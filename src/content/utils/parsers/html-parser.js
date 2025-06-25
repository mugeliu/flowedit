/**
 * HtmlParser 类
 * 专门负责解析逻辑，统一的解析器入口
 * 重构版本：HtmlParser → ProcessorRegistry → BlockProcessor → TemplateManager
 */

import { TemplateManager } from "./template-manager.js";
import { ProcessorRegistry } from "./processor-registry.js";

class HtmlParser {
  /**
   * 创建HTML解析器实例
   * @param {Object} options 全局选项（可选）
   */
  constructor(options = {}) {
    // 初始化模板管理器
    this.templateManager = new TemplateManager();

    // 初始化处理器注册表，传入模板管理器
    this.processorRegistry = new ProcessorRegistry(this.templateManager);

    // 保存全局选项
    this.options = {
      skipEmpty: true,
      wrapInContainer: false,
      includeMetadata: false,
      ...options,
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
   * 合并选项的私有方法
   * @param {Object} options 传入的选项
   * @returns {Object} 合并后的选项
   */
  _mergeOptions(options = {}) {
    return { ...this.options, ...options };
  }

  /**
   * 核心解析逻辑
   * @param {Object} editorData - EditorJS数据
   * @param {Object} options - 合并后的选项
   * @returns {Object} 包含htmlBlocks和metadata的对象
   */
  _parseCore(editorData, options) {
    console.log('[HtmlParser._parseCore] 开始解析数据:', editorData);
    
    // 验证数据
    if (!this._isValidData(editorData)) {
      console.warn('[HtmlParser._parseCore] 数据验证失败');
      return { htmlBlocks: [], metadata: {} };
    }
    
    const htmlBlocks = [];
    const blocks = editorData.blocks || [];
    console.log('[HtmlParser._parseCore] 处理块数量:', blocks.length);
    
    blocks.forEach((blockData, index) => {
      console.log(`[HtmlParser._parseCore] 处理第${index}个块:`, blockData);
      const processor = this.processorRegistry.getProcessor(blockData.type);
      
      if (processor) {
        console.log(`[HtmlParser._parseCore] 找到处理器:`, blockData.type);
        const blockHtml = processor.process(blockData, options);
        console.log(`[HtmlParser._parseCore] 生成的HTML:`, blockHtml);
        htmlBlocks.push(blockHtml);
      } else {
        console.warn(`[HtmlParser._parseCore] 未找到处理器:`, blockData.type);
        htmlBlocks.push('');
      }
    });
    
    console.log('[HtmlParser._parseCore] 所有HTML块:', htmlBlocks);
    
    return {
      htmlBlocks,
      metadata: {
        time: editorData.time,
        version: editorData.version,
        blocksCount: blocks.length
      }
    };
  }

  /**
   * 格式化输出HTML的私有方法
   * @param {Array<string>} htmlBlocks HTML块数组
   * @param {Object} mergedOptions 合并后的选项
   * @returns {string} 格式化后的HTML
   */
  _formatOutput(htmlBlocks, mergedOptions) {
    console.log('[HtmlParser._formatOutput] 格式化HTML块:', htmlBlocks);
    const content = htmlBlocks.join("\n");
    const result = mergedOptions.wrapInContainer
      ? `<section class="editorjs-content">${content}</section>`
      : content;
    console.log('[HtmlParser._formatOutput] 格式化后的内容:', result);
    return result;
  }

  /**
   * 解析EditorJS数据为HTML
   * @param {Object} editorData - EditorJS数据对象
   * @param {Object} options - 解析选项
   * @returns {string} 生成的HTML字符串
   */
  parseDocument(editorData, options = {}) {
    console.log('[HtmlParser.parseDocument] 开始解析文档:', editorData, '选项:', options);
    try {
      const mergedOptions = this._mergeOptions(options);
      console.log('[HtmlParser.parseDocument] 合并后的选项:', mergedOptions);
      const { htmlBlocks } = this._parseCore(editorData, mergedOptions);
      const result = this._formatOutput(htmlBlocks, mergedOptions);
      console.log('[HtmlParser.parseDocument] 最终HTML结果:', result);
      return result;
    } catch (error) {
      console.error('HtmlParser.parseDocument发生错误:', error);
      return '';
    }
  }

  /**
   * 解析并返回元数据
   * @param {Object} editorData EditorJS输出数据
   * @param {Object} options 解析选项（可选）
   * @returns {Object} 包含HTML和元数据的对象
   */
  parseWithMeta(editorData, options = {}) {
    const mergedOptions = this._mergeOptions(options);
    const { htmlBlocks, metadata } = this._parseCore(editorData, mergedOptions);
    return {
      html: this._formatOutput(htmlBlocks, mergedOptions),
      metadata,
    };
  }

  /**
   * 注册自定义处理器
   * @param {string} type 块类型
   * @param {BaseBlockProcessor} processor 处理器实例
   */
  registerProcessor(type, processor) {
    this.processorRegistry.registerProcessor(type, processor);
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
    return Array.from(this.processorRegistry.processors.keys());
  }

  /**
   * 快速验证EditorJS数据格式
   * @param {Object} editorData EditorJS数据
   * @returns {boolean} 是否有效
   */
  _isValidData(editorData) {
    return editorData && Array.isArray(editorData.blocks);
  }

  /**
   * 详细验证EditorJS数据格式（可选功能）
   * @param {Object} editorData EditorJS数据
   * @param {boolean} detailed 是否进行详细验证
   * @returns {Object} 验证结果
   */
  validateEditorData(editorData, detailed = false) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
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

    // 仅在详细模式下检查每个块
    if (detailed) {
      editorData.blocks.forEach((block, index) => {
        if (!block || typeof block !== "object") {
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
          result.warnings.push(
            `块 ${index} 的类型 "${block.type}" 不被支持，将使用默认处理器`
          );
        }
      });
    }

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
      // 快速验证数据
      if (!this._isValidData(editorData)) {
        return {
          success: false,
          html: "",
          errors: ["无效的EditorJS数据格式"],
          warnings: [],
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
        warnings: [],
      };
    } catch (error) {
      console.error("HTML解析失败:", error);
      return {
        success: false,
        html: "",
        errors: [error.message],
        warnings: [],
      };
    }
  }


}

export { HtmlParser };
export default HtmlParser;
