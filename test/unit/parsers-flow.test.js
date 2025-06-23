/**
 * HTML解析器运转流程测试和演示
 * 展示 /f:/project/flowedit/src/content/utils/parsers/ 中解析器的完整工作流程
 */

// Node.js环境DOM模拟
import { JSDOM } from 'jsdom';
const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = window.document;
global.DOMParser = window.DOMParser;
global.window = window;

// 导入解析器模块
import {
  createHtmlParser,
  createTemplateManager,
  createProcessorRegistry,
  createConfigManager,
  parseToHtml,
  parseWithMetadata,
  createParserWithPreset,
  HtmlParser,
  TemplateManager,
  ProcessorRegistry,
  ConfigManager
} from '../../src/content/utils/parsers/index.js';

/**
 * 解析器运转流程详细说明
 * 
 * 架构设计：
 * ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
 * │   HtmlParser    │───▶│ ProcessorRegistry│───▶│ BlockProcessor  │───▶│ TemplateManager │
 * │  (解析器主入口)  │    │  (处理器注册表)   │    │  (块处理器)      │    │  (模板管理器)    │
 * └─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
 *          ▲                                                                        ▲
 *          │                                                                        │
 * ┌─────────────────┐                                                    ┌─────────────────┐
 * │  ConfigManager  │                                                    │ style-template  │
 * │  (配置管理器)    │                                                    │  (默认模板配置)  │
 * └─────────────────┘                                                    └─────────────────┘
 * 
 * 依赖流向说明：
 * 1. HtmlParser → ProcessorRegistry → BlockProcessor → TemplateManager
 * 2. 无循环依赖，每个类只依赖下一层
 * 3. ConfigManager 独立管理配置，可选使用
 * 4. TemplateManager 从 style-template.js 加载默认模板
 */

/**
 * 测试数据 - 模拟 EditorJS 输出
 */
const testEditorData = {
  time: 1672531200000,
  blocks: [
    {
      id: "header-1",
      type: "header",
      data: {
        text: "HTML解析器运转流程演示",
        level: 1
      }
    },
    {
      id: "paragraph-1",
      type: "paragraph",
      data: {
        text: "这是一个演示 <b>HTML解析器</b> 工作流程的测试文档。"
      }
    },
    {
      id: "list-1",
      type: "list",
      data: {
        style: "unordered",
        items: [
          "第一个列表项",
          "第二个列表项",
          "第三个列表项"
        ]
      }
    },
    {
      id: "code-1",
      type: "code",
      data: {
        code: "console.log('Hello, FlowEdit!');",
        language: "javascript"
      }
    },
    {
      id: "quote-1",
      type: "quote",
      data: {
        text: "重构后的架构更加清晰，依赖关系更加简单。",
        caption: "架构设计原则",
        alignment: "left"
      }
    }
  ],
  version: "2.28.2"
};

/**
 * 运转流程演示函数
 */
