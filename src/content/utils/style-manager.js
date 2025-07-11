/**
 * 样式管理器模块
 * 负责管理预设样式配置和远程样式拉取功能
 */

import { styleConfig, BLOCK_THEME_CONFIGS, REMOTE_STYLE_CONFIG, STYLE_VALIDATION_RULES } from '../config/style-config.js';
import { styleSyncService } from '../services/style-sync.js';
import { createLogger } from '../services/simple-logger.js';

// 创建模块日志器
const logger = createLogger('StyleManager');

/**
 * 预设样式配置
 */
const DEFAULT_STYLES = {
  paragraph: {
    tag: 'p',
    className: 'flow-paragraph',
    styles: {
      'margin': '0 0 16px 0',
      'line-height': '1.6',
      'color': '#333',
      'font-size': '16px'
    }
  },
  header: {
    h1: {
      tag: 'h1',
      className: 'flow-header-1',
      styles: {
        'font-size': '32px',
        'font-weight': 'bold',
        'margin': '0 0 24px 0',
        'line-height': '1.2',
        'color': '#1a1a1a'
      }
    },
    h2: {
      tag: 'h2',
      className: 'flow-header-2',
      styles: {
        'font-size': '24px',
        'font-weight': 'bold',
        'margin': '0 0 20px 0',
        'line-height': '1.3',
        'color': '#1a1a1a'
      }
    },
    h3: {
      tag: 'h3',
      className: 'flow-header-3',
      styles: {
        'font-size': '20px',
        'font-weight': 'bold',
        'margin': '0 0 16px 0',
        'line-height': '1.4',
        'color': '#1a1a1a'
      }
    }
  },
  list: {
    tag: 'ul',
    className: 'flow-list',
    styles: {
      'margin': '0 0 16px 0',
      'padding-left': '20px'
    },
    itemStyles: {
      'margin': '0 0 8px 0',
      'line-height': '1.6'
    }
  },
  quote: {
    tag: 'blockquote',
    className: 'flow-quote',
    styles: {
      'margin': '0 0 16px 0',
      'padding': '16px 20px',
      'border-left': '4px solid #e0e0e0',
      'background-color': '#f9f9f9',
      'font-style': 'italic',
      'color': '#666'
    }
  },
  code: {
    tag: 'pre',
    className: 'flow-code',
    styles: {
      'margin': '0 0 16px 0',
      'padding': '16px',
      'background-color': '#f5f5f5',
      'border': '1px solid #e0e0e0',
      'border-radius': '4px',
      'font-family': 'Monaco, Consolas, "Courier New", monospace',
      'font-size': '14px',
      'overflow-x': 'auto'
    }
  }
};

/**
 * 样式缓存
 */
let styleCache = new Map();
let remoteStylesLoaded = false;

/**
 * 样式管理器类
 */
class StyleManager {
  constructor() {
    this.styles = { ...DEFAULT_STYLES };
    this.remoteStyleUrl = null;
    this.cacheExpiry = styleConfig.get('cacheExpiry');
  }

  /**
   * 设置远程样式URL
   * @param {string} url 远程样式API地址
   */
  setRemoteStyleUrl(url) {
    this.remoteStyleUrl = url;
  }

  /**
   * 获取块类型的样式配置
   * @param {string} blockType 块类型
   * @param {Object} blockData 块数据
   * @returns {Object} 样式配置
   */
  getBlockStyle(blockType, blockData = {}) {
    switch (blockType) {
      case 'paragraph':
        return this.styles.paragraph;
      case 'header':
        const level = blockData.level || 1;
        return this.styles.header[`h${level}`] || this.styles.header.h1;
      case 'list':
        return this.styles.list;
      case 'quote':
        return this.styles.quote;
      case 'code':
        return this.styles.code;
      default:
        return this.styles.paragraph; // 默认使用段落样式
    }
  }

