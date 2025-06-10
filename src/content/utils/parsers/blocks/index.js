/**
 * EditorJS Block Parsers
 * 参考 editorjs-html 的设计，将各种 block 类型的解析器分离到单独文件
 * 当前只包含 header 和 paragraph 解析器
 */

import paragraph from './paragraph.js';
import header from './header.js';

// 默认解析器映射
const defaultParsers = {
  paragraph,
  header
};

export default defaultParsers;

// 也可以单独导出
export {
  paragraph,
  header
};