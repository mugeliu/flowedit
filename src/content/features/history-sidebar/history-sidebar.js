// 历史文章侧边栏主体组件
import { createElement } from "../../utils/dom.js";
import { handleOutsideClick } from "./history-sidebar-toggle.js";
import { storage } from "../../utils/storage/index.js";

/**
 * 显示文章操作对话框
 * @param {Function} closeSidebarCallback - 关闭侧边栏的回调函数
 * @param {Object} article - 文章数据
 */
function showArticleDialog(closeSidebarCallback, article) {
  // 创建dialog遮罩层
  const dialogMask = createElement("div", {
    className: "weui-mask",
    cssText: `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 5002;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 15vh;
    `
  });

  // 创建dialog主体
  const dialog = createElement("div", {
    className: "weui-dialog",
    innerHTML: `
      <div class="weui-dialog__hd" style="
        padding: 24px 24px 8px 24px;
        text-align: center;
      ">
        <strong class="weui-dialog__title" style="
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        ">文章操作</strong>
      </div>
      <div class="weui-dialog__bd" style="
        padding: 8px 24px 24px 24px;
        text-align: center;
        color: #6b7280;
        font-size: 15px;
        line-height: 1.5;
      ">
        确定要插入文章《${article.title}》吗？
      </div>
      <div class="weui-dialog__ft" style="
        display: flex;
        border-top: 1px solid #f3f4f6;
      ">
        <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_default" id="cancel-btn" style="
          flex: 1;
          padding: 16px;
          text-align: center;
          color: #6b7280;
          font-weight: 500;
          border-right: 1px solid #f3f4f6;
          transition: background-color 0.2s ease;
          text-decoration: none;
        " onmouseover="this.style.backgroundColor='#f9fafb';" 
           onmouseout="this.style.backgroundColor='transparent';">取消</a>
        <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" id="insert-dialog-btn" style="
          flex: 1;
          padding: 16px;
          text-align: center;
          color: #2563eb;
          font-weight: 600;
          transition: background-color 0.2s ease;
          text-decoration: none;
        " onmouseover="this.style.backgroundColor='#f0f9ff';" 
           onmouseout="this.style.backgroundColor='transparent';">插入</a>
      </div>
    `,
    cssText: `
      background: white;
      border-radius: 16px;
      width: 320px;
      max-width: 90%;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      opacity: 0;
      transform: scale(0.95);
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `
  });

  dialogMask.appendChild(dialog);
  document.body.appendChild(dialogMask);

  // 使用requestAnimationFrame确保DOM完全插入后再执行动画
  requestAnimationFrame(() => {
    dialog.style.opacity = '1';
    dialog.style.transform = 'scale(1)';
  });

  // 添加按钮事件
  const cancelBtn = dialog.querySelector("#cancel-btn");
  const insertBtn = dialog.querySelector("#insert-dialog-btn");

  // 取消按钮 - 只关闭弹框，不关闭侧边栏
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("点击了取消按钮，只关闭弹框");
    document.body.removeChild(dialogMask);
  });

  // 插入按钮 - 执行插入逻辑并关闭侧边栏
  insertBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("点击了插入按钮，关闭弹框和侧边栏");
    
    try {
      // 获取文章的EditorJS数据
      const editorData = await storage.getArticle(article.id);
      if (editorData) {
        // 这里可以添加插入文章到编辑器的逻辑
        console.log("准备插入文章数据:", editorData);
        // TODO: 实现将文章数据插入到当前编辑器中
      }
    } catch (error) {
      console.error("获取文章数据失败:", error);
    }
    
    document.body.removeChild(dialogMask);
    // 关闭侧边栏
    closeSidebarCallback();
  });

  // 点击遮罩层关闭弹框，不关闭侧边栏
  dialogMask.addEventListener("click", (e) => {
    if (e.target === dialogMask) {
      e.preventDefault();
      e.stopPropagation();
      console.log("点击了遮罩层，只关闭弹框");
      document.body.removeChild(dialogMask);
    }
  });
}

