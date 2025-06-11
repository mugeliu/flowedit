/**
 * 引用解析器
 * 支持EditorJS的quote块类型
 */

import { createBlockParser } from './block-factory.js';

/**
 * 引用解析器 - 处理quote块
 * 生成section包裹的blockquote HTML结构
 */
const quote = createBlockParser({
  blockType: 'blockquote',
  contentTag: 'blockquote',
  preprocessText: (text, data) => {
    // 处理引用内容和署名
    let content = text;
    if (data.caption) {
      content += `<cite>${data.caption}</cite>`;
    }
    return content;
  },
  getSectionAttributes: (data) => ({
    'data-alignment': data.alignment || 'left'
  })
});

export default quote;