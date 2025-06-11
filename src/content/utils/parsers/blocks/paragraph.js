/**
 * 段落解析器
 * 参考 editorjs-html 的 paragraph.ts，增加样式支持
 */

import { generateStyledHtml, processInlineStyles } from './utils.js';

/**
 * 段落解析器 - 生成section包裹的段落HTML结构
 * @param {Object} block - EditorJS段落块数据
 * @param {Function} styleProvider - 样式提供函数
 * @returns {string} HTML字符串
 */
function paragraph(block, options = {}) {
  if (!block || !block.data || !block.data.text) {
    return '';
  }
  
  const { styleProvider } = options;
  const text = processInlineStyles(block.data.text, styleProvider);
  const paragraphStyles = styleProvider ? styleProvider('paragraph') : {};
  
  // 创建段落HTML结构
  const paragraphHtml = generateStyledHtml('p', text, paragraphStyles);
  
  // section的基础样式
  const sectionStyles = {
    textIndent: '0px',
    marginBottom: '8px'
  };
  
  return generateStyledHtml('section', paragraphHtml, sectionStyles);
}

export default paragraph;