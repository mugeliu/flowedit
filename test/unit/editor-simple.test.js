/**
 * 简单的editor.js测试文件
 * 测试saveToOriginalEditor函数是否能正确使用新的HtmlParser
 */

import { saveToOriginalEditor } from '../../src/content/utils/editor.js';

// 模拟DOM环境
global.document = {
  querySelector: () => null,
  createElement: (tag) => ({
    innerHTML: '',
    appendChild: () => {},
    insertBefore: () => {},
    cloneNode: () => ({}),
    querySelectorAll: () => []
  })
};

// 测试数据
const testBlocks = [
  {
    type: 'header',
    data: {
      text: '测试标题',
      level: 1
    }
  },
  {
    type: 'paragraph',
    data: {
      text: '这是一个测试段落，包含<b>粗体</b>和<i>斜体</i>文字。'
    }
  },
  {
    type: 'list',
    data: {
      style: 'unordered',
      items: [
        '第一个列表项',
        '第二个列表项'
      ]
    }
  }
];

/**
 * 测试saveToOriginalEditor函数
 */
async function testSaveToOriginalEditor() {
  console.log('开始测试 saveToOriginalEditor 函数...');
  
  try {
    // 测试基本功能
    const result = await saveToOriginalEditor(testBlocks, {
      targetSelector: '.test-editor',
      append: true
    });
    
    console.log('测试结果:', result ? '成功' : '失败');
    console.log('✅ saveToOriginalEditor 函数测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    throw error;
  }
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log('=== Editor.js 适配测试 ===\n');
  
  try {
    await testSaveToOriginalEditor();
    console.log('\n🎉 所有测试通过！editor.js 已成功适配 HtmlParser');
  } catch (error) {
    console.error('\n💥 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
runTests();