/**
 * FlowEdit 插件配置
 * 包含插件运行所需的所有配置项
 */

import { createWeChatImageUploader } from "../tools/custom-wechat-image-tool.js";

// ===========================================
// DOM 选择器配置
// ===========================================

/**
 * DOM 选择器配置
 */
export const selectorConfig = {
  toolbar: "js_toolbar_0",                              // 工具栏容器
  editorContent: 'div[contenteditable="true"].ProseMirror', // 编辑器内容区
  editorWrapper: "edui1_iframeholder",                  // 编辑器容器
  sidebar: "js_mp_sidemenu",                           // 侧边栏
  authorArea: "js_author_area",                        // 作者区域
  footerToolbar: "js_button_area",                     // 底部工具栏
};

// ===========================================
// EditorJS 编辑器配置
// ===========================================

/**
 * 图标资源
 */
const ICONS = {
  h1: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M19 17V10.2135C19 10.1287 18.9011 10.0824 18.836 10.1367L16 12.5"/>
  </svg>`,
  h2: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10 19 9.5 19 12C19 13.9771 16.0684 13.9997 16.0012 16.8981C15.9999 16.9533 16.0448 17 16.1 17L19.3 17"/>
  </svg>`,
  h3: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10.5 16.8323 10 17.6 10C18.3677 10 19.5 10.311 19.5 11.5C19.5 12.5315 18.7474 12.9022 18.548 12.9823C18.5378 12.9864 18.5395 13.0047 18.5503 13.0063C18.8115 13.0456 20 13.3065 20 14.8C20 16 19.5 17 17.8 17C17.8 17 16 17 16 16.3"/>
  </svg>`
};

/**
 * EditorJS 配置
 */
export const editorConfig = {
  // 基础设置
  placeholder: "开始编写内容...",
  autofocus: true,
  minHeight: 500,
  logLevel: "WARN",

  // 工具配置
  tools: {
    paragraph: {
      class: "Paragraph",
      inlineToolbar: true,
    },
    header: {
      class: "Header",
      config: {
        levels: [1, 2, 3],
        defaultLevel: 1,
        placeholder: "请输入标题",
      },
      toolbox: [
        { title: "Heading 1", icon: ICONS.h1, data: { level: 1 } },
        { title: "Heading 2", icon: ICONS.h2, data: { level: 2 } },
        { title: "Heading 3", icon: ICONS.h3, data: { level: 3 } },
      ],
    },
    quote: {
      class: "Quote",
      inlineToolbar: true,
      config: {
        quotePlaceholder: "输入引用内容",
        captionPlaceholder: "引用来源",
      },
    },
    image: {
      class: "ImageTool",
      config: {
        types: "image/gif,image/jpeg,image/jpg,image/png,image/svg,image/webp",
        captionPlaceholder: "图片描述",
        buttonContent: "选择图片或素材库插入",
        features: {
          caption: true,
          withBorder: true,
          withBackground: true,
          stretched: true,
        },
        uploader: createWeChatImageUploader(),
      },
    },
    list: {
      class: "List",
      inlineToolbar: true,
      config: {
        defaultStyle: "unordered",
        maxLevel: 5,
      },
    },
    delimiter: { class: "Delimiter" },
    raw: { class: "Raw" },
    code: { class: "Code" },
    marker: { class: "Marker" },
    inlineCode: { class: "InlineCode" },
    underline: { class: "Underline" },
  },
};