  /**
   * 从远程加载样式配置
   * @returns {Promise<boolean>} 是否加载成功
   */
  async loadRemoteStyles() {
    try {
      // 首先尝试从样式同步服务获取缓存的样式
      const cachedStyles = await styleSyncService.getCachedStyles();
      if (cachedStyles) {
        this.mergeStyles(cachedStyles);
        remoteStylesLoaded = true;
        logger.info('使用样式同步服务缓存的样式');
        return true;
      }

      // 如果没有缓存，检查本地缓存
      if (this.remoteStyleUrl) {
        const cacheKey = `${REMOTE_STYLE_CONFIG.cache.prefix}${this.remoteStyleUrl}`;
        const localCached = this.getCachedStyles(cacheKey);
        if (localCached) {
          this.mergeStyles(localCached);
          remoteStylesLoaded = true;
          logger.info('使用本地缓存的远程样式');
          return true;
        }
      }

      // 如果都没有，尝试触发样式同步
      if (!this.remoteStyleUrl) {
        logger.warn('远程样式URL未设置，无法同步样式');
        return false;
      }

      logger.info('触发样式同步...');
      const syncSuccess = await styleSyncService.manualSync();
      if (syncSuccess) {
        const syncedStyles = await styleSyncService.getCachedStyles();
        if (syncedStyles) {
          this.mergeStyles(syncedStyles);
          remoteStylesLoaded = true;
          return true;
        }
      }

      logger.warn('无法获取远程样式，将使用默认样式');
      return false;
    } catch (error) {
      logger.error('加载远程样式失败:', error);
      return false;
    }
  }

  /**
   * 合并样式配置
   * @param {Object} newStyles 新样式配置
   */
  mergeStyles(newStyles) {
    this.styles = {
      ...this.styles,
      ...newStyles
    };
  }

  /**
   * 验证样式格式
   * @param {Object} styles 样式配置
   * @returns {boolean} 是否有效
   */
  validateStyleFormat(styles) {
    if (!styles || typeof styles !== 'object') {
      return false;
    }

    // 检查必需的块类型
    const requiredTypes = STYLE_VALIDATION_RULES.requiredBlockTypes;
    if (!requiredTypes.every(type => styles[type])) {
      return false;
    }

    // 验证CSS属性安全性
    const validateCssProperties = (styleObj) => {
      if (!styleObj || typeof styleObj !== 'object') return true;
      
      for (const [property, value] of Object.entries(styleObj)) {
        // 检查禁止的属性
        if (STYLE_VALIDATION_RULES.forbiddenCssProperties.some(forbidden => 
          property.toLowerCase().includes(forbidden.toLowerCase()))) {
          return false;
        }
        
        // 检查值长度
        if (typeof value === 'string' && value.length > STYLE_VALIDATION_RULES.maxCssValueLength) {
          return false;
        }
      }
      return true;
    };

    // 递归验证所有样式对象
    const validateStylesRecursively = (obj) => {
      for (const value of Object.values(obj)) {
        if (value && typeof value === 'object') {
          if (value.styles && !validateCssProperties(value.styles)) {
            return false;
          }
          if (!validateStylesRecursively(value)) {
            return false;
          }
        }
      }
      return true;
    };

    return validateStylesRecursively(styles);
  }

  /**
   * 获取缓存的样式
   * @param {string} key 缓存键
   * @returns {Object|null} 缓存的样式或null
   */
  getCachedStyles(key) {
    if (!REMOTE_STYLE_CONFIG.cache.enabled) {
      return null;
    }
    
    const cached = styleCache.get(key);
    if (cached && Date.now() - cached.timestamp < REMOTE_STYLE_CONFIG.cache.expiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * 设置样式缓存
   * @param {string} key 缓存键
   * @param {Object} data 样式数据
   */
  setCachedStyles(key, data) {
    if (REMOTE_STYLE_CONFIG.cache.enabled) {
      styleCache.set(key, {
        data,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 清除样式缓存
   */
  clearCache() {
    styleCache.clear();
    remoteStylesLoaded = false;
  }

  /**
   * 获取所有样式配置
   * @returns {Object} 完整的样式配置
   */
  getAllStyles() {
    return this.styles;
  }

  /**
   * 检查远程样式是否已加载
   * @returns {boolean}
   */
  isRemoteStylesLoaded() {
    return remoteStylesLoaded;
  }

  /**
   * 初始化样式管理器
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize() {
    try {
      // 初始化样式同步服务
      await styleSyncService.initialize();
      
      // 尝试加载缓存的样式
      const cachedStyles = await styleSyncService.getCachedStyles();
      if (cachedStyles) {
        this.mergeStyles(cachedStyles);
        remoteStylesLoaded = true;
        logger.info('样式管理器初始化完成，已加载缓存样式');
      } else {
        logger.info('样式管理器初始化完成，使用默认样式');
      }
      
      return true;
    } catch (error) {
      logger.error('样式管理器初始化失败:', error);
      return false;
    }
  }
}

// 创建全局样式管理器实例
const styleManager = new StyleManager();

export { styleManager, StyleManager };
export default styleManager;