/**
 * 创建文章列表项
 * @param {Object} article - 文章数据
 * @param {Function} onArticleClick - 点击文章的回调函数
 * @returns {HTMLElement} 文章列表项元素
 */
function createArticleItem(article, onArticleClick) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const articleItem = createElement("div", {
    className: "weui-media-box weui-media-box_text article-item",
    innerHTML: `
      <strong class="weui-media-box__title" style="
        color: #111827;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      ">${article.title}</strong>
      <p class="weui-media-box__desc" style="
        color: #6b7280;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      ">${article.summary || '暂无摘要'}</p>
      <div class="article-meta" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
      ">
        <p class="weui-media-box__desc" style="
          color: #9ca3af;
          font-size: 12px;
          margin: 0;
        ">更新时间：${formatDate(article.updatedAt)}</p>
        <span class="word-count" style="
          color: #9ca3af;
          font-size: 12px;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 4px;
        ">${article.wordCount || 0} 字</span>
      </div>
    `,
    cssText: `
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #f3f4f6;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 12px;
    `
  });

  // 添加悬停效果
  articleItem.addEventListener("mouseenter", () => {
    articleItem.style.background = '#f3f4f6';
    articleItem.style.borderColor = '#e5e7eb';
  });

  articleItem.addEventListener("mouseleave", () => {
    articleItem.style.background = '#fafafa';
    articleItem.style.borderColor = '#f3f4f6';
  });

  // 添加点击事件
  articleItem.addEventListener("click", () => {
    onArticleClick(article);
  });

  return articleItem;
}

/**
 * 创建空状态显示
 * @returns {HTMLElement} 空状态元素
 */
function createEmptyState() {
  return createElement("div", {
    className: "empty-state",
    innerHTML: `
      <div style="
        text-align: center;
        padding: 40px 20px;
        color: #9ca3af;
      ">
        <div style="
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        ">📝</div>
        <div style="
          font-size: 16px;
          margin-bottom: 8px;
          color: #6b7280;
        ">暂无历史文章</div>
        <div style="
          font-size: 14px;
          color: #9ca3af;
        ">开始编写您的第一篇文章吧</div>
      </div>
    `
  });
}

/**
 * 创建加载状态显示
 * @returns {HTMLElement} 加载状态元素
 */
function createLoadingState() {
  return createElement("div", {
    className: "loading-state",
    innerHTML: `
      <div style="
        text-align: center;
        padding: 40px 20px;
        color: #9ca3af;
      ">
        <div style="
          font-size: 14px;
          color: #6b7280;
        ">正在加载历史文章...</div>
      </div>
    `
  });
}

/**
 * 创建历史文章侧边栏
 * @param {Function} toggleSidebarCallback - 切换侧边栏的回调函数
 * @returns {HTMLElement} 侧边栏元素
 */
