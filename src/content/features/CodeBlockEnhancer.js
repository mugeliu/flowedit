// 代码块增强功能模块
// 负责处理代码块的美化和自定义样式

import { applyCustomCss } from '../utils/dom.js';
import { loadFromStorage, saveToStorage } from '../utils/storage.js';

// 存储键名
const STORAGE_KEY = 'wx-code-block-settings';

// 默认设置
const DEFAULT_SETTINGS = {
  enabled: true,
  theme: 'github-dark', // 默认主题
  showMacButtons: true,
  fontSize: '11.34px',
  fontFamily: '"Fira Code", Menlo, "Operator Mono", Consolas, Monaco, monospace',
  customCSS: '',
  languages: {
    python: true,
    javascript: true,
    html: true,
    css: true
  }
};

/**
 * 代码块增强类
 * 负责处理代码块的美化和自定义
 */
export class CodeBlockEnhancer {
  /**
   * 构造函数
   * @param {HTMLElement} editor - 编辑器元素
   */
  constructor(editor) {
    this.editor = editor;
    this.settings = DEFAULT_SETTINGS;
    this.observer = null;
    
    // 绑定方法
    this.init = this.init.bind(this);
    this.loadSettings = this.loadSettings.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.enhanceCodeBlocks = this.enhanceCodeBlocks.bind(this);
    this.handleCodeButtonClick = this.handleCodeButtonClick.bind(this);
    this.observeEditorChanges = this.observeEditorChanges.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
  }
  
  /**
   * 初始化
   */
  init() {
    console.log('初始化代码块增强功能');
    
    // 加载用户设置
    this.loadSettings();
    
    // 如果功能被禁用，直接返回
    if (!this.settings.enabled) {
      console.log('代码块增强功能已禁用');
      return;
    }
    
    // 监听代码块插入按钮的点击事件
    this.listenForCodeButton();
    
    // 观察编辑器变化
    this.observeEditorChanges();
    
    // 初始化时增强现有的代码块
    this.enhanceCodeBlocks();
  }
  
  /**
   * 加载用户设置
   */
  loadSettings() {
    const savedSettings = loadFromStorage(STORAGE_KEY);
    if (savedSettings) {
      this.settings = {
        ...DEFAULT_SETTINGS,
        ...savedSettings
      };
      console.log('已加载代码块增强设置:', this.settings);
    } else {
      console.log('使用默认代码块增强设置');
    }
  }
  
  /**
   * 保存用户设置
   */
  saveSettings() {
    saveToStorage(STORAGE_KEY, this.settings);
    console.log('已保存代码块增强设置');
  }
  
  /**
   * 更新设置
   * @param {Object} newSettings - 新的设置
   */
  updateSettings(newSettings) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    this.saveSettings();
    
