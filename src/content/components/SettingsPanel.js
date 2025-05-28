// 设置面板组件
// 负责创建和管理样式设置面板

import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage.js';
import { applyCustomCss } from '../utils/dom.js';

/**
 * 设置面板类
 * 创建和管理样式设置面板
 */
export class SettingsPanel {
  /**
   * 构造函数
   * @param {Object} defaultSettings - 默认样式设置
   */
  constructor(defaultSettings) {
    this.panel = null;
    this.isVisible = false;
    this.styleSettings = defaultSettings || {
      h1: { fontSize: '30px', fontWeight: 'bold' },
      h2: { fontSize: '24px', fontWeight: 'bold' },
      h3: { fontSize: '20px', fontWeight: 'bold' },
      h4: { fontSize: '16px', fontWeight: 'bold' },
      code: { fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', backgroundColor: 'rgba(175, 184, 193, 0.2)', padding: '0.2em 0.4em', borderRadius: '3px', fontSize: '85%' },
      custom: { css: '' }
    };
    
    // 从本地存储加载设置
    this.loadSettings();
    
    // 绑定方法
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.toggle = this.toggle.bind(this);
    this.createPanel = this.createPanel.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.resetSettings = this.resetSettings.bind(this);
    this.addHeadingSettings = this.addHeadingSettings.bind(this);
    this.addCodeSettings = this.addCodeSettings.bind(this);
    this.addCustomCssSettings = this.addCustomCssSettings.bind(this);
    this.previewCustomCss = this.previewCustomCss.bind(this);
  }
  
  /**
   * 加载样式设置
   */
  loadSettings() {
    try {
      const savedSettings = loadFromStorage(STORAGE_KEYS.STYLE_SETTINGS);
      if (savedSettings) {
        // 确保所有必要的属性都存在
        this.styleSettings = {
          h1: { ...this.styleSettings.h1, ...savedSettings.h1 },
          h2: { ...this.styleSettings.h2, ...savedSettings.h2 },
          h3: { ...this.styleSettings.h3, ...savedSettings.h3 },
          h4: { ...this.styleSettings.h4, ...savedSettings.h4 },
          code: { ...this.styleSettings.code, ...savedSettings.code },
          custom: { css: '' } // 默认空字符串
        };
        
        // 如果有自定义CSS，则加载它
        if (savedSettings.custom && savedSettings.custom.css !== undefined) {
          this.styleSettings.custom.css = savedSettings.custom.css;
        }
        
        console.log('从本地存储加载样式设置');
        
        // 应用自定义CSS
        this.applyCustomCss(this.styleSettings.custom.css);
      }
    } catch (error) {
      console.error('加载样式设置失败:', error);
    }
  }
  
  /**
   * 保存样式设置
   */
  saveSettings() {
    saveToStorage(STORAGE_KEYS.STYLE_SETTINGS, this.styleSettings);
  }
  
  /**
   * 应用自定义CSS
   * @param {string} cssText - CSS文本
   */
  applyCustomCss(cssText) {
    applyCustomCss(cssText, 'wx-custom-css');
  }
  
  /**
   * 显示设置面板
   */
  show() {
    if (!this.panel) {
      this.createPanel();
    }
    
    this.panel.style.display = 'block';
    this.isVisible = true;
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
   * 切换设置面板显示状态
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * 创建设置面板
   */
  createPanel() {
    // 创建设置面板
    this.panel = document.createElement('div');
    this.panel.className = 'wx-style-settings-panel';
    
    // 创建标题
    const title = document.createElement('h2');
    title.textContent = '样式设置';
    this.panel.appendChild(title);
    
    // 创建表单
    const form = document.createElement('form');
    form.className = 'wx-settings-form';
    
    // 创建标签页容器
    const tabContainer = document.createElement('div');
    tabContainer.className = 'wx-settings-tabs';
    
    // 创建标签按钮
    const basicTabButton = document.createElement('button');
    basicTabButton.textContent = '基本设置';
    basicTabButton.className = 'wx-settings-tab-button wx-settings-tab-active';
    basicTabButton.type = 'button';
    
    const customTabButton = document.createElement('button');
    customTabButton.textContent = '自定义CSS';
    customTabButton.className = 'wx-settings-tab-button';
    customTabButton.type = 'button';
    
    tabContainer.appendChild(basicTabButton);
    tabContainer.appendChild(customTabButton);
    form.appendChild(tabContainer);
    
    // 创建基本设置面板
    const basicSettingsPanel = document.createElement('div');
    basicSettingsPanel.className = 'wx-settings-tab-panel';
    basicSettingsPanel.style.display = 'block';
    
    // 添加标题样式设置
    this.addHeadingSettings(basicSettingsPanel, 1);
    this.addHeadingSettings(basicSettingsPanel, 2);
    this.addHeadingSettings(basicSettingsPanel, 3);
    this.addHeadingSettings(basicSettingsPanel, 4);
    
    // 添加代码样式设置
    this.addCodeSettings(basicSettingsPanel);
    
    // 创建自定义CSS面板
    const customCssPanel = document.createElement('div');
    customCssPanel.className = 'wx-settings-tab-panel';
    customCssPanel.style.display = 'none';
    
    // 添加自定义CSS输入区
    this.addCustomCssSettings(customCssPanel);
    
    // 添加标签面板到表单
    form.appendChild(basicSettingsPanel);
    form.appendChild(customCssPanel);
    
    // 添加标签切换事件
    basicTabButton.addEventListener('click', () => {
      basicTabButton.className = 'wx-settings-tab-button wx-settings-tab-active';
      customTabButton.className = 'wx-settings-tab-button';
      basicSettingsPanel.style.display = 'block';
      customCssPanel.style.display = 'none';
    });
    
    customTabButton.addEventListener('click', () => {
      basicTabButton.className = 'wx-settings-tab-button';
      customTabButton.className = 'wx-settings-tab-button wx-settings-tab-active';
      basicSettingsPanel.style.display = 'none';
      customCssPanel.style.display = 'block';
    });
    
    // 添加按钮组
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'wx-settings-button-group';
    
    // 保存按钮
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存设置';
    saveButton.className = 'wx-settings-save-button';
    saveButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.updateSettings(form);
      this.hide();
    });
    buttonGroup.appendChild(saveButton);
    
    // 取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.className = 'wx-settings-cancel-button';
    cancelButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });
    buttonGroup.appendChild(cancelButton);
    
    // 重置按钮
    const resetButton = document.createElement('button');
    resetButton.textContent = '重置默认';
    resetButton.className = 'wx-settings-reset-button';
    resetButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.resetSettings(form);
    });
    buttonGroup.appendChild(resetButton);
    
    form.appendChild(buttonGroup);
    this.panel.appendChild(form);
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'wx-settings-close-button';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      this.hide();
    });
    this.panel.appendChild(closeButton);
    
    // 添加到文档
    document.body.appendChild(this.panel);
  }
  
  /**
   * 添加标题样式设置
   * @param {HTMLElement} panel - 设置面板元素
   * @param {number} level - 标题级别
   */
  addHeadingSettings(panel, level) {
    const section = document.createElement('div');
    section.className = 'wx-settings-section';
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = `H${level} 标题样式`;
    section.appendChild(sectionTitle);
    
    // 字体大小设置
    const fontSizeGroup = document.createElement('div');
    fontSizeGroup.className = 'wx-settings-group';
    
    const fontSizeLabel = document.createElement('label');
    fontSizeLabel.textContent = '字体大小:';
    fontSizeGroup.appendChild(fontSizeLabel);
    
    const fontSizeInput = document.createElement('input');
    fontSizeInput.type = 'text';
    fontSizeInput.name = `h${level}-font-size`;
    fontSizeInput.value = this.styleSettings[`h${level}`].fontSize || '';
    fontSizeInput.placeholder = '例如: 24px';
    fontSizeGroup.appendChild(fontSizeInput);
    
    section.appendChild(fontSizeGroup);
    
    // 字体粗细设置
    const fontWeightGroup = document.createElement('div');
    fontWeightGroup.className = 'wx-settings-group';
    
    const fontWeightLabel = document.createElement('label');
    fontWeightLabel.textContent = '字体粗细:';
    fontWeightGroup.appendChild(fontWeightLabel);
    
    const fontWeightSelect = document.createElement('select');
    fontWeightSelect.name = `h${level}-font-weight`;
    
    const fontWeightOptions = [
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
    
    fontWeightOptions.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      optionElement.selected = this.styleSettings[`h${level}`].fontWeight === option.value;
      fontWeightSelect.appendChild(optionElement);
    });
    
    fontWeightGroup.appendChild(fontWeightSelect);
    section.appendChild(fontWeightGroup);
    
    panel.appendChild(section);
  }
  
  /**
   * 添加代码样式设置
   * @param {HTMLElement} panel - 设置面板元素
   */
  addCodeSettings(panel) {
    const section = document.createElement('div');
    section.className = 'wx-settings-section';
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = '行内代码样式';
    section.appendChild(sectionTitle);
    
    // 字体设置
    const fontFamilyGroup = document.createElement('div');
    fontFamilyGroup.className = 'wx-settings-group';
    
    const fontFamilyLabel = document.createElement('label');
    fontFamilyLabel.textContent = '字体:';
    fontFamilyGroup.appendChild(fontFamilyLabel);
    
    const fontFamilyInput = document.createElement('input');
    fontFamilyInput.type = 'text';
    fontFamilyInput.name = 'code-font-family';
    fontFamilyInput.value = this.styleSettings.code.fontFamily || '';
    fontFamilyInput.placeholder = '例如: monospace';
    fontFamilyGroup.appendChild(fontFamilyInput);
    
    section.appendChild(fontFamilyGroup);
    
    // 背景色设置
    const bgColorGroup = document.createElement('div');
    bgColorGroup.className = 'wx-settings-group';
    
    const bgColorLabel = document.createElement('label');
    bgColorLabel.textContent = '背景色:';
    bgColorGroup.appendChild(bgColorLabel);
    
    const bgColorInput = document.createElement('input');
    bgColorInput.type = 'text';
    bgColorInput.name = 'code-background-color';
    bgColorInput.value = this.styleSettings.code.backgroundColor || '';
    bgColorInput.placeholder = '例如: #f0f0f0';
    bgColorGroup.appendChild(bgColorInput);
    
    section.appendChild(bgColorGroup);
    
    // 内边距设置
    const paddingGroup = document.createElement('div');
    paddingGroup.className = 'wx-settings-group';
    
    const paddingLabel = document.createElement('label');
    paddingLabel.textContent = '内边距:';
    paddingGroup.appendChild(paddingLabel);
    
    const paddingInput = document.createElement('input');
    paddingInput.type = 'text';
    paddingInput.name = 'code-padding';
    paddingInput.value = this.styleSettings.code.padding || '';
    paddingInput.placeholder = '例如: 0.2em 0.4em';
    paddingGroup.appendChild(paddingInput);
    
    section.appendChild(paddingGroup);
    
    // 圆角设置
    const borderRadiusGroup = document.createElement('div');
    borderRadiusGroup.className = 'wx-settings-group';
    
    const borderRadiusLabel = document.createElement('label');
    borderRadiusLabel.textContent = '圆角:';
    borderRadiusGroup.appendChild(borderRadiusLabel);
    
    const borderRadiusInput = document.createElement('input');
    borderRadiusInput.type = 'text';
    borderRadiusInput.name = 'code-border-radius';
    borderRadiusInput.value = this.styleSettings.code.borderRadius || '';
    borderRadiusInput.placeholder = '例如: 3px';
    borderRadiusGroup.appendChild(borderRadiusInput);
    
    section.appendChild(borderRadiusGroup);
    
    // 字体大小设置
    const fontSizeGroup = document.createElement('div');
    fontSizeGroup.className = 'wx-settings-group';
    
    const fontSizeLabel = document.createElement('label');
    fontSizeLabel.textContent = '字体大小:';
    fontSizeGroup.appendChild(fontSizeLabel);
    
    const fontSizeInput = document.createElement('input');
    fontSizeInput.type = 'text';
    fontSizeInput.name = 'code-font-size';
    fontSizeInput.value = this.styleSettings.code.fontSize || '';
    fontSizeInput.placeholder = '例如: 85%';
    fontSizeGroup.appendChild(fontSizeInput);
    
    section.appendChild(fontSizeGroup);
    
    panel.appendChild(section);
  }
  
  /**
   * 添加自定义CSS设置
   * @param {HTMLElement} panel - 设置面板元素
   */
  addCustomCssSettings(panel) {
    const section = document.createElement('div');
    section.className = 'wx-settings-section wx-custom-css-section';
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = '自定义CSS样式';
    section.appendChild(sectionTitle);
    
    const description = document.createElement('p');
    description.className = 'wx-settings-description';
    description.textContent = '在下面输入自定义CSS样式，这些样式将应用到微信编辑器中。';
    section.appendChild(description);
    
    const cssTextarea = document.createElement('textarea');
    cssTextarea.className = 'wx-custom-css-textarea';
    cssTextarea.name = 'custom-css';
    cssTextarea.rows = 15;
    
    // 确保 custom 对象和 css 属性存在
    if (this.styleSettings && this.styleSettings.custom && this.styleSettings.custom.css !== undefined) {
      cssTextarea.value = this.styleSettings.custom.css;
    } else {
      cssTextarea.value = '';
      // 确保 custom 对象存在
      if (!this.styleSettings.custom) {
        this.styleSettings.custom = { css: '' };
      }
    }
    
    cssTextarea.placeholder = '/* 示例:\n.ProseMirror h1 {\n  color: #ff5722;\n}\n\n.ProseMirror code {\n  background-color: #f0f0f0;\n  padding: 2px 4px;\n  border-radius: 3px;\n}\n*/';
    section.appendChild(cssTextarea);
    
    // 添加应用按钮
    const applyButton = document.createElement('button');
    applyButton.textContent = '预览样式';
    applyButton.className = 'wx-settings-apply-button';
    applyButton.type = 'button';
    applyButton.addEventListener('click', () => {
      this.previewCustomCss(cssTextarea.value);
    });
    section.appendChild(applyButton);
    
    panel.appendChild(section);
  }
  
  /**
   * 预览自定义CSS
   * @param {string} cssText - CSS文本
   */
  previewCustomCss(cssText) {
    this.applyCustomCss(cssText);
  }
  
  /**
   * 更新样式设置
   * @param {HTMLFormElement} form - 表单元素
   */
  updateSettings(form) {
    // 更新标题样式
    for (let level = 1; level <= 4; level++) {
      const fontSize = form.querySelector(`input[name="h${level}-font-size"]`).value;
      const fontWeight = form.querySelector(`select[name="h${level}-font-weight"]`).value;
      
      this.styleSettings[`h${level}`] = {
        ...this.styleSettings[`h${level}`],
        fontSize,
        fontWeight
      };
    }
    
    // 更新代码样式
    const fontFamily = form.querySelector('input[name="code-font-family"]').value;
    const backgroundColor = form.querySelector('input[name="code-background-color"]').value;
    const padding = form.querySelector('input[name="code-padding"]').value;
    const borderRadius = form.querySelector('input[name="code-border-radius"]').value;
    const fontSize = form.querySelector('input[name="code-font-size"]').value;
    
    this.styleSettings.code = {
      ...this.styleSettings.code,
      fontFamily,
      backgroundColor,
      padding,
      borderRadius,
      fontSize
    };
    
    // 更新自定义CSS
    const customCss = form.querySelector('textarea[name="custom-css"]').value;
    this.styleSettings.custom = {
      ...this.styleSettings.custom,
      css: customCss
    };
    
    // 应用自定义CSS
    this.applyCustomCss(customCss);
    
    // 保存设置
    this.saveSettings();
    
    console.log('样式设置已更新');
  }
  
  /**
   * 重置样式设置
   * @param {HTMLFormElement} form - 表单元素
   */
  resetSettings(form) {
    // 重置为默认设置
    this.styleSettings = {
      h1: { fontSize: '30px', fontWeight: 'bold' },
      h2: { fontSize: '24px', fontWeight: 'bold' },
      h3: { fontSize: '20px', fontWeight: 'bold' },
      h4: { fontSize: '16px', fontWeight: 'bold' },
      code: { fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', backgroundColor: 'rgba(175, 184, 193, 0.2)', padding: '0.2em 0.4em', borderRadius: '3px', fontSize: '85%' },
      custom: { css: '' }
    };
    
    // 更新表单值
    for (let level = 1; level <= 4; level++) {
      form.querySelector(`input[name="h${level}-font-size"]`).value = this.styleSettings[`h${level}`].fontSize;
      const fontWeightSelect = form.querySelector(`select[name="h${level}-font-weight"]`);
      for (let i = 0; i < fontWeightSelect.options.length; i++) {
        if (fontWeightSelect.options[i].value === this.styleSettings[`h${level}`].fontWeight) {
          fontWeightSelect.selectedIndex = i;
          break;
        }
      }
    }
    
    // 更新代码样式表单值
    form.querySelector('input[name="code-font-family"]').value = this.styleSettings.code.fontFamily;
    form.querySelector('input[name="code-background-color"]').value = this.styleSettings.code.backgroundColor;
    form.querySelector('input[name="code-padding"]').value = this.styleSettings.code.padding;
    form.querySelector('input[name="code-border-radius"]').value = this.styleSettings.code.borderRadius;
    form.querySelector('input[name="code-font-size"]').value = this.styleSettings.code.fontSize;
    
    // 更新自定义CSS表单值
    form.querySelector('textarea[name="custom-css"]').value = this.styleSettings.custom.css;
    
    // 应用自定义CSS
    this.applyCustomCss(this.styleSettings.custom.css);
    
    // 保存设置
    this.saveSettings();
    
    console.log('样式设置已重置为默认值');
  }
  
  /**
   * 获取样式设置
   * @returns {Object} 样式设置对象
   */
  getSettings() {
    return this.styleSettings;
  }
}
