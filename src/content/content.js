// 微信公众号浮动工具栏插件 - 内容脚本主入口文件

// 导入主样式文件（包含所有样式组件）
import './styles/main.css';

// 导入核心配置
import { CONFIG } from './core/config.js';

// 导入主插件类
import { Plugin } from './core/plugin.js';

// 导入工具函数
import { findEditor } from './utils/dom.js';
import { loadFromStorage, saveToStorage } from './utils/storage.js';
import { debounce } from './utils/events.js';
import { generateUniqueId } from './utils/helpers.js';

// 导入UI组件
import { FloatingToolbar } from './ui/widgets/FloatingToolbar.js';
import { DraggableButton } from './ui/widgets/DraggableButton.js';
import { SwitchButton } from './ui/widgets/SwitchButton.js';

// 导入功能模块
import { CodeBlockEnhancer } from './features/code/CodeBlockEnhancer.js';
import { CodeBlockSettings } from './features/code/CodeBlockSettings.js';

/**
 * 插件主类
 * 负责初始化和协调各个组件
 * @deprecated 请使用 ./core/plugin.js 中的 Plugin 类
 */
class WxFloatingToolbarPlugin {
  constructor() {
    // 初始化属性
    this.editor = null;
    this.floatingToolbar = null;
    this.settingsPanel = null;
    this.draggableButton = null;
    this.codeBlockEnhancer = null;
    this.codeBlockSettings = null;
    this.switchButton = null;
    this.findEditorInterval = null;
    
    // 默认样式设置
    this.styleSettings = {
      h1: { fontSize: '30px', fontWeight: 'bold' },
      h2: { fontSize: '24px', fontWeight: 'bold' },
      h3: { fontSize: '20px', fontWeight: 'bold' },
      h4: { fontSize: '16px', fontWeight: 'bold' },
      code: { fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', backgroundColor: 'rgba(175, 184, 193, 0.2)', padding: '0.2em 0.4em', borderRadius: '3px', fontSize: '85%' },
      custom: { css: '' }
    };
    
    // 绑定方法
    this.init = this.init.bind(this);
    this.onSettingsButtonClick = this.onSettingsButtonClick.bind(this);
    this.updateStyleSettings = this.updateStyleSettings.bind(this);
    this.onSwitchChange = this.onSwitchChange.bind(this);
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化方法
   */
  init() {
    console.log('浮动工具栏插件初始化中...');
    
    // 从存储中加载样式设置
    const savedSettings = loadFromStorage(STORAGE_KEYS.STYLE_SETTINGS);
    if (savedSettings) {
      this.styleSettings = {
        h1: { ...this.styleSettings.h1, ...savedSettings.h1 },
        h2: { ...this.styleSettings.h2, ...savedSettings.h2 },
        h3: { ...this.styleSettings.h3, ...savedSettings.h3 },
        h4: { ...this.styleSettings.h4, ...savedSettings.h4 },
        code: { ...this.styleSettings.code, ...savedSettings.code },
        custom: { css: savedSettings.custom?.css || '' }
      };
      
      // 应用自定义CSS
      if (this.styleSettings.custom.css) {
        applyCustomCss(this.styleSettings.custom.css);
      }
    }
    
    // 初始化设置面板
    this.settingsPanel = new SettingsPanel(this.styleSettings);
    
    // 创建可拖动的设置按钮
    this.draggableButton = new DraggableButton(this.onSettingsButtonClick);
    this.draggableButton.create();
    
    // 创建开关按钮
    this.switchButton = new SwitchButton(this.onSwitchChange);
    
    // 尝试从存储中加载开关状态
    const savedSwitchState = loadFromStorage(STORAGE_KEYS.FEATURE_ENABLED);
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
        this.floatingToolbar = new FloatingToolbar(this.editor, this.styleSettings);
        this.floatingToolbar.create();
        
        // 初始化代码块增强功能
        this.codeBlockEnhancer = new CodeBlockEnhancer(this.editor);
        this.codeBlockEnhancer.init();
        
        // 初始化代码块设置面板
        this.codeBlockSettings = new CodeBlockSettings(this.codeBlockEnhancer);
        
        // 在编辑器加载完成后创建开关按钮
        // 使用延时确保目标元素已加载
        setTimeout(() => {
          const switchContainer = this.switchButton.create();
          if (switchContainer && this.switchButtonState !== undefined) {
            this.switchButton.setState(this.switchButtonState);
          }
        }, 500);
        
        console.log('浮动工具栏插件初始化完成');
      }
    }, 1000);
    
