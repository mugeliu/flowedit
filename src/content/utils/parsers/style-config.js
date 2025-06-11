/**
 * 样式配置文件 - 测试用配置
 * 基于demo.html的样式结构设计
 */

/**
 * 默认样式配置
 * @type {Object}
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
  }
};

/**
 * 创建样式提供函数
 * @param {Object} styleConfig - 样式配置对象
 * @returns {Function} 样式提供函数
 */
export function createStyleProvider(styleConfig = defaultStyleConfig) {
  /**
   * 获取指定元素类型和变体的样式
   * @param {string} elementType - 元素类型 (header, paragraph, emphasis等)
   * @param {string} variant - 样式变体 (h1, h2, strong等)
   * @returns {Object} 合并后的样式对象
   */
  return function(elementType, variant = 'default') {
    const baseStyles = styleConfig.base || {};
    const elementStyles = styleConfig[elementType] || {};
    
    // 对于内联样式元素（emphasis），智能继承基础样式
    if (elementType === 'emphasis') {
      // 从基础样式中提取可继承的属性（颜色、字体等）
      const inheritableBaseStyles = {
        color: baseStyles.color,
        fontFamily: baseStyles.fontFamily,
        fontSize: baseStyles.fontSize
      };
      
      // 过滤掉undefined的属性
      const filteredBaseStyles = Object.fromEntries(
        Object.entries(inheritableBaseStyles).filter(([_, value]) => value !== undefined)
      );
      
      if (typeof elementStyles === 'object' && elementStyles[variant]) {
        return { ...filteredBaseStyles, ...elementStyles[variant] };
      }
      return { ...filteredBaseStyles, ...elementStyles };
    }
    
    // 对于块级元素，合并基础样式
    if (typeof elementStyles === 'object' && elementStyles[variant]) {
      return { ...baseStyles, ...elementStyles[variant] };
    }
    
    // 否则使用元素类型的默认样式
    return { ...baseStyles, ...elementStyles };
  };
}