/**
 * 标题解析器
 * 参考 editorjs-html 的 header.ts，增加样式支持
 * 现在使用工厂函数简化实现
 */

import { createBlockParser } from './block-factory.js';

/**
 * 标题解析器 - 使用工厂函数创建
 * 生成section包裹的标题HTML结构，支持不同级别的标题
 */
/**
 * 创建动态标题解析器
 * @param {Object} block - 块数据
 * @param {Object} options - 选项
 * @returns {string} HTML字符串
 */
function createHeaderParser(block, options = {}) {
  if (!block || !block.data || !block.data.text) {
    return '';
  }

  const { data } = block;
  const level = Math.min(Math.max(data.level || 1, 1), 6);
  const contentTag = `h${level}`;

  // 使用动态的 contentTag 创建解析器
  const dynamicParser = createBlockParser({
    blockType: 'header',
    contentTag: contentTag,
    getStyleVariant: () => `h${level}`,
    getContentAttributes: (data) => ({
      ...(data.id && { id: data.id })
    }),
    getSectionAttributes: () => ({ 'data-heading': 'true' })
  });

  return dynamicParser(block, options);
}

const header = createHeaderParser;

export default header;
