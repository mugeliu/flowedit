/**
 * 测试内联样式处理函数
 */

import { processInlineStyles } from './blocks/utils.js';
import { createStyleProvider, defaultStyleConfig } from './style-config.js';

// 创建样式提供函数
const styleProvider = createStyleProvider(defaultStyleConfig);

// 测试数据
const testTexts = [
  '这是一个测试，主要<b>测试</b>大小和<i>样式</i>',
  '<mark class="cdx-marker">Editor.js outputs JSON object</mark>',
  '这里有<code>代码</code>和<u>下划线</u>以及<s>删除线</s>',
  '混合测试：<b>粗体</b>和<i>斜体</i>还有<mark>标记</mark>'
];

console.log('=== 测试内联样式处理函数 ===\n');

testTexts.forEach((text, index) => {
  console.log(`测试 ${index + 1}: ${text}`);
  const result = processInlineStyles(text, styleProvider);
  console.log(`结果: ${result}`);
  console.log('---');
});

console.log('\n测试完成！');