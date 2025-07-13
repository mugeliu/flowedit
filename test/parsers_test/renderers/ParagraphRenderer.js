/**
 * 段落块渲染器
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';

class ParagraphRenderer extends BaseBlockRenderer {
  getType() {
    return 'paragraph';
  }

  render(data, renderer) {
    return this.renderWithTemplate('paragraph', {
      text: this.processInlineStyles(data.text || '', renderer)
    });
  }
}

export default ParagraphRenderer;