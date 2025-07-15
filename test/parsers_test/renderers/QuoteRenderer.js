/**
 * 引用块渲染器
 * 优化版本：使用新的占位符条件渲染语法
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';
import { ParserError } from '../TemplateLoader.js';

class QuoteRenderer extends BaseBlockRenderer {
  getType() {
    return 'quote';
  }

  render(data, renderer) {
    try {
      const text = this.processInlineStyles(data.text || '', renderer);
      const caption = data.caption ? this.processInlineStyles(data.caption, renderer) : '';

      // 获取 quote 模板配置
      const template = this.templateLoader.getBlockTemplate('quote');
      if (!template) {
        throw new ParserError('Quote template not found');
      }

      // 使用新的模板渲染方法（支持 {{?caption}} 语法）
      return this.renderTemplate(template, { text, caption });
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Quote render failed: ${error.message}`);
    }
  }
}

export default QuoteRenderer;