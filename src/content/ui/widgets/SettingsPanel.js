// 设置面板组件
// 负责创建和管理设置面板

import { saveToStorage } from '../../utils/storage.js';
import { CONFIG } from '../../core/config.js';

/**
 * 设置面板类
 * 创建和管理样式设置面板
 */
export class SettingsPanel {
  /**
   * 构造函数
   * @param {Object} settings - 初始样式设置
   */
  constructor(settings) {
    this.settings = settings;
    this.panel = null;
    this.panelElement = null;
    this.isVisible = false;
    this.tabs = {
      basic: null,
      custom: null
    };
    this.tabContents = {
      basic: null,
      custom: null
    };
    
    // 绑定方法
    this.create = this.create.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.getSettings = this.getSettings.bind(this);
    this.createBasicSettingsTab = this.createBasicSettingsTab.bind(this);
    this.createCustomCssTab = this.createCustomCssTab.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
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
    title.textContent = '样式设置';
    this.panelElement.appendChild(title);
    
    // 创建标签栏
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'wx-settings-tabs';
    
    // 创建基本设置标签
    this.tabs.basic = document.createElement('button');
    this.tabs.basic.className = 'wx-settings-tab active';
    this.tabs.basic.textContent = '基本设置';
    this.tabs.basic.addEventListener('click', () => this.handleTabClick('basic'));
    
    // 创建自定义CSS标签
    this.tabs.custom = document.createElement('button');
    this.tabs.custom.className = 'wx-settings-tab';
    this.tabs.custom.textContent = '自定义CSS';
    this.tabs.custom.addEventListener('click', () => this.handleTabClick('custom'));
    
    // 添加标签到标签栏
    tabsContainer.appendChild(this.tabs.basic);
    tabsContainer.appendChild(this.tabs.custom);
    this.panelElement.appendChild(tabsContainer);
    
    // 创建标签内容容器
    const tabContentsContainer = document.createElement('div');
    tabContentsContainer.className = 'wx-settings-tab-contents';
    
    // 创建基本设置标签内容
    this.tabContents.basic = document.createElement('div');
    this.tabContents.basic.className = 'wx-settings-tab-content active';
    this.createBasicSettingsTab(this.tabContents.basic);
    
    // 创建自定义CSS标签内容
    this.tabContents.custom = document.createElement('div');
    this.tabContents.custom.className = 'wx-settings-tab-content';
    this.createCustomCssTab(this.tabContents.custom);
    
    // 添加标签内容到容器
    tabContentsContainer.appendChild(this.tabContents.basic);
    tabContentsContainer.appendChild(this.tabContents.custom);
    this.panelElement.appendChild(tabContentsContainer);
    
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
    
    console.log('设置面板已创建');
  }
  
  /**
   * 创建基本设置标签内容
   * @param {HTMLElement} container - 标签内容容器
   */
  createBasicSettingsTab(container) {
    // 创建标题设置部分
    const headingsSection = document.createElement('div');
    headingsSection.className = 'wx-settings-section';
    
    // 创建标题设置标题
    const headingsTitle = document.createElement('h3');
    headingsTitle.className = 'wx-settings-section-title';
    headingsTitle.textContent = '标题样式';
    headingsSection.appendChild(headingsTitle);
    
    // 创建标题设置表单
    const headingsForm = document.createElement('div');
    headingsForm.className = 'wx-settings-form';
    
    // 创建H1-H4设置
    for (let i = 1; i <= 4; i++) {
      const headingGroup = document.createElement('div');
      headingGroup.className = 'wx-settings-group';
      
      // 创建标签
      const label = document.createElement('label');
      label.textContent = `H${i} 样式:`;
      label.className = 'wx-settings-label';
      headingGroup.appendChild(label);
      
      // 创建设置字段容器
      const fieldsContainer = document.createElement('div');
      fieldsContainer.className = 'wx-settings-fields';
      
      // 创建字体大小输入
      const fontSizeGroup = document.createElement('div');
      fontSizeGroup.className = 'wx-settings-field';
      
      const fontSizeLabel = document.createElement('label');
      fontSizeLabel.textContent = '字体大小:';
      fontSizeGroup.appendChild(fontSizeLabel);
      
      const fontSize = document.createElement('input');
      fontSize.type = 'text';
      fontSize.className = `wx-h${i}-font-size`;
      fontSize.value = this.settings[`h${i}`].fontSize;
      fontSizeGroup.appendChild(fontSize);
      
      fieldsContainer.appendChild(fontSizeGroup);
      
      // 创建字体粗细输入
      const fontWeightGroup = document.createElement('div');
      fontWeightGroup.className = 'wx-settings-field';
      
      const fontWeightLabel = document.createElement('label');
      fontWeightLabel.textContent = '字体粗细:';
      fontWeightGroup.appendChild(fontWeightLabel);
      
      const fontWeight = document.createElement('select');
      fontWeight.className = `wx-h${i}-font-weight`;
      
      const options = [
        { value: 'normal', text: '正常' },
        { value: 'bold', text: '粗体' },
        { value: '100', text: '100' },
        { value: '200', text: '200' },
        { value: '300', text: '300' },
        { value: '400', text: '400' },
        { value: '500', text: '500' },
        { value: '600', text: '600' },
        { value: '700', text: '700' },
        { value: '800', text: '800' },
        { value: '900', text: '900' }
      ];
      
      options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        optionElement.selected = this.settings[`h${i}`].fontWeight === option.value;
        fontWeight.appendChild(optionElement);
      });
      
