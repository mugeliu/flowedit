/**
 * 样式解析器测试文件
 * 演示如何使用样式配置系统
 */

import parser, { 
  createStyledParser,
} from '../src/content/utils/parsers/index.js';

// 测试数据
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
        "text": "“舌尖上的西北，灵魂里的故乡”",
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
        "text": "“麦玉犇”这三个字里，不仅藏着我们对故乡的深情思念，更承载着对传统手艺的坚守与传承的决心。“故乡”"
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
        "text": "\"麦 \"，源自西北金黄麦田的馈赠",
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
      "type": "paragraph",
      "data": {
        "text": "牛大骨在文火中慢慢熬制，释放出鲜香；"
      }
    },
    {
      "id": "YerEAjLiu5",
      "type": "paragraph",
      "data": {
        "text": "新鲜的鸡肉点缀其中，增添层次；"
      }
    },
    {
      "id": "JDWfi_n9dM",
      "type": "paragraph",
      "data": {
        "text": "时间慢慢流淌，汤色渐渐澄清 ......"
      }
    }
  ],
  "version": "2.31.0-rc.7"
}

/**
 * 测试默认样式解析器
 */
function testDefaultStyledParser() {
  console.log('=== 测试默认样式解析器 ===');
  
  const styledParser = createStyledParser();
  const result = styledParser.parse(testBlocks);
  
  console.log('默认样式解析结果:');
  console.log(result);
  console.log('\n');
  
  return result;
}

// 暗色主题和简洁主题已删除，只保留默认主题和自定义主题测试

/**
 * 测试自定义样式配置
 */
function testCustomStyledParser() {
  console.log('=== 测试自定义样式配置 ===');
  
  // 创建自定义样式配置
  const customStyleConfig = {
    base: {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#2c3e50',
      lineHeight: 1.8
    },
    header: {
      h1: {
        fontSize: '32px',
        color: '#e74c3c',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '2em 0 1em',
        borderBottom: '3px solid #e74c3c',
        paddingBottom: '0.5em'
      },
      h2: {
        fontSize: '24px',
        color: '#3498db',
        fontWeight: 'bold',
        margin: '1.5em 0 1em'
      }
    },
    paragraph: {
      margin: '1.2em 0',
      textIndent: '2em'
    },
    emphasis: {
      strong: {
        color: '#e74c3c',
        fontWeight: 'bold'
      },
      em: {
        color: '#9b59b6',
        fontStyle: 'italic'
      },
      code: {
        backgroundColor: '#ecf0f1',
        color: '#2c3e50',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '90%'
      }
    }
  };
  
  const customParser = parser({ styleConfig: customStyleConfig });
  const result = customParser.parse(testBlocks);
  
  console.log('自定义样式解析结果:');
  console.log(result);
  console.log('\n');
  
  return result;
}

/**
 * 测试无样式解析器（对比）
 */
function testPlainParser() {
  console.log('=== 测试无样式解析器（对比） ===');
  
  const plainParser = parser();
  const result = plainParser.parse(testBlocks);
  
  console.log('无样式解析结果:');
  console.log(result);
  console.log('\n');
  
  return result;
}

/**
 * 测试单个块解析
 */
function testSingleBlockParsing() {
  console.log('=== 测试单个块解析 ===');
  
  const styledParser = createStyledParser();
  
  // 找到第一个标题块
  const headerBlock = testBlocks.blocks.find(block => block.type === 'header');
  if (headerBlock) {
    const headerResult = styledParser.parseBlock(headerBlock);
    console.log('标题块解析结果:');
    console.log(headerResult);
  }
  
  // 找到第一个段落块
  const paragraphBlock = testBlocks.blocks.find(block => block.type === 'paragraph');
  if (paragraphBlock) {
    const paragraphResult = styledParser.parseBlock(paragraphBlock);
    console.log('段落块解析结果:');
    console.log(paragraphResult);
  }
  
  console.log('\n');
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('开始运行样式解析器测试...\n');
  
  try {
    testPlainParser();
    testDefaultStyledParser();
    testCustomStyledParser();
    testSingleBlockParsing();
    
    console.log('所有测试完成！');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

/**
 * 生成HTML文件用于预览
 */
export function generatePreviewHTML() {
  // 创建解析器实例
  const defaultParser = createStyledParser();
  const customParser = parser({ 
    styleConfig: {
      base: {
        textAlign: 'left',
        lineHeight: 1.6,
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#2c3e50'
      },
      header: {
        h1: {
          fontSize: '28px',
          color: '#e74c3c',
          textAlign: 'center',
          marginBottom: '20px'
        },
        h2: {
           fontSize: '24px',
           color: '#3498db',
           borderBottom: '2px solid #3498db'
         }
       },
       paragraph: {
         margin: '16px 0',
         textIndent: '2em'
       },
       emphasis: {
         strong: {
           color: '#e74c3c',
           fontWeight: 'bold'
         },
         em: {
           color: '#9b59b6',
           fontStyle: 'italic'
         },
         code: {
           backgroundColor: '#ecf0f1',
           color: '#2c3e50',
           padding: '2px 6px',
           borderRadius: '3px',
           fontSize: '90%'
         }
       }
     }
   });
  
  const defaultResult = defaultParser.parse(testBlocks);
  const customResult = customParser.parse(testBlocks);
  
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>样式解析器测试预览</title>
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
        <h1>样式解析器测试预览</h1>
        
        <div class="theme-section">
            <div class="theme-title">默认主题</div>
            <div class="content">${defaultResult}</div>
        </div>
        
        <div class="theme-section">
            <div class="theme-title">自定义主题</div>
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