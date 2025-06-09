// 配置管理

/**
 * Editor.js 编辑器配置
 */
export const editorConfig = {
  // Editor.js 基础配置
  placeholder: '在此输入内容...',
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
        levels: [2, 3, 4],
        defaultLevel: 2,
        placeholder: '请输入标题',
      },
    },
    quote: {
      class: 'Quote', // 将在editor.js中解析为实际的类引用
      inlineToolbar: true,
      config: {
        quotePlaceholder: '输入引用内容',
        captionPlaceholder: '引用来源',
      },
    },
    // 未来可以轻松添加更多工具
    // list: {
    //   class: 'List',
    //   inlineToolbar: true,
    //   config: {
    //     defaultStyle: 'unordered'
    //   }
    // },
    // quote: {
    //   class: 'Quote',
    //   inlineToolbar: true,
    //   config: {
    //     quotePlaceholder: '输入引用内容',
    //     captionPlaceholder: '引用来源'
    //   }
    // }
  },
  
  // 其他 Editor.js 配置选项
  minHeight: 300,
  logLevel: 'WARN', // 'VERBOSE', 'INFO', 'WARN', 'ERROR'
  
  // 初始内容配置
  initialContent: {
    version: '2.28.2',
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: '在此输入内容...'
        }
      }
    ]
  }
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
    editorConfigKey: 'default', // 使用哪个编辑器配置，对应 editorConfigMap 中的键
  },
};

// 样式配置已迁移到 style-config.js 中统一管理

/**
 * DOM选择器配置
 */
export const selectorConfig = {
  toolbar: '#js_toolbar_0',                           // 工具栏容器 - 用于添加自定义按钮和开关
  editor: 'div[contenteditable="true"].ProseMirror',  // 主编辑器容器 - 智能插入功能的目标容器
  proseMirror: '#ueditor_0 .ProseMirror',              // 编辑器内容区域 - 用于获取和保存编辑内容
  buttonArea: '#js_button_area',                       // 按钮区域 - 用于添加控制栏和管理按钮显示
  sidebar: '#js_side_article_list',                    // 侧边栏 - 用于侧边栏切换功能
};