/**
 * 测试新的children嵌套结构
 */

import { TemplateEngine } from "../src/content/utils/converter/template-engine.js";
import {
  blockTemplates,
  inlineStyles,
} from "../src/content/utils/converter/config.js";

// 创建模板引擎实例
const templateEngine = new TemplateEngine({
  blockTemplates,
  inlineStyles,
  enableCache: false,
});

// 测试数据
const testBlocks = [
  {
    type: "header",
    data: {
      text: "这是一个测试标题",
      level: 1,
    },
  },
  {
    type: "paragraph",
    data: {
      text: "这是一个包含 <strong>粗体</strong> 和 <em>斜体</em> 的段落。",
    },
  },
  {
    type: "quote",
    data: {
      text: "这是一个引用块",
      caption: "引用来源",
    },
  },
  {
    type: "header",
    data: {
      text: "这是一个测试标题h2",
      level: 2,
    },
  },
];

console.log("=== 测试新的children结构 ===\n");

testBlocks.forEach((block, index) => {
  console.log(`测试块 ${index + 1} (${block.type}):`);
  try {
    const result = templateEngine.buildHTML(block);
    console.log(result);
    console.log("\n" + "-".repeat(80) + "\n");
  } catch (error) {
    console.error(`渲染失败:`, error.message);
    console.log("\n" + "-".repeat(80) + "\n");
  }
});

console.log("=== 测试完成 ===");
