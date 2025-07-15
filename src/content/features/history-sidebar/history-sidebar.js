// 历史文章侧边栏主体组件
import { createElement } from "../../utils/dom.js";
import { handleOutsideClick } from "./history-sidebar-toggle.js";
import { storage } from "../../utils/storage/index.js";
import { showErrorToast, showSuccessToast } from "../../utils/toast.js";
import { createLogger } from "../../services/simple-logger.js";
import { getCurrentEditor, activateSmartEditor, deactivateSmartEditor } from "../smart-editor/manager.js";

// 创建模块日志器
const logger = createLogger('HistorySidebar');

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
    logger.debug("点击了取消按钮，只关闭弹框");
    document.body.removeChild(dialogMask);
  });

  // 插入按钮 - 执行插入逻辑并关闭侧边栏
  insertBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    logger.info("点击了插入按钮，准备打开编辑器并插入内容");
    
    try {
      // 获取文章的完整数据（包含EditorJS数据）
      const articleData = await storage.getArticle(article.id);
      if (articleData) {
        logger.debug("准备插入文章数据", articleData);
        
        // 关闭对话框
        document.body.removeChild(dialogMask);
        // 关闭侧边栏
        closeSidebarCallback();
        
        // 检查编辑器是否已经激活，如果已激活先停用
        const currentEditor = getCurrentEditor();
        if (currentEditor) {
          logger.debug("编辑器已激活，先停用");
          deactivateSmartEditor();
        }
        
        // 等待一小段时间确保停用完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 激活编辑器并传入文章数据
        await activateSmartEditor(articleData);
        
        logger.info("编辑器已激活并加载文章内容");
      } else {
        // 文章数据获取失败，可能是扩展上下文失效
        logger.warn("无法获取文章数据，可能是扩展上下文失效");
        showErrorToast("获取文章失败，请刷新页面重试");
      }
    } catch (error) {
      logger.error("获取文章数据或激活编辑器失败", error);
      
      // 检查是否是扩展上下文失效
      if (error.message && error.message.includes('Extension context invalidated')) {
        showErrorToast("扩展上下文失效，请刷新页面或重新加载扩展");
      } else {
        showErrorToast("插入文章失败，请重试");
      }
    }
  });

  // 点击遮罩层关闭弹框，不关闭侧边栏
  dialogMask.addEventListener("click", (e) => {
    if (e.target === dialogMask) {
      e.preventDefault();
      e.stopPropagation();
      logger.debug("点击了遮罩层，只关闭弹框");
      document.body.removeChild(dialogMask);
    }
  });
}

/**
 * 创建文章列表项
 * @param {Object} article - 文章数据
 * @param {Function} onArticleClick - 点击文章的回调函数
 * @param {Function} onDeleteClick - 点击删除的回调函数
 * @returns {HTMLElement} 文章列表项元素
 */
