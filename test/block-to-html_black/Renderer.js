/**
 * 渲染引擎
 * 负责遍历EditorJS blocks，根据block类型获取对应模板，处理变量替换和特殊类型的循环渲染
 */
class Renderer {
  constructor(templateLoader, inlineStyleProcessor) {
    this.templateLoader = templateLoader;
    this.inlineStyleProcessor = inlineStyleProcessor;
    this.allExtractedLinks = []; // 维护所有提取的链接数组
  }

  /**
   * 渲染EditorJS数据为HTML
   * @param {Object} editorData - EditorJS数据对象
   * @returns {string} 渲染后的HTML字符串
   */
  render(editorData) {
    // 重置链接数组
    this.allExtractedLinks = [];
    
    const htmlBlocks = editorData.blocks.map(block => this.renderBlock(block));
    return htmlBlocks.filter(html => html).join('\n');
  }

  /**
   * 渲染单个块
   * @param {Object} block - EditorJS块对象
   * @returns {string} 渲染后的HTML字符串
   */
  renderBlock(block) {
    if (!block || !block.type) {
      console.warn('无效的块数据:', block);
      return '';
    }

    const { type, data } = block;

    // 统一处理内联样式
    const processedData = this.processBlockInlineStyles(data);

    try {
      switch (type) {
        case 'paragraph':
          return this.renderParagraph(processedData);
        case 'header':
          return this.renderHeader(processedData);
        case 'list':
          return this.renderList(processedData);
        case 'quote':
          return this.renderQuote(processedData);
        case 'code':
          return this.renderCode(processedData);
        case 'delimiter':
          return this.renderDelimiter(processedData);
        case 'image':
          return this.renderImage(processedData);
        case 'raw':
          return this.renderRaw(processedData);
        default:
          console.warn(`未支持的块类型: ${type}`);
          return this.renderGeneric(type, processedData);
      }
    } catch (error) {
      console.error(`渲染块失败 (${type}):`, error);
      return '';
    }
  }

  /**
   * 统一处理块数据中的内联样式
   * @param {Object} data - 块数据
   * @returns {Object} 处理后的块数据和提取的链接信息
   */
  processBlockInlineStyles(data) {
    if (!data || typeof data !== 'object') {
      return { processedData: data, extractedLinks: [] };
    }

    const processedData = { ...data };
    let allExtractedLinks = [];

    // 处理常见的文本字段
    const textFields = ['text', 'caption', 'content'];
    
    textFields.forEach(field => {
       if (processedData[field] && typeof processedData[field] === 'string') {
         processedData[field] = this.inlineStyleProcessor.processInlineStyles(processedData[field], this.allExtractedLinks);
         
         // 收集提取的链接（现在链接已经直接添加到全局数组中）
         const links = this.inlineStyleProcessor.getExtractedLinks();
         if (links && links.length > 0) {
           allExtractedLinks = allExtractedLinks.concat(links);
         }
       }
     });

    // 处理列表项中的嵌套文本
    if (processedData.items && Array.isArray(processedData.items)) {
      processedData.items = processedData.items.map(item => {
         if (typeof item === 'string') {
           const processedText = this.inlineStyleProcessor.processInlineStyles(item, this.allExtractedLinks);
           const links = this.inlineStyleProcessor.getExtractedLinks();
           if (links && links.length > 0) {
             allExtractedLinks = allExtractedLinks.concat(links);
           }
           return processedText;
         } else if (item && typeof item === 'object') {
           const processedItem = { ...item };
           if (processedItem.content) {
             processedItem.content = this.inlineStyleProcessor.processInlineStyles(processedItem.content, this.allExtractedLinks);
             const links = this.inlineStyleProcessor.getExtractedLinks();
             if (links && links.length > 0) {
               allExtractedLinks = allExtractedLinks.concat(links);
             }
           }
           if (processedItem.text) {
             processedItem.text = this.inlineStyleProcessor.processInlineStyles(processedItem.text, this.allExtractedLinks);
             const links = this.inlineStyleProcessor.getExtractedLinks();
             if (links && links.length > 0) {
               allExtractedLinks = allExtractedLinks.concat(links);
             }
           }
           return processedItem;
         }
         return item;
       });
    }

    // 将提取的链接信息附加到处理后的数据中
      if (allExtractedLinks.length > 0) {
        processedData._extractedLinks = allExtractedLinks;
        // 注意：链接已经在processInlineStyles中直接添加到this.allExtractedLinks了
        // 这里不需要再次添加，避免重复
      }

      return processedData;
  }