    // 30秒后如果还没找到编辑器，则停止查找
    setTimeout(() => {
      if (this.findEditorInterval) {
        clearInterval(this.findEditorInterval);
        console.log('未能找到编辑器元素，停止查找');
      }
    }, 30000);
  }
  
  /**
   * 设置按钮点击事件处理
   */
  onSettingsButtonClick() {
    // 显示设置面板
    if (this.settingsPanel) {
      this.settingsPanel.show();
      
      // 添加代码块设置按钮
      const codeBlockButton = document.createElement('button');
      codeBlockButton.className = 'wx-settings-button wx-code-settings-button';
      codeBlockButton.textContent = '代码块样式设置';
      codeBlockButton.addEventListener('click', () => {
        // 隐藏主设置面板
        this.settingsPanel.hide();
        // 显示代码块设置面板
        this.codeBlockSettings.show();
      });
      
      // 将按钮添加到设置面板
      const buttonContainer = this.settingsPanel.panelElement.querySelector('.wx-settings-buttons') || this.settingsPanel.panelElement;
      if (buttonContainer && !buttonContainer.querySelector('.wx-code-settings-button')) {
        buttonContainer.appendChild(codeBlockButton);
      }
      
      // 监听设置变化
      const settingsChangeHandler = () => {
        const newSettings = this.settingsPanel.getSettings();
        this.updateStyleSettings(newSettings);
      };
      
      // 添加一次性事件监听
      if (this.settingsPanel.panel) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'style' && 
                mutation.target === this.settingsPanel.panel && 
                this.settingsPanel.panel.style.display === 'none') {
              settingsChangeHandler();
              observer.disconnect();
            }
          });
        });
        
        observer.observe(this.settingsPanel.panel, { attributes: true });
      }
    }
  }
  
  /**
   * 更新样式设置
   * @param {Object} newSettings - 新的样式设置
   */
  updateStyleSettings(newSettings) {
    this.styleSettings = newSettings;
    
    // 更新浮动工具栏的样式设置
    if (this.floatingToolbar) {
      this.floatingToolbar.updateSettings(newSettings);
    }
  }
  
  /**
   * 开关状态变化处理
   * @param {boolean} isOn - 开关状态
   */
  onSwitchChange(isOn) {
    console.log('开关状态变化:', isOn);
    
    // 根据开关状态启用或禁用功能
    if (this.floatingToolbar) {
      if (isOn) {
        this.floatingToolbar.enable();
      } else {
        this.floatingToolbar.disable();
      }
    }
    
    // 保存开关状态到存储
    chrome.storage.local.set({ [STORAGE_KEYS.FEATURE_ENABLED]: isOn });
  }
}

// 使用多种事件监听方式确保插件能够被初始化
function initPlugin() {
  console.log('尝试初始化插件...');
  if (document.body) {
    console.log('DOM已加载，初始化插件');
    // 使用新的插件类
    new Plugin();
  }
}

// 使用多种事件来确保插件能被初始化
document.addEventListener('DOMContentLoaded', initPlugin);

// 如果DOM已经加载完成，直接初始化
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initPlugin();
}

// 如果上述方法都失败，尝试使用延迟加载
setTimeout(initPlugin, 1000);

// 向背景脚本发送初始化成功消息
chrome.runtime.sendMessage({ action: 'log', data: '内容脚本已加载' });