    // 重新应用样式
    this.enhanceCodeBlocks();
  }
  
  /**
   * 监听代码块插入按钮
   */
  listenForCodeButton() {
    const insertCodeButton = document.querySelector('.edui-for-insertcode');
    if (insertCodeButton) {
      console.log('找到代码块插入按钮');
      insertCodeButton.addEventListener('click', this.handleCodeButtonClick);
    } else {
      console.log('未找到代码块插入按钮');
    }
  }
  
  /**
   * 处理代码块按钮点击事件
   */
  handleCodeButtonClick() {
    console.log('代码块插入按钮被点击');
    // 使用延时等待代码块插入到DOM
    setTimeout(this.enhanceCodeBlocks, 500);
  }
  
  /**
   * 观察编辑器变化
   */
  observeEditorChanges() {
    if (!this.editor) return;
    
    // 创建MutationObserver实例
    this.observer = new MutationObserver((mutations) => {
      // 使用防抖来避免过多调用
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
      }
      
      this._debounceTimer = setTimeout(() => {
        let hasNewCodeBlocks = false;
        
        for (const mutation of mutations) {
          // 跳过我们自己触发的变化
          if (mutation.target.classList && 
              (mutation.target.classList.contains('wx-enhanced') || 
               mutation.target.closest('.wx-enhanced'))) {
            continue;
          }
          
          if (mutation.type === 'childList' && mutation.addedNodes.length) {
            // 检查是否添加了代码块
            const addedCodeBlocks = Array.from(mutation.addedNodes)
              .filter(node => node.nodeType === Node.ELEMENT_NODE)
              .filter(node => {
                // 检查节点本身或其子节点是否包含代码块
                // 排除已经增强过的代码块
                if (node.classList && 
                    (node.classList.contains('wx-enhanced') || 
                     node.classList.contains('wx-enhanced-code-block'))) {
                  return false;
                }
                
                return node.matches?.('.code-snippet:not(.wx-enhanced)') || 
                       node.querySelector?.('.code-snippet:not(.wx-enhanced)') ||
                       node.matches?.('.code-snippet__js:not(.wx-enhanced)') || 
                       node.querySelector?.('.code-snippet__js:not(.wx-enhanced)');
              });
            
            if (addedCodeBlocks.length) {
              hasNewCodeBlocks = true;
              break;
            }
          }
        }
        
        if (hasNewCodeBlocks) {
          console.log('检测到新的代码块添加');
          this.enhanceCodeBlocks();
        }
      }, 300); // 300ms的防抖时间
    });
    
    // 开始观察编辑器变化
    this.observer.observe(this.editor, { childList: true, subtree: true });
    console.log('已开始观察编辑器变化');
  }
  
  /**
   * 增强所有代码块
   */
  enhanceCodeBlocks() {
    // 防止正在增强过程中重复调用
    if (this._isEnhancing) return;
    this._isEnhancing = true;
    
    try {
      console.log('开始增强代码块');
      
      // 查找所有未增强的代码块
      const codeBlocks = document.querySelectorAll('.code-snippet__js:not(.wx-enhanced), .code-snippet:not(.wx-enhanced)');
      console.log(`找到 ${codeBlocks.length} 个未增强的代码块`);
      
      // 如果没有未增强的代码块，直接返回
      if (codeBlocks.length === 0) {
        this._isEnhancing = false;
        return;
      }
      
      codeBlocks.forEach((codeBlock, index) => {
        // 再次检查是否已经增强过，以防止在循环过程中有新的增强
        if (codeBlock.classList.contains('wx-enhanced') || codeBlock.dataset.wxEnhanced === 'true') return;
        
        console.log(`增强代码块 #${index + 1}`);
        
        // 标记代码块已经增强，避免重复处理
        codeBlock.classList.add('wx-enhanced');
        codeBlock.dataset.wxEnhanced = 'true';
        
        // 不替换原始代码块，而是修改其样式和类名
        codeBlock.classList.add('wx-enhanced-code-block');
        
        // 获取原始代码元素
        const codeElement = codeBlock.querySelector('code');
        if (!codeElement) return;
        
        const codeContent = codeElement.textContent || '';
        
        // 添加Mac窗口按钮
        if (this.settings.showMacButtons && !codeBlock.querySelector('.wx-code-mac-buttons')) {
          const macButtons = document.createElement('span');
          macButtons.className = 'wx-code-mac-buttons';
          macButtons.innerHTML = `<svg viewBox="0 0 450 130" height="13px" width="45px" y="0px" x="0px" version="1.1" xmlns="http://www.w3.org/2000/svg"><ellipse fill="rgb(237,108,96)" stroke-width="2" stroke="rgb(220,60,54)" ry="52" rx="50" cy="65" cx="50"></ellipse><ellipse fill="rgb(247,193,81)" stroke-width="2" stroke="rgb(218,151,33)" ry="52" rx="50" cy="65" cx="225"></ellipse><ellipse fill="rgb(100,200,86)" stroke-width="2" stroke="rgb(27,161,37)" ry="52" rx="50" cy="65" cx="400"></ellipse></svg>`;
          codeBlock.insertBefore(macButtons, codeBlock.firstChild);
        }
        
        // 应用字体设置
        codeElement.style.fontFamily = this.settings.fontFamily;
        codeElement.style.fontSize = this.settings.fontSize;
        codeElement.classList.add('wx-code-content');
        
        // 检测语言并添加语法高亮
        const language = this.detectLanguage(codeContent);
        if (language) {
          codeElement.classList.add(`language-${language}`);
          codeBlock.dataset.language = language;
        }
        
        // 创建一个隐藏的原始内容备份，以便编辑器可以使用
        if (!codeBlock.querySelector('.wx-original-content')) {
          const originalContent = document.createElement('div');
          originalContent.className = 'wx-original-content';
          originalContent.style.display = 'none';
          originalContent.textContent = codeContent;
          codeBlock.appendChild(originalContent);
        }
        
        // 如果代码块有内容，应用语法高亮
        if (codeContent.trim() && language && this.settings.languages[language]) {
          // 保存原始内容作为数据属性
          codeElement.dataset.originalContent = codeContent;
          
          // 创建一个隐藏的容器来存放高亮的内容
          const highlightContainer = document.createElement('div');
          highlightContainer.className = 'wx-highlight-container';
          highlightContainer.style.display = 'none';
          codeBlock.appendChild(highlightContainer);
          
          // 先暂停观察，以避免在应用高亮时触发变化
          if (this.observer) {
            this.observer.disconnect();
          }
          
          // 应用语法高亮，但保留原始内容的编辑能力
          const highlightedContent = this.highlightCode(codeContent, language);
          highlightContainer.innerHTML = highlightedContent;
          
          // 重新开始观察
          if (this.observer && this.editor) {
            this.observer.observe(this.editor, { childList: true, subtree: true });
          }
        }
      });
      
      // 应用自定义CSS
      if (this.settings.customCSS) {
        applyCustomCss(this.settings.customCSS, 'wx-custom-code-styles');
      }
      
      console.log('代码块增强完成');
    } catch (error) {
      console.error('代码块增强过程中出错:', error);
    } finally {
      // 确保即使出错也会重置标志
      this._isEnhancing = false;
    }
  }
  
  /**
   * 检测代码语言
   * @param {string} code - 代码内容
   * @returns {string|null} 检测到的语言或null
   */
  detectLanguage(code) {
    // 简单的语言检测逻辑
    const trimmedCode = code.trim();
    
    // 检测Python
    if (this.settings.languages.python && 
        /\b(import|from|def|class|if|else|elif|for|while|return|try|except)\b/.test(trimmedCode)) {
      return 'python';
    }
    
    // 检测JavaScript
    if (this.settings.languages.javascript && 
        /\b(function|const|let|var|if|else|for|while|return|try|catch|class|import|export)\b/.test(trimmedCode)) {
      return 'javascript';
    }
    
    // 检测HTML
    if (this.settings.languages.html && 
        /(<html|<body|<div|<span|<p|<h1|<a)\b/.test(trimmedCode)) {
      return 'html';
    }
    
    // 检测CSS
    if (this.settings.languages.css && 
        /({|}|;|\b(margin|padding|color|background|font-size|width|height):\s)/.test(trimmedCode)) {
      return 'css';
    }
    
    return null;
  }
  
  /**
   * 高亮代码
   * @param {string} code - 代码内容
   * @param {string} language - 语言
   * @returns {string} 高亮后的HTML
   */
  highlightCode(code, language) {
    let highlightedCode = code;
    
    // 根据不同语言应用不同的高亮规则
    switch (language) {
      case 'python':
        // Python关键字高亮
        highlightedCode = highlightedCode.replace(
          /\b(import|from|def|class|if|else|elif|for|while|return|try|except|with|as|in|is|not|and|or)\b/g, 
          '<span class="wx-code-keyword">$1</span>'
        );
        // 字符串高亮
        highlightedCode = highlightedCode.replace(
          /(".*?"|'.*?')/g,
          '<span class="wx-code-string">$1</span>'
        );
        // 注释高亮
        highlightedCode = highlightedCode.replace(
          /(#.*)$/gm,
          '<span class="wx-code-comment">$1</span>'
        );
        break;
        
      case 'javascript':
        // JavaScript关键字高亮
        highlightedCode = highlightedCode.replace(
          /\b(function|const|let|var|if|else|for|while|return|try|catch|class|import|export|new|this|typeof|instanceof)\b/g, 
          '<span class="wx-code-keyword">$1</span>'
        );
        // 字符串高亮
        highlightedCode = highlightedCode.replace(
          /(".*?"|'.*?'|`.*?`)/g,
          '<span class="wx-code-string">$1</span>'
        );
        // 注释高亮
        highlightedCode = highlightedCode.replace(
          /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
          '<span class="wx-code-comment">$1</span>'
        );
        break;
        
      case 'html':
        // HTML标签高亮
        highlightedCode = highlightedCode.replace(
          /(&lt;[^&]*&gt;|<[^<>]*>)/g,
          '<span class="wx-code-keyword">$1</span>'
        );
        // 属性高亮
        highlightedCode = highlightedCode.replace(
          /(\s[a-zA-Z-]+)=["']([^"']*)["']/g,
          '$1=<span class="wx-code-string">"$2"</span>'
        );
        break;
        
      case 'css':
        // CSS选择器高亮
        highlightedCode = highlightedCode.replace(
          /([.#][a-zA-Z0-9_-]+|[a-zA-Z]+)(?=\s*{)/g,
          '<span class="wx-code-keyword">$1</span>'
        );
        // 属性高亮
        highlightedCode = highlightedCode.replace(
          /([a-zA-Z-]+)(?=\s*:)/g,
          '<span class="wx-code-keyword">$1</span>'
        );
        // 值高亮
        highlightedCode = highlightedCode.replace(
          /:\s*([^;{}]+)/g,
          ': <span class="wx-code-string">$1</span>'
        );
        break;
        
      default:
        // 默认不做特殊处理
        break;
    }
    
    return highlightedCode;
  }
  
  /**
   * 销毁实例
   */
  destroy() {
    // 停止观察
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // 移除事件监听
    const insertCodeButton = document.querySelector('.edui-for-insertcode');
    if (insertCodeButton) {
      insertCodeButton.removeEventListener('click', this.handleCodeButtonClick);
    }
  }
}
