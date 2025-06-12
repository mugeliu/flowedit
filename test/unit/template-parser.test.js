/**
 * Template Parser 测试文件
 * 测试基于模板的HTML解析器模块
 */

import { HtmlParser, HTML_TEMPLATES } from '../../src/content/utils/parser-html.js';

// 测试数据 - 来自 parsers-test-styled-parser.js
const testBlocks = {
  "time": 1749624719024,
  "blocks": [
    {
      "id": "JBmKW2OQ57",
      "type": "header",
      "data": {
        "text": "一碗面，勾勒思乡千里，道尽黄河入江南",
        "level": 1
      }
    },
    {
      "id": "ar2C32tDPG",
      "type": "quote",
      "data": {
        "text": "\"舌尖上的西北，灵魂里的故乡\"",
        "caption": "来自尊贵的editorjs",
        "alignment": "left"
      }
    },
    {
      "id": "KrTXMNlfjk",
      "type": "header",
      "data": {
        "text": "缘起",
        "level": 2
      }
    },
    {
      "id": "nWWfhrbnPr",
      "type": "paragraph",
      "data": {
        "text": "夜色渐浓，姑苏城的街道<code class=\"inline-code\">灯火璀璨</code>。当您推开麦玉犇兰州牛肉面的门，那<b>浓郁的</b>牛肉香气扑面而来。"
      }
    },
    {
      "id": "sxbPF0RtBb",
      "type": "paragraph",
      "data": {
        "text": "我们希望这份香气能让您仿佛<mark class=\"cdx-marker\">穿越千里</mark><i></i>，感受到黄河奔涌、戈壁辽阔的<a href=\"http://www.baidu.com\">西北家园</a>。"
      }
    },
    {
      "id": "jsH3W8eDl5",
      "type": "paragraph",
      "data": {
        "text": "\"麦玉犇\"这三个字里，不仅藏着我们对故乡的深情思念，更承载着对传统手艺的坚守与传承的决心。\"故乡\""
      }
    },
    {
      "id": "2o71bQB_e3",
      "type": "header",
      "data": {
        "text": "一碗面的千里之行",
        "level": 2
      }
    },
    {
      "id": "ApduWTwseT",
      "type": "paragraph",
      "data": {
        "text": "<mark class=\"cdx-marker\">｢麦玉犇｣</mark> 诞生于 2023 年，这个名字背后蕴含着我们对美食的理解与追求："
      }
    },
    {
      "id": "2p_s9Rx5k0",
      "type": "quote",
      "data": {
        "text": "\"麦\"，源自西北金黄麦田的馈赠",
        "caption": "",
        "alignment": "left"
      }
    },
    {
      "id": "BjbeARFQyz",
      "type": "paragraph",
      "data": {
        "text": "<b>从甘肃到苏州，从黄河到长江，我们带着对家乡味道的执念，让这碗面成为连接两地的文化使者</b>"
      }
    },
    {
      "id": "_6uzWkbsan",
      "type": "delimiter",
      "data": {}
    },
    {
      "id": "oupJJO-85w",
      "type": "header",
      "data": {
        "text": "每一碗都是艺术品",
        "level": 2
      }
    },
    {
      "id": "4WeiQlBd-p",
      "type": "paragraph",
      "data": {
        "text": "在麦玉犇，我们坚信：真正的美食需要时间浸润，需要匠心守护。我们的拉面师傅通过纯手工拉面技艺，能够在您的眼前呈现从毛细、细、三细、二细、宽、大宽、韭叶、荞麦棱、等多种面型变化。"
      }
    },
    {
      "id": "WN5UeqQhkH",
      "type": "paragraph",
      "data": {
        "text": "清晨五点，当城市还沉浸在睡梦中，麦玉犇的后厨已经忙碌起来。"
      }
    },
    {
      "id": "dHPkFgsmFj",
      "type": "list",
      "data": {
        "style": "unordered",
        "items": [
          "牛大骨在文火中慢慢熬制，释放出<b>鲜香</b>",
          "新鲜的鸡肉点缀其中，增添<i>层次</i>",
          "时间慢慢流淌，汤色渐渐<mark>澄清</mark>"
        ]
      }
    },
    {
      "id": "YerEAjLiu5",
      "type": "code",
      "data": {
        "code": "// 传统拉面工艺\nfunction makeLamian() {\n  const dough = prepareDough();\n  const noodles = stretchNoodles(dough);\n  return cookNoodles(noodles);\n}"
      }
    }
  ],
  "version": "2.31.0-rc.7"
};

