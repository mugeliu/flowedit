// 可拖动按钮组件
// 负责创建和管理可拖动的悬浮按钮

import { CONFIG, ICON_PATHS } from '../../core/config.js';
import { createIcon } from '../components/Icon.js';
import { saveToStorage, loadFromStorage } from '../../utils/storage.js';

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
      const svgIcon = createIcon(ICON_PATHS.SETTINGS);
      
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
    // 尝试从存储中加载位置
    const savedPosition = loadFromStorage(CONFIG.STORAGE_KEYS.BUTTON_POSITION);
    
    if (savedPosition && savedPosition.left !== undefined && savedPosition.top !== undefined) {
      // 使用保存的位置
      this.container.style.left = `${savedPosition.left}px`;
      this.container.style.top = `${savedPosition.top}px`;
      
      // 清除可能存在的right属性
      this.container.style.right = '';
    } else {
      // 初始定位 - 屏幕右侧中间
      const initialLeft = window.innerWidth - this.container.offsetWidth - 20;
      const initialTop = window.innerHeight / 2 - this.container.offsetHeight / 2;
      
      this.container.style.left = `${initialLeft}px`;
      this.container.style.top = `${initialTop}px`;
    }
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
    let left = e.clientX - this.offsetX;
    let top = e.clientY - this.offsetY;
    
    // 获取窗口尺寸和按钮尺寸
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buttonWidth = this.container.offsetWidth;
    const buttonHeight = this.container.offsetHeight;
    
    // 确保按钮不会超出窗口
    left = Math.max(0, Math.min(left, windowWidth - buttonWidth));
    top = Math.max(0, Math.min(top, windowHeight - buttonHeight));
    
    // 应用新位置
    this.container.style.left = `${left}px`;
    this.container.style.top = `${top}px`;
    
    // 清除right属性，避免冲突
    this.container.style.right = '';
  }
  
  /**
   * 处理鼠标释放事件
   * @param {MouseEvent} e - 鼠标事件对象
   */
  handleMouseUp(e) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.dragEndTime = Date.now();
    
    // 移除拖动时的样式
    this.container.classList.remove('wx-dragging');
    
    // 获取当前位置
    const rect = this.container.getBoundingClientRect();
    const left = rect.left;
    const top = rect.top;
    
    // 保存位置到存储
    saveToStorage(CONFIG.STORAGE_KEYS.BUTTON_POSITION, { left, top });
    
    // 吸附到屏幕边缘
    this.snapToEdge();
  }
  
  /**
   * 处理窗口大小改变事件
   */
  handleResize() {
    // 确保按钮不会超出窗口
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buttonWidth = this.container.offsetWidth;
    const buttonHeight = this.container.offsetHeight;
    
    // 获取当前位置
    const rect = this.container.getBoundingClientRect();
    let left = rect.left;
    let top = rect.top;
    
    // 调整位置
    left = Math.max(0, Math.min(left, windowWidth - buttonWidth));
    top = Math.max(0, Math.min(top, windowHeight - buttonHeight));
    
    // 应用新位置
    this.container.style.left = `${left}px`;
    this.container.style.top = `${top}px`;
    
    // 保存位置到存储
    saveToStorage(CONFIG.STORAGE_KEYS.BUTTON_POSITION, { left, top });
  }
  
  /**
   * 吸附到屏幕边缘
   */
  snapToEdge() {
    // 获取窗口尺寸和按钮尺寸
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buttonWidth = this.container.offsetWidth;
    const buttonHeight = this.container.offsetHeight;
    
    // 获取当前位置
    const rect = this.container.getBoundingClientRect();
    let left = rect.left;
    let top = rect.top;
    
    // 吸附阈值
    const threshold = 20;
    
    // 吸附到左边
    if (left < threshold) {
      left = 0;
    }
    
    // 吸附到右边
    if (left > windowWidth - buttonWidth - threshold) {
      left = windowWidth - buttonWidth;
    }
    
    // 吸附到上边
    if (top < threshold) {
      top = 0;
    }
    
    // 吸附到下边
    if (top > windowHeight - buttonHeight - threshold) {
      top = windowHeight - buttonHeight;
    }
    
    // 应用新位置
    this.container.style.left = `${left}px`;
    this.container.style.top = `${top}px`;
    
    // 保存位置到存储
    saveToStorage(CONFIG.STORAGE_KEYS.BUTTON_POSITION, { left, top });
  }
  
  /**
   * 销毁按钮
   */
  destroy() {
    // 移除事件监听
    this.removeEventListeners();
    
    // 移除按钮元素
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    console.log('可拖动的悬浮设置按钮已销毁');
  }
}
