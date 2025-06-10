/**
 * EditorJS到span标签转换示例
 * 展示如何使用新的样式配置系统
 */

import { processInlineStyles } from './blocks/utils.js';
import { paragraph } from './blocks/paragraph.js';
import { header } from './blocks/header.js';
import { 
  createStyleProvider, 
  defaultStyleConfig, 
  darkStyleConfig, 
  minimalStyleConfig 
} from './style-config.js';

// 示例EditorJS数据
const editorJSData = {
  blocks: [
    {
      type: 'header',
      data: {
        text: 'AI淘汰的是"雇员"，但"老板"永远稀缺',
        level: 1,
        id: 'main-title'
      }
    },
    {
      type: 'paragraph',
      data: {
        text: '这是<mark class="cdx-marker">我想要达</mark>到的一个效果，<b>如果这个</b><u>效果还不是</u><i>太好</i>，我将继续优化。'
      }
    },
    {
      type: 'paragraph',
      data: {
        text: '支持多种内联样式：<code>代码块</code>、<s>删除线</s>、<a href="https://example.com">链接</a>等。'
      }
    }
  ]
};

/**
 * 解析EditorJS数据为HTML
 * @param {Object} data - EditorJS数据
 * @param {Object} styleConfig - 样式配置
 * @returns {string} HTML字符串
 */
function parseEditorJSData(data, styleConfig = defaultStyleConfig) {
  const styleProvider = createStyleProvider(styleConfig);
  const results = [];
  
  for (const block of data.blocks) {
    let html = '';
    
    switch (block.type) {
      case 'header':
        html = header(block, styleProvider);
        break;
      case 'paragraph':
        html = paragraph(block, styleProvider);
        break;
      default:
        console.warn(`未支持的块类型: ${block.type}`);
        continue;
    }
    
    if (html) {
      results.push(html);
    }
  }
  
  return results.join('\n');
}

// 测试不同主题
console.log('=== 默认主题 ===');
const defaultResult = parseEditorJSData(editorJSData, defaultStyleConfig);
console.log(defaultResult);

console.log('\n=== 暗色主题 ===');
const darkResult = parseEditorJSData(editorJSData, darkStyleConfig);
console.log(darkResult);

console.log('\n=== 简洁主题 ===');
const minimalResult = parseEditorJSData(editorJSData, minimalStyleConfig);
console.log(minimalResult);

// 展示预期的HTML结构
console.log('\n=== 预期的HTML结构示例 ===');
console.log(`
<section style="text-indent: 0px; margin-bottom: 8px;">
  <span leaf="">这是<span textstyle="" style="background-color: #ff6827">我想要达</span>到的一个效果，<span textstyle="" style="font-weight: bold">如果这个</span><span textstyle="" style="text-decoration: none">效果还不是</span><span textstyle="" style="font-style: italic; text-decoration: none">太好</span>，我将继续优化。</span>
</section>
`);

console.log('\n=== 配置说明 ===');
console.log('1. 所有EditorJS的内联标签都转换为span标签');
console.log('2. 每个span标签都有textstyle=""属性');
console.log('3. 块级元素使用section标签包装');
console.log('4. 支持多种主题配置');
console.log('5. 样式通过CSS-in-JS方式应用');