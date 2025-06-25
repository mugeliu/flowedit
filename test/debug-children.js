/**
 * 调试children结构重复输出问题
 */

import { TemplateEngine } from '../src/content/utils/converter/template-engine.js';
import { blockTemplates, inlineStyles } from '../src/content/utils/converter/config.js';

// 创建模板引擎实例
const templateEngine = new TemplateEngine({
  blockTemplates,
  inlineStyles,
  enableCache: false
});

// 简单测试
const testBlock = {
  type: 'paragraph',
  data: {
    text: '简单测试文本'
  }
};

console.log('开始测试...');
const result = templateEngine.buildHTML(testBlock);
console.log('结果:', result);
console.log('测试完成');

// 检查paragraph模板结构
console.log('\nParagraph模板结构:');
console.log(JSON.stringify(blockTemplates.paragraph.default, null, 2));