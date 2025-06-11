/**
 * 标题解析器
 * 参考 editorjs-html 的 header.ts，增加样式支持
 */

import { generateStyledHtml, processInlineStyles } from './utils.js';

/**
 * 标题解析器 - 生成section包裹的标题HTML结构
 * @param {Object} block - EditorJS标题块数据
 * @param {Function} styleProvider - 样式提供函数
 * @returns {string} HTML字符串
 */
function header(block, options = {}) {
  if (!block || !block.data || !block.data.text) {
    return '';
  }
  
  const { styleProvider } = options;
  const { data } = block;
  const level = data.level || 1;
  const tag = `h${level}`;
  
  // 获取对应级别的标题样式
  const headerStyles = styleProvider ? styleProvider('header', tag) : {};
  
  // 处理文本中的内联样式
  const processedText = processInlineStyles(data.text, styleProvider);
  
  // 创建标题HTML结构
  const headerHtml = generateStyledHtml(tag, processedText, headerStyles);
  
  // section的基础样式
  const sectionStyles = {
    textIndent: '0px',
    marginBottom: '8px'
  };
  
  // 添加标题特有的属性
  const attributes = {
    id: data.id || '',
    'data-heading': 'true'
  };
  
  return generateStyledHtml('section', headerHtml, sectionStyles, attributes);
}

export default header;