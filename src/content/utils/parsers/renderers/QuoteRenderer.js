/**
 * 引用块渲染器
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';

class QuoteRenderer extends BaseBlockRenderer {
  getType() {
    return 'quote';
  }

  render(data, renderer) {
    const text = this.processInlineStyles(data.text || '', renderer);
    const caption = data.caption ? this.processInlineStyles(data.caption, renderer) : '';

    return this.renderWithConditionalTemplate(
      'quote',
      { text, caption },
      'caption'
    );
  }
}

export default QuoteRenderer;