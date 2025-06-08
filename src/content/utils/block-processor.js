/**
 * 块处理器模块
 * 负责处理不同类型的EditorJS块数据
 */

import styleManager from './style-manager.js';

/**
 * 块处理器类
 */
class BlockProcessor {
  constructor() {
    this.processors = {
      paragraph: this.processParagraph.bind(this),
      header: this.processHeader.bind(this)
    };
  }

  /**
   * 处理单个块
   * @param {Object} block EditorJS块数据
   * @returns {Object} 处理后的块信息
   */
  processBlock(block) {
    if (!block || !block.type) {
      console.warn('无效的块数据:', block);
      return this.createEmptyBlock();
    }

    const processor = this.processors[block.type];
    if (!processor) {
      console.warn(`未知的块类型: ${block.type}`);
      return this.processParagraph(block); // 默认按段落处理
    }

    try {
      return processor(block);
    } catch (error) {
      console.error(`处理块失败 (${block.type}):`, error);
      return this.createEmptyBlock();
    }
  }

  /**
   * 处理段落块
   * @param {Object} block 段落块数据
   * @returns {Object} 处理后的块信息
   */
  processParagraph(block) {
    const originalData = block.data || {};
    const processedData = {
      ...originalData,
      text: this.sanitizeText(originalData.text || '')
    };
    const styles = styleManager.getBlockStyle('paragraph');

    return {
      type: 'paragraph',
      data: processedData,
      styles: styles,
      isEmpty: this.isBlockEmpty(block)
    };
  }

  /**
   * 处理标题块
   * @param {Object} block 标题块数据
   * @returns {Object} 处理后的块信息
   */
  processHeader(block) {
    const originalData = block.data || {};
    const level = Math.min(Math.max(originalData.level || 1, 1), 6); // 限制在1-6之间
    const processedData = {
      ...originalData,
      text: this.sanitizeText(originalData.text || ''),
      level: level
    };
    const styles = styleManager.getBlockStyle('header', { level });

    return {
      type: 'header',
      data: processedData,
      styles: styles,
      isEmpty: this.isBlockEmpty(block)
    };
  }


  /**
   * 创建空块
   * @returns {Object} 空块信息
   */
  createEmptyBlock() {
    return {
      type: 'paragraph',
      data: {
        text: ''
      },
      styles: styleManager.getBlockStyle('paragraph'),
      isEmpty: true
    };
  }

  /**
   * 判断块是否为空
   * @param {Object} block 块数据
   * @returns {boolean} 是否为空
   */
  isBlockEmpty(block) {
    if (!block || !block.data) {
      return true;
    }

    const data = block.data;
    const type = block.type;

    // 根据不同块类型判断是否为空
    switch (type) {
      case 'paragraph':
      case 'header':
        return !data.text || !data.text.trim();
      
      case 'list':
        return !data.items || data.items.length === 0 || 
               data.items.every(item => !item || !item.trim());
      
      case 'quote':
        return !data.text || !data.text.trim();
      
      case 'code':
        return !data.code || !data.code.trim();
      
      case 'image':
        return !data.file?.url && !data.url;
      
      case 'table':
        return !data.content || data.content.length === 0;
      
      case 'delimiter':
        return false; // 分隔符永远不为空
      
      default:
        // 对于未知类型，检查是否有任何非空字符串值
        return !Object.values(data).some(value => 
          typeof value === 'string' && value.trim()
        );
    }
  }

  /**
   * 清理文本内容
   * @param {string} text 原始文本
   * @returns {string} 清理后的文本
   */
  sanitizeText(text) {
    if (typeof text !== 'string') {
      return '';
    }

    // 基本的HTML清理，保留一些安全的标签
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'mark', 'code', 'a'];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    
    return text.replace(tagRegex, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        return match;
      }
      return '';
    });
  }

  /**
   * 转义HTML字符
   * @param {string} text 原始文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return '';
    }

    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
  }

  /**
   * 批量处理块数组
   * @param {Array} blocks EditorJS块数组
   * @returns {Array} 处理后的块信息数组
   */
  processBlocks(blocks) {
    if (!Array.isArray(blocks)) {
      console.warn('blocks必须是数组');
      return [];
    }

    return blocks.map(block => this.processBlock(block)).filter(block => block);
  }

  /**
   * 注册自定义块处理器
   * @param {string} blockType 块类型
   * @param {Function} processor 处理函数
   */
  registerProcessor(blockType, processor) {
    if (typeof processor === 'function') {
      this.processors[blockType] = processor;
    } else {
      console.warn('处理器必须是函数');
    }
  }
}

// 创建全局块处理器实例
const blockProcessor = new BlockProcessor();

export { blockProcessor, BlockProcessor };
export default blockProcessor;