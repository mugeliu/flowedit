// 配置常量和默认设置

/**
 * 插件配置常量
 */
export const CONFIG = {
  // 存储键
  STORAGE_KEYS: {
    SETTINGS: 'wx-floating-toolbar-settings',
    FEATURE_ENABLED: 'wx-floating-toolbar-enabled',
    BUTTON_POSITION: 'wx-floating-button-position'
  },
  
  // 选择器
  SELECTORS: {
    EDITOR: '.ProseMirror[contenteditable="true"]',
    TOOLBAR: '.edui-editor-toolbarboxouter-placeholder.edui-default',
    EDITOR_CANDIDATES: [
      '.edui-editor-body',
      '.rich_media_content',
      '.editor',
      '.js_editor_area',
      '.view.rich_media_content',
      '#ueditor_0'
    ]
  },
  
  // 延时设置
  TIMEOUTS: {
    EDITOR_SEARCH: 1000,
    EDITOR_SEARCH_MAX: 30000,
    SELECTION_DELAY: 300
  }
};

/**
 * 默认样式设置
 */
export const DEFAULT_SETTINGS = {
  // 标题样式
  h1: { 
    fontSize: '30px', 
    fontWeight: 'bold',
    lineHeight: '1.3',
    margin: '16px 0 4px'
  },
  h2: { 
    fontSize: '24px', 
    fontWeight: 'bold',
    lineHeight: '1.3',
    margin: '14px 0 4px'
  },
  h3: { 
    fontSize: '20px', 
    fontWeight: 'bold',
    lineHeight: '1.3',
    margin: '12px 0 4px'
  },
  h4: { 
    fontSize: '16px', 
    fontWeight: 'bold',
    lineHeight: '1.3',
    margin: '10px 0 4px'
  },
  
  // 代码样式
  code: { 
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', 
    backgroundColor: 'rgba(175, 184, 193, 0.2)', 
    padding: '0.2em 0.4em', 
    borderRadius: '3px', 
    fontSize: '85%',
    whiteSpace: 'nowrap'
  },
  
  // 自定义样式
  custom: { 
    css: '' 
  },
  
  // UI设置
  ui: {
    floatingToolbarEnabled: true,
    buttonPosition: { right: '20px', top: '50%' }
  }
};

/**
 * 图标路径数据
 */
export const ICON_PATHS = {
  SETTINGS: 'M19.502 12c0 .34-.03.66-.07.98l2.11 1.65c.19.15.24.42.12.64l-2 3.46c-.09.16-.26.25-.43.25-.06 0-.12-.01-.18-.03l-2.49-1c-.52.39-1.08.73-1.69.98l-.38 2.65c-.03.24-.24.42-.49.42h-4c-.25 0-.46-.18-.49-.42l-.38-2.65c-.61-.25-1.17-.58-1.69-.98l-2.49 1c-.06.02-.12.03-.18.03-.17 0-.34-.09-.43-.25l-2-3.46c-.12-.22-.07-.49.12-.64l2.11-1.65c-.04-.32-.07-.65-.07-.98s.03-.66.07-.98l-2.11-1.65c-.19-.15-.24-.42-.12-.64l2-3.46c.09-.16.26-.25.43-.25.06 0 .12.01.18.03l2.49 1c.52-.39 1.08-.73 1.69-.98l.38-2.65c.03-.24.24-.42.49-.42h4c.25 0 .46.18.49.42l.38 2.65c.61.25 1.17.58 1.69.98l2.49-1c.06-.02.12-.03.18-.03.17 0 .34.09.43.25l2 3.46c.12.22.07.49-.12.64l-2.11 1.65c.04.32.07.64.07.98zm-8 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z'
};
