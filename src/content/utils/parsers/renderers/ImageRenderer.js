/**
 * 图片块渲染器
 * 优化版本：使用新的占位符条件渲染语法
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';
import { ParserError } from '../TemplateLoader.js';

class ImageRenderer extends BaseBlockRenderer {
  getType() {
    return 'image';
  }

  render(data, renderer) {
    try {
      const url = data.file?.url || data.url || '';
      const caption = data.caption || '';
      const alt = data.alt || caption || '';

      // 获取 image 模板配置
      const template = this.templateLoader.getBlockTemplate('image');
      if (!template) {
        throw new ParserError('Image template not found');
      }

      // 使用新的模板渲染方法（支持 {{?caption}} 语法）
      return this.renderTemplate(template, { url, caption, alt });
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Image render failed: ${error.message}`);
    }
  }
}

export default ImageRenderer;