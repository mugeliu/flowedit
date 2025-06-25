/**
 * 简单的children结构测试
 */

import { TemplateEngine } from '../src/content/utils/converter/template-engine.js';

// 创建简单的测试配置
const testConfig = {
  blockTemplates: {
    test: {
      default: {
        tag: "div",
        style: {
          padding: "10px",
          border: "1px solid #ccc"
        },
        children: [
          {
            tag: "span",
            style: {
              fontWeight: "bold",
              color: "blue"
            },
            content: true
          }
        ]
      }
    }
  },
  inlineStyles: {}
};

const templateEngine = new TemplateEngine(testConfig);

// 测试children结构
const testBlock = {
  type: 'test',
  data: {
    text: 'Hello World'
  }
};

const result = templateEngine.buildHTML(testBlock);
console.log('渲染结果:', result);

// 预期结果应该是:
// <div style="padding: 10px; border: 1px solid #ccc;"><span style="font-weight: bold; color: blue;">Hello World</span></div>