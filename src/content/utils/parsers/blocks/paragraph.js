/**
 * 段落解析器
 * 参考 editorjs-html 的 paragraph.ts，增加样式支持
 * 现在使用工厂函数简化实现
 */

import { createBlockParser } from './block-factory.js';

/**
 * 段落解析器 - 使用工厂函数创建
 * 生成section包裹的段落HTML结构
 */
const paragraph = createBlockParser({
  blockType: 'paragraph',
  contentTag: 'p'
});

export default paragraph;

// 如果需要自定义逻辑，可以使用完整的工厂函数：
// import { createBlockParser } from './block-factory.js';
// const paragraph = createBlockParser({
//   blockType: 'paragraph',
//   contentTag: 'p',
//   // 在这里添加自定义配置
// });