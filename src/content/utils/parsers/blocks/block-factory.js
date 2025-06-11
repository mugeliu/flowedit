/**
 * 块解析器工厂函数
 * 提供通用的块解析器创建功能，减少重复代码
 * 包含所有工具函数
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
 * 内联标签处理配置
 * 定义哪些标签需要转换为span，哪些保持原样但添加样式
 */
const INLINE_TAG_CONFIG = {
  // 需要转换为span的标签（因为需要特殊样式处理）
  convertToSpan: {
    'mark': 'mark',  // 标记需要背景色等复杂样式
    'code': 'code'   // 代码需要特殊字体和背景
  },
  // 保持原标签但添加样式的标签
  keepOriginal: {
    'b': 'strong',
    'i': 'em', 
    'u': 'u',
    's': 's'
  },
  // 特殊处理的标签
  special: {
    'a': 'link'  // 链接需要保持href属性
  }
};

/**
 * 处理EditorJS文本中的内联样式标记
 * @param {string} text - 包含EditorJS内联样式的文本
 * @param {Function} styleProvider - 样式提供函数
 * @returns {string} 处理后的HTML文本
 */
export function processInlineStyles(text, styleProvider) {
  if (!text || typeof text !== 'string') return '';
  if (!styleProvider) return text; // 无样式提供函数时直接返回原文本
  
  let processedText = text;
  
  // 处理需要转换为span的标签
  Object.entries(INLINE_TAG_CONFIG.convertToSpan).forEach(([tag, styleKey]) => {
    const regex = new RegExp(`<${tag}(?:\\s+class="[^"]*")?>(.*?)<\\/${tag}>`, 'g');
    processedText = processedText.replace(regex, (match, content) => {
      const styles = styleProvider('emphasis', styleKey);
      return generateStyledHtml('span', content, styles, 'textstyle');
    });
  });
  
  // 处理保持原标签但添加样式的标签
  Object.entries(INLINE_TAG_CONFIG.keepOriginal).forEach(([tag, styleKey]) => {
    const regex = new RegExp(`<${tag}>(.*?)<\\/${tag}>`, 'g');
    processedText = processedText.replace(regex, (match, content) => {
      const styles = styleProvider('emphasis', styleKey);
      return generateStyledHtml(tag, content, styles);
    });
  });
  
  // 处理链接标签（特殊处理，保持href属性）
  processedText = processedText.replace(/<a\s+href="([^"]*?)"[^>]*>(.*?)<\/a>/g, (match, href, content) => {
    const linkStyles = styleProvider('emphasis', 'link');
    const attributes = { href };
    return generateStyledHtml('a', content, linkStyles, attributes);
  });
  
  return processedText;
}

/**
 * 添加自定义内联标签处理器
 * @param {string} tag - HTML标签名
 * @param {string} styleKey - 样式键名
 * @param {string} mode - 处理模式: 'convertToSpan' | 'keepOriginal' | 'special'
 */
export function addInlineTagHandler(tag, styleKey, mode = 'keepOriginal') {
  if (INLINE_TAG_CONFIG[mode]) {
    INLINE_TAG_CONFIG[mode][tag] = styleKey;
  }
}

/**
 * 生成块级元素的标准HTML结构（带section容器）
 * @param {string} contentTag - 内容标签名（如 'p', 'h1' 等）
 * @param {string} content - 内容文本
 * @param {Function} styleProvider - 样式提供函数
 * @param {string} blockType - 块类型（用于获取样式）
 * @param {string} styleVariant - 样式变体（如 'h1', 'h2' 等）
 * @param {Object} contentAttributes - 内容标签的额外属性
 * @param {Object} sectionAttributes - section标签的额外属性
 * @param {Function} customProcessor - 自定义处理函数，接收 (contentHtml, sectionStyles) 参数
 * @returns {string} 完整的HTML字符串
 */
export function generateBlockHtml(
  contentTag,
  content,
  styleProvider,
  blockType,
  styleVariant = null,
  contentAttributes = {},
  sectionAttributes = {},
  customProcessor = null
) {
  // 获取内容样式
  const contentStyles = styleProvider ? styleProvider(blockType, styleVariant) : {};
  
  // 生成内容HTML
  const contentHtml = generateStyledHtml(contentTag, content, contentStyles, contentAttributes);
  
  // 获取section样式
  const sectionStyles = styleProvider ? styleProvider('section') : {};
  
  // 如果有自定义处理函数，使用它来处理
  if (customProcessor && typeof customProcessor === 'function') {
    return customProcessor(contentHtml, sectionStyles, sectionAttributes);
  }
  
  // 默认处理：生成section包裹的HTML
  return generateStyledHtml('section', contentHtml, sectionStyles, sectionAttributes);
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

/**
 * 创建块解析器的工厂函数
 * @param {Object} config - 配置对象
 * @param {string} config.blockType - 块类型名称（用于获取样式）
 * @param {string} config.contentTag - 内容HTML标签名
 * @param {string} config.textField - 文本字段名（默认为'text'）
 * @param {string} config.styleVariant - 样式变体（可选）
 * @param {Function} config.getStyleVariant - 动态获取样式变体的函数（可选）
 * @param {Function} config.getContentAttributes - 获取内容属性的函数（可选）
 * @param {Function} config.getSectionAttributes - 获取section属性的函数（可选）
 * @param {Function} config.preprocessText - 文本预处理函数（可选）
 * @param {Function} config.customProcessor - 自定义处理函数（可选）
 * @param {boolean} config.processInlineStyles - 是否处理内联样式（默认true）
 * @returns {Function} 块解析器函数
 */
export function createBlockParser(config) {
  const {
    blockType,
    contentTag,
    textField = 'text',
    styleVariant = null,
    getStyleVariant = null,
    getContentAttributes = null,
    getSectionAttributes = null,
    preprocessText = null,
    customProcessor = null,
    processInlineStyles: shouldProcessInlineStyles = true
  } = config;

  // 验证必需参数
  if (!blockType || !contentTag) {
    throw new Error('blockType and contentTag are required');
  }

  return function(block, options = {}) {
    // 基础验证
    if (!block || !block.data || !block.data[textField]) {
      return '';
    }

    const { styleProvider } = options;
    const { data } = block;
    let text = data[textField];

    // 文本预处理
    if (preprocessText && typeof preprocessText === 'function') {
      text = preprocessText(text, data, options);
    }

    // 处理内联样式
    if (shouldProcessInlineStyles) {
      text = processInlineStyles(text, styleProvider);
    }

    // 获取样式变体
    let variant = styleVariant;
    if (getStyleVariant && typeof getStyleVariant === 'function') {
      variant = getStyleVariant(data, options);
    }

    // 获取内容属性
    let contentAttributes = {};
    if (getContentAttributes && typeof getContentAttributes === 'function') {
      contentAttributes = getContentAttributes(data, options);
    }

    // 获取section属性
    let sectionAttributes = {};
    if (getSectionAttributes && typeof getSectionAttributes === 'function') {
      sectionAttributes = getSectionAttributes(data, options);
    }

    // 生成HTML
    return generateBlockHtml(
      contentTag,
      text,
      styleProvider,
      blockType,
      variant,
      contentAttributes,
      sectionAttributes,
      customProcessor
    );
  };
}