  /**
   * 渲染段落块
   * @param {Object} data - 段落数据
   * @returns {string} HTML字符串
   */
  renderParagraph(data) {
    return this.renderWithTemplate('paragraph', {
      text: data.text || ''
    });
  }

  /**
   * 渲染标题块
   * @param {Object} data - 标题数据
   * @returns {string} HTML字符串
   */
  renderHeader(data) {
    const level = data.level || 1;
    const subType = `h${Math.min(Math.max(level, 1), 6)}`;
    return this.renderWithTemplate('header', {
      text: data.text || '',
      level
    }, subType);
  }

  /**
   * 渲染列表块
   * @param {Object} data - 列表数据
   * @returns {string} HTML字符串
   */
  renderList(data) {
    const template = this.templateLoader.getBlockTemplate('List');
    if (!template) {
      // 如果没有模板，使用默认渲染
      const style = data.style || 'unordered';
      const items = data.items || [];
      const renderedItems = items.map(item => {
        return this.renderListItem(item, style, {});
      }).join('');
      
      const tagName = style === 'ordered' ? 'ol' : 'ul';
      return `<${tagName}>${renderedItems}</${tagName}>`;
    }

    const style = data.style || 'unordered';
    const listTemplate = template[style];
    
    if (!listTemplate) {
      // 如果没有找到特定样式的模板，使用默认的HTML标签
      const tag = style === 'ordered' ? 'ol' : 'ul';
      const items = data.items.map(item => this.renderListItem(item, style, {})).join('');
      return `<${tag}>${items}</${tag}>`;
    }

    const items = data.items || [];
    const renderedItems = items.map(item => {
      return this.renderListItem(item, style, listTemplate);
    }).join('');

    if (listTemplate.wrapper) {
      return this.replaceVariables(listTemplate.wrapper, { items: renderedItems });
    }

    // 如果没有wrapper，使用默认包装
    const tagName = style === 'ordered' ? 'ol' : 'ul';
    return `<${tagName}>${renderedItems}</${tagName}>`;
  }

