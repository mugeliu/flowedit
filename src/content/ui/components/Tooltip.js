// 工具提示组件
// 用于在元素周围显示简短的提示信息

import { generateUniqueId } from '../../utils/helpers.js';

/**
 * 工具提示位置
 * @enum {string}
 */
export const TOOLTIP_POSITIONS = {
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  LEFT: 'left'
};

/**
 * 工具提示类
 * 用于创建和管理工具提示
 */
export class Tooltip {
  /**
   * 创建工具提示
   * @param {Object} options - 工具提示选项
   * @param {HTMLElement} options.target - 目标元素
   * @param {string} options.content - 提示内容
   * @param {string} options.position - 提示位置（top, right, bottom, left）
   * @param {number} options.offset - 提示偏移量（像素）
   * @param {boolean} options.showOnHover - 是否在悬停时显示
   * @param {boolean} options.showOnFocus - 是否在聚焦时显示
   * @param {boolean} options.showOnClick - 是否在点击时显示
   * @param {number} options.showDelay - 显示延迟（毫秒）
   * @param {number} options.hideDelay - 隐藏延迟（毫秒）
   */
  constructor(options = {}) {
    this.id = generateUniqueId('tooltip');
    this.target = options.target;
    this.content = options.content || '';
    this.position = options.position || TOOLTIP_POSITIONS.TOP;
    this.offset = options.offset || 8;
    this.showOnHover = options.showOnHover !== false;
    this.showOnFocus = options.showOnFocus !== false;
    this.showOnClick = options.showOnClick || false;
    this.showDelay = options.showDelay || 200;
    this.hideDelay = options.hideDelay || 200;
    
    this.tooltip = null;
    this.showTimeout = null;
    this.hideTimeout = null;
    this.isVisible = false;
    
    // 绑定方法
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.toggle = this.toggle.bind(this);
    this.create = this.create.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化工具提示
   */
  init() {
    if (!this.target) {
      console.warn('工具提示目标元素不存在');
      return;
    }
    
    // 创建工具提示元素
    this.create();
    
    // 添加事件监听
    if (this.showOnHover) {
      this.target.addEventListener('mouseenter', this.handleMouseEnter);
      this.target.addEventListener('mouseleave', this.handleMouseLeave);
    }
    
    if (this.showOnFocus) {
      this.target.addEventListener('focus', this.handleFocus);
      this.target.addEventListener('blur', this.handleBlur);
    }
    
    if (this.showOnClick) {
      this.target.addEventListener('click', this.handleClick);
    }
    
    // 添加键盘事件监听
    this.target.addEventListener('keydown', this.handleKeyDown);
    
    // 添加 aria 属性
    this.target.setAttribute('aria-describedby', this.id);
  }
  
  /**
   * 创建工具提示元素
   * @returns {HTMLElement} 工具提示元素
   */
  create() {
    // 如果工具提示已存在，则返回
    if (this.tooltip) {
      return this.tooltip;
    }
    
    // 创建工具提示容器
    this.tooltip = document.createElement('div');
    this.tooltip.id = this.id;
    this.tooltip.className = `wx-tooltip wx-tooltip-${this.position} wx-hidden`;
    this.tooltip.setAttribute('role', 'tooltip');
    
    // 添加内容
    if (typeof this.content === 'string') {
      this.tooltip.innerHTML = this.content;
    } else if (this.content instanceof HTMLElement) {
      this.tooltip.appendChild(this.content);
    }
    
    // 添加箭头
    const arrow = document.createElement('div');
    arrow.className = 'wx-tooltip-arrow';
    this.tooltip.appendChild(arrow);
    
    // 添加到文档
    document.body.appendChild(this.tooltip);
    
    return this.tooltip;
  }
  
  /**
   * 显示工具提示
   */
  show() {
    // 清除隐藏定时器
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    // 设置显示定时器
    this.showTimeout = setTimeout(() => {
      if (!this.tooltip) {
        this.create();
      }
      
      this.tooltip.classList.remove('wx-hidden');
      this.isVisible = true;
      
      // 更新位置
      this.updatePosition();
      
      // 添加窗口大小变化监听
      window.addEventListener('resize', this.updatePosition);
      window.addEventListener('scroll', this.updatePosition, true);
    }, this.showDelay);
  }
  
  /**
   * 隐藏工具提示
   */
  hide() {
    // 清除显示定时器
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    
    // 设置隐藏定时器
    this.hideTimeout = setTimeout(() => {
      if (this.tooltip) {
        this.tooltip.classList.add('wx-hidden');
        this.isVisible = false;
        
        // 移除窗口大小变化监听
        window.removeEventListener('resize', this.updatePosition);
        window.removeEventListener('scroll', this.updatePosition, true);
      }
    }, this.hideDelay);
  }
  
  /**
   * 切换工具提示显示状态
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * 更新工具提示位置
   */
  updatePosition() {
    if (!this.tooltip || !this.target) {
      return;
    }
    
    // 获取目标元素位置
    const targetRect = this.target.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    
    // 计算位置
    let top, left;
    
    switch (this.position) {
      case TOOLTIP_POSITIONS.TOP:
        top = targetRect.top - tooltipRect.height - this.offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
        
      case TOOLTIP_POSITIONS.RIGHT:
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + this.offset;
        break;
        
      case TOOLTIP_POSITIONS.BOTTOM:
        top = targetRect.bottom + this.offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
        
      case TOOLTIP_POSITIONS.LEFT:
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - this.offset;
        break;
        
      default:
        top = targetRect.top - tooltipRect.height - this.offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    }
    
    // 确保工具提示在可视区域内
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 水平边界检查
    if (left < 0) {
      left = 0;
    } else if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width;
    }
    
    // 垂直边界检查
    if (top < 0) {
      // 如果顶部溢出，切换到底部
      if (this.position === TOOLTIP_POSITIONS.TOP) {
        top = targetRect.bottom + this.offset;
        this.tooltip.className = `wx-tooltip wx-tooltip-${TOOLTIP_POSITIONS.BOTTOM}`;
      } else {
        top = 0;
      }
    } else if (top + tooltipRect.height > viewportHeight) {
      // 如果底部溢出，切换到顶部
      if (this.position === TOOLTIP_POSITIONS.BOTTOM) {
        top = targetRect.top - tooltipRect.height - this.offset;
        this.tooltip.className = `wx-tooltip wx-tooltip-${TOOLTIP_POSITIONS.TOP}`;
      } else {
        top = viewportHeight - tooltipRect.height;
      }
    }
    
    // 设置位置
    this.tooltip.style.top = `${top + window.scrollY}px`;
    this.tooltip.style.left = `${left + window.scrollX}px`;
  }
  
