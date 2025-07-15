/**
 * 通用块渲染器
 * 用于处理未知类型的块
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';

class GenericRenderer extends BaseBlockRenderer {
  getType() {
    return 'generic';
  }

  render(data, renderer, blockType) {
    // 处理文本字段
    const processedData = { ...data };
    if (data.text) {
      processedData.text = this.processInlineStyles(data.text, renderer);
    }

    return this.renderWithTemplate(blockType, processedData);
  }
}

export default GenericRenderer;