/**
 * 原始HTML块渲染器
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';

class RawRenderer extends BaseBlockRenderer {
  getType() {
    return 'raw';
  }

  render(data, renderer) {
    return this.renderWithTemplate('raw', { html: data.html || '' }) ||
           data.html ||
           '';
  }
}

export default RawRenderer;