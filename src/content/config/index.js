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

// 样式配置已迁移到 style-config.js 中统一管理

/**
 * DOM选择器配置
 */
export const selectorConfig = {
  toolbar: '#js_toolbar_0',                           // 工具栏容器 - 用于添加自定义按钮和开关
  editor: 'div[contenteditable="true"].ProseMirror',                  // 主编辑器容器 - 智能插入功能的目标容器
  proseMirror: '#ueditor_0 .ProseMirror',              // 编辑器内容区域 - 用于获取和保存编辑内容
  buttonArea: '#js_button_area',                       // 按钮区域 - 用于添加控制栏和管理按钮显示
  sidebar: '#js_side_article_list',                    // 侧边栏 - 用于侧边栏切换功能
};