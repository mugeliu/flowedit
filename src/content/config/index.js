// 配置管理

/**
 * 功能开关配置
 */
export const featureConfig = {
  // 侧边栏切换功能
  sidebarToggle: {
    enabled: true,
    position: 'first', // 在工具栏的位置
  },
  
  // 智能插入功能
  smartInsert: {
    enabled: true,
    position: 'last', // 在工具栏的位置
    editor: {
      placeholder: '在此输入内容...',
      tools: {
        header: {
          levels: [2, 3, 4],
          defaultLevel: 2,
          placeholder: '请输入标题',
        },
      },
    },
  },
};

/**
 * 样式配置
 */
export const styleConfig = {
  // 扩展样式ID
  styleId: 'flowedit-styles',
};

/**
 * DOM选择器配置
 */
export const selectorConfig = {
  toolbar: '#js_toolbar_0',
  editor: '#ueditor_0',
  proseMirror: '#ueditor_0 .ProseMirror',
  buttonArea: '#js_button_area',
  sidebar: '#js_side_article_list',
  articleList: '#js_side_article_list',
  articleSetting: '#article_setting_area',
};