/**
 * Block 块转 HTML 样式配置文件
 * 专门管理编辑器内容块转换为 HTML 时的样式配置
 */

/**
 * 默认块样式配置
 */
export const defaultStyleConfig = {
  // 基础样式 - 所有元素的默认样式
  base: {
    textAlign: 'left',
    lineHeight: 1.75,
    fontFamily: "Menlo, Monaco, 'Courier New', monospace",
    fontSize: '14px',
    color: '#3f3f3f'
  },
  
  // 标题样式配置
  header: {
    h1: {
      textAlign: 'center',
      fontSize: '19.6px',
      display: 'table',
      padding: '0.5em 1em',
      borderBottom: '2px solid rgba(26, 104, 64, 1)',
      margin: '2em auto 1em',
      marginTop: '0',
      color: 'rgba(26, 104, 64, 1)',
      fontWeight: 'bold',
      textShadow: '1px 1px 3px rgba(0,0,0,0.05)'
    },
    h2: {
      fontSize: '17px',
      color: 'rgba(26, 104, 64, 1)',
      fontWeight: 'bold',
      margin: '1.5em 8px 1em',
      borderBottom: '1px solid rgba(26, 104, 64, 0.3)',
      paddingBottom: '0.3em'
    },
    h3: {
      fontSize: '15.5px',
      color: 'rgba(26, 104, 64, 1)',
      fontWeight: 'bold',
      margin: '1.2em 8px 0.8em'
    },
    h4: {
      fontSize: '14.5px',
      color: 'rgba(26, 104, 64, 1)',
      fontWeight: 'bold',
      margin: '1em 8px 0.6em'
    },
    h5: {
      fontSize: '14px',
      color: 'rgba(26, 104, 64, 1)',
      fontWeight: 'bold',
      margin: '0.8em 8px 0.5em'
    },
    h6: {
      fontSize: '13px',
      color: 'rgba(26, 104, 64, 1)',
      fontWeight: 'bold',
      margin: '0.6em 8px 0.4em'
    }
  },
  
  // 段落样式配置
  paragraph: {
    margin: '1.5em 8px',
    letterSpacing: '0.1em'
  },
  
  // Section容器样式配置 - 所有块级元素的外层容器
  section: {
    textIndent: '0px',
    marginBottom: '8px'
  },
  
  // 内联样式配置 - 用于转换为span标签的样式
  emphasis: {
    strong: {
      fontWeight: 'bold'
    },
    em: {
      fontStyle: 'italic'
    },
    code: {
      fontSize: '90%',
      fontFamily: 'monospace',
      backgroundColor: '#f6f8fa',
      padding: '2px 4px',
      borderRadius: '3px',
      border: '1px solid #e1e4e8'
    },
    mark: {
      backgroundColor: '#ff6827',
      color: '#ffffff',
      padding: '1px 2px',
      borderRadius: '2px'
    },
    u: {
      textDecoration: 'underline'
    },
    s: {
      textDecoration: 'line-through'
    },
    link: {
      color: 'rgba(26, 104, 64, 1)',
      textDecoration: 'none',
      borderBottom: '1px solid rgba(26, 104, 64, 0.3)',
      cursor: 'pointer'
    }
  },
  
  // 引用样式配置
  blockquote: {
    fontStyle: 'italic',
    padding: '1em 1em 1em 2em',
    borderLeft: '4px solid rgba(26, 104, 64, 1)',
    borderRadius: '6px',
    color: 'rgba(0,0,0,0.6)',
    background: '#f7f7f7',
    marginBottom: '1em',
    borderBottom: '0.2px solid rgba(0, 0, 0, 0.04)',
    borderTop: '0.2px solid rgba(0, 0, 0, 0.04)',
    borderRight: '0.2px solid rgba(0, 0, 0, 0.04)'
  },
  
  // 列表样式配置
  list: {
    ul: {
      listStyle: 'none',
      paddingLeft: '1.5em',
      marginLeft: '0'
    },
    ol: {
      paddingLeft: '1.5em',
      marginLeft: '0'
    },
    li: {
      textIndent: '-1em',
      display: 'block',
      margin: '0.5em 8px'
    }
  },
  
  // 图片样式配置
  image: {
    figure: {
      margin: '1.5em 8px'
    },
    img: {
      display: 'block',
      maxWidth: '100%',
      margin: '0.1em auto 0.5em',
      borderRadius: '8px',
      border: '1px solid rgba(0, 0, 0, 0.04)'
    },
    figcaption: {
      textAlign: 'center',
      fontSize: '0.8em',
      color: '#888'
    }
  },
  
  // 代码块样式配置
  codeBlock: {
    background: '#f6f8fa',
    border: '1px solid #e1e4e8',
    borderRadius: '6px',
    padding: '16px',
    margin: '1em 8px',
    overflow: 'auto',
    fontSize: '85%',
    lineHeight: 1.45
  },
  
  // 分隔符样式配置
  delimiter: {
    textAlign: 'center',
    margin: '2em 0',
    fontSize: '1.2em',
    color: '#999',
    letterSpacing: '0.5em'
  }
};