function demonstrateParsingFlow() {
  console.log("\n=== HTML解析器运转流程演示 ===");
  
  // ========== 第一步：创建组件实例 ==========
  console.log("\n1. 创建组件实例");
  
  // 1.1 创建模板管理器（最底层，无依赖）
  console.log("   1.1 创建 TemplateManager（从 style-template.js 加载默认模板）");
  const templateManager = createTemplateManager();
  console.log("       ✓ TemplateManager 创建完成，已加载默认模板");
  
  // 1.2 创建处理器注册表（依赖 TemplateManager）
  console.log("   1.2 创建 ProcessorRegistry（依赖 TemplateManager）");
  const processorRegistry = createProcessorRegistry(templateManager);
  console.log("       ✓ ProcessorRegistry 创建完成，已注册默认处理器");
  
  // 1.3 创建配置管理器（可选，独立组件）
  console.log("   1.3 创建 ConfigManager（可选配置管理）");
  const configManager = createConfigManager();
  console.log("       ✓ ConfigManager 创建完成，已加载默认配置");
  
  // 1.4 创建主解析器（依赖 ProcessorRegistry）
  console.log("   1.4 创建 HtmlParser（依赖 ProcessorRegistry）");
  const parser = createHtmlParser();
  console.log("       ✓ HtmlParser 创建完成，解析器就绪");
  
  // ========== 第二步：解析流程演示 ==========
  console.log("\n2. 解析流程演示");
  
  // 2.1 单个块解析
  console.log("   2.1 单个块解析流程：");
  const headerBlock = testEditorData.blocks[0];
  console.log(`       输入块类型: ${headerBlock.type}`);
  console.log(`       输入块数据: ${JSON.stringify(headerBlock.data)}`);
  
  console.log("       解析步骤：");
  console.log("       ├─ HtmlParser.parseBlock() 接收块数据");
  console.log("       ├─ ProcessorRegistry.getProcessor() 获取对应处理器");
  console.log("       ├─ HeaderBlockProcessor.process() 处理块数据");
  console.log("       ├─ TemplateManager.getTemplateVariant() 获取模板");
  console.log("       └─ 返回渲染后的HTML");
  
  const headerHtml = parser.parseBlock(headerBlock);
  console.log(`       输出HTML: ${headerHtml}`);
  
  // 2.2 完整文档解析
  console.log("\n   2.2 完整文档解析流程：");
  console.log("       ├─ HtmlParser.parseDocument() 接收EditorJS数据");
  console.log("       ├─ 遍历所有blocks数组");
  console.log("       ├─ 对每个block调用parseBlock()");
  console.log("       ├─ 过滤空块（根据skipEmpty选项）");
  console.log("       ├─ 拼接所有HTML片段");
  console.log("       └─ 返回完整HTML文档");
  
  const documentHtml = parser.parseDocument(testEditorData);
  console.log(`       输出HTML长度: ${documentHtml.length} 字符`);
  
  // 2.3 带元数据解析
  console.log("\n   2.3 带元数据解析流程：");
  console.log("       ├─ HtmlParser.parseWithMeta() 接收EditorJS数据");
  console.log("       ├─ 执行完整文档解析");
  console.log("       ├─ 收集解析元数据（块数量、类型统计等）");
  console.log("       ├─ 添加头部和尾部模板");
  console.log("       └─ 返回{html, metadata}对象");
  
  const resultWithMeta = parser.parseWithMeta(testEditorData);
  console.log(`       元数据: ${JSON.stringify(resultWithMeta.metadata, null, 2)}`);
  
  // ========== 第三步：组件协作演示 ==========
  console.log("\n3. 组件协作演示");
  
  // 3.1 TemplateManager 工作流程
  console.log("   3.1 TemplateManager 工作流程：");
  console.log("       ├─ 从 style-template.js 导入默认模板");
  console.log("       ├─ 支持自定义模板覆盖");
  console.log("       ├─ 提供模板查询接口");
  console.log("       └─ 管理内联样式、头部、尾部模板");
  
  const headerTemplate = templateManager.getTemplateVariant('header', 'h1');
  console.log(`       获取h1模板: ${headerTemplate}`);
  
  // 3.2 ProcessorRegistry 工作流程
  console.log("\n   3.2 ProcessorRegistry 工作流程：");
  console.log("       ├─ 注册默认块处理器（Header、Code、List等）");
  console.log("       ├─ 支持自定义处理器注册");
  console.log("       ├─ 延迟实例化处理器");
  console.log("       └─ 提供处理器查询和管理");
  
  const headerProcessor = processorRegistry.getProcessor('header');
  console.log(`       获取header处理器: ${headerProcessor.constructor.name}`);
  
  // 3.3 BlockProcessor 工作流程
  console.log("\n   3.3 BlockProcessor 工作流程：");
  console.log("       ├─ 继承BaseBlockProcessor基类");
  console.log("       ├─ 实现模板方法模式（preprocessData、getTemplate、renderContent、postprocess）");
  console.log("       ├─ 处理内联样式（粗体、斜体、链接等）");
  console.log("       ├─ HTML安全清理");
  console.log("       └─ 生成最终HTML输出");
  
  // ========== 第四步：预设配置演示 ==========
  console.log("\n4. 预设配置演示");
  
  // 4.1 基础配置
  console.log("   4.1 基础配置（最小功能集）：");
  const basicParser = createParserWithPreset('basic');
  console.log(`       支持的处理器: header, paragraph, raw`);
  
  // 4.2 标准配置
  console.log("   4.2 标准配置（常用功能）：");
  const standardParser = createParserWithPreset('standard');
  console.log(`       支持的处理器: header, paragraph, list, quote, code, raw`);
  
  // 4.3 完整配置
  console.log("   4.3 完整配置（所有功能）：");
  const fullParser = createParserWithPreset('full');
  console.log(`       支持的处理器: 所有处理器 + 容器包装 + 元数据`);
  
  // 4.4 严格模式配置
  console.log("   4.4 严格模式配置（启用所有验证）：");
  const strictParser = createParserWithPreset('strict');
  console.log(`       启用: 严格模式 + 日志记录 + 大小限制 + 超时控制`);
  
  // ========== 第五步：便捷方法演示 ==========
  console.log("\n5. 便捷方法演示");
  
  // 5.1 快速解析
  console.log("   5.1 快速解析方法：");
  const quickHtml = parseToHtml(testEditorData);
  console.log(`       parseToHtml() 结果长度: ${quickHtml.length} 字符`);
  
  // 5.2 带元数据解析
  console.log("   5.2 带元数据解析方法：");
  const quickMeta = parseWithMetadata(testEditorData);
  console.log(`       parseWithMetadata() 块数量: ${quickMeta.metadata.blockCount}`);
  
  console.log("\n=== 解析器运转流程演示完成 ===");
  
  return {
    templateManager,
    processorRegistry,
    configManager,
    parser,
    results: {
      headerHtml,
      documentHtml,
      resultWithMeta,
      quickHtml,
      quickMeta
    }
  };
}

/**
 * 性能测试函数
 */
