/**
 * 分隔符解析器
 * 支持EditorJS的delimiter块类型
 */

import { createBlockParser } from './block-factory.js';

/**
 * 分隔符解析器 - 处理delimiter块
 * 生成section包裹的分隔符HTML结构
 */
const delimiter = createBlockParser({
  blockType: 'delimiter',
  contentTag: 'div',
  textField: 'text', // delimiter通常没有文本内容
  preprocessText: () => '***', // 默认分隔符内容
  getContentAttributes: () => ({
    'class': 'delimiter'
  }),
  getSectionAttributes: () => ({
    'data-delimiter': 'true'
  })
});

export default delimiter;