/**
 * 样式解析器测试文件
 * 演示如何使用样式配置系统
 */

import parser, { 
  createStyledParser, 
  createDefaultStyledParser,
  defaultStyleConfig,
  createStyleProvider
} from './index.js';
import { darkStyleConfig, minimalStyleConfig } from './style-config.js';

// 测试数据
const testBlocks = {
  blocks: [
    {
      type: 'header',
      data: {
        "text": "AI淘汰的是\"雇员\"，但\"老板\"永远稀缺'",
        level: 1,
        id: '0'
      }
    },
    {
      type: 'paragraph',
      data: {
        "text": "这是一个测试，主要<b>测试</b>大小和<i>样式</i>"
      }
    },
    {
      type: 'paragraph',
      data: {
        text: '<mark class="cdx-marker">Editor.js outputs JSON object</mark>'
      }
    },
    {
      type: 'header',
      data: {
        text: '为什么会有这种落差？',
        level: 2
      }
    },
    {
      type: 'paragraph',
      data: {
        text: '我认为根本原因在于，我们误解了AI的本质。很多人把AI当做万能工具，期待它能独立完成复杂任务。但实际上，AI更像是一个功能强大的<b>执行者</b>--它能快速处理信息，生成内容，但是缺乏判断，规划和创新的能力。'
      }
    }
  ]
};

/**
 * 测试默认样式解析器
 */
function testDefaultStyledParser() {
  console.log('=== 测试默认样式解析器 ===');
  
  const styledParser = createDefaultStyledParser();
  const result = styledParser.parse(testBlocks);
  
  console.log('默认样式解析结果:');
  console.log(result);
  console.log('\n');
  
  return result;
}

/**
 * 测试暗色主题样式解析器
 */
function testDarkStyledParser() {
  console.log('=== 测试暗色主题样式解析器 ===');
  
  const darkParser = createStyledParser(darkStyleConfig);
  const result = darkParser.parse(testBlocks);
  
  console.log('暗色主题解析结果:');
  console.log(result);
  console.log('\n');
  
  return result;
}

/**
 * 测试简洁主题样式解析器
 */
function testMinimalStyledParser() {
  console.log('=== 测试简洁主题样式解析器 ===');
  
  const minimalParser = createStyledParser(minimalStyleConfig);
  const result = minimalParser.parse(testBlocks);
  
  console.log('简洁主题解析结果:');
  console.log(result);
  console.log('\n');
  
  return result;
}

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
  
  const customParser = createStyledParser(customStyleConfig);
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
  
  const styledParser = createDefaultStyledParser();
  
  // 测试标题块
  const headerResult = styledParser.parseBlock(testBlocks.blocks[0]);
  console.log('标题块解析结果:');
  console.log(headerResult);
  
  // 测试段落块
  const paragraphResult = styledParser.parseBlock(testBlocks.blocks[1]);
  console.log('段落块解析结果:');
  console.log(paragraphResult);
  
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
    testDarkStyledParser();
    testMinimalStyledParser();
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
  const defaultResult = testDefaultStyledParser();
  const darkResult = testDarkStyledParser();
  const minimalResult = testMinimalStyledParser();
  const customResult = testCustomStyledParser();
  
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
            <div class="theme-title">暗色主题</div>
            <div class="content" style="background: #0d1117;">${darkResult}</div>
        </div>
        
        <div class="theme-section">
            <div class="theme-title">简洁主题</div>
            <div class="content">${minimalResult}</div>
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