  /**
   * 处理鼠标进入事件
   */
  handleMouseEnter() {
    this.show();
  }
  
  /**
   * 处理鼠标离开事件
   */
  handleMouseLeave() {
    this.hide();
  }
  
  /**
   * 处理聚焦事件
   */
  handleFocus() {
    this.show();
  }
  
  /**
   * 处理失焦事件
   */
  handleBlur() {
    this.hide();
  }
  
  /**
   * 处理点击事件
   */
  handleClick() {
    this.toggle();
  }
  
  /**
   * 处理键盘事件
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyDown(event) {
    // ESC 键隐藏工具提示
    if (event.key === 'Escape' && this.isVisible) {
      this.hide();
    }
  }
  
  /**
   * 更新工具提示内容
   * @param {string|HTMLElement} content - 新的提示内容
   */
  updateContent(content) {
    this.content = content;
    
    if (this.tooltip) {
      this.tooltip.innerHTML = '';
      
      if (typeof this.content === 'string') {
        this.tooltip.innerHTML = this.content;
      } else if (this.content instanceof HTMLElement) {
        this.tooltip.appendChild(this.content);
      }
      
      // 重新添加箭头
      const arrow = document.createElement('div');
      arrow.className = 'wx-tooltip-arrow';
      this.tooltip.appendChild(arrow);
      
      // 如果工具提示可见，更新位置
      if (this.isVisible) {
        this.updatePosition();
      }
    }
  }
  
  /**
   * 销毁工具提示
   */
  destroy() {
    // 清除定时器
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    // 移除事件监听
    if (this.target) {
      if (this.showOnHover) {
        this.target.removeEventListener('mouseenter', this.handleMouseEnter);
        this.target.removeEventListener('mouseleave', this.handleMouseLeave);
      }
      
      if (this.showOnFocus) {
        this.target.removeEventListener('focus', this.handleFocus);
        this.target.removeEventListener('blur', this.handleBlur);
      }
      
      if (this.showOnClick) {
        this.target.removeEventListener('click', this.handleClick);
      }
      
      this.target.removeEventListener('keydown', this.handleKeyDown);
      this.target.removeAttribute('aria-describedby');
    }
    
    // 移除窗口事件监听
    window.removeEventListener('resize', this.updatePosition);
    window.removeEventListener('scroll', this.updatePosition, true);
    
    // 移除工具提示元素
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    
    this.tooltip = null;
    this.isVisible = false;
  }
}
