// 通用设置面板组件
// 提供可配置的设置界面

import { generateUniqueId } from '../../utils/helpers.js';
import { saveToStorage } from '../../utils/storage.js';
import { CONFIG } from '../../core/config.js';
import { createIcon } from './Icon.js';

/**
 * 通用设置面板类
 * 用于创建和管理设置界面
 */
export class SettingsPanel {
  /**
   * 创建设置面板
   * @param {Object} options - 设置面板选项
   * @param {string} options.title - 面板标题
   * @param {string} options.storageKey - 存储键名
   * @param {Array} options.sections - 设置分区数组
   * @param {Function} options.onSave - 保存回调函数
   * @param {Function} options.onCancel - 取消回调函数
   */
  constructor(options = {}) {
    this.id = generateUniqueId('settings-panel');
    this.title = options.title || '设置';
    this.storageKey = options.storageKey || CONFIG.STORAGE_KEYS.SETTINGS;
    this.sections = options.sections || [];
    this.onSave = options.onSave || (() => {});
    this.onCancel = options.onCancel || (() => {});
    
    this.panel = null;
    this.backdrop = null;
    this.isVisible = false;
    this.formValues = {};
    
    // 绑定方法
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.toggle = this.toggle.bind(this);
    this.create = this.create.bind(this);
    this.getValues = this.getValues.bind(this);
    this.setValues = this.setValues.bind(this);
    this.saveValues = this.saveValues.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  
  /**
   * 创建设置面板
   * @returns {HTMLElement} 设置面板元素
   */
  create() {
    // 如果面板已存在，则返回
    if (this.panel) {
      return this.panel;
    }
    
    // 创建背景遮罩
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'wx-settings-backdrop wx-hidden';
    this.backdrop.addEventListener('click', this.hide);
    
    // 创建面板容器
    this.panel = document.createElement('div');
    this.panel.id = this.id;
    this.panel.className = 'wx-settings-panel wx-hidden';
    
    // 创建面板头部
    const header = document.createElement('div');
    header.className = 'wx-settings-header';
    
    const title = document.createElement('h2');
    title.className = 'wx-settings-title';
    title.textContent = this.title;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'wx-settings-close';
    closeButton.innerHTML = createIcon('close');
    closeButton.setAttribute('aria-label', '关闭');
    closeButton.addEventListener('click', this.hide);
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // 创建面板内容
    const content = document.createElement('div');
    content.className = 'wx-settings-content';
    
    // 创建表单
    const form = document.createElement('form');
    form.id = `${this.id}-form`;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave();
    });
    
    // 添加设置分区
    this.sections.forEach(section => {
      const sectionElement = this.createSection(section);
      form.appendChild(sectionElement);
    });
    
    content.appendChild(form);
    
    // 创建面板底部
    const footer = document.createElement('div');
    footer.className = 'wx-settings-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'wx-settings-button wx-settings-button-secondary';
    cancelButton.textContent = '取消';
    cancelButton.type = 'button';
    cancelButton.addEventListener('click', this.handleCancel);
    
    const saveButton = document.createElement('button');
    saveButton.className = 'wx-settings-button wx-settings-button-primary';
    saveButton.textContent = '保存';
    saveButton.type = 'submit';
    saveButton.form = `${this.id}-form`;
    
    footer.appendChild(cancelButton);
    footer.appendChild(saveButton);
    
    // 组装面板
    this.panel.appendChild(header);
    this.panel.appendChild(content);
    this.panel.appendChild(footer);
    
