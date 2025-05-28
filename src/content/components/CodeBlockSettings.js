// 代码块设置面板组件
// 负责提供代码块样式的自定义设置界面

import { STORAGE_KEYS } from '../utils/storage.js';

/**
 * 代码块设置面板类
 * 提供用户自定义代码块样式的界面
 */
export class CodeBlockSettings {
  /**
   * 构造函数
   * @param {CodeBlockEnhancer} enhancer - 代码块增强器实例
   */
  constructor(enhancer) {
    this.enhancer = enhancer;
    this.panelElement = null;
    
    // 绑定方法
    this.create = this.create.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  
  /**
   * 创建设置面板
   */
  create() {
    // 如果面板已存在，直接返回
    if (this.panelElement) {
      return this.panelElement;
    }
    
    // 创建面板容器
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'wx-code-settings-panel';
    this.panelElement.style.display = 'none';
    
    // 创建面板标题
    const title = document.createElement('h2');
    title.textContent = '代码块样式设置';
    this.panelElement.appendChild(title);
    
    // 创建设置表单
    const form = document.createElement('form');
    form.className = 'wx-code-settings-form';
    
    // 启用/禁用设置
    const enabledGroup = this.createSettingGroup('启用代码块增强');
    const enabledCheckbox = document.createElement('input');
    enabledCheckbox.type = 'checkbox';
    enabledCheckbox.id = 'wx-code-enabled';
    enabledCheckbox.checked = this.enhancer.settings.enabled;
    
    const enabledLabel = document.createElement('label');
    enabledLabel.htmlFor = 'wx-code-enabled';
    enabledLabel.textContent = '启用代码块样式增强';
    
    enabledGroup.appendChild(enabledCheckbox);
    enabledGroup.appendChild(enabledLabel);
    form.appendChild(enabledGroup);
    
    // 显示Mac窗口按钮设置
    const macButtonsGroup = this.createSettingGroup('Mac窗口按钮');
    const macButtonsCheckbox = document.createElement('input');
    macButtonsCheckbox.type = 'checkbox';
    macButtonsCheckbox.id = 'wx-code-mac-buttons';
    macButtonsCheckbox.checked = this.enhancer.settings.showMacButtons;
    
    const macButtonsLabel = document.createElement('label');
    macButtonsLabel.htmlFor = 'wx-code-mac-buttons';
    macButtonsLabel.textContent = '显示Mac窗口按钮';
    
    macButtonsGroup.appendChild(macButtonsCheckbox);
    macButtonsGroup.appendChild(macButtonsLabel);
    form.appendChild(macButtonsGroup);
    
    // 字体设置
    const fontGroup = this.createSettingGroup('字体设置');
    
    // 字体大小
    const fontSizeLabel = document.createElement('label');
    fontSizeLabel.htmlFor = 'wx-code-font-size';
    fontSizeLabel.textContent = '字体大小:';
    
    const fontSizeInput = document.createElement('input');
    fontSizeInput.type = 'text';
    fontSizeInput.id = 'wx-code-font-size';
    fontSizeInput.value = this.enhancer.settings.fontSize;
    
    // 字体系列
    const fontFamilyLabel = document.createElement('label');
    fontFamilyLabel.htmlFor = 'wx-code-font-family';
    fontFamilyLabel.textContent = '字体系列:';
    
    const fontFamilyInput = document.createElement('input');
    fontFamilyInput.type = 'text';
    fontFamilyInput.id = 'wx-code-font-family';
    fontFamilyInput.value = this.enhancer.settings.fontFamily;
    
    fontGroup.appendChild(fontSizeLabel);
    fontGroup.appendChild(fontSizeInput);
    fontGroup.appendChild(document.createElement('br'));
    fontGroup.appendChild(fontFamilyLabel);
    fontGroup.appendChild(fontFamilyInput);
    form.appendChild(fontGroup);
    
    // 语言支持设置
    const languagesGroup = this.createSettingGroup('语言支持');
    
    // Python支持
    const pythonCheckbox = document.createElement('input');
    pythonCheckbox.type = 'checkbox';
    pythonCheckbox.id = 'wx-code-lang-python';
    pythonCheckbox.checked = this.enhancer.settings.languages.python;
    
    const pythonLabel = document.createElement('label');
    pythonLabel.htmlFor = 'wx-code-lang-python';
    pythonLabel.textContent = 'Python';
    
    // JavaScript支持
    const jsCheckbox = document.createElement('input');
    jsCheckbox.type = 'checkbox';
    jsCheckbox.id = 'wx-code-lang-js';
    jsCheckbox.checked = this.enhancer.settings.languages.javascript;
    
    const jsLabel = document.createElement('label');
    jsLabel.htmlFor = 'wx-code-lang-js';
    jsLabel.textContent = 'JavaScript';
    
    // HTML支持
    const htmlCheckbox = document.createElement('input');
    htmlCheckbox.type = 'checkbox';
    htmlCheckbox.id = 'wx-code-lang-html';
    htmlCheckbox.checked = this.enhancer.settings.languages.html;
    
    const htmlLabel = document.createElement('label');
    htmlLabel.htmlFor = 'wx-code-lang-html';
    htmlLabel.textContent = 'HTML';
    
    // CSS支持
    const cssCheckbox = document.createElement('input');
    cssCheckbox.type = 'checkbox';
    cssCheckbox.id = 'wx-code-lang-css';
    cssCheckbox.checked = this.enhancer.settings.languages.css;
    
    const cssLabel = document.createElement('label');
    cssLabel.htmlFor = 'wx-code-lang-css';
    cssLabel.textContent = 'CSS';
    
    languagesGroup.appendChild(pythonCheckbox);
    languagesGroup.appendChild(pythonLabel);
    languagesGroup.appendChild(document.createElement('br'));
    languagesGroup.appendChild(jsCheckbox);
    languagesGroup.appendChild(jsLabel);
    languagesGroup.appendChild(document.createElement('br'));
    languagesGroup.appendChild(htmlCheckbox);
    languagesGroup.appendChild(htmlLabel);
    languagesGroup.appendChild(document.createElement('br'));
    languagesGroup.appendChild(cssCheckbox);
    languagesGroup.appendChild(cssLabel);
    form.appendChild(languagesGroup);
    
    // 自定义CSS设置
    const customCssGroup = this.createSettingGroup('自定义CSS');
    
    const customCssLabel = document.createElement('label');
    customCssLabel.htmlFor = 'wx-code-custom-css';
    customCssLabel.textContent = '自定义CSS样式:';
    
    const customCssTextarea = document.createElement('textarea');
    customCssTextarea.id = 'wx-code-custom-css';
    customCssTextarea.rows = 6;
    customCssTextarea.value = this.enhancer.settings.customCSS;
    customCssTextarea.placeholder = '/* 在这里添加自定义CSS样式 */\n.wx-enhanced-code-block {\n  /* 自定义样式 */\n}';
    
    customCssGroup.appendChild(customCssLabel);
    customCssGroup.appendChild(document.createElement('br'));
    customCssGroup.appendChild(customCssTextarea);
    form.appendChild(customCssGroup);
    
    // 按钮组
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'wx-code-settings-buttons';
    
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'wx-code-settings-save';
    saveButton.textContent = '保存设置';
    saveButton.addEventListener('click', this.handleSave);
    
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'wx-code-settings-cancel';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', this.handleCancel);
    
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(cancelButton);
    form.appendChild(buttonGroup);
    
    this.panelElement.appendChild(form);
    document.body.appendChild(this.panelElement);
    
    return this.panelElement;
  }
  
  /**
   * 创建设置分组
   * @param {string} title - 分组标题
   * @returns {HTMLElement} 分组元素
   */
  createSettingGroup(title) {
    const group = document.createElement('div');
    group.className = 'wx-code-settings-group';
    
    const groupTitle = document.createElement('h3');
    groupTitle.textContent = title;
    group.appendChild(groupTitle);
    
    return group;
  }
  
  /**
   * 显示设置面板
   */
  show() {
    if (!this.panelElement) {
      this.create();
    }
    
    this.panelElement.style.display = 'block';
  }
  
  /**
   * 隐藏设置面板
   */
  hide() {
    if (this.panelElement) {
      this.panelElement.style.display = 'none';
    }
  }
  
  /**
   * 处理保存按钮点击
   */
  handleSave() {
    // 获取表单中的设置值
    const enabled = document.getElementById('wx-code-enabled').checked;
    const showMacButtons = document.getElementById('wx-code-mac-buttons').checked;
    const fontSize = document.getElementById('wx-code-font-size').value;
    const fontFamily = document.getElementById('wx-code-font-family').value;
    const customCSS = document.getElementById('wx-code-custom-css').value;
    
    // 获取语言支持设置
    const languages = {
      python: document.getElementById('wx-code-lang-python').checked,
      javascript: document.getElementById('wx-code-lang-js').checked,
      html: document.getElementById('wx-code-lang-html').checked,
      css: document.getElementById('wx-code-lang-css').checked
    };
    
    // 更新设置
    this.enhancer.updateSettings({
      enabled,
      showMacButtons,
      fontSize,
      fontFamily,
      customCSS,
      languages
    });
    
    // 隐藏面板
    this.hide();
  }
  
  /**
   * 处理取消按钮点击
   */
  handleCancel() {
    this.hide();
  }
  
  /**
   * 销毁面板
   */
  destroy() {
    if (this.panelElement && this.panelElement.parentNode) {
      this.panelElement.parentNode.removeChild(this.panelElement);
    }
    this.panelElement = null;
  }
}
