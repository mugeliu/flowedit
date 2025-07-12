/**
 * 图片块渲染器
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';

class ImageRenderer extends BaseBlockRenderer {
  getType() {
    return 'image';
  }

  render(data, renderer) {
    const url = data.file?.url || data.url || '';
    const caption = data.caption || '';
    const alt = data.alt || caption || '';

    return this.renderWithConditionalTemplate(
      'image',
      { url, caption, alt },
      'caption'
    );
  }
}

export default ImageRenderer;