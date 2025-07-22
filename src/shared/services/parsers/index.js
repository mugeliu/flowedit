/**
 * Block-to-HTML 转换器主入口
 * 专为Chrome插件设计的模块化转换器
 * 优化版本：集成错误处理和新的架构
 */
import TemplateLoader from './TemplateLoader.js';
import InlineStyleProcessor from './InlineStyleProcessor.js';
import Renderer from './Renderer.js';
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
   * @returns {Promise<string>} HTML字符串
   */
  async convert(editorData) {
    try {
      // 数据格式验证
      if (!validateEditorData(editorData)) {
        throw new ParserError('无效的EditorJS数据格式');
      }

      // 自动从存储加载模板
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
}

/**
 * 转换EditorJS数据为HTML（优化版：使用单例）
 * @param {Object} editorData - EditorJS数据对象
 * @returns {Promise<string>} 转换后的HTML字符串
 */
async function convertToHtml(editorData) {
  const converter = BlockToHtmlConverter.getInstance();
  return await converter.convert(editorData);
}

// ES6 模块导出
export { BlockToHtmlConverter, convertToHtml, ParserError };
export default BlockToHtmlConverter;