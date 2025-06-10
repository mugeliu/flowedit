/**
 * 段落解析器
 * 参考 editorjs-html 的 paragraph.ts，增加样式支持
 */

import { generateStyledHtml, processInlineStyles } from './utils.js';

/**
 * 段落解析器 - 生成section标签
 * @param {Object} block - EditorJS段落块数据
 * @param {Function} styleProvider - 样式提供函数
 * @returns {string} HTML字符串
 */
export function paragraph(block, styleProvider) {
  if (!block || !block.data || !block.data.text) {
    return '';
  }
  
  const text = processInlineStyles(block.data.text, styleProvider);
  const styles = styleProvider('paragraph');
  
  // 添加leaf=""属性和textIndent样式
  const sectionStyles = {
    ...styles,
    textIndent: '0px',
    marginBottom: '8px'
  };
  
  return generateStyledHtml('section', `<span leaf="">${text}</span>`, sectionStyles);
}