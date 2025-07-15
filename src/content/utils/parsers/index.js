/**
 * Block-to-HTML 转换器主入口
 * 专为Chrome插件设计的模块化转换器
 * 优化版本：集成错误处理和新的架构
 */
import TemplateLoader, { ParserError } from './TemplateLoader.js';
import InlineStyleProcessor from './InlineStyleProcessor.js';
import Renderer from './Renderer.js';
import { createLogger } from '../../services/simple-logger.js';

// 创建模块日志器
const logger = createLogger('ParserIndex');

/**
 * Block-to-HTML 转换器主类
 */
class BlockToHtmlConverter {
  constructor() {
    this.templateLoader = new TemplateLoader();
    this.inlineStyleProcessor = new InlineStyleProcessor(this.templateLoader);
    this.renderer = new Renderer(this.templateLoader, this.inlineStyleProcessor);
  }

  /**
   * 转换EditorJS数据为HTML
   * @param {Object} editorData - EditorJS数据对象
   * @param {Object} template - 模板对象
   * @returns {string} HTML字符串
   */
  convert(editorData, template) {
    try {
      // 数据格式验证
      if (!validateEditorData(editorData)) {
        throw new ParserError('无效的EditorJS数据格式');
      }

      if (template) {
        this.templateLoader.loadTemplate(template);
      }

      // 模板加载验证
      if (!this.templateLoader.isTemplateLoaded()) {
        throw new ParserError('模板未加载');
      }

      return this.renderer.render(editorData);
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
 * 转换EditorJS数据为HTML
 * @param {Object} editorData - EditorJS数据对象
 * @param {Object} template - 模板对象
 * @returns {string} 转换后的HTML字符串
 */
function convertToHtml(editorData, template) {
  const converter = new BlockToHtmlConverter();
  return converter.convert(editorData, template);
}

/**
 * 验证EditorJS数据格式
 * @param {Object} editorData - EditorJS数据对象
 * @returns {boolean} 是否有效
 */
function validateEditorData(editorData) {
  return editorData && 
         editorData.blocks && 
         Array.isArray(editorData.blocks) &&
         editorData.blocks.every(block => block && block.type);
}

// ES6 模块导出
export { BlockToHtmlConverter, convertToHtml, validateEditorData, ParserError };
export default BlockToHtmlConverter;