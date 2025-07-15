/**
 * 分隔符块渲染器
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';

class DelimiterRenderer extends BaseBlockRenderer {
  getType() {
    return 'delimiter';
  }

  render(data, renderer) {
    return this.renderWithTemplate('delimiter', {}) || '<hr>';
  }
}

export default DelimiterRenderer;