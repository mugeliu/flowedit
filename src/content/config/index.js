// 配置管理

import { createWeChatImageUploader } from "../tools/custom-wechat-image-tool.js";

/**
 * 标题工具图标常量
 */
const IconH1 = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
  <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M19 17V10.2135C19 10.1287 18.9011 10.0824 18.836 10.1367L16 12.5"/>
</svg>`;

const IconH2 = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
  <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10 19 9.5 19 12C19 13.9771 16.0684 13.9997 16.0012 16.8981C15.9999 16.9533 16.0448 17 16.1 17L19.3 17"/>
</svg>`;

const IconH3 = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
  <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10.5 16.8323 10 17.6 10C18.3677 10 19.5 10.311 19.5 11.5C19.5 12.5315 18.7474 12.9022 18.548 12.9823C18.5378 12.9864 18.5395 13.0047 18.5503 13.0063C18.8115 13.0456 20 13.3065 20 14.8C20 16 19.5 17 17.8 17C17.8 17 16 17 16 16.3"/>
</svg>`;

/**
 * Editor.js 编辑器配置
 */
export const editorConfig = {
  // Editor.js 基础配置
  placeholder: "开始编写内容...",
  autofocus: true,
  minHeight: 500,
  logLevel: "WARN", // 'VERBOSE', 'INFO', 'WARN', 'ERROR'

  // 工具配置 - 使用实际的类引用而非字符串
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
      class: "Image", // 将在editor.js中解析为实际的类引用
      config: {
        types: "image/*",
        captionPlaceholder: "图片描述",
        buttonContent: "选择图片",
        features: {
          caption: true, // caption作为可选功能
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
      class: "Raw", // 将在editor.js中解析为实际的类引用
    },
    list: {
      class: "List", // 将在editor.js中解析为实际的类引用
      inlineToolbar: true,
      config: {
        defaultStyle: "unordered",
        maxLevel: 5,
      },
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