export const DEFAULT_BLOCK_STYLE_CONFIG = {
  // 是否启用远程样式
  enableRemoteStyles: false,
  
  // 远程样式API地址
  remoteStyleUrl: null,
  
  // 样式缓存过期时间（毫秒）
  cacheExpiry: 24 * 60 * 60 * 1000, // 24小时
  
  // 是否自动注入样式到页面
  autoInjectStyles: true,
  
  // HTML包装器类名
  wrapperClassName: 'flow-editor-content',
  
  // 是否跳过空块
  skipEmptyBlocks: true,
  
  // 样式主题
  theme: 'default', // default, minimal, modern
  
  // 内容样式ID
  contentStyleId: 'flowedit-content-styles',
  
  // 块类型样式映射
  blockStyles: {
    // 段落样式
    paragraph: {
      className: 'flow-paragraph',
      styles: {
        'margin': '0 0 16px 0',
        'line-height': '1.6',
        'color': '#333'
      }
    },
    // 标题样式
    header: {
      className: 'flow-header',
      styles: {
        'margin': '24px 0 16px 0',
        'font-weight': 'bold',
        'color': '#222'
      },
      levelStyles: {
        1: { 'font-size': '2em' },
        2: { 'font-size': '1.5em' },
        3: { 'font-size': '1.25em' },
        4: { 'font-size': '1.1em' },
        5: { 'font-size': '1em' },
        6: { 'font-size': '0.9em' }
      }
    },
    // 列表样式
    list: {
      className: 'flow-list',
      styles: {
        'margin': '0 0 16px 0',
        'padding-left': '20px'
      }
    },
    // 引用样式
    quote: {
      className: 'flow-quote',
      styles: {
        'margin': '16px 0',
        'padding': '16px',
        'border-left': '4px solid #ddd',
        'background-color': '#f9f9f9',
        'font-style': 'italic'
      }
    },
    // 代码块样式
    code: {
      className: 'flow-code',
      styles: {
        'margin': '16px 0',
        'padding': '16px',
        'background-color': '#f5f5f5',
        'border-radius': '4px',
        'font-family': 'Monaco, Consolas, "Courier New", monospace',
        'font-size': '14px',
        'overflow-x': 'auto'
      }
    }
  }
};

/**
 * 块样式主题配置
 */
export const BLOCK_THEME_CONFIGS = {
  default: {
    name: 'Default',
    description: '默认主题，平衡的设计风格',
    blockStyles: {
      paragraph: {
        styles: {
          'color': '#333',
          'line-height': '1.6'
        }
      },
      header: {
        styles: {
          'color': '#222',
          'font-weight': 'bold'
        }
      },
      quote: {
        styles: {
          'border-left': '4px solid #007bff',
          'background-color': '#f8f9fa'
        }
      }
    }
  },
  
  minimal: {
    name: 'Minimal',
    description: '极简主题，简洁的设计风格',
    blockStyles: {
      paragraph: {
        styles: {
          'color': '#000',
          'line-height': '1.5'
        }
      },
      header: {
        styles: {
          'color': '#000',
          'font-weight': '600'
        }
      },
      quote: {
        styles: {
          'border-left': '2px solid #000',
          'background-color': '#fff'
        }
      }
    }
  },
  
  modern: {
    name: 'Modern',
    description: '现代主题，时尚的设计风格',
    blockStyles: {
      paragraph: {
        styles: {
          'color': '#1a1a1a',
          'line-height': '1.7'
        }
      },
      header: {
        styles: {
          'color': '#1a1a1a',
          'font-weight': '700'
        }
      },
      quote: {
        styles: {
          'border-left': '4px solid #6366f1',
          'background-color': '#f8fafc'
        }
      }
    }
  }
};

/**
 * 远程样式API配置
 */