    // 添加到文档
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.panel);
    
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeyDown);
    
    return this.panel;
  }
  
  /**
   * 创建设置分区
   * @param {Object} section - 分区配置
   * @returns {HTMLElement} 分区元素
   */
  createSection(section) {
    const sectionElement = document.createElement('div');
    sectionElement.className = 'wx-settings-section';
    
    if (section.title) {
      const title = document.createElement('h3');
      title.className = 'wx-settings-section-title';
      title.textContent = section.title;
      sectionElement.appendChild(title);
    }
    
    if (section.description) {
      const description = document.createElement('p');
      description.className = 'wx-settings-description';
      description.textContent = section.description;
      sectionElement.appendChild(description);
    }
    
    // 添加设置项
    if (section.items && section.items.length > 0) {
      section.items.forEach(item => {
        const itemElement = this.createSettingItem(item);
        sectionElement.appendChild(itemElement);
      });
    }
    
    return sectionElement;
  }
  
  /**
   * 创建设置项
   * @param {Object} item - 设置项配置
   * @returns {HTMLElement} 设置项元素
   */
  createSettingItem(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'wx-settings-item';
    
    // 创建标签
    const labelContainer = document.createElement('div');
    labelContainer.className = 'wx-settings-label-container';
    
    const label = document.createElement('label');
    label.className = 'wx-settings-label';
    label.setAttribute('for', `${this.id}-${item.id}`);
    label.textContent = item.label;
    
    labelContainer.appendChild(label);
    
    if (item.description) {
      const description = document.createElement('p');
      description.className = 'wx-settings-description';
      description.textContent = item.description;
      labelContainer.appendChild(description);
    }
    
    // 创建控件
    const controlElement = this.createControl(item);
    
    // 组装设置项
    itemElement.appendChild(labelContainer);
    itemElement.appendChild(controlElement);
    
    return itemElement;
  }
  
  /**
   * 创建控件
   * @param {Object} item - 设置项配置
   * @returns {HTMLElement} 控件元素
   */
  createControl(item) {
    const controlContainer = document.createElement('div');
    controlContainer.className = 'wx-settings-control';
    
    let control;
    
    switch (item.type) {
      case 'text':
      case 'number':
      case 'email':
      case 'password':
        control = document.createElement('input');
        control.type = item.type;
        control.id = `${this.id}-${item.id}`;
        control.className = 'wx-settings-input';
        control.name = item.id;
        if (item.placeholder) control.placeholder = item.placeholder;
        if (item.value !== undefined) control.value = item.value;
        if (item.min !== undefined) control.min = item.min;
        if (item.max !== undefined) control.max = item.max;
        if (item.step !== undefined) control.step = item.step;
        break;
        
      case 'textarea':
        control = document.createElement('textarea');
        control.id = `${this.id}-${item.id}`;
        control.className = 'wx-settings-textarea';
        control.name = item.id;
        if (item.placeholder) control.placeholder = item.placeholder;
        if (item.value !== undefined) control.value = item.value;
        if (item.rows) control.rows = item.rows;
        break;
        
      case 'select':
        control = document.createElement('select');
        control.id = `${this.id}-${item.id}`;
        control.className = 'wx-settings-select';
        control.name = item.id;
        
        if (item.options && item.options.length > 0) {
          item.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (option.value === item.value) {
              optionElement.selected = true;
            }
            control.appendChild(optionElement);
          });
        }
        break;
        
      case 'checkbox':
        control = document.createElement('input');
        control.type = 'checkbox';
        control.id = `${this.id}-${item.id}`;
        control.className = 'wx-settings-checkbox';
        control.name = item.id;
        if (item.value) control.checked = item.value;
        break;
        
      case 'radio':
        controlContainer.className += ' wx-settings-radio-group';
        
        if (item.options && item.options.length > 0) {
          item.options.forEach((option, index) => {
            const radioContainer = document.createElement('div');
            radioContainer.className = 'wx-settings-radio-container';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `${this.id}-${item.id}-${index}`;
            radio.className = 'wx-settings-radio';
            radio.name = item.id;
            radio.value = option.value;
            if (option.value === item.value) {
              radio.checked = true;
            }
            
            const radioLabel = document.createElement('label');
            radioLabel.className = 'wx-settings-radio-label';
            radioLabel.setAttribute('for', `${this.id}-${item.id}-${index}`);
            radioLabel.textContent = option.label;
            
            radioContainer.appendChild(radio);
            radioContainer.appendChild(radioLabel);
            controlContainer.appendChild(radioContainer);
          });
        }
        
        return controlContainer;
        
      case 'color':
        control = document.createElement('input');
        control.type = 'color';
        control.id = `${this.id}-${item.id}`;
        control.className = 'wx-settings-color';
        control.name = item.id;
        if (item.value) control.value = item.value;
        break;
        
      case 'range':
        controlContainer.className += ' wx-settings-range-container';
        
        control = document.createElement('input');
        control.type = 'range';
        control.id = `${this.id}-${item.id}`;
        control.className = 'wx-settings-range';
        control.name = item.id;
        if (item.value !== undefined) control.value = item.value;
        if (item.min !== undefined) control.min = item.min;
        if (item.max !== undefined) control.max = item.max;
        if (item.step !== undefined) control.step = item.step;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'wx-settings-range-value';
        valueDisplay.textContent = item.value || 0;
        
        control.addEventListener('input', () => {
          valueDisplay.textContent = control.value;
        });
        
        controlContainer.appendChild(control);
        controlContainer.appendChild(valueDisplay);
        
        return controlContainer;
        
      default:
        control = document.createElement('input');
        control.type = 'text';
        control.id = `${this.id}-${item.id}`;
        control.className = 'wx-settings-input';
        control.name = item.id;
        if (item.value !== undefined) control.value = item.value;
    }
    
    controlContainer.appendChild(control);
    return controlContainer;
  }
  
  /**
   * 显示设置面板
   */
  show() {
    if (!this.panel) {
      this.create();
    }
    
    this.backdrop.classList.remove('wx-hidden');
    this.panel.classList.remove('wx-hidden');
    this.isVisible = true;
  }
  
  /**
   * 隐藏设置面板
   */
  hide() {
    if (this.panel && this.backdrop) {
      this.backdrop.classList.add('wx-hidden');
      this.panel.classList.add('wx-hidden');
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
   * 获取表单值
   * @returns {Object} 表单值
   */
  getValues() {
    if (!this.panel) {
      return this.formValues;
    }
    
    const form = this.panel.querySelector('form');
    if (!form) {
      return this.formValues;
    }
    
    const formData = new FormData(form);
    const values = {};
    
    // 处理表单数据
    for (const [name, value] of formData.entries()) {
      // 处理嵌套属性（如 'font.size'）
      if (name.includes('.')) {
        const parts = name.split('.');
        let current = values;
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        
        current[parts[parts.length - 1]] = value;
      } else {
        values[name] = value;
      }
    }
    
    // 处理复选框（未选中的复选框不会出现在 FormData 中）
    this.sections.forEach(section => {
      if (section.items) {
        section.items.forEach(item => {
          if (item.type === 'checkbox' && !formData.has(item.id)) {
            // 处理嵌套属性
            if (item.id.includes('.')) {
              const parts = item.id.split('.');
              let current = values;
              
              for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current[part]) {
                  current[part] = {};
                }
                current = current[part];
              }
              
              current[parts[parts.length - 1]] = false;
            } else {
              values[item.id] = false;
            }
          }
        });
      }
    });
    
    this.formValues = values;
    return values;
  }
  
  /**
   * 设置表单值
   * @param {Object} values - 表单值
   */
  setValues(values) {
    if (!this.panel || !values) {
      return;
    }
    
    this.formValues = values;
    
    // 遍历所有设置项
    this.sections.forEach(section => {
      if (section.items) {
        section.items.forEach(item => {
          const control = this.panel.querySelector(`#${this.id}-${item.id}`);
          if (!control) {
            return;
          }
          
          // 获取值（支持嵌套属性）
          let value;
          if (item.id.includes('.')) {
            const parts = item.id.split('.');
            let current = values;
            
            for (const part of parts) {
              if (!current || typeof current !== 'object') {
                current = undefined;
                break;
              }
              current = current[part];
            }
            
            value = current;
          } else {
            value = values[item.id];
          }
          
          // 设置控件值
          if (value !== undefined) {
            switch (item.type) {
              case 'checkbox':
                control.checked = !!value;
                break;
                
              case 'radio':
                const radio = this.panel.querySelector(`input[name="${item.id}"][value="${value}"]`);
                if (radio) {
                  radio.checked = true;
                }
                break;
                
              default:
                control.value = value;
            }
          }
        });
      }
    });
  }
  
  /**
   * 保存表单值
   */
  saveValues() {
    const values = this.getValues();
    
    // 保存到存储
    if (this.storageKey) {
      saveToStorage(this.storageKey, values);
    }
    
    return values;
  }
  
  /**
   * 处理保存按钮点击
   */
  handleSave() {
    const values = this.saveValues();
    this.hide();
    
    // 调用保存回调
    if (typeof this.onSave === 'function') {
      this.onSave(values);
    }
  }
  
  /**
   * 处理取消按钮点击
   */
  handleCancel() {
    this.hide();
    
    // 调用取消回调
    if (typeof this.onCancel === 'function') {
      this.onCancel();
    }
  }
  
  /**
   * 处理键盘事件
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyDown(event) {
    if (!this.isVisible) {
      return;
    }
    
    // ESC 键关闭面板
    if (event.key === 'Escape') {
      this.handleCancel();
    }
    
    // Enter 键提交表单（当焦点不在表单元素上时）
    if (event.key === 'Enter' && 
        !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement.tagName)) {
      this.handleSave();
    }
  }
}
