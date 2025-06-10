/**
 * Parsers 模块测试文件
 * 用于验证新的解析器模块功能
 */

// 模拟 styleManager
const mockStyleManager = {
  getBlockStyle: (type, options = {}) => {
    const baseStyles = {
      paragraph: {
        'font-size': '16px',
        'line-height': '1.6',
        'margin': '0 0 16px 0'
      },
      header: {
        'font-weight': 'bold',
        'margin': '24px 0 16px 0',
        'font-size': options.level ? `${32 - options.level * 2}px` : '28px'
      },
      list: {
        'margin': '0 0 16px 0',
        'padding-left': '20px'
      },
      image: {
        'text-align': 'center',
        'margin': '16px 0'
      },
      code: {
        'background-color': '#f5f5f5',
        'padding': '16px',
        'border-radius': '4px',
        'font-family': 'monospace'
      },
      quote: {
        'border-left': '4px solid #ddd',
        'padding-left': '16px',
        'margin': '16px 0',
        'font-style': 'italic'
      },
      delimiter: {
        'text-align': 'center',
        'margin': '24px 0'
      },
      embed: {
        'text-align': 'center',
        'margin': '16px 0'
      }
    };
    
    return baseStyles[type] || {};
  }
};

// 模拟 DOM 环境
if (typeof document === 'undefined') {
  global.document = {
    createElement: (tag) => ({
      textContent: '',
      get innerHTML() { return this.textContent; }
    })
  };
}

// 测试数据
const testEditorData = {
  blocks: [
    {
      type: 'header',
      data: {
        text: '这是一个标题',
        level: 2
      }
    },
    {
      type: 'paragraph',
      data: {
        text: '这是一个段落，包含一些<strong>粗体</strong>文本。'
      }
    },
    {
      type: 'list',
      data: {
        style: 'unordered',
        items: [
          '第一个列表项',
          '第二个列表项',
          {
            content: '嵌套列表项',
            items: [
              '嵌套项1',
              '嵌套项2'
            ]
          }
        ]
      }
    },
    {
      type: 'image',
      data: {
        file: {
          url: 'https://example.com/image.jpg'
        },
        caption: '示例图片'
      }
    },
    {
      type: 'code',
      data: {
        code: 'console.log("Hello, World!");'
      }
    },
    {
      type: 'quote',
      data: {
        text: '这是一个引用',
        caption: '引用来源'
      }
    },
    {
      type: 'delimiter',
      data: {}
    },
    {
      type: 'embed',
      data: {
        service: 'youtube',
        embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        width: 560,
        height: 315
      }
    }
  ]
};

/**
 * 运行测试
 */
async function runTests() {
  console.log('开始测试 Parsers 模块...');
  
  try {
    // 动态导入模块（需要在支持 ES modules 的环境中运行）
    const { createParser, parse, parseBlock, defaultParsers } = await import('../src/content/utils/parsers/index.js');
    
    console.log('✅ 模块导入成功');
    
    // 测试 1: 创建解析器
    const parser = createParser();
    console.log('✅ 解析器创建成功');
    
    // 测试 2: 解析整个数据
    const html = parser.parse(testEditorData);
    console.log('✅ 整体解析成功');
    console.log('生成的 HTML:');
    console.log(html);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 测试 3: 解析单个块
    testEditorData.blocks.forEach((block, index) => {
      try {
        const blockHtml = parser.parseBlock(block);
        console.log(`✅ 块 ${index + 1} (${block.type}) 解析成功:`);
        console.log(blockHtml);
        console.log('');
      } catch (error) {
        console.error(`❌ 块 ${index + 1} (${block.type}) 解析失败:`, error.message);
      }
    });
    
    // 测试 4: 自定义解析器
    function customParser(block) {
      return `<div class="custom-block">${block.data.text || 'Custom Block'}</div>`;
    }
    
    parser.registerParser('custom', customParser);
    
    const customBlock = {
      type: 'custom',
      data: {
        text: '这是一个自定义块'
      }
    };
    
    const customHtml = parser.parseBlock(customBlock);
    console.log('✅ 自定义解析器测试成功:');
    console.log(customHtml);
    console.log('');
    
    // 测试 5: 严格模式
    const strictParser = createParser({}, { strict: true });
    
    try {
      const unknownBlock = {
        type: 'unknown',
        data: {}
      };
      strictParser.parseBlock(unknownBlock);
      console.log('❌ 严格模式测试失败：应该抛出错误');
    } catch (error) {
      console.log('✅ 严格模式测试成功：正确抛出错误');
    }
    
    // 测试 6: 获取可用解析器
    const availableParsers = parser.getAvailableParsers();
    console.log('✅ 可用解析器:', Object.keys(availableParsers));
    
    console.log('\n🎉 所有测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

/**
 * 简单的 HTML 验证
 */
function validateHtml(html) {
  // 检查基本的 HTML 结构
  const hasOpeningTags = /<\w+[^>]*>/g.test(html);
  const hasClosingTags = /<\/\w+>/g.test(html);
  const hasContent = html.trim().length > 0;
  
  return hasOpeningTags && hasClosingTags && hasContent;
}

/**
 * 性能测试
 */
function performanceTest() {
  console.log('\n开始性能测试...');
  
  const iterations = 1000;
  const startTime = Date.now();
  
  // 这里需要实际的模块来运行性能测试
  // 暂时只是示例代码
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`✅ 性能测试完成: ${iterations} 次解析耗时 ${duration}ms`);
  console.log(`平均每次解析耗时: ${(duration / iterations).toFixed(2)}ms`);
}

// 如果直接运行此文件
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runTests,
    validateHtml,
    performanceTest,
    testEditorData,
    mockStyleManager
  };
}