export const REMOTE_STYLE_CONFIG = {
  // API端点
  endpoints: {
    // 获取样式配置
    getStyles: '/api/styles',
    // 获取主题列表
    getThemes: '/api/themes',
    // 获取特定主题
    getTheme: '/api/themes/{themeId}'
  },
  
  // 请求配置
  requestConfig: {
    timeout: 10000, // 10秒超时
    retries: 3, // 重试3次
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  
  // 缓存配置
  cache: {
    enabled: true,
    prefix: 'flow_styles_',
    expiry: 24 * 60 * 60 * 1000 // 24小时
  }
};

/**
 * 样式验证规则
 */
export const STYLE_VALIDATION_RULES = {
  // 必需的块类型
  requiredBlockTypes: ['paragraph', 'header'],
  
  // 允许的CSS属性
  allowedCssProperties: [
    'margin', 'padding', 'font-size', 'font-weight', 'font-family',
    'line-height', 'color', 'background-color', 'border', 'border-radius',
    'text-align', 'text-decoration', 'display', 'width', 'height',
    'max-width', 'max-height', 'overflow', 'position', 'top', 'right',
    'bottom', 'left', 'z-index', 'opacity', 'transform', 'transition'
  ],
  
  // 禁止的CSS属性（安全考虑）
  forbiddenCssProperties: [
    'javascript', 'expression', 'behavior', 'binding',
    'import', 'include', 'moz-binding'
  ],
  
  // 最大样式数量限制
  maxStylesPerBlock: 20,
  
  // 最大CSS值长度
  maxCssValueLength: 200
};

/**
 * 性能配置
 */
export const PERFORMANCE_CONFIG = {
  // 批量处理块的大小
  batchSize: 50,
  
  // 延迟注入样式的时间（毫秒）
  styleInjectionDelay: 0,
  
  // 是否启用虚拟滚动（大量块时）
  enableVirtualScrolling: false,
  
  // 虚拟滚动阈值
  virtualScrollingThreshold: 100
};

/**
 * 块样式配置管理器
 */
class BlockStyleConfigManager {
  constructor() {
    this.config = { ...DEFAULT_BLOCK_STYLE_CONFIG };
  }
  
  /**
   * 获取配置
   * @param {string} key 配置键
   * @returns {any} 配置值
   */
  get(key) {
    return key ? this.config[key] : this.config;
  }
  
  /**
   * 设置配置
   * @param {string|Object} key 配置键或配置对象
   * @param {any} value 配置值
   */
  set(key, value) {
    if (typeof key === 'object') {
      this.config = { ...this.config, ...key };
    } else {
      this.config[key] = value;
    }
  }
  
  /**
   * 重置为默认配置
   */
  reset() {
    this.config = { ...DEFAULT_BLOCK_STYLE_CONFIG };
  }
  
  /**
   * 应用主题
   * @param {string} themeName 主题名称
   */
  applyTheme(themeName) {
    const theme = BLOCK_THEME_CONFIGS[themeName];
    if (theme) {
      this.config.theme = themeName;
      // 合并主题的块样式到当前配置
      Object.keys(theme.blockStyles).forEach(blockType => {
        if (this.config.blockStyles[blockType]) {
          this.config.blockStyles[blockType].styles = {
            ...this.config.blockStyles[blockType].styles,
            ...theme.blockStyles[blockType].styles
          };
        }
      });
    }
  }
  
  /**
   * 获取当前主题配置
   * @returns {Object} 主题配置
   */
  getCurrentTheme() {
    return BLOCK_THEME_CONFIGS[this.config.theme] || BLOCK_THEME_CONFIGS.default;
  }
  
  /**
   * 获取指定块类型的样式
   * @param {string} blockType 块类型
   * @param {number} level 标题级别（仅用于header类型）
   * @returns {Object} 样式对象
   */
  getBlockStyles(blockType, level = null) {
    const blockConfig = this.config.blockStyles[blockType];
    if (!blockConfig) return {};
    
    let styles = { ...blockConfig.styles };
    
    // 如果是标题类型且有级别样式
    if (blockType === 'header' && level && blockConfig.levelStyles && blockConfig.levelStyles[level]) {
      styles = { ...styles, ...blockConfig.levelStyles[level] };
    }
    
    return styles;
  }
  
  /**
   * 获取指定块类型的CSS类名
   * @param {string} blockType 块类型
   * @returns {string} CSS类名
   */
  getBlockClassName(blockType) {
    const blockConfig = this.config.blockStyles[blockType];
    return blockConfig ? blockConfig.className : '';
  }
  
  /**
   * 验证配置
   * @returns {boolean} 是否有效
   */
  validate() {
    return typeof this.config === 'object' && 
           this.config !== null && 
           typeof this.config.blockStyles === 'object';
  }
}

// 创建全局块样式配置管理器实例
export const blockStyleConfig = new BlockStyleConfigManager();

// 为了向后兼容，保留原有的导出名称
export const styleConfig = blockStyleConfig;

export default blockStyleConfig;