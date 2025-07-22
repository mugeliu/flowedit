/**
 * 图片块渲染器
 * 优化版本：使用新的占位符条件渲染语法
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';
import { ParserError } from '../utils.js';

class ImageRenderer extends BaseBlockRenderer {
  getType() {
    return 'image';
  }

  async render(data, renderer) {
    try {
      const url = data.file?.url || data.url || '';
      const caption = data.caption || '';
      const alt = data.alt || caption || '';

      // 使用标准化的模板渲染方法
      return await this.renderWithTemplate('image', { url, caption, alt });
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Image render failed: ${error.message}`);
    }
  }
}

export default ImageRenderer;