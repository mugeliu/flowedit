// 插件主类
// 负责初始化和协调各个组件

import { CONFIG, DEFAULT_SETTINGS } from './config.js';
import { findEditor, applyCustomCss } from '../utils/dom.js';
import { loadFromStorage, saveToStorage } from '../utils/storage.js';

/**
 * 微信浮动工具栏插件主类
 * 负责初始化和协调各个组件
 */
export class FloatEditPlugin {
  /**
   * 构造函数
   */
  constructor() {
    // 初始化属性
    this.editor = null;
    this.components = {
      floatingToolbar: null,
      settingsPanel: null,
      draggableButton: null,
      switchButton: null,
      codeBlockEnhancer: null,
      codeBlockSettings: null
    };
    this.findEditorInterval = null;
    
    // 加载设置
    this.settings = this.loadSettings();
    
    // 绑定方法
    this.init = this.init.bind(this);
    this.onSettingsButtonClick = this.onSettingsButtonClick.bind(this);
    this.updateStyleSettings = this.updateStyleSettings.bind(this);
    this.onSwitchChange = this.onSwitchChange.bind(this);
    
    // 初始化
    this.init();
  }
  
  /**
   * 加载设置
   * @returns {Object} 合并后的设置
   */
  loadSettings() {
    // 从存储加载样式设置
    const savedSettings = loadFromStorage(CONFIG.STORAGE_KEYS.SETTINGS);
    
    // 合并默认设置和已保存的设置
    const mergedSettings = { ...DEFAULT_SETTINGS };
    
    if (savedSettings) {
      // 合并每个设置类别
      Object.keys(DEFAULT_SETTINGS).forEach(key => {
        if (key !== 'ui' && savedSettings[key]) {
          mergedSettings[key] = { 
            ...DEFAULT_SETTINGS[key], 
            ...savedSettings[key] 
          };
        }
      });
      
      // 合并UI设置
      if (savedSettings.ui) {
        mergedSettings.ui = {
          ...DEFAULT_SETTINGS.ui,
          ...savedSettings.ui
        };
      }
      
      // 应用自定义CSS
      if (mergedSettings.custom && mergedSettings.custom.css) {
        applyCustomCss(mergedSettings.custom.css);
      }
    }
    
    return mergedSettings;
  }
  
  /**
   * 初始化方法
   */
  init() {
    console.log('浮动工具栏插件初始化中...');
    
    // 动态导入组件
    this.importComponents().then(() => {
      // 创建可拖动的设置按钮
      const { DraggableButton } = this.imports;
      this.components.draggableButton = new DraggableButton(this.onSettingsButtonClick);
      this.components.draggableButton.create();
      
      // 创建设置面板
      const { SettingsPanel } = this.imports;
      this.components.settingsPanel = new SettingsPanel(this.settings);
      
      // 创建开关按钮
      const { SwitchButton } = this.imports;
      this.components.switchButton = new SwitchButton(this.onSwitchChange);
      
      // 尝试从存储中加载开关状态
      const savedSwitchState = loadFromStorage(CONFIG.STORAGE_KEYS.FEATURE_ENABLED);
      if (savedSwitchState !== null) {
        // 如果找到了存储的状态，将在创建后设置
        this.switchButtonState = savedSwitchState;
      } else {
        // 默认启用
        this.switchButtonState = true;
      }
      
      // 等待编辑器加载
      this.findEditorInterval = setInterval(() => {
        const editor = findEditor();
        if (editor) {
          clearInterval(this.findEditorInterval);
          this.editor = editor;
          console.log('找到编辑器元素:', this.editor);
          
          // 初始化浮动工具栏
          const { FloatingToolbar } = this.imports;
          this.components.floatingToolbar = new FloatingToolbar(this.editor, this.settings);
          this.components.floatingToolbar.create();
          
          // 初始化代码块增强功能
          const { CodeBlockEnhancer } = this.imports;
          this.components.codeBlockEnhancer = new CodeBlockEnhancer(this.editor);
          this.components.codeBlockEnhancer.init();
          
          // 初始化代码块设置面板
          const { CodeBlockSettings } = this.imports;
          this.components.codeBlockSettings = new CodeBlockSettings(this.components.codeBlockEnhancer);
          
          // 在编辑器加载完成后创建开关按钮
          // 使用延时确保目标元素已加载
          setTimeout(() => {
            const switchContainer = this.components.switchButton.create();
            if (switchContainer && this.switchButtonState !== undefined) {
              this.components.switchButton.setState(this.switchButtonState);
            }
          }, 500);
          
          console.log('浮动工具栏插件初始化完成');
        }
      }, CONFIG.TIMEOUTS.EDITOR_SEARCH);
      
      // 30秒后如果还没找到编辑器，则停止查找
      setTimeout(() => {
        if (this.findEditorInterval) {
          clearInterval(this.findEditorInterval);
          console.log('未能找到编辑器元素，停止查找');
        }
      }, CONFIG.TIMEOUTS.EDITOR_SEARCH_MAX);
    });
  }
  
