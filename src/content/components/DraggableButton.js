// 可拖动按钮组件
// 负责创建和管理可拖动的悬浮按钮

import { createSvgIcon } from '../utils/dom.js';

// 设置图标的SVG路径数据
const SETTINGS_ICON_PATH = 'M19.502 12c0 .34-.03.66-.07.98l2.11 1.65c.19.15.24.42.12.64l-2 3.46c-.09.16-.26.25-.43.25-.06 0-.12-.01-.18-.03l-2.49-1c-.52.39-1.08.73-1.69.98l-.38 2.65c-.03.24-.24.42-.49.42h-4c-.25 0-.46-.18-.49-.42l-.38-2.65c-.61-.25-1.17-.58-1.69-.98l-2.49 1c-.06.02-.12.03-.18.03-.17 0-.34-.09-.43-.25l-2-3.46c-.12-.22-.07-.49.12-.64l2.11-1.65c-.04-.32-.07-.65-.07-.98s.03-.66.07-.98l-2.11-1.65c-.19-.15-.24-.42-.12-.64l2-3.46c.09-.16.26-.25.43-.25.06 0 .12.01.18.03l2.49 1c.52-.39 1.08-.73 1.69-.98l.38-2.65c.03-.24.24-.42.49-.42h4c.25 0 .46.18.49.42l.38 2.65c.61.25 1.17.58 1.69.98l2.49-1c.06-.02.12-.03.18-.03.17 0 .34.09.43.25l2 3.46c.12.22.07.49-.12.64l-2.11 1.65c.04.32.07.64.07.98zm-8 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z';

/**
 * 可拖动按钮类
 * 创建一个可以拖动并吸附到屏幕边缘的悬浮按钮
 */