  /**
   * 渲染单个列表项（支持嵌套）
   * @param {string|Object} item - 列表项数据
   * @param {string} style - 列表样式
   * @param {Object} listTemplate - 列表模板
   * @returns {string} HTML字符串
   */
  renderListItem(item, style, listTemplate) {
    const itemData = typeof item === 'string' ? { content: item } : item;
    const content = itemData.content || itemData.text || '';
    
    let itemHtml = content;
    
    // 处理嵌套列表 - 使用专门的嵌套模板
    if (itemData.items && Array.isArray(itemData.items) && itemData.items.length > 0) {
      const nestedItems = itemData.items.map(nestedItem => {
        return this.renderListItem(nestedItem, style, listTemplate);
      }).join('');
      
      // 使用嵌套模板，如果没有则回退到简单HTML
      let nestedList;
      if (listTemplate && listTemplate.nested) {
        nestedList = this.replaceVariables(listTemplate.nested, { items: nestedItems });
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

  /**
   * 渲染引用块
   * @param {Object} data - 引用数据
   * @returns {string} HTML字符串
   */
  renderQuote(data) {
    const text = data.text || '';
    const caption = data.caption || '';
    
    return this.renderWithConditionalTemplate('quote', { text, caption }, 'caption');
  }

  /**
   * 渲染代码块
   * @param {Object} data - 代码数据
   * @returns {string} HTML字符串
   */
  renderCode(data) {
    return this.renderWithTemplate('code', {
      code: this.escapeHtml(data.code || ''),
      language: data.language || ''
    });
  }

  /**
   * 渲染分隔符块
   * @param {Object} data - 分隔符数据
   * @returns {string} HTML字符串
   */
  renderDelimiter(data) {
    return this.renderWithTemplate('delimiter', {}) || '<hr>';
  }

  /**
   * 渲染图片块
   * @param {Object} data - 图片数据
   * @returns {string} HTML字符串
   */
  renderImage(data) {
    const url = data.file?.url || data.url || '';
    const caption = data.caption || '';
    const alt = data.alt || caption || '';
    
    return this.renderWithConditionalTemplate('image', { url, caption, alt }, 'caption');
  }

  /**
   * 渲染原始HTML块
   * @param {Object} data - 原始HTML数据
   * @returns {string} HTML字符串
   */
  renderRaw(data) {
    return this.renderWithTemplate('raw', { html: data.html || '' }) || data.html || '';
  }

  /**
   * 渲染通用块（用于未知类型）
   * @param {string} type - 块类型
   * @param {Object} data - 块数据
   * @returns {string} HTML字符串
   */
  renderGeneric(type, data) {
    return this.renderWithTemplate(type, data);
  }

  /**
   * 通用模板渲染方法
   * @param {string} blockType - 块类型
   * @param {Object} variables - 变量对象
   * @param {string} subType - 子类型（可选）
   * @returns {string} 渲染后的HTML字符串
   */
  renderWithTemplate(blockType, variables, subType = null) {
    const template = this.templateLoader.getBlockTemplate(blockType, subType) || 
                    (subType ? this.templateLoader.getBlockTemplate(blockType) : null);
    
    return template ? this.replaceVariables(template, variables) : '';
  }

  /**
   * 带条件性内容的模板渲染方法
   * @param {string} blockType - 块类型
   * @param {Object} variables - 变量对象
   * @param {string} conditionalKey - 条件性内容的键名
   * @returns {string} 渲染后的HTML字符串
   */
  renderWithConditionalTemplate(blockType, variables, conditionalKey) {
    const template = this.templateLoader.getBlockTemplate(blockType);
    if (!template) {
      return '';
    }

    // 处理条件性内容显示
    const hasConditionalContent = variables[conditionalKey];
    const conditionalRegex = new RegExp(`\\{\\{#${conditionalKey}\\}\\}([\\s\\S]*?)\\{\\{\\/${conditionalKey}\\}\\}`, 'g');
    
    const processedTemplate = hasConditionalContent 
      ? template.replace(conditionalRegex, '$1')
      : template.replace(conditionalRegex, '');
    
    return this.replaceVariables(processedTemplate, variables);
  }

  /**
   * 替换模板中的变量
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @returns {string} 替换后的字符串
   */
  replaceVariables(template, variables) {
    if (!template || typeof template !== 'string') {
      return '';
    }

    let result = template;
    
    // 替换所有变量
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = value !== null && value !== undefined ? String(value) : '';
      result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), stringValue);
    });

    // 清理未替换的变量
    result = result.replace(/{{[^}]+}}/g, '');
    
    return result;
  }

  /**
   * 转义HTML特殊字符
   * @param {string} text - 需要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    if (!text || typeof text !== 'string') {
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
   * 获取所有提取的链接
   * @returns {Array} 所有提取的链接数组
   */
  getAllExtractedLinks() {
    return this.allExtractedLinks || [];
  }

  /**
   * 清空所有提取的链接
   */
  clearAllExtractedLinks() {
    this.allExtractedLinks = [];
  }


}

// ES6 模块导出
export default Renderer;