      fontWeightGroup.appendChild(fontWeight);
      
      fieldsContainer.appendChild(fontWeightGroup);
      
      headingGroup.appendChild(fieldsContainer);
      headingsForm.appendChild(headingGroup);
    }
    
    headingsSection.appendChild(headingsForm);
    container.appendChild(headingsSection);
    
    // 创建代码样式设置部分
    const codeSection = document.createElement('div');
    codeSection.className = 'wx-settings-section';
    
    // 创建代码样式设置标题
    const codeTitle = document.createElement('h3');
    codeTitle.className = 'wx-settings-section-title';
    codeTitle.textContent = '行内代码样式';
    codeSection.appendChild(codeTitle);
    
    // 创建代码样式设置表单
    const codeForm = document.createElement('div');
    codeForm.className = 'wx-settings-form';
    
    // 创建代码字体设置
    const codeFontGroup = document.createElement('div');
    codeFontGroup.className = 'wx-settings-group';
    
    const codeFontLabel = document.createElement('label');
    codeFontLabel.textContent = '字体:';
    codeFontLabel.className = 'wx-settings-label';
    codeFontGroup.appendChild(codeFontLabel);
    
    const codeFont = document.createElement('input');
    codeFont.type = 'text';
    codeFont.className = 'wx-code-font-family';
    codeFont.value = this.settings.code.fontFamily;
    codeFontGroup.appendChild(codeFont);
    
    codeForm.appendChild(codeFontGroup);
    
    // 创建代码背景色设置
    const codeBgGroup = document.createElement('div');
    codeBgGroup.className = 'wx-settings-group';
    
    const codeBgLabel = document.createElement('label');
    codeBgLabel.textContent = '背景色:';
    codeBgLabel.className = 'wx-settings-label';
    codeBgGroup.appendChild(codeBgLabel);
    
    const codeBg = document.createElement('input');
    codeBg.type = 'text';
    codeBg.className = 'wx-code-bg-color';
    codeBg.value = this.settings.code.backgroundColor;
    codeBgGroup.appendChild(codeBg);
    
    codeForm.appendChild(codeBgGroup);
    
    // 创建代码字体大小设置
    const codeSizeGroup = document.createElement('div');
    codeSizeGroup.className = 'wx-settings-group';
    
    const codeSizeLabel = document.createElement('label');
    codeSizeLabel.textContent = '字体大小:';
    codeSizeLabel.className = 'wx-settings-label';
    codeSizeGroup.appendChild(codeSizeLabel);
    
    const codeSize = document.createElement('input');
    codeSize.type = 'text';
    codeSize.className = 'wx-code-font-size';
    codeSize.value = this.settings.code.fontSize;
    codeSizeGroup.appendChild(codeSize);
    
    codeForm.appendChild(codeSizeGroup);
    
    codeSection.appendChild(codeForm);
    container.appendChild(codeSection);
  }
  
  /**
   * 创建自定义CSS标签内容
   * @param {HTMLElement} container - 标签内容容器
   */
  createCustomCssTab(container) {
    // 创建自定义CSS部分
    const customCssSection = document.createElement('div');
    customCssSection.className = 'wx-settings-section';
    
    // 创建自定义CSS标题
    const customCssTitle = document.createElement('h3');
    customCssTitle.className = 'wx-settings-section-title';
    customCssTitle.textContent = '自定义CSS';
    customCssSection.appendChild(customCssTitle);
    
    // 创建自定义CSS说明
    const customCssDesc = document.createElement('p');
    customCssDesc.className = 'wx-settings-desc';
    customCssDesc.textContent = '在下面输入自定义CSS代码，可以完全控制编辑器中的样式。';
    customCssSection.appendChild(customCssDesc);
    
    // 创建自定义CSS文本区域
    const customCssTextarea = document.createElement('textarea');
    customCssTextarea.className = 'wx-custom-css';
    customCssTextarea.value = this.settings.custom.css || '';
    customCssTextarea.rows = 10;
    customCssTextarea.placeholder = '/* 在这里输入自定义CSS代码 */\n\n/* 例如: */\n.wx-heading-1 {\n  color: #ff5722;\n}\n\n.wx-code {\n  color: #2196f3;\n}';
    
    customCssSection.appendChild(customCssTextarea);
    container.appendChild(customCssSection);
  }
  
  /**
   * 处理标签点击事件
   * @param {string} tabName - 标签名称
   */
  handleTabClick(tabName) {
    // 移除所有标签的活动状态
    Object.values(this.tabs).forEach(tab => {
      tab.classList.remove('active');
    });
    
    // 移除所有标签内容的活动状态
    Object.values(this.tabContents).forEach(content => {
      content.classList.remove('active');
    });
    
    // 设置点击的标签为活动状态
    this.tabs[tabName].classList.add('active');
    this.tabContents[tabName].classList.add('active');
  }
  
  /**
   * 处理预览按钮点击事件
   */
  handlePreview() {
    // 获取当前设置
    const settings = this.getSettings();
    
    // 应用自定义CSS
    if (settings.custom && settings.custom.css) {
      const customCssElement = document.getElementById('wx-preview-custom-css');
      
      if (customCssElement) {
        customCssElement.textContent = settings.custom.css;
      } else {
        const style = document.createElement('style');
        style.id = 'wx-preview-custom-css';
        style.textContent = settings.custom.css;
        document.head.appendChild(style);
      }
    }
    
    // 显示预览成功消息
    alert('样式已应用，请在编辑器中查看效果。');
  }
  
  /**
   * 处理保存按钮点击事件
   */
  handleSave() {
    // 获取当前设置
    const settings = this.getSettings();
    
    // 保存设置到存储
    saveToStorage(CONFIG.STORAGE_KEYS.SETTINGS, settings);
    
    // 应用自定义CSS
    if (settings.custom && settings.custom.css) {
      const customCssElement = document.getElementById('wx-custom-css');
      
      if (customCssElement) {
        customCssElement.textContent = settings.custom.css;
      } else {
        const style = document.createElement('style');
        style.id = 'wx-custom-css';
        style.textContent = settings.custom.css;
        document.head.appendChild(style);
      }
    }
    
    // 更新设置
    this.settings = settings;
    
    // 隐藏面板
    this.hide();
    
    // 显示保存成功消息
    alert('设置已保存。');
  }
  
  /**
   * 处理取消按钮点击事件
   */
  handleCancel() {
    // 隐藏面板
    this.hide();
  }
  
  /**
   * 获取当前设置
   * @returns {Object} 当前设置
   */
  getSettings() {
    const settings = {
      h1: { ...this.settings.h1 },
      h2: { ...this.settings.h2 },
      h3: { ...this.settings.h3 },
      h4: { ...this.settings.h4 },
      code: { ...this.settings.code },
      custom: { ...this.settings.custom }
    };
    
    // 获取H1-H4设置
    for (let i = 1; i <= 4; i++) {
      const fontSize = document.querySelector(`.wx-h${i}-font-size`);
      const fontWeight = document.querySelector(`.wx-h${i}-font-weight`);
      
      if (fontSize) {
        settings[`h${i}`].fontSize = fontSize.value;
      }
      
      if (fontWeight) {
        settings[`h${i}`].fontWeight = fontWeight.value;
      }
    }
    
    // 获取代码设置
    const codeFont = document.querySelector('.wx-code-font-family');
    const codeBg = document.querySelector('.wx-code-bg-color');
    const codeSize = document.querySelector('.wx-code-font-size');
    
    if (codeFont) {
      settings.code.fontFamily = codeFont.value;
    }
    
    if (codeBg) {
      settings.code.backgroundColor = codeBg.value;
    }
    
    if (codeSize) {
      settings.code.fontSize = codeSize.value;
    }
    
    // 获取自定义CSS
    const customCss = document.querySelector('.wx-custom-css');
    
    if (customCss) {
      settings.custom.css = customCss.value;
    }
    
    return settings;
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
    // 加载H1-H4设置
    for (let i = 1; i <= 4; i++) {
      const fontSize = document.querySelector(`.wx-h${i}-font-size`);
      const fontWeight = document.querySelector(`.wx-h${i}-font-weight`);
      
      if (fontSize) {
        fontSize.value = this.settings[`h${i}`].fontSize;
      }
      
      if (fontWeight) {
        for (const option of fontWeight.options) {
          option.selected = option.value === this.settings[`h${i}`].fontWeight;
        }
      }
    }
    
    // 加载代码设置
    const codeFont = document.querySelector('.wx-code-font-family');
    const codeBg = document.querySelector('.wx-code-bg-color');
    const codeSize = document.querySelector('.wx-code-font-size');
    
    if (codeFont) {
      codeFont.value = this.settings.code.fontFamily;
    }
    
    if (codeBg) {
      codeBg.value = this.settings.code.backgroundColor;
    }
    
    if (codeSize) {
      codeSize.value = this.settings.code.fontSize;
    }
    
    // 加载自定义CSS
    const customCss = document.querySelector('.wx-custom-css');
    
    if (customCss) {
      customCss.value = this.settings.custom.css || '';
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
    
    console.log('设置面板已销毁');
  }
}
