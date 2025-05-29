// 代码块设置面板组件
// 负责创建和管理代码块设置面板

import { saveToStorage, loadFromStorage } from '../../utils/storage.js';

/**
 * 代码块设置面板类
 * 创建和管理代码块设置面板
 */
export class CodeBlockSettings {
  /**
   * 构造函数
   * @param {Object} codeBlockEnhancer - 代码块增强器实例
   */
  constructor(codeBlockEnhancer) {
    this.codeBlockEnhancer = codeBlockEnhancer;
    this.panel = null;
    this.panelElement = null;
    this.isVisible = false;
    
    // 绑定方法
    this.create = this.create.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
    
    // 创建面板
    this.create();
  }
  
  /**
   * 创建设置面板
   */
  create() {
    // 检查是否已经存在设置面板
    if (this.panel) {
      return;
    }
    
    // 创建面板容器
    this.panel = document.createElement('div');
    this.panel.className = 'wx-settings-panel-overlay';
    this.panel.style.display = 'none';
    
    // 创建面板元素
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'wx-settings-panel';
    
    // 创建面板标题
    const title = document.createElement('h2');
    title.className = 'wx-settings-title';
    title.textContent = '代码块样式设置';
    this.panelElement.appendChild(title);
    
    // 创建设置表单
    const form = document.createElement('div');
    form.className = 'wx-settings-form';
    
    // 创建主题设置
    const themeGroup = document.createElement('div');
    themeGroup.className = 'wx-settings-group';
    
    const themeLabel = document.createElement('label');
    themeLabel.textContent = '主题:';
    themeLabel.className = 'wx-settings-label';
    themeGroup.appendChild(themeLabel);
    
    const themeSelect = document.createElement('select');
    themeSelect.className = 'wx-code-theme';
    
    const themes = [
      { value: 'dark', text: '深色' },
      { value: 'light', text: '浅色' }
    ];
    
    themes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme.value;
      option.textContent = theme.text;
      option.selected = this.codeBlockEnhancer.settings.theme === theme.value;
      themeSelect.appendChild(option);
    });
    
    themeGroup.appendChild(themeSelect);
    form.appendChild(themeGroup);
    
    // 创建字体设置
    const fontGroup = document.createElement('div');
    fontGroup.className = 'wx-settings-group';
    
    const fontLabel = document.createElement('label');
    fontLabel.textContent = '字体:';
    fontLabel.className = 'wx-settings-label';
    fontGroup.appendChild(fontLabel);
    
    const fontInput = document.createElement('input');
    fontInput.type = 'text';
    fontInput.className = 'wx-code-font-family';
    fontInput.value = this.codeBlockEnhancer.settings.fontFamily;
    fontGroup.appendChild(fontInput);
    
    form.appendChild(fontGroup);
    
    // 创建字体大小设置
    const fontSizeGroup = document.createElement('div');
    fontSizeGroup.className = 'wx-settings-group';
    
    const fontSizeLabel = document.createElement('label');
    fontSizeLabel.textContent = '字体大小:';
    fontSizeLabel.className = 'wx-settings-label';
    fontSizeGroup.appendChild(fontSizeLabel);
    
    const fontSizeInput = document.createElement('input');
    fontSizeInput.type = 'text';
    fontSizeInput.className = 'wx-code-font-size';
    fontSizeInput.value = this.codeBlockEnhancer.settings.fontSize;
    fontSizeGroup.appendChild(fontSizeInput);
    
    form.appendChild(fontSizeGroup);
    
    // 创建行高设置
    const lineHeightGroup = document.createElement('div');
    lineHeightGroup.className = 'wx-settings-group';
    
    const lineHeightLabel = document.createElement('label');
    lineHeightLabel.textContent = '行高:';
    lineHeightLabel.className = 'wx-settings-label';
    lineHeightGroup.appendChild(lineHeightLabel);
    
    const lineHeightInput = document.createElement('input');
    lineHeightInput.type = 'text';
    lineHeightInput.className = 'wx-code-line-height';
    lineHeightInput.value = this.codeBlockEnhancer.settings.lineHeight;
    lineHeightGroup.appendChild(lineHeightInput);
    
    form.appendChild(lineHeightGroup);
    
    // 创建圆角设置
    const borderRadiusGroup = document.createElement('div');
    borderRadiusGroup.className = 'wx-settings-group';
    
    const borderRadiusLabel = document.createElement('label');
    borderRadiusLabel.textContent = '圆角:';
    borderRadiusLabel.className = 'wx-settings-label';
    borderRadiusGroup.appendChild(borderRadiusLabel);
    
    const borderRadiusInput = document.createElement('input');
    borderRadiusInput.type = 'text';
    borderRadiusInput.className = 'wx-code-border-radius';
    borderRadiusInput.value = this.codeBlockEnhancer.settings.borderRadius;
    borderRadiusGroup.appendChild(borderRadiusInput);
    
    form.appendChild(borderRadiusGroup);
    
    // 创建显示行号设置
    const lineNumbersGroup = document.createElement('div');
    lineNumbersGroup.className = 'wx-settings-group';
    
    const lineNumbersLabel = document.createElement('label');
    lineNumbersLabel.textContent = '显示行号:';
    lineNumbersLabel.className = 'wx-settings-label';
    lineNumbersGroup.appendChild(lineNumbersLabel);
    
    const lineNumbersCheckbox = document.createElement('input');
    lineNumbersCheckbox.type = 'checkbox';
    lineNumbersCheckbox.className = 'wx-code-show-line-numbers';
    lineNumbersCheckbox.checked = this.codeBlockEnhancer.settings.showLineNumbers;
    lineNumbersGroup.appendChild(lineNumbersCheckbox);
    
    form.appendChild(lineNumbersGroup);
    
    this.panelElement.appendChild(form);
    
    // 创建按钮容器
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'wx-settings-buttons';
    
    // 创建预览按钮
    const previewButton = document.createElement('button');
    previewButton.className = 'wx-settings-button wx-preview-button';
    previewButton.textContent = '预览样式';
    previewButton.addEventListener('click', this.handlePreview);
    
    // 创建保存按钮
    const saveButton = document.createElement('button');
    saveButton.className = 'wx-settings-button wx-save-button';
    saveButton.textContent = '保存设置';
    saveButton.addEventListener('click', this.handleSave);
    
    // 创建取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.className = 'wx-settings-button wx-cancel-button';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', this.handleCancel);
    
    // 添加按钮到容器
    buttonsContainer.appendChild(previewButton);
    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(cancelButton);
    this.panelElement.appendChild(buttonsContainer);
    
    // 将面板添加到遮罩层
    this.panel.appendChild(this.panelElement);
    
    // 将遮罩层添加到文档
    document.body.appendChild(this.panel);
    
    console.log('代码块设置面板已创建');
  }
  
  /**
   * 获取当前设置
   * @returns {Object} 当前设置
   */
  getSettings() {
    const settings = { ...this.codeBlockEnhancer.settings };
    
    // 获取主题设置
    const themeSelect = document.querySelector('.wx-code-theme');
    if (themeSelect) {
      settings.theme = themeSelect.value;
    }
    
    // 获取字体设置
    const fontInput = document.querySelector('.wx-code-font-family');
    if (fontInput) {
      settings.fontFamily = fontInput.value;
    }
    
    // 获取字体大小设置
    const fontSizeInput = document.querySelector('.wx-code-font-size');
    if (fontSizeInput) {
      settings.fontSize = fontSizeInput.value;
    }
    
    // 获取行高设置
    const lineHeightInput = document.querySelector('.wx-code-line-height');
    if (lineHeightInput) {
      settings.lineHeight = lineHeightInput.value;
    }
    
    // 获取圆角设置
    const borderRadiusInput = document.querySelector('.wx-code-border-radius');
    if (borderRadiusInput) {
      settings.borderRadius = borderRadiusInput.value;
    }
    
    // 获取显示行号设置
    const lineNumbersCheckbox = document.querySelector('.wx-code-show-line-numbers');
    if (lineNumbersCheckbox) {
      settings.showLineNumbers = lineNumbersCheckbox.checked;
    }
    
    return settings;
  }
  
  /**
   * 处理预览按钮点击事件
   */
  handlePreview() {
    // 获取当前设置
    const settings = this.getSettings();
    
    // 应用设置
    this.codeBlockEnhancer.updateSettings(settings);
    
    // 显示预览成功消息
    alert('代码块样式已应用，请在编辑器中查看效果。');
  }
  
  /**
   * 处理保存按钮点击事件
   */
  handleSave() {
    // 获取当前设置
    const settings = this.getSettings();
    
    // 保存设置到存储
    saveToStorage('wx-code-block-settings', settings);
    
    // 应用设置
    this.codeBlockEnhancer.updateSettings(settings);
    
    // 隐藏面板
    this.hide();
    
    // 显示保存成功消息
    alert('代码块设置已保存。');
  }
  
  /**
   * 处理取消按钮点击事件
   */
  handleCancel() {
    // 隐藏面板
    this.hide();
  }
  
  /**
   * 显示设置面板
   */
  show() {
    if (this.panel) {
      this.panel.style.display = 'flex';
      this.isVisible = true;
      
      // 重新加载设置
      this.loadSettings();
    }
  }
  
  /**
   * 隐藏设置面板
   */
  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
    }
  }
  
  /**
   * 加载设置到表单
   */
  loadSettings() {
    // 加载主题设置
    const themeSelect = document.querySelector('.wx-code-theme');
    if (themeSelect) {
      for (const option of themeSelect.options) {
        option.selected = option.value === this.codeBlockEnhancer.settings.theme;
      }
    }
    
    // 加载字体设置
    const fontInput = document.querySelector('.wx-code-font-family');
    if (fontInput) {
      fontInput.value = this.codeBlockEnhancer.settings.fontFamily;
    }
    
    // 加载字体大小设置
    const fontSizeInput = document.querySelector('.wx-code-font-size');
    if (fontSizeInput) {
      fontSizeInput.value = this.codeBlockEnhancer.settings.fontSize;
    }
    
    // 加载行高设置
    const lineHeightInput = document.querySelector('.wx-code-line-height');
    if (lineHeightInput) {
      lineHeightInput.value = this.codeBlockEnhancer.settings.lineHeight;
    }
    
    // 加载圆角设置
    const borderRadiusInput = document.querySelector('.wx-code-border-radius');
    if (borderRadiusInput) {
      borderRadiusInput.value = this.codeBlockEnhancer.settings.borderRadius;
    }
    
    // 加载显示行号设置
    const lineNumbersCheckbox = document.querySelector('.wx-code-show-line-numbers');
    if (lineNumbersCheckbox) {
      lineNumbersCheckbox.checked = this.codeBlockEnhancer.settings.showLineNumbers;
    }
  }
  
  /**
   * 销毁设置面板
   */
  destroy() {
    // 移除面板元素
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
    
    console.log('代码块设置面板已销毁');
  }
}
