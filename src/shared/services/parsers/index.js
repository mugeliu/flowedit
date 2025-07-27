/**
 * Block-to-HTML 转换器主入口
 * 专为Chrome插件设计的模块化转换器
 * 优化版本：集成错误处理和新的架构
 */
import TemplateLoader from './TemplateLoader.js';
import InlineStyleProcessor from './InlineStyleProcessor.js';
import Renderer from './Renderer.js';
import { TemplateManager } from '../template-manager.js';
import { createLogger } from "../logger.js";
import { ParserError, validateEditorData } from './utils.js';

// 创建模块日志器
const logger = createLogger('ParserIndex');

/**
 * Block-to-HTML 转换器主类（优化版：单例模式）
 */
class BlockToHtmlConverter {
  constructor() {
    this.templateLoader = new TemplateLoader();
    this.inlineStyleProcessor = new InlineStyleProcessor(this.templateLoader);
    this.renderer = new Renderer(this.templateLoader, this.inlineStyleProcessor);
    this.templateManager = new TemplateManager();
  }

  /**
   * 获取单例实例（性能优化）
   * @returns {BlockToHtmlConverter} 单例实例
   */
  static getInstance() {
    if (!BlockToHtmlConverter._instance) {
      BlockToHtmlConverter._instance = new BlockToHtmlConverter();
      logger.debug('创建BlockToHtmlConverter单例实例');
    }
    return BlockToHtmlConverter._instance;
  }

  /**
   * 转换EditorJS数据为HTML
   * @param {Object} editorData - EditorJS数据对象
   * @param {string} [templateId] - 可选的模板ID
   * @returns {Promise<string>} HTML字符串
   */
  async convert(editorData, templateId = null) {
    try {
      // 数据格式验证
      if (!validateEditorData(editorData)) {
        throw new ParserError('无效的EditorJS数据格式');
      }

      // 如果传入了模板ID，使用指定模板渲染
      if (templateId) {
        return await this._convertWithSpecificTemplate(editorData, templateId);
      }

      // 否则使用现有逻辑：从存储加载当前模板
      if (!this.templateLoader.isTemplateLoaded()) {
        await this.templateLoader.loadFromStorage();
      }

      return await this.renderer.render(editorData);
    } catch (error) {
      if (error instanceof ParserError) {
        logger.error('转换失败:', error.message);
        throw error;
      }
      logger.error('转换过程中发生未知错误:', error);
      throw new ParserError(`转换失败: ${error.message}`);
    }
  }

  /**
   * 使用指定模板进行转换（内部方法）
   * @param {Object} editorData - EditorJS数据对象
   * @param {string} templateId - 模板ID
   * @returns {Promise<string>} HTML字符串
   */
  async _convertWithSpecificTemplate(editorData, templateId) {
    // 加载指定模板
    const actualTemplateData = await this.templateManager.loadTemplate(templateId);
    if (!actualTemplateData) {
      throw new ParserError(`无法加载模板: ${templateId}`);
    }
    
    logger.info(`使用指定模板渲染: ${templateId}`);

    // 创建临时组件实例，避免影响单例状态
    const tempTemplateLoader = new TemplateLoader();
    const tempInlineStyleProcessor = new InlineStyleProcessor(tempTemplateLoader);
    const tempRenderer = new Renderer(tempTemplateLoader, tempInlineStyleProcessor);

    // 加载指定模板到临时loader中
    tempTemplateLoader.loadTemplate(actualTemplateData);

    // 渲染HTML
    return await tempRenderer.render(editorData);
  }
}

/**
 * 转换EditorJS数据为HTML（优化版：使用单例）
 * @param {Object} editorData - EditorJS数据对象
 * @param {string} [templateId] - 可选的模板ID，如果不传则使用当前模板
 * @returns {Promise<string>} 转换后的HTML字符串
 */
async function convertToHtml(editorData, templateId = null) {
  const converter = BlockToHtmlConverter.getInstance();
  return await converter.convert(editorData, templateId);
}

// ES6 模块导出
export { BlockToHtmlConverter, convertToHtml, ParserError };
export default BlockToHtmlConverter;