/**
 * 测试默认模板解析器
 */
function testDefaultHtmlParser() {
  console.log('=== 测试默认HTML解析器 ===');
  
  const parser = new HtmlParser();
  const result = parser.parse(testBlocks);
  
  console.log('默认模板解析结果:');
  console.log(result);
  console.log('\n');
  
  return result;
}

/**
 * 测试自定义模板解析器
 */
function testCustomHtmlParser() {
  console.log('=== 测试自定义HTML解析器 ===');
  
  // 自定义模板配置
  const customTemplates = {
    header: {
      h1: `<div class="custom-h1" style="font-size: 24px; color: #e74c3c; text-align: center; margin: 20px 0; padding: 10px; border: 2px solid #e74c3c;">{{content}}</div>`,
      h2: `<div class="custom-h2" style="font-size: 20px; color: #3498db; margin: 15px 0; padding: 8px; border-left: 4px solid #3498db;">{{content}}</div>`
    },
    paragraph: {
      default: `<p class="custom-paragraph" style="margin: 12px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">{{content}}</p>`
    }
  };
  
  const customParser = new HtmlParser(customTemplates);
  const result = customParser.parse(testBlocks);
  
  console.log('自定义模板解析结果:');
  console.log(result);
  console.log('\n');
  
  return result;
}

/**
 * 测试单个块解析
 */
function testSingleBlockParsing() {
  console.log('=== 测试单个块解析 ===');
  
  const parser = new HtmlParser();
  
  // 测试标题块
  const headerBlock = testBlocks.blocks.find(block => block.type === 'header');
  if (headerBlock) {
    const headerResult = parser.parseBlock(headerBlock);
    console.log('标题块解析结果:');
    console.log(headerResult);
    console.log('');
  }
  
  // 测试段落块（包含内联样式）
  const paragraphBlock = testBlocks.blocks.find(block => 
    block.type === 'paragraph' && block.data.text.includes('<b>')
  );
  if (paragraphBlock) {
    const paragraphResult = parser.parseBlock(paragraphBlock);
    console.log('段落块（含内联样式）解析结果:');
    console.log(paragraphResult);
    console.log('');
  }
  
  // 测试列表块
  const listBlock = testBlocks.blocks.find(block => block.type === 'list');
  if (listBlock) {
    const listResult = parser.parseBlock(listBlock);
    console.log('列表块解析结果:');
    console.log(listResult);
    console.log('');
  }
  
  // 测试代码块
  const codeBlock = testBlocks.blocks.find(block => block.type === 'code');
  if (codeBlock) {
    const codeResult = parser.parseBlock(codeBlock);
    console.log('代码块解析结果:');
    console.log(codeResult);
    console.log('');
  }
  
  console.log('\n');
}

/**
 * 测试内联样式处理
 */
function testInlineStyleProcessing() {
  console.log('=== 测试内联样式处理 ===');
  
  const parser = new HtmlParser();
  
  const testTexts = [
    '普通文字',
    '包含<b>粗体</b>的文字',
    '包含<i>斜体</i>和<code>代码</code>的文字',
    '复杂的<b>粗体<i>嵌套斜体</i></b>格式',
    '带<a href="https://example.com">链接</a>的文字',
    '包含<mark>高亮</mark>和<u>下划线</u>的文字'
  ];
  
  testTexts.forEach(text => {
    const processed = parser.processInlineStyles(text);
    console.log(`原文: ${text}`);
    console.log(`处理后: ${processed}`);
    console.log('---');
  });
  
  console.log('\n');
}