  /**
   * 动态导入组件
   * @returns {Promise} 导入完成的Promise
   */
  async importComponents() {
    this.imports = {};
    
    // 导入UI组件
    const [
      { FloatingToolbar },
      { SettingsPanel },
      { DraggableButton },
      { SwitchButton }
    ] = await Promise.all([
      import('../ui/widgets/FloatingToolbar.js'),
      import('../ui/widgets/SettingsPanel.js'),
      import('../ui/widgets/DraggableButton.js'),
      import('../ui/widgets/SwitchButton.js')
    ]);
    
    // 导入功能组件
    const [
      { CodeBlockEnhancer },
      { CodeBlockSettings }
    ] = await Promise.all([
      import('../features/code/CodeBlockEnhancer.js'),
      import('../features/code/CodeBlockSettings.js')
    ]);
    
    // 保存导入的组件
    this.imports = {
      FloatingToolbar,
      SettingsPanel,
      DraggableButton,
      SwitchButton,
      CodeBlockEnhancer,
      CodeBlockSettings
    };
    
    return this.imports;
  }
  
  /**
   * 设置按钮点击事件处理
   */
  onSettingsButtonClick() {
    // 显示设置面板
    if (this.components.settingsPanel) {
      this.components.settingsPanel.show();
      
      // 添加代码块设置按钮
      const codeBlockButton = document.createElement('button');
      codeBlockButton.className = 'wx-settings-button wx-code-settings-button';
      codeBlockButton.textContent = '代码块样式设置';
      codeBlockButton.addEventListener('click', () => {
        // 隐藏主设置面板
        this.components.settingsPanel.hide();
        // 显示代码块设置面板
        this.components.codeBlockSettings.show();
      });
      
      // 将按钮添加到设置面板
      const buttonContainer = this.components.settingsPanel.panelElement.querySelector('.wx-settings-buttons') || this.components.settingsPanel.panelElement;
      if (buttonContainer && !buttonContainer.querySelector('.wx-code-settings-button')) {
        buttonContainer.appendChild(codeBlockButton);
      }
      
      // 监听设置变化
      const settingsChangeHandler = () => {
        const newSettings = this.components.settingsPanel.getSettings();
        this.updateStyleSettings(newSettings);
      };
      
      // 添加一次性事件监听
      if (this.components.settingsPanel.panel) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'style' && 
                mutation.target === this.components.settingsPanel.panel && 
                this.components.settingsPanel.panel.style.display === 'none') {
              settingsChangeHandler();
              observer.disconnect();
            }
          });
        });
        
        observer.observe(this.components.settingsPanel.panel, { attributes: true });
      }
    }
  }
  
  /**
   * 更新样式设置
   * @param {Object} newSettings - 新的样式设置
   */
  updateStyleSettings(newSettings) {
    this.settings = newSettings;
    
    // 更新浮动工具栏的样式设置
    if (this.components.floatingToolbar) {
      this.components.floatingToolbar.updateSettings(newSettings);
    }
    
    // 保存设置到存储
    saveToStorage(CONFIG.STORAGE_KEYS.SETTINGS, newSettings);
  }
  
  /**
   * 开关状态变化处理
   * @param {boolean} isOn - 开关状态
   */
  onSwitchChange(isOn) {
    console.log('开关状态变化:', isOn);
    
    // 根据开关状态启用或禁用功能
    if (this.components.floatingToolbar) {
      if (isOn) {
        this.components.floatingToolbar.enable();
      } else {
        this.components.floatingToolbar.disable();
      }
    }
    
    // 保存开关状态到存储
    saveToStorage(CONFIG.STORAGE_KEYS.FEATURE_ENABLED, isOn);
  }
}
