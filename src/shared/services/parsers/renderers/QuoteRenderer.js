/**
 * 引用块渲染器
 * 优化版本：使用新的占位符条件渲染语法
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';
import { ParserError } from '../utils.js';

class QuoteRenderer extends BaseBlockRenderer {
  getType() {
    return 'quote';
  }

  async render(data, renderer) {
    try {
      const text = await this.processInlineStyles(data.text || '', renderer);
      const caption = data.caption ? await this.processInlineStyles(data.caption, renderer) : '';

      // 使用标准化的模板渲染方法
      return await this.renderWithTemplate('quote', { text, caption });
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Quote render failed: ${error.message}`);
    }
  }
}

export default QuoteRenderer;