// 配置管理

const Icon = (txt) => `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="monospace" font-size="12">${txt}</text>
</svg>`; // 你可以换成自己的 SVG/图片
/**
 * Editor.js 编辑器配置
 */
export const editorConfig = {
  // Editor.js 基础配置
  placeholder: "开始输入内容...",
  autofocus: true,
  hideToolbar: false,

  // 工具配置
  tools: {
    paragraph: {
      class: "Paragraph", // 将在editor.js中解析为实际的类引用
      inlineToolbar: true,
    },
    header: {
      class: "Header", // 将在editor.js中解析为实际的类引用
      inlineToolbar: true,
      config: {
        levels: [1, 2, 3],
        defaultLevel: 1,
        placeholder: "请输入标题",
      },
      toolbox: [
        {
          title: "Heading 1",
          icon: Icon("H1"),
          data: { level: 1 },
        },
        {
          title: "Heading 2",
          icon: Icon("H2"),
          data: { level: 2 },
        },
        {
          title: "Heading 3",
          icon: Icon("H3"),
          data: { level: 3 },
        },
      ],
    },
    quote: {
      class: "Quote", // 将在editor.js中解析为实际的类引用
      inlineToolbar: true,
      config: {
        quotePlaceholder: "输入引用内容",
        captionPlaceholder: "引用来源",
      },
    },
    image: {
      class: "ImageTool", // 将在editor.js中解析为实际的类引用
      inlineToolbar: true,
      config: {
        endpoints: {},
      },
    },
    raw: {
      class: "RawTool", // 将在editor.js中解析为实际的类引用
    },
  },

  // 其他 Editor.js 配置选项
  minHeight: 300,
  logLevel: "WARN", // 'VERBOSE', 'INFO', 'WARN', 'ERROR'

  // 初始内容配置
};

/**
 * 功能开关配置
 */
export const featureConfig = {
  // 悬浮工具栏功能（推荐使用）
  floatingToolbar: {
    enabled: true,
    placement: "top-end", // 相对于原工具栏的位置
    offset: 8,
    buttons: [
      {
        id: "sidebarToggle",
        text: "侧栏",
        type: "secondary",
        enabled: true,
      },
      {
        id: "smartInsert",
        text: "智能插入",
        type: "primary",
        enabled: true,
      },
    ],
  },

  // 传统工具栏按钮（现在使用 Floating UI 定位）
  // 侧边栏切换功能
  sidebarToggle: {
    enabled: true, // 启用浮动定位的侧边栏切换
    position: "first",
    insertMethod: "insertBefore",
    targetElement: "firstElementChild",
  },

  // 智能插入功能
  smartInsert: {
    enabled: true, // 启用浮动定位的智能插入
    position: "last",
    insertMethod: "appendChild",
    targetElement: null,
  },
};

// 样式配置已迁移到 style-config.js 中统一管理

/**
 * DOM选择器配置
 */
export const selectorConfig = {
  toolbar: "#js_toolbar_0", // 工具栏容器 - 用于添加自定义按钮和开关
  editorContent: 'div[contenteditable="true"].ProseMirror', // 原编辑器容器 - 智能插入功能的目标容器
  editorWrapper: "#edui1_iframeholder", // 原编辑器容器的父元素
  buttonArea: "#bottom_main", // 按钮区域 - 用于添加保存和取消按钮
  sidebar: "#js_side_article_list", // 侧边栏 - 用于侧边栏切换功能
  authorArea: "#js_author_area", // 作者区域 - 智能编辑器定位参考元素
  ueditor: "#ueditor_0", // UEditor 容器
  botBar: ".js_bot_bar.tool_area", // 底部工具栏 - 控制栏定位参考元素
};
