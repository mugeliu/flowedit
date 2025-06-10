// 配置管理

const Icon = txt => `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="monospace" font-size="12">${txt}</text>
</svg>`;   // 你可以换成自己的 SVG/图片
/**
 * Editor.js 编辑器配置
 */
export const editorConfig = {
  // Editor.js 基础配置
  placeholder: '开始输入内容...',
  autofocus: true,
  hideToolbar: false,
  
  // 工具配置
  tools: {
    paragraph: {
      class: 'Paragraph', // 将在editor.js中解析为实际的类引用
      inlineToolbar: true,
    },
    header: {
      class: 'Header', // 将在editor.js中解析为实际的类引用
      inlineToolbar: true,
      config: {
        levels: [1, 2, 3],
        defaultLevel: 1,
        placeholder: '请输入标题',
      },
      toolbox: [
        {
          title: "Heading 1",
          icon: Icon("H1"),
          data: { level: 1 }
        },
        {
          title: "Heading 2",
          icon: Icon("H2"),
          data: { level: 2 }
        },
        {
          title: "Heading 3",
          icon: Icon("H3"),
          data: { level: 3 }
        }
      ]
    },
    quote: {
      class: 'Quote', // 将在editor.js中解析为实际的类引用
      inlineToolbar: true,
      config: {
        quotePlaceholder: '输入引用内容',
        captionPlaceholder: '引用来源',
      },
    },
    image: {
      class: 'ImageTool', // 将在editor.js中解析为实际的类引用
      inlineToolbar: true,
      config: {
        endpoints: {
        }
      }
    },
    raw: {
      class: 'RawTool', // 将在editor.js中解析为实际的类引用
    },
  },

  // 其他 Editor.js 配置选项
  minHeight: 300,
  logLevel: 'WARN', // 'VERBOSE', 'INFO', 'WARN', 'ERROR'
  
  // 初始内容配置
};

/**
 * 功能开关配置
 */
export const featureConfig = {
  // 侧边栏切换功能
  sidebarToggle: {
    enabled: true,
    position: 'first', // 在工具栏的位置：'first', 'last', 'before', 'after'
    insertMethod: 'insertBefore', // 插入方法：'insertBefore', 'appendChild'
    targetElement: 'firstElementChild', // 目标元素：'firstElementChild', 'lastElementChild'
  },
  
  // 智能插入功能
  smartInsert: {
    enabled: true,
    position: 'last', // 在工具栏的位置：'first', 'last', 'before', 'after'
    insertMethod: 'appendChild', // 插入方法：'insertBefore', 'appendChild'
    targetElement: null, // 目标元素：null表示直接添加到toolbar
  },
};

// 样式配置已迁移到 style-config.js 中统一管理

/**
 * DOM选择器配置
 */
export const selectorConfig = {
  toolbar: '#js_toolbar_0',                                           // 工具栏容器 - 用于添加自定义按钮和开关
  editorContent: 'div[contenteditable="true"].ProseMirror',          // 原编辑器容器 - 智能插入功能的目标容器
  editorWrapper: '#edui1_iframeholder',                                     // 原编辑器容器的父元素 - 用于隐藏和显示
  editorToHide: ['#ueditor_0', '#article_setting_area', '#js_button_area'],              // 原编辑器需要隐藏的区域
  buttonArea: '#bottom_main',                              // 按钮区域 - 用于添加保存和取消按钮
  sidebar: '#js_side_article_list',                    // 侧边栏 - 用于侧边栏切换功能
};