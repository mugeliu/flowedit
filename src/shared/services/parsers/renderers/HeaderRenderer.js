/**
 * 标题块渲染器
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';

class HeaderRenderer extends BaseBlockRenderer {
  getType() {
    return 'header';
  }

  async render(data, renderer) {
    const level = data.level || 1;
    const subType = `h${Math.min(Math.max(level, 1), 6)}`;
    
    return await this.renderWithTemplate(
      'header',
      {
        text: await this.processInlineStyles(data.text || '', renderer),
        level
      },
      subType
    );
  }
}

export default HeaderRenderer;