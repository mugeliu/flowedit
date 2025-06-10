/**
 * 测试span标签转换功能
 */

import { processInlineStyles } from './blocks/utils.js';
import { paragraph } from './blocks/paragraph.js';
import { header } from './blocks/header.js';
import { createStyleProvider, defaultStyleConfig } from './style-config.js';

// 创建样式提供函数
const styleProvider = createStyleProvider(defaultStyleConfig);

// 测试数据
const testData = {
  paragraph: {
    type: 'paragraph',
    data: {
      text: '这是<b>粗体</b>和<i>斜体</i>还有<mark class="cdx-marker">标记</mark>以及<code>代码</code>和<u>下划线</u>和<s>删除线</s>的测试。'
    }
  },
  header: {
    type: 'header',
    data: {
      text: '这是一个<b>包含样式</b>的标题',
      level: 2,
      id: 'test-header'
    }
  }
};

console.log('=== 测试span标签转换 ===');

// 测试内联样式处理
console.log('\n--- 内联样式处理测试 ---');
const inlineResult = processInlineStyles(testData.paragraph.data.text, styleProvider);
console.log('原始文本:', testData.paragraph.data.text);
console.log('处理结果:', inlineResult);

// 测试段落解析
console.log('\n--- 段落解析测试 ---');
const paragraphResult = paragraph(testData.paragraph, styleProvider);
console.log('段落结果:', paragraphResult);

// 测试标题解析
console.log('\n--- 标题解析测试 ---');
const headerResult = header(testData.header, styleProvider);
console.log('标题结果:', headerResult);

console.log('\n=== 测试完成 ===');