export class DraggableButton {
  /**
   * 构造函数
   * @param {Function} onClick - 按钮点击事件处理函数
   */
  constructor(onClick) {
    this.container = null;
    this.button = null;
    this.isDragging = false;
    this.dragEndTime = 0;
    this.onClick = onClick;
    
    // 绑定方法
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  
  /**
   * 创建按钮
   * @returns {HTMLElement} 按钮容器元素
   */
  create() {
    // 检查是否已经存在悬浮按钮
    const existingButton = document.querySelector('.wx-floating-settings-container');
    if (existingButton) {
      console.log('悬浮按钮已存在，不重复创建');
      return existingButton;
    }
    
    try {
      // 创建悬浮按钮容器
      this.container = document.createElement('div');
      this.container.className = 'wx-floating-settings-container';
      
      // 添加内联样式确保按钮可见
      this.container.style.cssText = `
        position: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        background-color: #fff;
        border-radius: 50%;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        width: 50px;
        height: 50px;
        cursor: move;
        user-select: none;
        touch-action: none;
        transition: transform 0.2s, box-shadow 0.2s;
        right: 20px;
        top: 50%;
      `;
      
      // 创建设置按钮
      this.button = document.createElement('button');
      this.button.className = 'wx-floating-settings-button';
      
      // 添加内联样式确保按钮可见
      this.button.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        color: #4C4D4E;
        border: none;
        width: 100%;
        height: 100%;
        padding: 0;
        cursor: pointer;
        border-radius: 50%;
      `;
      
      // 创建 SVG 图标
      const svgIcon = createSvgIcon(SETTINGS_ICON_PATH);
      
      // 添加图标到按钮
      this.button.appendChild(svgIcon);
      this.button.title = '样式设置 (可拖动)';
      
      // 添加按钮到容器
      this.container.appendChild(this.button);
      
      // 将容器添加到body
      if (document.body) {
        document.body.appendChild(this.container);
        console.log('已将按钮添加到body');
      } else {
        console.error('document.body不存在，无法添加按钮');
        return null;
      }
      
      // 设置初始位置
      this.setInitialPosition();
      
      // 添加事件监听
      this.addEventListeners();
      
      console.log('可拖动的悬浮设置按钮已创建');
      
      return this.container;
    } catch (error) {
      console.error('创建悬浮按钮时出错:', error);
      return null;
    }
  }
  
  /**
   * 设置按钮初始位置
   */
  setInitialPosition() {
    // 初始定位 - 屏幕右侧中间
    const initialLeft = window.innerWidth - this.container.offsetWidth - 20;
    const initialTop = window.innerHeight / 2 - this.container.offsetHeight / 2;
    
    this.container.style.left = `${initialLeft}px`;
    this.container.style.top = `${initialTop}px`;
  }
  
  /**
   * 添加事件监听
   */
  addEventListeners() {
    // 点击事件
    this.button.addEventListener('click', this.handleClick);
    
    // 拖动事件
    this.container.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mouseleave', this.handleMouseUp);
    
    // 窗口大小改变事件
    window.addEventListener('resize', this.handleResize);
  }
  
  /**
   * 移除事件监听
   */
  removeEventListeners() {
    this.button.removeEventListener('click', this.handleClick);
    this.container.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('mouseleave', this.handleMouseUp);
    window.removeEventListener('resize', this.handleResize);
  }
  
  /**
   * 处理点击事件
   * @param {Event} e - 事件对象
   */
  handleClick(e) {
    // 防止拖动结束后触发点击事件
    if (!this.isDragging || (this.isDragging && Date.now() - this.dragEndTime > 200)) {
      e.preventDefault();
      e.stopPropagation();
      
      // 调用点击回调
      if (typeof this.onClick === 'function') {
        this.onClick();
      }
    }
  }
  
  /**
   * 处理鼠标按下事件
   * @param {MouseEvent} e - 鼠标事件对象
   */
  handleMouseDown(e) {
    if (e.button !== 0) return; // 只处理左键点击
    
    this.isDragging = true;
    
    // 计算鼠标在按钮内的偏移量
    const rect = this.container.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;
    
    // 添加拖动时的样式
    this.container.classList.add('wx-dragging');
    
    // 防止文本选择
    e.preventDefault();
  }
  
  /**
   * 处理鼠标移动事件
   * @param {MouseEvent} e - 鼠标事件对象
   */
  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    // 计算新位置
    const newLeft = e.clientX - this.offsetX;
    const newTop = e.clientY - this.offsetY;
    
    // 限制在可视区域内
    const maxLeft = window.innerWidth - this.container.offsetWidth;
    const maxTop = window.innerHeight - this.container.offsetHeight;
    
    this.container.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
    this.container.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
  }
  
  /**
   * 处理鼠标松开事件
   */
  handleMouseUp() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.dragEndTime = Date.now();
    
    // 移除拖动时的样式
    this.container.classList.remove('wx-dragging');
    
    // 获取当前位置
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    
    // 吸附到左侧或右侧
    let targetLeft;
    if (centerX < window.innerWidth / 2) {
      // 吸附到左侧
      targetLeft = 20;
    } else {
      // 吸附到右侧
      targetLeft = window.innerWidth - rect.width - 20;
    }
    
    // 应用吸附效果
    this.container.style.transition = 'left 0.3s ease-out';
    this.container.style.left = `${targetLeft}px`;
    
    // 重置transition
    setTimeout(() => {
      this.container.style.transition = '';
    }, 300);
  }
  
  /**
   * 处理窗口大小改变事件
   */
  handleResize() {
    const rect = this.container.getBoundingClientRect();
    
    // 如果按钮在右侧，保持在右侧
    if (rect.left > window.innerWidth / 2) {
      this.container.style.left = `${window.innerWidth - rect.width - 20}px`;
    }
    
    // 确保按钮不超出屏幕
    const maxTop = window.innerHeight - rect.height;
    if (rect.top > maxTop) {
      this.container.style.top = `${maxTop}px`;
    }
  }
  
  /**
   * 销毁按钮
   */
  destroy() {
    if (this.container) {
      this.removeEventListeners();
      this.container.remove();
      this.container = null;
      this.button = null;
    }
  }
}