export function createHistorySidebar(toggleSidebarCallback) {
  // 直接创建WeUI panel作为侧边栏
  const panel = createElement("div", {
    id: "history-sidebar",
    className: "weui-panel weui-panel_access",
    cssText: `
      position: fixed;
      right: -400px;
      top: 100px;
      width: 350px;
      height: calc(100vh - 120px);
      background: white;
      border-radius: 16px 0 0 16px;
      box-shadow: -4px 0 20px rgba(0,0,0,0.15);
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 5001;
      overflow-y: auto;
      padding: 24px;
      border: 1px solid #e5e7eb;
      border-right: none;
    `
  });

  // 创建侧边栏头部
  const header = createElement("div", {
    className: "sidebar-header",
    innerHTML: `
      <button class="weui-btn weui-btn_mini weui-btn_default" id="close-sidebar-btn" style="
        position: absolute;
        top: 20px;
        right: 20px;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        line-height: 1;
        padding: 0;
        border: 1px solid #e5e7eb;
        background: #f9fafb;
        color: #6b7280;
        z-index: 5002;
        transition: all 0.2s ease;
        cursor: pointer;
      " onmouseover="this.style.background='#f3f4f6'; this.style.borderColor='#d1d5db';" 
         onmouseout="this.style.background='#f9fafb'; this.style.borderColor='#e5e7eb';">×</button>
      
      <div class="weui-panel__hd" style="
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f3f4f6;
      ">历史文章</div>
    `
  });

  // 创建文章列表容器
  const articleList = createElement("div", {
    id: "article-list",
    className: "weui-panel__bd",
    innerHTML: '' // 内容将动态加载
  });

  // 创建底部操作区
  const footer = createElement("div", {
    className: "weui-panel__ft",
    innerHTML: `
      <div style="margin-top: 16px;">
        <a href="javascript:" class="weui-cell weui-cell_active weui-cell_access weui-cell_link" id="refresh-btn" style="
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
          margin-bottom: 8px;
        " onmouseover="this.style.background='#f1f5f9';" 
           onmouseout="this.style.background='#f8fafc';">
          <span class="weui-cell__bd" style="color: #475569; font-weight: 500;">刷新列表</span>
          <span class="weui-cell__ft"></span>
        </a>
        <a href="javascript:" class="weui-cell weui-cell_active weui-cell_access weui-cell_link" id="view-more-btn" style="
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        " onmouseover="this.style.background='#f1f5f9';" 
           onmouseout="this.style.background='#f8fafc';">
          <span class="weui-cell__bd" style="color: #475569; font-weight: 500;">查看更多</span>
          <span class="weui-cell__ft"></span>
        </a>
      </div>
    `
  });

  // 组装侧边栏
  panel.appendChild(header);
  panel.appendChild(articleList);
  panel.appendChild(footer);

  // 添加关闭按钮事件
  const closeBtn = panel.querySelector("#close-sidebar-btn");
  closeBtn.addEventListener("click", toggleSidebarCallback);

  // 添加刷新按钮事件
  const refreshBtn = panel.querySelector("#refresh-btn");
  refreshBtn.addEventListener("click", () => {
    loadArticles();
  });

  // 添加查看更多按钮事件
  const viewMoreBtn = panel.querySelector("#view-more-btn");
  viewMoreBtn.addEventListener("click", () => {
    console.log("查看更多文章");
    // TODO: 实现分页加载或打开文章管理界面
  });

  /**
   * 加载文章列表
   */
  async function loadArticles() {
    const articleListContainer = panel.querySelector("#article-list");
    
    // 显示加载状态
    articleListContainer.innerHTML = '';
    articleListContainer.appendChild(createLoadingState());

    try {
      // 获取文章列表
      const articles = await storage.getAllArticles({
        limit: 10, // 限制显示数量
        sortOrder: 'updatedAt_desc'
      });

      // 清空加载状态
      articleListContainer.innerHTML = '';

      if (articles.length === 0) {
        // 显示空状态
        articleListContainer.appendChild(createEmptyState());
      } else {
        // 渲染文章列表
        articles.forEach(article => {
          const articleItem = createArticleItem(article, (selectedArticle) => {
            // 创建专门用于关闭侧边栏的函数
            const closeSidebarFunction = () => {
              const sidebar = document.getElementById("history-sidebar");
              if (sidebar && sidebar.style.right === "0px") {
                sidebar.style.right = "-400px";
                // 移除外部点击监听器
                document.removeEventListener("click", handleOutsideClick);
              }
            };
            showArticleDialog(closeSidebarFunction, selectedArticle);
          });
          articleListContainer.appendChild(articleItem);
        });
      }
    } catch (error) {
      console.error("加载文章列表失败:", error);
      articleListContainer.innerHTML = '';
      articleListContainer.appendChild(createElement("div", {
        innerHTML: `
          <div style="
            text-align: center;
            padding: 40px 20px;
            color: #ef4444;
          ">
            <div style="font-size: 16px; margin-bottom: 8px;">加载失败</div>
            <div style="font-size: 14px; color: #9ca3af;">请稍后重试</div>
          </div>
        `
      }));
    }
  }

  // 初始加载文章列表
  loadArticles();

  return panel;
}