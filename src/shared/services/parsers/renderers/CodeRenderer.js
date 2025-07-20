/**
 * 代码块渲染器
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';

class CodeRenderer extends BaseBlockRenderer {
  getType() {
    return 'code';
  }

  render(data, renderer) {
    // 将代码中的换行符转换为 <br> 标签
    const processedCode = this.escapeHtml(data.code || '').replace(/\n/g, '<br>');
    
    return this.renderWithTemplate('code', {
      code: processedCode,
      language: data.language || ''
    });
  }
}

export default CodeRenderer;