/**
 * 测试模板动态修改
 */
function testDynamicTemplateModification() {
  console.log('=== 测试模板动态修改 ===');
  
  const parser = new HtmlParser();
  
  // 添加新的标题模板
  parser.setTemplate('header', 'h1-special', `
    <div class="special-header" style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
      <h1 style="margin: 0; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">✨ {{content}} ✨</h1>
    </div>
  `);
  
  // 使用新模板渲染
  const specialHeaderHtml = parser.renderTemplate(
    parser.templates.header['h1-special'],
    { text: '特殊样式的标题' },
    'header'
  );
  
  console.log('特殊样式标题:');
  console.log(specialHeaderHtml);
  console.log('\n');
}

/**
 * 测试完整文档渲染
 */
function testDocumentRendering() {
  console.log('=== 测试完整文档渲染 ===');
  
  const parser = new HtmlParser();
  
  // 测试普通渲染
  const normalResult = parser.renderDocument(testBlocks);
  console.log('普通文档渲染结果（前500字符）:');
  console.log(normalResult.substring(0, 500) + '...');
  console.log('');
  
  // 测试带容器包装的渲染
  const containerResult = parser.renderDocument(testBlocks, { wrapInContainer: true });
  console.log('带容器包装的文档渲染结果（前500字符）:');
  console.log(containerResult.substring(0, 500) + '...');
  console.log('\n');
}

/**
 * 测试错误处理
 */
function testErrorHandling() {
  console.log('=== 测试错误处理 ===');
  
  const parser = new HtmlParser();
  
  // 测试无效数据
  console.log('测试空数据:');
  console.log(parser.parse(null));
  console.log(parser.parse({}));
  console.log('');
  
  // 测试未知块类型
  const unknownBlock = {
    type: 'unknown-type',
    data: {
      text: '这是一个未知类型的块'
    }
  };
  
  console.log('测试未知块类型:');
  const unknownResult = parser.parseBlock(unknownBlock);
  console.log(unknownResult);
  console.log('\n');
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('开始运行 Template Parser 测试...\n');
  
  try {
    testDefaultHtmlParser();
    testCustomHtmlParser();
    testSingleBlockParsing();
    testInlineStyleProcessing();
    testDynamicTemplateModification();
    testDocumentRendering();
    testErrorHandling();
    
    console.log('所有测试完成！');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

/**
 * 生成HTML预览文件
 */
export function generatePreviewHTML() {
  const defaultParser = new HtmlParser();
  const customParser = new HtmlParser({
    header: {
      h1: `<div style="background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;"><h1 style="margin: 0; font-size: 28px;">{{content}}</h1></div>`,
      h2: `<div style="border-left: 5px solid #667eea; padding-left: 15px; margin: 20px 0;"><h2 style="color: #667eea; margin: 0;">{{content}}</h2></div>`
    },
    paragraph: {
      default: `<p style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; line-height: 1.6;">{{content}}</p>`
    }
  });
  
  const defaultResult = defaultParser.renderDocument(testBlocks);
  const customResult = customParser.renderDocument(testBlocks);
  
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Parser 测试预览</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .theme-section {
            background: white;
            margin: 20px 0;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .theme-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
            color: #333;
        }
        .content {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 4px;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Template Parser 测试预览</h1>
        
        <div class="theme-section">
            <div class="theme-title">默认模板</div>
            <div class="content">${defaultResult}</div>
        </div>
        
        <div class="theme-section">
            <div class="theme-title">自定义模板</div>
            <div class="content">${customResult}</div>
        </div>
    </div>
</body>
</html>
  `;
  
  return html;
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  runAllTests();
}

// 导出测试函数
export { testBlocks };
export default { runAllTests, generatePreviewHTML, testBlocks };