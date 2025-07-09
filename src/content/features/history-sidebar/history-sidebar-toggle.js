// 历史文章侧边栏组件创建和管理
import { createElement } from "../../utils/dom.js";
import { createHistorySidebar } from "./history-sidebar.js";

/**
 * 创建历史文章侧边栏按钮
 * @returns {HTMLElement} 按钮元素
 */
function createSidebarButton() {
  const feedbackBtn = createElement("div", {
    className: "weui-desktop-online-faq__wrp",
    innerHTML: `
      <div class="weui-desktop-online-faq__switch" style="border-radius: 4px;">
        <div class="weui-desktop-online-faq__switch_content" style="cursor: pointer; border-radius: 4px;">
          <div class="text" style="font-size: 14px; color: rgb(76, 77, 78); line-height: 19.6px;">历史文章</div>
        </div>
      </div>
    `,
    cssText: `
      bottom: 400px;
    `
  });

  // 添加点击事件到按钮内容区域
  const switchContent = feedbackBtn.querySelector(
    ".weui-desktop-online-faq__switch_content"
  );
  if (switchContent) {
    switchContent.addEventListener("click", toggleHistorySidebar);
  }

  return feedbackBtn;
}

/**
 * 切换历史文章侧边栏显示状态
 */
function toggleHistorySidebar() {
  const sidebar = document.getElementById("history-sidebar");
  if (!sidebar) return;

  const isVisible = sidebar.style.right === "0px";

  if (isVisible) {
    // 隐藏侧边栏
    sidebar.style.right = "-400px";
    // 移除外部点击监听器
    document.removeEventListener("click", handleOutsideClick);
  } else {
    // 显示侧边栏
    sidebar.style.right = "0px";
    // 添加外部点击监听器
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 100); // 延迟添加，避免立即触发
  }
}

/**
 * 处理侧边栏外部点击事件
 */
export function handleOutsideClick(event) {
  const sidebar = document.getElementById("history-sidebar");
  const button = document.querySelector(".weui-desktop-online-faq__wrp");
  const dialog = document.querySelector(".weui-dialog");
  const dialogMask = document.querySelector(".weui-mask");
  
  // 如果点击的不是侧边栏内部、触发按钮、对话框或对话框遮罩
  if (sidebar && 
      !sidebar.contains(event.target) && 
      button && !button.contains(event.target) &&
      (!dialog || !dialog.contains(event.target)) &&
      (!dialogMask || !dialogMask.contains(event.target)) &&
      sidebar.style.right === "0px") {
    toggleHistorySidebar();
  }
}

/**
 * 创建历史文章侧边栏切换开关
 * @returns {Object} 包含清理方法的对象
 */
export function createHistorySidebarToggle() {
  // 创建并插入按钮
  const button = createSidebarButton();
  document.body.appendChild(button);

  // 创建并插入侧边栏
  const sidebar = createHistorySidebar(toggleHistorySidebar);
  document.body.appendChild(sidebar);

  console.log("历史文章侧边栏按钮和侧边栏已成功创建");

  // 返回清理方法
  return {
    cleanup: () => {
      // 移除按钮
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
      
      // 移除侧边栏
      if (sidebar && sidebar.parentNode) {
        sidebar.parentNode.removeChild(sidebar);
      }
      
      // 移除外部点击监听器
      document.removeEventListener("click", handleOutsideClick);
      
      console.log("历史文章侧边栏组件已清理");
    }
  };
}