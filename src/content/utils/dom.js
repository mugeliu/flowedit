// DOM操作工具函数模块
// 负责处理DOM元素查找、创建和操作

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
 * 查找编辑器元素
 * @returns {HTMLElement|null} 找到的编辑器元素或null
 */
export function findEditor() {
  // 尝试查找ProseMirror编辑器
  const proseMirrorEditor = document.querySelector('.ProseMirror[contenteditable="true"]');
  if (proseMirrorEditor) {
    console.log('找到ProseMirror编辑器');
    return proseMirrorEditor;
  }
  
  // 检查iframe中的编辑器
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      const iframeEditor = iframeDocument.querySelector('.ProseMirror[contenteditable="true"]') || 
                          iframeDocument.querySelector('[contenteditable="true"]');
      if (iframeEditor) {
        console.log('在iframe中找到编辑器');
        return iframeEditor;
      }
    } catch (e) {
      console.log('访问iframe内容时出错:', e);
    }
  }
  
  // 查找其他可能的编辑器元素
  const editorCandidates = document.querySelectorAll('[contenteditable="true"]');
  
  for (const candidate of editorCandidates) {
    if (candidate.closest('.edui-editor-body') || 
        candidate.closest('.rich_media_content') || 
        candidate.closest('.editor') || 
        candidate.closest('.js_editor_area') || 
        candidate.closest('.view.rich_media_content') || 
        candidate.closest('#ueditor_0')) {
      console.log('找到微信编辑器元素');
      return candidate;
    }
  }
  
  // 如果上述方法都失败，则返回第一个可编辑元素
  if (editorCandidates.length > 0) {
    console.log('未找到特定编辑器，使用第一个可编辑元素');
    return editorCandidates[0];
  }
  
  console.log('未找到任何可编辑元素');
  return null;
}

/**
 * 创建SVG图标元素
 * @param {string} pathData - SVG路径数据
 * @param {string} fill - 填充颜色
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @returns {SVGElement} 创建的SVG元素
 */
export function createSvgIcon(pathData, fill = '#4C4D4E', width = 24, height = 24) {
  const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgIcon.setAttribute('width', width.toString());
  svgIcon.setAttribute('height', height.toString());
  svgIcon.setAttribute('viewBox', '0 0 24 24');
  
  const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath.setAttribute('fill', fill);
  iconPath.setAttribute('fill-rule', 'evenodd');
  iconPath.setAttribute('d', pathData);
  svgIcon.appendChild(iconPath);
  
  return svgIcon;
}

/**
 * 替换选中内容
 * @param {Node} newNode - 用于替换的新节点
 * @param {Selection} selection - 当前选择对象
 */
export function replaceSelection(newNode, selection) {
  if (!selection) return;
  
  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(newNode);
  
  // 清除选择
  selection.removeAllRanges();
}

/**
 * 应用自定义CSS样式到页面
 * @param {string} cssText - CSS文本
 * @param {string} id - 样式表ID
 */
export function applyCustomCss(cssText, id = 'wx-custom-css') {
  // 先移除已存在的样式表
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // 如果没有CSS文本，则直接返回
  if (!cssText) return;
  
  // 创建新的样式表
  const style = document.createElement('style');
  style.id = id;
  style.textContent = cssText;
  document.head.appendChild(style);
}

/**
 * 初始化代码块美化功能
 * @param {HTMLElement} editor - 编辑器元素
 */
export function initCodeBlockBeautifier(editor) {
  if (!editor) return;
  
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
      setTimeout(beautifyCodeBlocks, 500);
    });
  } else {
    console.log('未找到代码块插入按钮，将使用变异观察器');
    // 使用MutationObserver监听编辑器内容变化
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          // 检查是否添加了代码块
          const addedCodeBlocks = Array.from(mutation.addedNodes)
            .filter(node => node.nodeType === Node.ELEMENT_NODE)
            .filter(node => node.matches?.('.code-snippet') || node.querySelector?.('.code-snippet'));
          
          if (addedCodeBlocks.length) {
            console.log('检测到新的代码块添加');
            beautifyCodeBlocks();
          }
        }
      }
    });
    
    // 开始观察编辑器变化
    observer.observe(editor, { childList: true, subtree: true });
  }
  
  // 初始化时美化现有的代码块
  beautifyCodeBlocks();
}

/**
 * 美化所有代码块
 */
export function beautifyCodeBlocks() {
  console.log('开始美化代码块');
  
  // 查找所有代码块
  const codeBlocks = document.querySelectorAll('.code-snippet__js, .code-snippet');
  console.log(`找到 ${codeBlocks.length} 个代码块`);
  
  codeBlocks.forEach((codeBlock, index) => {
    // 如果已经美化过，则跳过
    if (codeBlock.classList.contains('hljs')) return;
    
    console.log(`美化代码块 #${index + 1}`);
    
    // 获取原始代码内容
    const codeElement = codeBlock.querySelector('code');
    const codeContent = codeElement?.textContent || '';
    
    // 创建新的代码块结构
    const newCodeBlock = document.createElement('pre');
    newCodeBlock.className = 'hljs code__pre';
    
    // 添加Mac窗口按钮
    const macSign = document.createElement('span');
    macSign.className = 'mac-sign';
    macSign.setAttribute('hidden', '');
    macSign.innerHTML = `<svg viewBox="0 0 450 130" height="13px" width="45px" y="0px" x="0px" version="1.1" xmlns="http://www.w3.org/2000/svg"><ellipse fill="rgb(237,108,96)" stroke-width="2" stroke="rgb(220,60,54)" ry="52" rx="50" cy="65" cx="50"></ellipse><ellipse fill="rgb(247,193,81)" stroke-width="2" stroke="rgb(218,151,33)" ry="52" rx="50" cy="65" cx="225"></ellipse><ellipse fill="rgb(100,200,86)" stroke-width="2" stroke="rgb(27,161,37)" ry="52" rx="50" cy="65" cx="400"></ellipse></svg>`;
    newCodeBlock.appendChild(macSign);
    
    // 创建新的代码元素
    const newCodeElement = document.createElement('code');
    newCodeElement.className = 'language-python';
    
    // 处理代码内容，添加语法高亮
    if (codeContent.trim()) {
      // 简单的语法高亮处理（这里仅作示例，实际可以使用更复杂的高亮逻辑）
      const highlightedContent = codeContent
        .replace(/\b(import|from|def|class|if|else|elif|for|while|return|try|except|with|as|in|is|not|and|or)\b/g, '<span class="hljs-keyword">$1</span>');
      
      newCodeElement.innerHTML = highlightedContent;
    } else {
      newCodeElement.innerHTML = '<span leaf=""></span>';
    }
    
    newCodeBlock.appendChild(newCodeElement);
    
    // 替换原始代码块
    codeBlock.parentNode.replaceChild(newCodeBlock, codeBlock);
  });
}

/**
 * 获取元素的绝对位置
 * @param {HTMLElement} element - 目标元素
 * @returns {Object} 包含top和left属性的对象
 */
export function getElementPosition(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height
  };
}
