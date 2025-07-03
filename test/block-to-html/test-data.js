/**
 * EditorJS 测试数据
 * 包含各种类型的块用于测试转换功能
 */

const testData = {
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
        text: "这是一个功能强大的 <strong>富文本编辑器</strong>，支持多种块类型和 <em>内联样式</em>。您可以使用 <code>代码标记</code> 来突出显示代码片段。"
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
          "支持多种 <strong>块类型</strong>：标题、段落、列表、引用等",
          "丰富的 <em>内联样式</em>：粗体、斜体、下划线、代码等",
          "灵活的 <u>样式系统</u>：可自定义样式和主题"
        ]
      }
    },
    {
      id: "list-2",
      type: "list",
      data: {
        style: "ordered",
        items: [
          "第一步：创建内容",
          "第二步：编辑样式",
          "第三步：导出 HTML"
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
        code: "// 示例代码\nfunction convertToHtml(editorData) {\n  const converter = new BlockToHtmlConverter();\n  return converter.convert(editorData);\n}",
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
        text: "FlowEdit 采用模块化架构设计，包含 <code>BlockToHtmlConverter</code>、<code>BaseBlockProcessor</code> 等核心组件。"
      }
    }
  ],
  version: "2.28.2"
};

// 导出测试数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testData };
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.testData = testData;
}