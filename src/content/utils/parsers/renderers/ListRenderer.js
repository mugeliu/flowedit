/**
 * 列表块渲染器
 */
import BaseBlockRenderer from './BaseBlockRenderer.js';

class ListRenderer extends BaseBlockRenderer {
  getType() {
    return 'list';
  }

  render(data, renderer) {
    const style = data.style || 'unordered';
    const items = data.items || [];
    const template = this.templateLoader.getBlockTemplate('List');
    const listTemplate = template?.[style] || {};

    const renderedItems = items
      .map(item => this.renderListItem(item, style, listTemplate, renderer))
      .join('');

    return this.wrapListItems(renderedItems, style, listTemplate);
  }

  /**
   * 包装列表项
   * @param {string} renderedItems - 渲染后的列表项
   * @param {string} style - 列表样式
   * @param {Object} listTemplate - 列表模板
   * @returns {string} 包装后的HTML
   */
  wrapListItems(renderedItems, style, listTemplate) {
    if (listTemplate.wrapper) {
      return this.replaceVariables(listTemplate.wrapper, {
        items: renderedItems
      });
    }

    // 使用默认HTML标签包装
    const tagName = style === 'ordered' ? 'ol' : 'ul';
    return `<${tagName}>${renderedItems}</${tagName}>`;
  }

  /**
   * 渲染单个列表项（支持嵌套）
   * @param {string|Object} item - 列表项数据
   * @param {string} style - 列表样式
   * @param {Object} listTemplate - 列表模板
   * @param {Renderer} renderer - 主渲染器实例
   * @returns {string} HTML字符串
   */
  renderListItem(item, style, listTemplate, renderer) {
    const itemData = typeof item === 'string' ? { content: item } : item;
    const content = this.processInlineStyles(
      itemData.content || itemData.text || '',
      renderer
    );

    let itemHtml = content;

    // 处理嵌套列表 - 使用专门的嵌套模板
    if (
      itemData.items &&
      Array.isArray(itemData.items) &&
      itemData.items.length > 0
    ) {
      const nestedItems = itemData.items
        .map(nestedItem => {
          return this.renderListItem(nestedItem, style, listTemplate, renderer);
        })
        .join('');

      // 使用嵌套模板，如果没有则回退到简单HTML
      let nestedList;
      if (listTemplate && listTemplate.nested) {
        nestedList = this.replaceVariables(listTemplate.nested, {
          items: nestedItems
        });
      } else {
        const tagName = style === 'ordered' ? 'ol' : 'ul';
        nestedList = `<${tagName}>${nestedItems}</${tagName}>`;
      }
      itemHtml = content + nestedList;
    }

    // 应用列表项模板
    if (listTemplate && listTemplate.item) {
      const templateVars = { content: itemHtml };

      // 特殊处理checklist类型
      if (style === 'checklist') {
        const isChecked = itemData.meta && itemData.meta.checked;
        const checkedIcon = listTemplate.checked_icon || '✅';
        const uncheckedIcon = listTemplate.unchecked_icon || '☐';
        templateVars.checkbox = isChecked ? checkedIcon : uncheckedIcon;
      }

      return this.replaceVariables(listTemplate.item, templateVars);
    }
    return `<li>${itemHtml}</li>`;
  }
}

export default ListRenderer;