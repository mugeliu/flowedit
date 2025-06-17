// ==UserScript==
// @name         微信公众号元素定位单次检测
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  页面刷新时检测元素定位问题原因
// @match        https://mp.weixin.qq.com/cgi-bin/appmsg*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  // 配置目标元素ID
  const TARGET_ID = "js_toolbar_0";

  // 添加高亮样式
  GM_addStyle(`
        .element-highlight-debug {
            position: relative;
            outline: 3px solid #f44336 !important;
            box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.5) !important;
            animation: highlight-pulse 2s;
        }
        @keyframes highlight-pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
    `);

  // 主检测函数（只执行一次）
  function runSingleCheck() {
    // 等待微信界面完全加载
    setTimeout(() => {
      const element = document.getElementById(TARGET_ID);
      if (!element) {
        console.error(`[定位诊断] 未找到元素: #${TARGET_ID}`);
        return;
      }

      // 高亮目标元素
      element.classList.add("element-highlight-debug");
      setTimeout(() => {
        element.classList.remove("element-highlight-debug");
      }, 3000);

      // 获取元素和父级信息
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const parent = element.parentElement;
      const parentStyle = parent ? window.getComputedStyle(parent) : null;

      // 诊断报告数据
      const diagnosticReport = {
        // 基础信息
        timestamp: new Date().toLocaleString(),
        elementId: TARGET_ID,
        topValue: rect.top,

        // 可能影响top值的因素
        issues: [],

        // 元素样式
        elementStyles: {
          position: style.position,
          display: style.display,
          transform: style.transform,
          marginTop: style.marginTop,
          top: style.top,
        },

        // 父元素样式
        parentStyles: parent
          ? {
              display: parentStyle.display,
              position: parentStyle.position,
              overflow: parentStyle.overflow,
              paddingTop: parentStyle.paddingTop,
              borderTop: parentStyle.borderTopWidth,
            }
          : null,
      };

      // 检查常见问题
      if (style.position === "static") {
        diagnosticReport.issues.push("元素使用static定位(受文档流影响)");
      }

      if (style.transform !== "none") {
        diagnosticReport.issues.push(`存在transform: ${style.transform}`);
      }

      if (parentStyle) {
        if (parentStyle.display.includes("flex")) {
          diagnosticReport.issues.push("父元素使用flex布局可能影响定位");
        }
        if (parentStyle.overflow !== "visible") {
          diagnosticReport.issues.push(
            `父元素overflow: ${parentStyle.overflow}`
          );
        }
      }

      if (
        style.top !== "auto" &&
        style.position !== "relative" &&
        style.position !== "absolute"
      ) {
        diagnosticReport.issues.push(
          `top值(${style.top})在${style.position}定位下无效`
        );
      }

      // 输出诊断报告
      console.groupCollapsed(
        `[定位诊断] ${TARGET_ID} @ ${diagnosticReport.timestamp}`
      );
      console.log("当前top值:", rect.top + "px");

      if (diagnosticReport.issues.length > 0) {
        console.log("%c发现可能问题:", "color: red; font-weight: bold;");
        diagnosticReport.issues.forEach((issue) => {
          console.log(`• ${issue}`);
        });
      } else {
        console.log("%c未发现明显问题", "color: green;");
      }

      console.log(
        "\n%c元素样式:",
        "font-weight: bold;",
        diagnosticReport.elementStyles
      );
      if (parent) {
        console.log(
          "%c父元素样式:",
          "font-weight: bold;",
          diagnosticReport.parentStyles
        );
        console.log("父元素:", parent);
      }

      console.log("元素对象:", element);
      console.groupEnd();
    }, 1800); // 适当延迟确保DOM完全加载
  }

  // 页面加载完成后执行一次
  if (document.readyState === "complete") {
    runSingleCheck();
  } else {
    window.addEventListener("load", runSingleCheck);
  }
})();
