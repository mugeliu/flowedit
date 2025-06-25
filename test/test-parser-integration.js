/**
 * 解析器模块集成测试
 * 测试 HTML 解析器与样式模板的集成功能
 */

// 导入解析器模块
import { 
  parseToHtml, 
  safeParse, 
  getSupportedBlockTypes,
  HtmlParser,
  TemplateManager,
  ProcessorRegistry
} from '../src/content/utils/parsers/index.js';

// 导入样式配置
import { theme, blockInlineStyles, flexibleTemplatesWithInlineStyles } from '../src/content/config/style-template.js';

// 模拟 EditorJS 数据
const mockEditorJSData = {
  time: 1672531200000,
  blocks: [
    {
      id: "header-1",
      type: "header",
      data: {
        text: "欢迎使用 <strong>FlowEdit</strong> 编辑器",
        level: 1
      }
    },
    {
      id: "paragraph-1",
      type: "paragraph",
      data: {
        text: "这是一个功能强大的 <em>富文本编辑器</em>，支持多种块类型和 <u>内联样式</u>。您可以使用 <code>代码标记</code> 来突出显示代码片段。"
      }
    },
    {
      id: "header-2",
      type: "header",
      data: {
        text: "主要功能特性",
        level: 2
      }
    },
    {
      id: "list-1",
      type: "list",
      data: {
        style: "unordered",
        items: [
          {
            content: "支持多种 <strong>块类型</strong>：标题、段落、列表、引用等",
            items: []
          },
          {
            content: "丰富的 <em>内联样式</em>：粗体、斜体、下划线、代码等",
            items: []
          },
          {
            content: "灵活的 <u>模板系统</u>：可自定义样式和主题",
            items: []
          }
        ]
      }
    },
    {
      id: "quote-1",
      type: "quote",
      data: {
        text: "优秀的工具能够 <strong>提升效率</strong>，而不是增加复杂性。",
        caption: "设计哲学"
      }
    },
    {
      id: "code-1",
      type: "code",
      data: {
        code: "// 示例代码\nfunction parseToHtml(editorData, options = {}) {\n  const parser = getParserInstance(options);\n  return parser.parseDocument(editorData);\n}",
        language: "javascript"
      }
    },
    {
      id: "delimiter-1",
      type: "delimiter",
      data: {}
    },
    {
      id: "header-3",
      type: "header",
      data: {
        text: "技术架构",
        level: 3
      }
    },
    {
      id: "paragraph-2",
      type: "paragraph",
      data: {
        text: "FlowEdit 采用模块化架构设计，包含 <code>HtmlParser</code>、<code>ProcessorRegistry</code>、<code>BlockProcessor</code> 和 <code>TemplateManager</code> 等核心组件。"
      }
    }
  ],
  version: "2.28.2"
};

