/**
 * 列表块渲染器
 * 优化版本：简化嵌套模板处理，通过递归复用配置
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';
import { ParserError } from '../utils.js';

class ListRenderer extends BaseBlockRenderer {
  getType() {
    return 'list';
  }

  /**
   * 渲染列表（支持嵌套）
   * @param {Object} data - 列表数据
   * @param {Object} renderer - 主渲染器实例
   * @param {number} depth - 嵌套深度，用于样式控制
   * @returns {string} 渲染后的HTML
   */
  async render(data, renderer, depth = 0) {
    try {
      const style = data.style || 'unordered';
      const items = data.items || [];
      
      // 获取列表模板配置
      const listTemplate = await this.getListTemplate(style);
      if (!listTemplate) {
        throw new ParserError(`List template for style: ${style}`);
      }

      // 渲染所有列表项
      const renderedItems = (await Promise.all(
        items.map(item => this.renderItem(item, style, listTemplate, renderer, depth))
      )).join('');

      // 应用包装器模板
      return this.applyWrapper(renderedItems, listTemplate, depth);
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`List render failed: ${error.message}`);
    }
  }

  /**
   * 获取列表模板配置
   * @param {string} style - 列表样式
   * @returns {Promise<Object>} 列表模板配置
   */
  async getListTemplate(style) {
    // 使用统一的小写 'list' 键名
    const template = await this.templateLoader.getBlockTemplate('list');
    if (template && template[style]) {
      return template[style];
    }
    
    return null;
  }

  /**
   * 渲染单个列表项
   * @param {string|Object} item - 列表项数据
   * @param {string} style - 列表样式
   * @param {Object} listTemplate - 列表模板
   * @param {Object} renderer - 主渲染器实例
   * @param {number} depth - 嵌套深度
   * @returns {string} HTML字符串
   */
  async renderItem(item, style, listTemplate, renderer, depth) {
    const itemData = typeof item === 'string' ? { content: item } : item;
    const content = await renderer.processInlineStyles(itemData.content || itemData.text || '');
    
    // 处理嵌套列表
    let nestedContent = '';
    if (itemData.items?.length > 0) {
      // 递归渲染嵌套列表，增加深度
      nestedContent = await this.render(
        { style, items: itemData.items }, 
        renderer, 
        depth + 1
      );
    }
    
    // 构建模板变量
    const templateVars = {
      content: content + nestedContent,
      class: depth > 0 ? 'nested-list' : 'main-list'
    };

    // 处理 checklist 特殊情况
    if (style === 'checklist') {
      const isChecked = itemData.meta?.checked;
      templateVars.checkbox = isChecked 
        ? (listTemplate.checked || '✅')
        : (listTemplate.unchecked || '☐');
    }

    // 应用列表项模板
    if (listTemplate.item) {
      return this.replaceVariables(listTemplate.item, templateVars);
    }

    // 默认回退
    return `<li>${templateVars.content}</li>`;
  }

  /**
   * 应用包装器模板
   * @param {string} renderedItems - 渲染后的列表项
   * @param {Object} listTemplate - 列表模板
   * @param {number} depth - 嵌套深度
   * @returns {string} 包装后的HTML
   */
  applyWrapper(renderedItems, listTemplate, depth) {
    if (!listTemplate.wrapper) {
      // 如果没有包装器模板，使用默认HTML标签
      const tagName = listTemplate.ordered ? 'ol' : 'ul';
      return `<${tagName}>${renderedItems}</${tagName}>`;
    }

    return this.replaceVariables(listTemplate.wrapper, {
      items: renderedItems,
      class: depth > 0 ? 'nested-list' : 'main-list'
    });
  }
}

export default ListRenderer;