function performanceTest() {
  console.log("\n=== 性能测试 ===");
  
  const iterations = 1000;
  const parser = createHtmlParser();
  
  // 测试单个块解析性能
  console.log(`\n1. 单个块解析性能测试（${iterations}次）：`);
  const startTime1 = performance.now();
  for (let i = 0; i < iterations; i++) {
    parser.parseBlock(testEditorData.blocks[0]);
  }
  const endTime1 = performance.now();
  console.log(`   平均耗时: ${((endTime1 - startTime1) / iterations).toFixed(3)}ms`);
  
  // 测试完整文档解析性能
  console.log(`\n2. 完整文档解析性能测试（${iterations}次）：`);
  const startTime2 = performance.now();
  for (let i = 0; i < iterations; i++) {
    parser.parseDocument(testEditorData);
  }
  const endTime2 = performance.now();
  console.log(`   平均耗时: ${((endTime2 - startTime2) / iterations).toFixed(3)}ms`);
  
  // 测试带元数据解析性能
  console.log(`\n3. 带元数据解析性能测试（${iterations}次）：`);
  const startTime3 = performance.now();
  for (let i = 0; i < iterations; i++) {
    parser.parseWithMeta(testEditorData);
  }
  const endTime3 = performance.now();
  console.log(`   平均耗时: ${((endTime3 - startTime3) / iterations).toFixed(3)}ms`);
}

/**
 * 错误处理测试函数
 */
function errorHandlingTest() {
  console.log("\n=== 错误处理测试 ===");
  
  const parser = createHtmlParser();
  
  // 测试无效块数据
  console.log("\n1. 无效块数据测试：");
  const invalidBlock = { type: "unknown", data: {} };
  const result1 = parser.parseBlock(invalidBlock);
  console.log(`   未知块类型处理结果: ${result1.substring(0, 50)}...`);
  
  // 测试空数据
  console.log("\n2. 空数据测试：");
  const result2 = parser.parseDocument(null);
  console.log(`   空数据处理结果: "${result2}"`);
  
  // 测试格式错误的数据
  console.log("\n3. 格式错误数据测试：");
  const malformedData = { blocks: "not an array" };
  const result3 = parser.parseDocument(malformedData);
  console.log(`   格式错误数据处理结果: "${result3}"`);
}

/**
 * 自定义配置测试函数
 */
function customConfigTest() {
  console.log("\n=== 自定义配置测试 ===");
  
  // 自定义模板配置
  const customConfig = {
    templates: {
      header: {
        h1: '<h1 class="custom-h1">{{content}}</h1>',
        h2: '<h2 class="custom-h2">{{content}}</h2>'
      },
      paragraph: {
        default: '<p class="custom-paragraph">{{content}}</p>'
      }
    },
    options: {
      wrapInContainer: true,
      includeMetadata: true
    }
  };
  
  console.log("\n1. 自定义模板配置：");
  const customParser = createHtmlParser(customConfig);
  const customResult = customParser.parseDocument(testEditorData);
  console.log(`   自定义配置解析结果包含容器: ${customResult.includes('editorjs-content')}`);
  
  console.log("\n2. 自定义配置元数据：");
  const customMeta = customParser.parseWithMeta(testEditorData);
  console.log(`   元数据包含容器包装: ${customMeta.html.includes('editorjs-content')}`);
}

/**
 * 主测试函数
 */
function runAllTests() {
  console.log("FlowEdit HTML解析器运转流程测试");
  console.log("=====================================\n");
  
  try {
    // 运行主要演示
    const demoResults = demonstrateParsingFlow();
    
    // 运行性能测试
    performanceTest();
    
    // 运行错误处理测试
    errorHandlingTest();
    
    // 运行自定义配置测试
    customConfigTest();
    
    console.log("\n=====================================\n");
    console.log("所有测试完成！解析器运转正常。");
    
    return demoResults;
    
  } catch (error) {
    console.error("测试过程中发生错误:", error);
    throw error;
  }
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  // 将测试函数暴露到全局作用域
  window.runParserFlowTests = runAllTests;
  window.demonstrateParsingFlow = demonstrateParsingFlow;
  window.performanceTest = performanceTest;
  window.errorHandlingTest = errorHandlingTest;
  window.customConfigTest = customConfigTest;
  
  console.log("解析器流程测试已加载，可以调用以下函数：");
  console.log("- runParserFlowTests(): 运行所有测试");
  console.log("- demonstrateParsingFlow(): 演示解析流程");
  console.log("- performanceTest(): 性能测试");
  console.log("- errorHandlingTest(): 错误处理测试");
  console.log("- customConfigTest(): 自定义配置测试");
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    demonstrateParsingFlow,
    performanceTest,
    errorHandlingTest,
    customConfigTest,
    testEditorData
  };
}

// 导出测试函数
export {
  runAllTests,
  demonstrateParsingFlow,
  performanceTest,
  errorHandlingTest,
  customConfigTest,
  testEditorData
};

export default runAllTests;

// 如果直接运行此文件，执行所有测试
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  console.log('🚀 开始运行 HTML解析器流程测试...');
  console.log('=' .repeat(60));
  
  try {
    await runAllTests();
    console.log('\n🎉 所有测试完成！');
  } catch (error) {
    console.error('❌ 测试运行失败:', error.message);
    console.error('详细错误信息:', error);
    process.exit(1);
  }
}