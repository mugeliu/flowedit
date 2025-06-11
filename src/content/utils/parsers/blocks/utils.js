/**
 * 公共工具函数
 */

/**
 * 生成带样式的HTML
 * @param {string} tag - HTML标签名
 * @param {string} content - 内容
 * @param {Object} styles - 样式对象或样式字符串
 * @param {string|Object} attributesOrSpecialAttr - 特殊属性名（如'textstyle'）或额外的HTML属性对象
 * @returns {string} 带样式的HTML字符串
 */
export function generateStyledHtml(tag, content, styles = {}, attributesOrSpecialAttr = {}) {
  // 处理样式
  let styleStr = '';
  if (typeof styles === 'string') {
    styleStr = styles ? ` style="${styles}"` : '';
  } else if (typeof styles === 'object' && styles !== null) {
    const styleArray = Object.entries(styles)
      .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
      .filter(style => style.includes(': '));
    styleStr = styleArray.length > 0 ? ` style="${styleArray.join('; ')}"` : '';
  }
  
  // 处理属性
  let attrsStr = '';
  if (typeof attributesOrSpecialAttr === 'string') {
    // 如果是字符串，作为特殊属性名添加空值属性
    attrsStr = ` ${attributesOrSpecialAttr}=""`;
  } else if (typeof attributesOrSpecialAttr === 'object' && attributesOrSpecialAttr !== null) {
    // 如果是对象，构建属性字符串
    const attrs = Object.entries(attributesOrSpecialAttr)
      .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
      .join(' ');
    attrsStr = attrs ? ` ${attrs}` : '';
  }
  
  return `<${tag}${attrsStr}${styleStr}>${content}</${tag}>`;
}

/**
 * 转义HTML特殊字符
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的文本
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 处理EditorJS文本中的内联样式标记，将所有内联标签转换为span标签形式
 * @param {string} text - 包含EditorJS内联样式的文本
 * @param {Function} styleProvider - 样式提供函数
 * @returns {string} 处理后的HTML文本
 */
export function processInlineStyles(text, styleProvider) {
  if (!text || typeof text !== 'string') return '';
  if (!styleProvider) return text; // EditorJS已经是HTML格式，无需转义
  
  let processedText = text;
  
  // 处理 <b> 标签 - EditorJS粗体格式，转换为span标签
  processedText = processedText.replace(/<b>(.*?)<\/b>/g, (match, content) => {
    const strongStyles = styleProvider('emphasis', 'strong');
    return generateStyledHtml('span', content, strongStyles, 'textstyle');
  });
  
  // 处理 <i> 标签 - EditorJS斜体格式，转换为span标签
  processedText = processedText.replace(/<i>(.*?)<\/i>/g, (match, content) => {
    const emStyles = styleProvider('emphasis', 'em');
    return generateStyledHtml('span', content, emStyles, 'textstyle');
  });
  
  // 处理 <code> 标签 - EditorJS代码格式，转换为span标签
  processedText = processedText.replace(/<code(?:\s+class="[^"]*")?>(.*?)<\/code>/g, (match, content) => {
    const codeStyles = styleProvider('emphasis', 'code');
    return generateStyledHtml('span', content, codeStyles, 'textstyle');
  });
  
  // 处理 <mark> 标签 - EditorJS标记格式，转换为span标签
  processedText = processedText.replace(/<mark(?:\s+class="[^"]*")?>(.*?)<\/mark>/g, (match, content) => {
    const markStyles = styleProvider('emphasis', 'mark');
    return generateStyledHtml('span', content, markStyles, 'textstyle');
  });
  
  // 处理 <u> 标签 - EditorJS下划线格式，转换为span标签
  processedText = processedText.replace(/<u>(.*?)<\/u>/g, (match, content) => {
    const underlineStyles = styleProvider('emphasis', 'u');
    return generateStyledHtml('span', content, underlineStyles, 'textstyle');
  });
  
  // 处理 <s> 标签 - EditorJS删除线格式，转换为span标签
  processedText = processedText.replace(/<s>(.*?)<\/s>/g, (match, content) => {
    const strikeStyles = styleProvider('emphasis', 's');
    return generateStyledHtml('span', content, strikeStyles, 'textstyle');
  });
  
  // 处理 <a> 标签 - EditorJS链接格式，转换为span标签
  processedText = processedText.replace(/<a\s+href="([^"]*?)"[^>]*>(.*?)<\/a>/g, (match, href, content) => {
    const linkStyles = styleProvider('emphasis', 'link');
    return generateStyledHtml('span', content, linkStyles, 'textstyle');
  });
  
  return processedText;
}

/**
 * 将驼峰命名转换为CSS属性名
 * @param {string} camelCase - 驼峰命名的属性
 * @returns {string} CSS属性名
 */
export function camelToKebab(camelCase) {
  return camelCase.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * 将样式对象转换为CSS字符串
 * @param {Object} styles - 样式对象
 * @returns {string} CSS字符串
 */
export function stylesToCss(styles) {
  if (!styles || typeof styles !== 'object') return '';
  
  return Object.entries(styles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .filter(style => style.includes(': '))
    .join('; ');
}