// 全局样式注入（只需执行一次）
export function injectGlobalStyles() {
  const styleId = "my-extension-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      /* 重置所有扩展元素的默认样式 */
      .my-ext-btn, .my-ext-switch {
        all: unset !important;
        display: inline-block !important;
        height: 22px !important;
        margin: 1px 4px !important;
        vertical-align: middle !important;
        cursor: pointer !important;
      }
      /* 智能插入按钮样式 */
      .my-ext-smart-btn {
        background-color: #07c160 !important;
        color: white !important;
        border-radius: 4px !important;
        padding: 0 12px !important;
        font-size: 12px !important;
        line-height: 22px !important;
      }
      /* Switch开关样式 */
      .my-ext-switch {
        position: relative !important;
        width: 40px !important;
      }
      .my-ext-switch-track {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background-color: #ccc !important;
        border-radius: 11px !important;
        transition: background-color 0.3s !important;
      }
      .my-ext-switch-thumb {
        position: absolute !important;
        width: 18px !important;
        height: 18px !important;
        left: 2px !important;
        bottom: 2px !important;
        background-color: white !important;
        border-radius: 50% !important;
        transition: transform 0.3s !important;
      }
      .my-ext-switch.on .my-ext-switch-track {
        background-color: #07c160 !important;
      }
      .my-ext-switch.on .my-ext-switch-thumb {
        transform: translateX(18px) !important;
      }
    `;
    document.head.appendChild(style);
  }
}
