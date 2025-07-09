/**
 * Block-to-HTML 转换器测试文件
 * 测试 EditorJS 数据转换为 HTML 的功能
 */

import { BlockToHtmlConverter } from "./block-to-html/index.js";
import testData from "./block-to-html/test-data.js";

/**
 * 加载样式模板
 * @returns {Promise<Object>} 样式模板对象
 */
async function loadStyleTemplate() {
  try {
    const response = await fetch("./block-to-html/style-template.json");
    return await response.json();
  } catch (error) {
    console.error("加载样式模板失败:", error);
    return null;
  }
}

/**
 * 运行转换测试
 */
async function runTest() {
  console.log("开始测试 Block-to-HTML 转换器...");

  // 加载样式模板
  const template = await loadStyleTemplate();
  if (!template) {
    console.error("无法加载样式模板，测试终止");
    return;
  }

  console.log("样式模板加载成功:", template.theme);

  // 创建转换器实例
  const converter = new BlockToHtmlConverter();

  // 执行转换
  console.log("开始转换 EditorJS 数据...");
  const startTime = Date.now();

  const htmlResult = converter.convert(testData, template);

  const endTime = Date.now();
  console.log(`转换完成，耗时: ${endTime - startTime}ms`);

  // 输出结果
  console.log("转换结果:");
  console.log(htmlResult);

  // 将结果显示在页面上
  displayResult(htmlResult);

  // 运行详细测试
  runDetailedTests(converter, template);
}

/**
 * 在页面上显示转换结果
 * @param {string} html - 转换后的HTML字符串
 */
function displayResult(html) {
  // 创建结果容器
  let resultContainer = document.getElementById("test-result");
  if (!resultContainer) {
    resultContainer = document.createElement("div");
    resultContainer.id = "test-result";
    resultContainer.style.cssText = `
      margin: 20px;
      padding: 20px;
      border: 2px solid #10b981;
      border-radius: 8px;
      background: #f0fdf4;
    `;
    document.body.appendChild(resultContainer);
  }

  resultContainer.innerHTML = `
    <h2 style="color: #047857; margin-top: 0;">转换结果预览</h2>
    <div style="background: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      ${html}
    </div>
  `;
}

/**
 * 运行详细测试
 * @param {BlockToHtmlConverter} converter - 转换器实例
 * @param {Object} template - 样式模板
 */
function runDetailedTests(converter, template) {
  console.log("\n=== 开始详细测试 ===");

  // 测试各种块类型
  const testCases = [
    {
      name: "标题块测试",
      data: {
        blocks: [
          {
            type: "header",
            data: { text: "测试标题", level: 1 },
          },
        ],
      },
    },
    {
      name: "段落块测试",
      data: {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: "这是一个测试段落，包含<strong>粗体</strong>和<em>斜体</em>文本。",
            },
          },
        ],
      },
    },
    {
      name: "链接测试",
      data: {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: '访问 <a href="https://example.com">示例网站</a> 了解更多。',
            },
          },
        ],
      },
    },
    {
      name: "代码块测试",
      data: {
        blocks: [
          {
            type: "code",
            data: { code: 'console.log("Hello World");' },
          },
        ],
      },
    },
    {
      name: "列表测试",
      data: {
        blocks: [
          {
            type: "list",
            data: {
              style: "unordered",
              items: [{ content: "项目1" }, { content: "项目2" }],
            },
          },
        ],
      },
    },
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    try {
      const result = converter.convert(testCase.data, template);
      console.log("✅ 转换成功");
      console.log(
        "结果:",
        result.substring(0, 100) + (result.length > 100 ? "..." : "")
      );
    } catch (error) {
      console.error("❌ 转换失败:", error.message);
    }
  });

  console.log("\n=== 详细测试完成 ===");
}

/**
 * 性能测试
 * @param {BlockToHtmlConverter} converter - 转换器实例
 * @param {Object} template - 样式模板
 */
function performanceTest(converter, template) {
  console.log("\n=== 性能测试 ===");

  const iterations = 100;
  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    converter.convert(testData, template);
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;

  console.log(`执行 ${iterations} 次转换:`);
  console.log(`总耗时: ${totalTime}ms`);
  console.log(`平均耗时: ${avgTime.toFixed(2)}ms`);
  console.log("=== 性能测试完成 ===");
}

// 页面加载完成后运行测试
if (typeof window !== "undefined") {
  // 浏览器环境
  window.addEventListener("DOMContentLoaded", () => {
    runTest()
      .then(() => {
        console.log("\n所有测试完成！");
      })
      .catch((error) => {
        console.error("测试过程中发生错误:", error);
      });
  });
} else {
  // Node.js 环境
  runTest()
    .then(() => {
      console.log("\n所有测试完成！");
    })
    .catch((error) => {
      console.error("测试过程中发生错误:", error);
    });
}

// 导出测试函数供外部调用
export { runTest, runDetailedTests, performanceTest };