// 测试函数
function runTests() {
  console.log('=== 解析器模块集成测试 ===\n');

  // 测试 1: 基本解析功能
  console.log('测试 1: 基本解析功能');
  try {
    const html = parseToHtml(mockEditorJSData);
    console.log('✅ 基本解析成功');
    console.log('生成的 HTML 长度:', html.length);
    console.log('HTML 预览 (前 200 字符):', html.substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ 基本解析失败:', error.message);
  }
  console.log('');

  // 测试 2: 安全解析功能
  console.log('测试 2: 安全解析功能');
  try {
    const result = safeParse(mockEditorJSData);
    console.log('✅ 安全解析成功');
    console.log('解析结果:', {
      success: result.success,
      htmlLength: result.html.length,
      errorsCount: result.errors.length,
      warningsCount: result.warnings.length
    });
  } catch (error) {
    console.error('❌ 安全解析失败:', error.message);
  }
  console.log('');

  // 测试 3: 支持的块类型
  console.log('测试 3: 支持的块类型');
  try {
    const supportedTypes = getSupportedBlockTypes();
    console.log('✅ 获取支持的块类型成功');
    console.log('支持的块类型:', supportedTypes);
  } catch (error) {
    console.error('❌ 获取支持的块类型失败:', error.message);
  }
  console.log('');

  // 测试 4: 自定义选项解析
  console.log('测试 4: 自定义选项解析');
  try {
    const htmlWithContainer = parseToHtml(mockEditorJSData, {
      wrapInContainer: true,
      skipEmpty: false
    });
    console.log('✅ 自定义选项解析成功');
    console.log('包含容器的 HTML 是否包含 section 标签:', htmlWithContainer.includes('<section class="editorjs-content">'));
  } catch (error) {
    console.error('❌ 自定义选项解析失败:', error.message);
  }
  console.log('');

  // 测试 5: 直接使用 HtmlParser 类
  console.log('测试 5: 直接使用 HtmlParser 类');
  try {
    const parser = new HtmlParser({
      wrapInContainer: true
    });
    const html = parser.parseDocument(mockEditorJSData);
    const metadata = parser.parseWithMeta(mockEditorJSData);
    
    console.log('✅ HtmlParser 类使用成功');
    console.log('解析结果包含元数据:', !!metadata.metadata);
    console.log('支持的块类型数量:', parser.getSupportedBlockTypes().length);
  } catch (error) {
    console.error('❌ HtmlParser 类使用失败:', error.message);
  }
  console.log('');

  // 测试 6: 模板管理器功能
  console.log('测试 6: 模板管理器功能');
  try {
    const templateManager = new TemplateManager();
    const headerTemplate = templateManager.getFlexibleTemplate('header', 'h1');
    const paragraphTemplate = templateManager.getFlexibleTemplate('paragraph');
    
    console.log('✅ 模板管理器功能正常');
    console.log('H1 模板层级数量:', headerTemplate?.layers?.length || 0);
    console.log('段落模板层级数量:', paragraphTemplate?.layers?.length || 0);
    console.log('主题配置存在:', !!templateManager.theme);
  } catch (error) {
    console.error('❌ 模板管理器功能失败:', error.message);
  }
  console.log('');

  // 测试 7: 处理器注册表功能
  console.log('测试 7: 处理器注册表功能');
  try {
    const templateManager = new TemplateManager();
    const registry = new ProcessorRegistry(templateManager);
    
    const headerProcessor = registry.getProcessor('header');
    const unknownProcessor = registry.getProcessor('unknown-type');
    
    console.log('✅ 处理器注册表功能正常');
    console.log('Header 处理器存在:', !!headerProcessor);
    console.log('未知类型处理器存在:', !!unknownProcessor);
    console.log('支持 header 类型:', registry.hasProcessor('header'));
    console.log('支持 unknown-type 类型:', registry.hasProcessor('unknown-type'));
  } catch (error) {
    console.error('❌ 处理器注册表功能失败:', error.message);
  }
  console.log('');

  // 测试 8: 样式模板配置验证
  console.log('测试 8: 样式模板配置验证');
  try {
    console.log('✅ 样式模板配置加载成功');
    console.log('主题配置:', {
      primary: theme.primary,
      textSecondary: theme.textSecondary,
      alphaKeys: Object.keys(theme.alpha)
    });
    console.log('内联样式配置数量:', Object.keys(blockInlineStyles).length);
    console.log('模板配置类型:', Object.keys(flexibleTemplatesWithInlineStyles));
  } catch (error) {
    console.error('❌ 样式模板配置验证失败:', error.message);
  }
  console.log('');

  // 测试 9: 错误处理
  console.log('测试 9: 错误处理');
  try {
    // 测试无效数据
    const invalidResult = safeParse(null);
    const emptyResult = safeParse({ blocks: [] });
    
    console.log('✅ 错误处理功能正常');
    console.log('无效数据处理:', {
      success: invalidResult.success,
      hasErrors: invalidResult.errors.length > 0
    });
    console.log('空数据处理:', {
      success: emptyResult.success,
      htmlLength: emptyResult.html.length
    });
  } catch (error) {
    console.error('❌ 错误处理功能失败:', error.message);
  }
  console.log('');

  console.log('=== 测试完成 ===');
}

// 在浏览器环境中设为全局可用，在Node.js环境中直接运行
if (typeof window !== 'undefined') {
  window.runParserTests = runTests;
  window.mockEditorJSData = mockEditorJSData;
  console.log('测试函数已加载，请调用 runParserTests() 开始测试');
} else {
  // Node.js环境下直接运行测试
  runTests();
}

// 导出函数和数据
export { runTests as runParserTests, mockEditorJSData };