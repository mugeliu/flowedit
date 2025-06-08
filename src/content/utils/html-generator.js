/**
 * HTML生成器模块
 * 负责将处理后的块数据转换为HTML
 */

import blockProcessor from './block-processor.js';

/**
 * HTML生成器类
 */
class HtmlGenerator {
  constructor() {
    this.generators = {
      paragraph: this.generateParagraph.bind(this),
      header: this.generateHeader.bind(this)
    };
  }

  /**
   * 生成单个块的HTML
   * @param {Object} processedBlock 处理后的块数据
   * @returns {string} HTML字符串
   */
  generateBlockHtml(processedBlock) {
    if (!processedBlock || processedBlock.isEmpty) {
      return '';
    }

    const generator = this.generators[processedBlock.type];
    if (!generator) {
      console.warn(`未知的块类型: ${processedBlock.type}`);
      return this.generateParagraph(processedBlock);
    }

    try {
      const blockContent = generator(processedBlock);
      // 用 <section> 标签包裹每个块
      return `<section>${blockContent}</section>`;
    } catch (error) {
      console.error(`生成HTML失败 (${processedBlock.type}):`, error);
      return '';
    }
  }

  /**
   * 生成段落HTML
   * @param {Object} block 处理后的段落块
   * @returns {string} HTML字符串
   */
  generateParagraph(block) {
    const text = block.data?.text || '';
    const styles = block.styles || {};
    
    // 构建样式字符串
    const styleStr = Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
    
    const styleAttr = styleStr ? ` style="${styleStr}"` : '';
    
    return `<span leaf=""${styleAttr}>${this.escapeHtml(text)}</span>`;
  }

  /**
   * 生成标题HTML
   * @param {Object} block 处理后的标题块
   * @returns {string} HTML字符串
   */
  generateHeader(block) {
    const text = block.data?.text || '';
    const level = block.data?.level || 1;
    const styles = block.styles || {};
    
    // 根据级别确定标签
    const tag = `h${Math.min(Math.max(level, 1), 6)}`;
    
    // 构建样式字符串
    const styleStr = Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
    
    const styleAttr = styleStr ? ` style="${styleStr}"` : '';
    
    return `<${tag}${styleAttr}>${this.escapeHtml(text)}</${tag}>`;
  }

  /**
   * HTML转义函数
   * @param {string} text 需要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 预留扩展方法
  // TODO: 后续添加更多块类型生成器



  // 已移除 generateFromEditorData 方法，使用 generateHTML 替代

  /**
   * 生成HTML（新接口，支持异步）
   * @param {Array} blocks EditorJS块数组
   * @param {Object} options 生成选项
   * @param {boolean} options.skipEmpty 是否跳过空块
   * @returns {Promise<string>} 完整的HTML字符串
   */
  async generateHTML(blocks, options = {}) {
    const {
      skipEmpty = true
    } = options;

    // 处理块数据
    const processedBlocks = blockProcessor.processBlocks(blocks);
    
    // 生成HTML
    const htmlBlocks = processedBlocks
      .map(block => this.generateBlockHtml(block))
      .filter(html => skipEmpty ? html.trim() : true);

    // 直接返回section标签，不使用包装器
    return htmlBlocks.join('\n');
  }



  /**
   * 注册自定义HTML生成器
   * @param {string} blockType 块类型
   * @param {Function} generator 生成函数
   */
  registerGenerator(blockType, generator) {
    if (typeof generator === 'function') {
      this.generators[blockType] = generator;
    } else {
      console.warn('生成器必须是函数');
    }
  }
}

// 创建全局HTML生成器实例
const htmlGenerator = new HtmlGenerator();

export { htmlGenerator, HtmlGenerator };
export default htmlGenerator;