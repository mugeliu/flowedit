// 浮动工具栏组件
// 负责创建和管理浮动工具栏

import { replaceSelection } from '../utils/dom.js';

/**
 * 浮动工具栏类
 * 创建和管理选中文本时显示的浮动工具栏
 */
export class FloatingToolbar {
  /**
   * 构造函数
   * @param {HTMLElement} editor - 编辑器元素
   * @param {Object} styleSettings - 样式设置
   */
  constructor(editor, styleSettings) {
    this.editor = editor;
    this.toolbarElement = null;
    this.isVisible = false;
    this.currentSelection = null;
    this.styleSettings = styleSettings;
    this.selectionTimeout = null;
    
    // 绑定方法
    this.create = this.create.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.applyHeadingStyle = this.applyHeadingStyle.bind(this);
    this.applyCodeStyle = this.applyCodeStyle.bind(this);
  }
  
  /**
   * 创建工具栏
   */
  create() {
    // 创建工具栏容器
    this.toolbarElement = document.createElement('div');
    this.toolbarElement.className = 'wx-floating-toolbar';
    this.toolbarElement.style.display = 'none';
    
    // 创建工具栏按钮 - 只包含H1-H4和行内代码
    const buttons = [
      { name: 'H1', title: '一级标题', action: () => this.applyHeadingStyle(1) },
      { name: 'H2', title: '二级标题', action: () => this.applyHeadingStyle(2) },
      { name: 'H3', title: '三级标题', action: () => this.applyHeadingStyle(3) },
      { name: 'H4', title: '四级标题', action: () => this.applyHeadingStyle(4) },
      { name: 'Code', title: '行内代码', action: this.applyCodeStyle }
    ];
    
    // 添加按钮到工具栏
    buttons.forEach(button => {
      const buttonElement = document.createElement('button');
      buttonElement.className = 'wx-toolbar-button';
      buttonElement.textContent = button.name;
      buttonElement.title = button.title;
      buttonElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        button.action();
      });
      this.toolbarElement.appendChild(buttonElement);
    });
    
    // 添加工具栏到文档
    document.body.appendChild(this.toolbarElement);
    
    // 监听选择事件
    document.addEventListener('selectionchange', this.handleSelectionChange);
    
    // 监听点击事件，用于隐藏工具栏
    document.addEventListener('click', (e) => {
      // 如果点击的不是工具栏，且不是选中的文本，则隐藏工具栏
      if (this.toolbarElement && 
          !this.toolbarElement.contains(e.target) && 
          window.getSelection().toString().trim() === '') {
        this.hide();
      }
    });
    
    console.log('浮动工具栏已创建');
  }
  
  /**
   * 处理选择变化事件
   */
  handleSelectionChange() {
    // 使用延时处理，确保选择完成后才显示工具栏
    clearTimeout(this.selectionTimeout);
    
    this.selectionTimeout = setTimeout(() => {
      const selection = window.getSelection();
      
      // 如果没有选择，或者选择为空，则隐藏工具栏
      if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
        this.hide();
        return;
      }
      
      // 检查选择是否在编辑器内
      let isInEditor = false;
      let node = selection.anchorNode;
      
      while (node && !isInEditor) {
        if (node === this.editor) {
          isInEditor = true;
        }
        node = node.parentNode;
      }
      
      // 如果选择不在编辑器内，则隐藏工具栏
      if (!isInEditor) {
        this.hide();
        return;
      }
      
      // 保存当前选择
      this.currentSelection = selection;
      
      // 显示工具栏
      this.show();
    }, 300); // 300毫秒延迟，等待选择完成
  }
  
  /**
   * 显示工具栏
   */
  show() {
    if (!this.currentSelection || !this.toolbarElement) return;
    
    // 获取选择范围的位置
    const range = this.currentSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // 计算工具栏位置
    const toolbarWidth = 280; // 估计的工具栏宽度
    const toolbarHeight = 40; // 估计的工具栏高度
    
    // 工具栏位置（在选择上方）
    let left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    let top = rect.top - toolbarHeight - 10; // 在选择上方10px处
    
    // 确保工具栏不会超出视口
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // 调整左右位置
    left = Math.max(10, Math.min(left, viewportWidth - toolbarWidth - 10));
    
    // 如果上方空间不足，则显示在选择下方
    if (top < 10) {
      top = rect.bottom + 10;
      this.toolbarElement.classList.add('position-bottom');
    } else {
      this.toolbarElement.classList.remove('position-bottom');
    }
    
    // 设置工具栏位置
    this.toolbarElement.style.position = 'fixed';
    this.toolbarElement.style.left = `${left}px`;
    this.toolbarElement.style.top = `${top}px`;
    this.toolbarElement.style.display = 'flex';
    
    this.isVisible = true;
  }
  
  /**
   * 隐藏工具栏
   */
  hide() {
    if (this.toolbarElement) {
      this.toolbarElement.style.display = 'none';
      this.isVisible = false;
    }
  }
  
  /**
   * 应用标题样式
   * @param {number} level - 标题级别
   */
  applyHeadingStyle(level) {
    if (!this.currentSelection) return;
    
    // 获取选中的文本
    const selectedText = this.currentSelection.toString();
    if (!selectedText.trim()) return;
    
    // 创建一个新的span元素，用于应用样式
    const textStyleSpan = document.createElement('span');
    textStyleSpan.setAttribute('textstyle', '');
    
    // 从样式设置中获取样式
    const styleKey = `h${level}`;
    const style = this.styleSettings[styleKey];
    
    // 应用样式
    if (style) {
      Object.keys(style).forEach(prop => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase(); // 将驼峰命名转换为CSS属性名
        textStyleSpan.style[prop] = style[prop];
      });
    }
    
    // 设置文本内容
    textStyleSpan.textContent = selectedText;
    
    // 创建外层span
    const outerSpan = document.createElement('span');
    outerSpan.setAttribute('leaf', '');
    outerSpan.appendChild(textStyleSpan);
    
    // 替换选中内容
    replaceSelection(outerSpan, this.currentSelection);
    
    // 隐藏工具栏
    this.hide();
  }
  
  /**
   * 应用代码样式
   */
  applyCodeStyle() {
    if (!this.currentSelection) return;
    
    // 获取选中的文本
    const selectedText = this.currentSelection.toString();
    if (!selectedText.trim()) return;
    
    // 创建一个新的span元素，用于应用样式
    const codeStyleSpan = document.createElement('span');
    codeStyleSpan.setAttribute('textstyle', '');
    
    // 从样式设置中获取样式
    const style = this.styleSettings.code;
    
    // 应用样式
    if (style) {
      Object.keys(style).forEach(prop => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase(); // 将驼峰命名转换为CSS属性名
        codeStyleSpan.style[prop] = style[prop];
      });
    }
    
    // 设置文本内容
    codeStyleSpan.textContent = selectedText;
    
    // 创建外层span
    const outerSpan = document.createElement('span');
    outerSpan.setAttribute('leaf', '');
    outerSpan.appendChild(codeStyleSpan);
    
    // 替换选中内容
    replaceSelection(outerSpan, this.currentSelection);
    
    // 隐藏工具栏
    this.hide();
  }
  
  /**
   * 更新样式设置
   * @param {Object} newSettings - 新的样式设置
   */
  updateSettings(newSettings) {
    this.styleSettings = newSettings;
  }
  
  /**
   * 销毁工具栏
   */
  destroy() {
    if (this.toolbarElement) {
      document.removeEventListener('selectionchange', this.handleSelectionChange);
      this.toolbarElement.remove();
      this.toolbarElement = null;
    }
  }
}