function createArticleItem(article, onArticleClick, onDeleteClick) {
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
      <div style="position: relative;">
        <button class="article-delete-btn" style="
          position: absolute;
          top: 4px;
          right: 4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: none;
          background: #d1d5db;
          color: white;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
          opacity: 0.7;
        " onmouseover="this.style.background='#ef4444'; this.style.opacity='1';" 
           onmouseout="this.style.background='#d1d5db'; this.style.opacity='0.7';"
           title="删除文章">×</button>
        
        <div class="article-content" style="
          padding-right: 24px;
          cursor: pointer;
        ">
          <strong class="weui-media-box__title" style="
            color: #111827;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 1.3;
          ">${article.title}</strong>
          <p class="weui-media-box__desc" style="
            color: #6b7280;
            font-size: 12px;
            line-height: 1.4;
            margin-bottom: 6px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          ">${article.summary || '暂无摘要'}</p>
          <div class="article-meta" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 4px;
          ">
            <p class="weui-media-box__desc" style="
              color: #9ca3af;
              font-size: 11px;
              margin: 0;
            ">更新：${formatDate(article.updatedAt)}</p>
            <span class="word-count" style="
              color: #9ca3af;
              font-size: 11px;
              background: #f3f4f6;
              padding: 1px 6px;
              border-radius: 3px;
            ">${article.wordCount || 0} 字</span>
          </div>
        </div>
      </div>
    `,
    cssText: `
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid #f3f4f6;
      background: #fafafa;
      transition: all 0.2s ease;
      margin-bottom: 8px;
      position: relative;
    `
  });

  // 添加悬停效果（只对内容区域）
  const contentArea = articleItem.querySelector('.article-content');
  contentArea.addEventListener("mouseenter", () => {
    articleItem.style.background = '#f3f4f6';
    articleItem.style.borderColor = '#e5e7eb';
  });

  contentArea.addEventListener("mouseleave", () => {
    articleItem.style.background = '#fafafa';
    articleItem.style.borderColor = '#f3f4f6';
  });

  // 添加点击事件（只对内容区域）
  contentArea.addEventListener("click", () => {
    onArticleClick(article);
  });

  // 添加删除按钮事件
  const deleteBtn = articleItem.querySelector('.article-delete-btn');
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    onDeleteClick(article);
  });

  return articleItem;
}

/**
 * 显示删除确认对话框
 * @param {Object} article - 要删除的文章
 * @param {Function} onConfirm - 确认删除的回调函数
 */
function showDeleteConfirmDialog(article, onConfirm) {
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
          color: #dc2626;
        ">删除文章</strong>
      </div>
      <div class="weui-dialog__bd" style="
        padding: 8px 24px 24px 24px;
        text-align: center;
        color: #6b7280;
        font-size: 15px;
        line-height: 1.5;
      ">
        确定要删除文章《${article.title}》吗？<br>
        <span style="color: #ef4444; font-size: 14px;">此操作不可恢复</span>
      </div>
      <div class="weui-dialog__ft" style="
        display: flex;
        border-top: 1px solid #f3f4f6;
      ">
        <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_default" id="cancel-delete-btn" style="
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
        <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" id="confirm-delete-btn" style="
          flex: 1;
          padding: 16px;
          text-align: center;
          color: #dc2626;
          font-weight: 600;
          transition: background-color 0.2s ease;
          text-decoration: none;
        " onmouseover="this.style.backgroundColor='#fef2f2';" 
           onmouseout="this.style.backgroundColor='transparent';">删除</a>
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
  const cancelBtn = dialog.querySelector("#cancel-delete-btn");
  const confirmBtn = dialog.querySelector("#confirm-delete-btn");

  // 取消按钮
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.removeChild(dialogMask);
  });

  // 确认删除按钮
  confirmBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await onConfirm();
      document.body.removeChild(dialogMask);
    } catch (error) {
      logger.error("删除操作失败", error);
      showErrorToast("删除失败，请重试");
    }
  });

  // 点击遮罩层关闭弹框
  dialogMask.addEventListener("click", (e) => {
    if (e.target === dialogMask) {
      e.preventDefault();
      e.stopPropagation();
      document.body.removeChild(dialogMask);
    }
  });
}
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
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding: 0;
      ">
        <div class="weui-panel__hd" style="
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
          flex: 1;
        ">历史文章</div>
        
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <button class="weui-btn weui-btn_mini weui-btn_default" id="refresh-btn" style="
            width: 28px;
            height: 28px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            color: #6b7280;
            transition: all 0.2s ease;
            cursor: pointer;
            font-size: 14px;
          " onmouseover="this.style.background='#f3f4f6'; this.style.borderColor='#d1d5db';" 
             onmouseout="this.style.background='#f9fafb'; this.style.borderColor='#e5e7eb';" 
             title="刷新文章列表">↻</button>
          
          <button class="weui-btn weui-btn_mini weui-btn_default" id="close-sidebar-btn" style="
            width: 28px;
            height: 28px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            color: #6b7280;
            transition: all 0.2s ease;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
          " onmouseover="this.style.background='#f3f4f6'; this.style.borderColor='#d1d5db';" 
             onmouseout="this.style.background='#f9fafb'; this.style.borderColor='#e5e7eb';" 
             title="关闭侧边栏">×</button>
        </div>
      </div>
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

  // 添加头部刷新按钮事件
  const refreshBtn = panel.querySelector("#refresh-btn");
  refreshBtn.addEventListener("click", () => {
    loadArticles();
  });

  // 添加查看更多按钮事件
  const viewMoreBtn = panel.querySelector("#view-more-btn");
  let currentPage = 1;
  const pageSize = 10;
  let totalArticles = 0;
  let isLoadingMore = false;

  viewMoreBtn.addEventListener("click", () => {
    loadMoreArticles();
  });

  /**
   * 加载更多文章
   */
  async function loadMoreArticles() {
    if (isLoadingMore) return;
    
    isLoadingMore = true;
    const articleListContainer = panel.querySelector("#article-list");
    
    try {
      // 显示加载状态
      viewMoreBtn.textContent = "加载中...";
      viewMoreBtn.style.pointerEvents = "none";
      
      // 获取下一页文章
      const nextPage = currentPage + 1;
      const articles = await storage.getAllArticles({
        limit: pageSize,
        offset: (nextPage - 1) * pageSize,
        sortOrder: 'updatedAt_desc'
      });

      if (articles.length > 0) {
        // 渲染新文章并追加到列表
        articles.forEach(article => {
          const articleItem = createArticleItem(
            article, 
            (selectedArticle) => {
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
            },
            (articleToDelete) => {
              // 删除文章回调
              showDeleteConfirmDialog(articleToDelete, async () => {
                try {
                  const success = await storage.deleteArticle(articleToDelete.id);
                  if (success) {
                    showSuccessToast(`文章《${articleToDelete.title}》已删除`);
                    // 重新加载文章列表
                    currentPage = 1;
                    loadArticles();
                  } else {
                    showErrorToast("删除文章失败");
                  }
                } catch (error) {
                  logger.error("删除文章失败", error);
                  showErrorToast("删除文章失败");
                }
              });
            }
          );
          articleListContainer.appendChild(articleItem);
        });
        
        currentPage = nextPage;
        
        // 检查是否还有更多文章
        if (articles.length < pageSize) {
          // 没有更多文章了
          viewMoreBtn.textContent = "没有更多了";
          viewMoreBtn.style.pointerEvents = "none";
          viewMoreBtn.style.opacity = "0.5";
        } else {
          viewMoreBtn.textContent = "查看更多";
          viewMoreBtn.style.pointerEvents = "auto";
        }
      } else {
        // 没有更多文章
        viewMoreBtn.textContent = "没有更多了";
        viewMoreBtn.style.pointerEvents = "none";
        viewMoreBtn.style.opacity = "0.5";
      }
    } catch (error) {
      logger.error("加载更多文章失败", error);
      showErrorToast("加载更多文章失败");
      viewMoreBtn.textContent = "查看更多";
      viewMoreBtn.style.pointerEvents = "auto";
    } finally {
      isLoadingMore = false;
    }
  }

  /**
   * 加载文章列表
   */
  async function loadArticles() {
    const articleListContainer = panel.querySelector("#article-list");
    
    // 重置分页状态
    currentPage = 1;
    isLoadingMore = false;
    
    // 显示加载状态
    articleListContainer.innerHTML = '';
    articleListContainer.appendChild(createLoadingState());

    try {
      // 获取文章列表
      const articles = await storage.getAllArticles({
        limit: pageSize, // 使用相同的页面大小
        sortOrder: 'updatedAt_desc'
      });

      // 清空加载状态
      articleListContainer.innerHTML = '';

      if (articles.length === 0) {
        // 显示空状态
        articleListContainer.appendChild(createEmptyState());
        // 隐藏查看更多按钮
        viewMoreBtn.style.display = 'none';
      } else {
        // 渲染文章列表
        articles.forEach(article => {
          const articleItem = createArticleItem(
            article, 
            (selectedArticle) => {
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
            },
            (articleToDelete) => {
              // 删除文章回调
              showDeleteConfirmDialog(articleToDelete, async () => {
                try {
                  const success = await storage.deleteArticle(articleToDelete.id);
                  if (success) {
                    showSuccessToast(`文章《${articleToDelete.title}》已删除`);
                    // 重新加载文章列表
                    loadArticles();
                  } else {
                    showErrorToast("删除文章失败");
                  }
                } catch (error) {
                  logger.error("删除文章失败", error);
                  showErrorToast("删除文章失败");
                }
              });
            }
          );
          articleListContainer.appendChild(articleItem);
        });
        
        // 显示/隐藏查看更多按钮
        if (articles.length >= pageSize) {
          // 可能还有更多文章
          viewMoreBtn.style.display = 'block';
          viewMoreBtn.textContent = "查看更多";
          viewMoreBtn.style.pointerEvents = "auto";
          viewMoreBtn.style.opacity = "1";
        } else {
          // 没有更多文章了
          viewMoreBtn.style.display = 'none';
        }
      }
    } catch (error) {
      logger.error("加载文章列表失败", error);
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
      // 隐藏查看更多按钮
      viewMoreBtn.style.display = 'none';
    }
  }

  // 初始加载文章列表
  loadArticles();

  return panel;
}