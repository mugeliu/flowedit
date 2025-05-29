// 代码块增强功能
// 负责美化和增强编辑器中的代码块

import { applyCustomCss } from '../../utils/dom.js';

// 代码块美化样式
const CODE_BLOCK_STYLES = `
.hljs.code__pre {
  box-sizing: border-box; 
  border: 1px solid rgba(0, 0, 0, 0.04); 
  font-family: Menlo, Monaco, "Courier New", monospace; 
  font-size: 12.6px; 
  margin: 10px 8px; 
  color: rgb(201, 209, 217); 
  background: rgb(13, 17, 23); 
  text-align: left; 
  line-height: 1.5; 
  overflow-x: auto; 
  border-radius: 8px; 
  padding: 0px !important;
}

.mac-sign {
  box-sizing: border-box; 
  border-width: 0px; 
  border-style: solid; 
  border-color: rgb(229, 229, 229); 
  display: flex; 
  padding: 10px 14px 0px;
}

.hljs.code__pre code {
  box-sizing: border-box; 
  border-width: 0px; 
  border-style: solid; 
  border-color: rgb(229, 229, 229); 
  font-family: "Fira Code", Menlo, "Operator Mono", Consolas, Monaco, monospace; 
  font-size: 11.34px; 
  display: -webkit-box; 
  padding: 0.5em 1em 1em; 
  overflow-x: auto; 
  text-indent: 0px; 
  text-align: left; 
  line-height: 1.75; 
  margin: 0px; 
  white-space: pre-wrap; 
  overflow-wrap: break-word;
}

.hljs .hljs-keyword {
  color: rgb(255, 123, 114);
}
`;

/**
 * 代码块增强类
 * 美化和增强编辑器中的代码块
 */
export class CodeBlockEnhancer {
  /**
   * 构造函数
   * @param {HTMLElement} editor - 编辑器元素
   */
  constructor(editor) {
    this.editor = editor;
    this.observer = null;
    this.settings = {
      theme: 'dark',
      fontFamily: '"Fira Code", Menlo, "Operator Mono", Consolas, Monaco, monospace',
      fontSize: '11.34px',
      lineHeight: '1.75',
      borderRadius: '8px',
      showLineNumbers: false
    };
    
    // 绑定方法
    this.init = this.init.bind(this);
    this.beautifyCodeBlocks = this.beautifyCodeBlocks.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
  }
  
  /**
   * 初始化代码块美化功能
   */
  init() {
    if (!this.editor) return;
    
    console.log('初始化代码块美化功能');
    
    // 添加代码块样式
    applyCustomCss(CODE_BLOCK_STYLES, 'wx-code-block-styles');
    
    // 监听代码块插入按钮的点击事件
    const insertCodeButton = document.querySelector('.edui-for-insertcode');
    if (insertCodeButton) {
      console.log('找到代码块插入按钮');
      insertCodeButton.addEventListener('click', () => {
        console.log('代码块插入按钮被点击');
        // 使用延时等待代码块插入到DOM
        setTimeout(this.beautifyCodeBlocks, 500);
      });
    } else {
      console.log('未找到代码块插入按钮，将使用变异观察器');
      // 使用MutationObserver监听编辑器内容变化
      this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length) {
            // 检查是否添加了代码块
            const addedCodeBlocks = Array.from(mutation.addedNodes)
              .filter(node => node.nodeType === Node.ELEMENT_NODE)
              .filter(node => node.matches?.('.code-snippet') || node.querySelector?.('.code-snippet'));
            
            if (addedCodeBlocks.length) {
              console.log('检测到新的代码块添加');
              this.beautifyCodeBlocks();
            }
          }
        }
      });
      
      // 开始观察编辑器内容变化
      this.observer.observe(this.editor, { childList: true, subtree: true });
    }
    
    // 初始美化已存在的代码块
    this.beautifyCodeBlocks();
  }
  
  /**
   * 美化所有代码块
   */
  beautifyCodeBlocks() {
    // 查找所有代码块
    const codeBlocks = document.querySelectorAll('.code-snippet, pre[class*="language-"], .hljs');
    
    if (codeBlocks.length === 0) {
      console.log('未找到代码块');
      return;
    }
    
    console.log(`找到 ${codeBlocks.length} 个代码块，开始美化`);
    
    // 遍历代码块并应用样式
    codeBlocks.forEach((block, index) => {
      // 如果已经美化过，则跳过
      if (block.classList.contains('wx-beautified')) {
        return;
      }
      
      // 标记为已美化
      block.classList.add('wx-beautified');
      
      // 应用自定义样式
      if (this.settings.theme === 'dark') {
        block.style.color = 'rgb(201, 209, 217)';
        block.style.background = 'rgb(13, 17, 23)';
      } else {
        block.style.color = '#333';
        block.style.background = '#f6f8fa';
      }
      
      block.style.fontFamily = this.settings.fontFamily;
      block.style.fontSize = this.settings.fontSize;
      block.style.lineHeight = this.settings.lineHeight;
      block.style.borderRadius = this.settings.borderRadius;
      block.style.overflow = 'auto';
      
      // 添加行号
      if (this.settings.showLineNumbers) {
        this.addLineNumbers(block);
      }
      
      console.log(`代码块 ${index + 1} 美化完成`);
    });
  }
  
  /**
   * 添加行号
   * @param {HTMLElement} block - 代码块元素
   */
  addLineNumbers(block) {
    // 获取代码内容
    const code = block.textContent;
    const lines = code.split('\n');
    
    // 创建行号容器
    const lineNumbersWrapper = document.createElement('div');
    lineNumbersWrapper.className = 'wx-line-numbers';
    lineNumbersWrapper.style.cssText = `
      float: left;
      margin-right: 10px;
      padding: 0.5em 0;
      color: rgba(255, 255, 255, 0.5);
      text-align: right;
      user-select: none;
    `;
    
    // 添加行号
    for (let i = 0; i < lines.length; i++) {
      const lineNumber = document.createElement('span');
      lineNumber.className = 'wx-line-number';
      lineNumber.textContent = i + 1;
      lineNumber.style.cssText = `
        display: block;
        padding: 0 0.5em;
      `;
      lineNumbersWrapper.appendChild(lineNumber);
    }
    
    // 添加行号容器到代码块
    block.insertBefore(lineNumbersWrapper, block.firstChild);
    
    // 调整代码块样式
    block.style.paddingLeft = '40px';
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
    
    // 重新美化代码块
    this.beautifyCodeBlocks();
  }
  
  /**
   * 销毁
   */
  destroy() {
    // 停止观察编辑器内容变化
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // 移除代码块样式
    const styleElement = document.getElementById('wx-code-block-styles');
    if (styleElement) {
      styleElement.remove();
    }
    
    console.log('代码块增强功能已销毁');
  }
}
