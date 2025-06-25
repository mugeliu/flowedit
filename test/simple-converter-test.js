/**
 * EditorJS Converter 测试文件
 * 测试 /Users/mugeliu/program/project/flowedit/src/content/utils/converter/ 模块的解析功能
 */

// 导入实际的 converter 模块
import { EditorJSParser, parseEditorJS, validateEditorData } from '../src/content/utils/converter/index.js';

// 模拟 EditorJS 数据 - 包含多种块类型
const testData = {
  time: 1672531200000,
  blocks: [
    {
      id: "test1",
      type: "header",
      data: {
        text: "这是一个H2标题",
        level: 2
      }
    },
    {
      id: "test2", 
      type: "paragraph",
      data: {
        text: "这是一个段落，包含一些<strong>粗体</strong>和<em>斜体</em>文本。"
      }
    },
    {
      id: "test3",
      type: "list",
      data: {
        style: "unordered",
        items: [
          "第一个无序列表项",
          "第二个无序列表项",
          "第三个无序列表项"
        ]
      }
    },
    {
      id: "test4",
      type: "list",
      data: {
        style: "ordered",
        items: [
          "第一个有序列表项",
          "第二个有序列表项",
          "第三个有序列表项"
        ]
      }
    },
    {
      id: "test5",
      type: "quote",
      data: {
        text: "这是一个引用块，用于突出显示重要内容。",
        caption: "引用来源",
        alignment: "left"
      }
    },
    {
      id: "test6",
      type: "code",
      data: {
        code: "function hello() {\n  console.log('Hello, World!');\n  return true;\n}"
      }
    },
    {
      id: "test7",
      type: "delimiter",
      data: {}
    },
    {
      id: "test8",
      type: "header",
      data: {
        text: "这是一个H3标题",
        level: 3
      }
    },
    {
      id: "test9",
      type: "paragraph",
      data: {
        text: "这是另一个段落，用于测试多个段落的解析效果。包含一些特殊字符：&lt;script&gt;alert('test')&lt;/script&gt;"
      }
    }
  ],
  version: "2.28.2"
};

// 测试函数
function runTests() {
  console.log('=== EditorJS Converter 模块测试开始 ===\n');
  
  try {
    // 测试1: 模块导入验证
    console.log('测试1: 模块导入验证');
    console.log('EditorJSParser:', typeof EditorJSParser);
    console.log('parseEditorJS:', typeof parseEditorJS);
    console.log('validateEditorData:', typeof validateEditorData);
    console.log('---\n');
    
    // 测试2: 数据验证
    console.log('测试2: 数据验证');
    const isValid = validateEditorData(testData);
    console.log('数据验证结果:', isValid);
    console.log('---\n');
    
    // 测试3: 解析器实例创建
    console.log('测试3: 解析器实例创建');
    const parser = new EditorJSParser();
    console.log('解析器创建成功:', parser instanceof EditorJSParser);
    console.log('---\n');
    
    // 测试4: 逐个块解析测试
    console.log('测试4: 逐个块解析测试');
    testData.blocks.forEach((block, index) => {
      console.log(`\n--- 块 ${index + 1} (${block.type}) ---`);
      console.log('输入数据:', JSON.stringify(block, null, 2));
      
      try {
        const blockResult = parser.parseBlock(block);
        console.log('解析结果:');
        console.log(blockResult);
      } catch (error) {
        console.log('解析失败:', error.message);
      }
    });
    
    console.log('\n--- 完整解析结果 ---');
    const fullResult = parser.parse(testData);
    console.log('完整HTML长度:', fullResult ? fullResult.length : 0);
    console.log('完整HTML结果:');
    console.log(fullResult);
    console.log('---\n');
    
    console.log('=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 如果在 Node.js 环境中直接运行
if (typeof module !== "undefined" && module.exports) {
  runTests();
}

// 导出供其他模块使用
if (typeof module !== "undefined" && module.exports) {
  module.exports = { testData, runTests };
}

// 直接运行测试
runTests();
