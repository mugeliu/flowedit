// 开关按钮组件
// 负责创建和管理工具栏中的开关按钮

import { CONFIG } from '../../core/config.js';

/**
 * 开关按钮类
 * 在指定的元素下创建一个开关按钮
 */
export class SwitchButton {
  /**
   * 构造函数
   * @param {Function} onChange - 开关状态变化时的回调函数
   */
  constructor(onChange) {
    this.container = null;
    this.switchInput = null;
    this.switchLabel = null;
    this.isOn = false;
    this.onChange = onChange;
    
    // 绑定方法
    this.handleChange = this.handleChange.bind(this);
  }
  
  /**
   * 创建开关按钮
   * @returns {HTMLElement} 开关按钮容器元素
   */
  create() {
    try {
      // 检查是否已经存在开关按钮
      const existingSwitch = document.querySelector('.wx-switch-container');
      if (existingSwitch) {
        console.log('开关按钮已存在，不重复创建');
        this.container = existingSwitch;
        this.switchInput = existingSwitch.querySelector('.wx-switch-checkbox');
        this.switchLabel = existingSwitch.querySelector('.wx-switch-label');
        
        // 重新添加事件监听
        if (this.switchInput) {
          this.switchInput.addEventListener('change', this.handleChange);
        }
        
        return this.container;
      }
      
      // 查找目标元素
      const targetElement = document.querySelector(CONFIG.SELECTORS.TOOLBAR);
      if (!targetElement) {
        console.error('未找到目标元素，无法添加开关按钮');
        return null;
      }
      
      // 创建开关按钮容器
      this.container = document.createElement('div');
      this.container.className = 'wx-switch-container';
      
      // 使用相对定位
      this.container.style.cssText = `
        position: relative;
        display: flex;
        align-items: center;
        z-index: 999;
        margin: 10px 20px 0 auto; /* 上右对齐 */
        font-size: 14px;
        color: #333;
        float: right; /* 右浮动 */
      `;
      
      // 创建标签文本
      const labelText = document.createElement('span');
      labelText.textContent = '启用增强';
      labelText.style.marginRight = '8px';
      
      // 创建开关按钮
      this.switchInput = document.createElement('input');
      this.switchInput.type = 'checkbox';
      this.switchInput.id = 'wx-feature-switch';
      this.switchInput.className = 'wx-switch-checkbox';
      this.switchInput.style.display = 'none';
      
      // 创建开关标签
      this.switchLabel = document.createElement('label');
      this.switchLabel.htmlFor = 'wx-feature-switch';
      this.switchLabel.className = 'wx-switch-label';
      this.switchLabel.style.cssText = `
        position: relative;
        display: inline-block;
        width: 40px;
        height: 20px;
        background-color: #ccc;
        border-radius: 20px;
        transition: all 0.3s;
        cursor: pointer;
      `;
      
      // 创建开关滑块
      const switchSlider = document.createElement('span');
      switchSlider.className = 'wx-switch-slider';
      switchSlider.style.cssText = `
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: white;
        transition: all 0.3s;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      `;
      
      // 组装开关组件
      this.switchLabel.appendChild(switchSlider);
      this.container.appendChild(labelText);
      this.container.appendChild(this.switchInput);
      this.container.appendChild(this.switchLabel);
      
      // 添加到目标元素
      targetElement.appendChild(this.container);
      
      // 添加事件监听
      this.switchInput.addEventListener('change', this.handleChange);
      
      // 添加样式规则
      this.addStyleRules();
      
      console.log('开关按钮已创建');
      
      return this.container;
    } catch (error) {
      console.error('创建开关按钮时出错:', error);
      return null;
    }
  }
  
  /**
   * 添加样式规则
   */
  addStyleRules() {
    const styleId = 'wx-switch-dynamic-styles';
    
    // 检查是否已存在样式元素
    if (document.getElementById(styleId)) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      .wx-switch-checkbox:checked + .wx-switch-label {
        background-color: #4CAF50;
      }
      
      .wx-switch-checkbox:checked + .wx-switch-label .wx-switch-slider {
        transform: translateX(20px);
      }
      
      .wx-switch-label:hover {
        opacity: 0.8;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  /**
   * 处理开关状态变化
   * @param {Event} e - 事件对象
   */
  handleChange(e) {
    this.isOn = e.target.checked;
    
    // 调用回调函数
    if (typeof this.onChange === 'function') {
      this.onChange(this.isOn);
    }
  }
  
  /**
   * 获取开关状态
   * @returns {boolean} 当前开关状态
   */
  getState() {
    return this.isOn;
  }
  
  /**
   * 设置开关状态
   * @param {boolean} state - 要设置的状态
   */
  setState(state) {
    this.isOn = Boolean(state);
    this.switchInput.checked = this.isOn;
    
    // 调用回调函数
    if (typeof this.onChange === 'function') {
      this.onChange(this.isOn);
    }
  }
  
  /**
   * 切换开关状态
   */
  toggle() {
    this.setState(!this.isOn);
  }
  
  /**
   * 更新开关位置
   * @param {Object} position - 位置对象，包含 margin, float 等属性
   */
  updatePosition(position) {
    if (!this.container) return;
    
    // 重置相关定位属性
    this.container.style.margin = '';
    this.container.style.float = '';
    this.container.style.position = 'relative';
    
    // 应用新的定位属性
    if (position.margin) {
      this.container.style.margin = position.margin;
    }
    
    if (position.float) {
      this.container.style.float = position.float;
    }
    
    // 处理其他自定义样式
    if (position.customStyles) {
      Object.entries(position.customStyles).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          this.container.style[key] = value;
        }
      });
    }
  }
  
  /**
   * 销毁开关按钮
   */
  destroy() {
    // 移除事件监听
    if (this.switchInput) {
      this.switchInput.removeEventListener('change', this.handleChange);
    }
    
    // 移除元素
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    console.log('开关按钮已销毁');
  }
}
