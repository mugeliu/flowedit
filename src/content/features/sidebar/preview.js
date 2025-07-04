// 侧边栏预览功能管理

import { createElement, showElement, hideElement } from "../../utils/dom.js";
import { isSmartEditorActive } from "../../utils/editor.js";
import { convertToHtml } from "../../utils/parsers/index.js";

// 全局预览容器实例
let globalPreviewContainer = null;

// 缓存的模板和测试数据
let cachedTemplate = null;
let cachedTestData = null;

/**
 * 异步加载模板和测试数据
 * @returns {Promise<{template: Object, testData: Object}>} 加载的模板和测试数据
 */
async function loadTemplateAndData() {
  if (cachedTemplate && cachedTestData) {
    return { template: cachedTemplate, testData: cachedTestData };
  }

  try {
    // 加载模板文件
    const templateResponse = await fetch(chrome.runtime.getURL('assets/style-template.json'));
    cachedTemplate = await templateResponse.json();

    // 加载测试数据文件
    const testDataResponse = await fetch(chrome.runtime.getURL('assets/test-data.json'));
    cachedTestData = await testDataResponse.json();

    return { template: cachedTemplate, testData: cachedTestData };
  } catch (error) {
    console.error('加载模板或测试数据失败:', error);
    return { template: null, testData: null };
  }
}

/**
 * 生成默认预览内容
 * @returns {Promise<string>} 渲染后的HTML内容
 */
async function generateDefaultPreviewContent() {
  const { template, testData } = await loadTemplateAndData();
  
  if (!template || !testData) {
    return '<div style="color: #666; padding: 20px; text-align: center;">加载预览数据失败，请检查模板和数据文件。</div>';
  }

  try {
    const htmlContent = convertToHtml(testData, template);
    return htmlContent || '<div style="color: #666; padding: 20px; text-align: center;">预览内容生成失败。</div>';
  } catch (error) {
    console.error('生成预览内容失败:', error);
    return '<div style="color: #666; padding: 20px; text-align: center;">预览内容生成失败。</div>';
  }
}

/**
 * 创建预览容器的 HTML 结构
 * @returns {Object} 包含容器元素和渲染函数的对象
 */
function createPreviewContainer() {
  // 创建主容器
  const mainContainer = createElement("div", {
    className:
      "weui-desktop-layout__main__hd main_hd appmsg_edit_mod default appmsg_preview_area scrollbar-macosx",
  });

  // 创建内容区域
  const contentSection = createElement("div", {
    className: "appmsg_preview_container appmsg-side__wrapper",
  });
  mainContainer.appendChild(contentSection);

  // 创建WeUI面板容器
  const weuiPanel = createElement("div", {
    className: "weui-panel weui-panel_access",
  });
  contentSection.appendChild(weuiPanel);

  // 创建面板头部
  const panelHeader = createElement("div", {
    className: "weui-panel__hd",
  });
  panelHeader.textContent = "文章预览";
  weuiPanel.appendChild(panelHeader);

  // 创建面板主体内容
  const panelBody = createElement("div", {
    className: "weui-panel__bd",
    cssText: "padding: 13px;",
  });
  weuiPanel.appendChild(panelBody);

  return {
    container: mainContainer,
    contentBody: panelBody,
  };
}

/**
 * 渲染预览内容
 * @param {HTMLElement} panelBody - 面板主体容器元素
 * @param {string} htmlContent - 要渲染的 HTML 内容
 */
async function renderContent(panelBody, htmlContent) {
  if (!panelBody) return;

  // 检查编辑器是否激活
  if (!isSmartEditorActive()) {
    // 生成并显示默认预览内容
    const defaultContent = await generateDefaultPreviewContent();
    panelBody.innerHTML = defaultContent;
    return;
  }

  // 渲染HTML内容
  panelBody.innerHTML = htmlContent || "";
}

/**
 * 显示预览容器
 */
export async function showPreviewContainer() {
  if (!globalPreviewContainer) {
    globalPreviewContainer = createPreviewContainer();

    // 插入到DOM中
    const sidebar = document.getElementById("js_mp_sidemenu");
    if (sidebar && sidebar.parentNode) {
      sidebar.parentNode.insertBefore(
        globalPreviewContainer.container,
        sidebar.nextSibling
      );
    }
  }

  if (globalPreviewContainer) {
    showElement(globalPreviewContainer.container);
    await renderContent(globalPreviewContainer.contentBody, "");
  }
}

/**
 * 隐藏预览容器
 */
export function hidePreviewContainer() {
  if (globalPreviewContainer) {
    hideElement(globalPreviewContainer.container);
  }
}

/**
 * 清理预览容器
 */
export function cleanupPreviewContainer() {
  if (globalPreviewContainer && globalPreviewContainer.container.parentNode) {
    globalPreviewContainer.container.parentNode.removeChild(
      globalPreviewContainer.container
    );
    globalPreviewContainer = null;
  }
}

/**
 * 渲染HTML内容到预览容器
 * @param {string} htmlContent - 要渲染的HTML内容
 */
export async function renderPreviewContent(htmlContent) {
  if (globalPreviewContainer) {
    await renderContent(globalPreviewContainer.contentBody, htmlContent);
  }
}
