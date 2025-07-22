/**
 * 段落块渲染器
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';

class ParagraphRenderer extends BaseBlockRenderer {
  getType() {
    return 'paragraph';
  }

  async render(data, renderer) {
    return await this.renderWithTemplate('paragraph', {
      text: await this.processInlineStyles(data.text || '', renderer)
    });
  }
}

export default ParagraphRenderer;