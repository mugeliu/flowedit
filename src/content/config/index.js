// 配置管理

import { IconH1, IconH2, IconH3 } from "@codexteam/icons";
import { createWeChatImageUploader } from "../tools/custom-wechat-image-tool.js";

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
      config: {
        levels: [1, 2, 3],
        defaultLevel: 1,
        placeholder: "请输入标题",
      },
      toolbox: [
        {
          title: "Heading 1",
          icon: IconH1,
          data: { level: 1 },
        },
        {
          title: "Heading 2",
          icon: IconH2,
          data: { level: 2 },
        },
        {
          title: "Heading 3",
          icon: IconH3,
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
        types: "image/*",
        captionPlaceholder: "图片描述",
        endpoints: {
          byFile: "/api/upload",
          byUrl: "/api/upload",
        },
        features: {
          caption: "optional", // caption作为可选功能
          withBorder: true, // 启用边框功能
          withBackground: true, // 启用背景功能
          stretched: true, // 启用拉伸功能
        },
        uploader: createWeChatImageUploader(),
      },
    },
    delimiter: {
      class: "Delimiter", // 将在editor.js中解析为实际的类引用
    },
    raw: {
      class: "RawTool", // 将在editor.js中解析为实际的类引用
    },
    list: {
      class: "List", // 将在editor.js中解析为实际的类引用
    },
    code: {
      class: "Code", // 将在editor.js中解析为实际的类引用
    },
    marker: {
      class: "Marker", // 将在editor.js中解析为实际的类引用
    },
    inlineCode: {
      class: "InlineCode", // 将在editor.js中解析为实际的类引用
    },
    underline: {
      class: "Underline", // 将在editor.js中解析为实际的类引用
    },
  },

  // 其他 Editor.js 配置选项
  minHeight: 400,
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
  toolbar: "js_toolbar_0", // 工具栏容器 - 用于添加自定义按钮和开关 (使用getElementById)
  editorContent: 'div[contenteditable="true"].ProseMirror', // 原编辑器容器 - 智能插入功能的目标容器 (使用safeQuerySelector)
  editorWrapper: "edui1_iframeholder", // 原编辑器容器的父元素 (使用getElementById)
  sidebar: "js_side_article_list", // 侧边栏 - 用于侧边栏切换功能 (使用getElementById)
  authorArea: "js_author_area", // 作者区域 - 智能编辑器定位参考元素 (使用getElementById)
  footerToolbar: "js_button_area", // 底部工具栏 - 控制栏定位参考元素 (使用getElementById)
};
