import { initializeWechatBridge } from "../wechat/editor-bridge.ts";
import { openImportPanel } from "../ui/import-panel.ts";

const BUTTON_ID = "flowedit-open-button";

function createOpenButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.textContent = "FlowEdit";
  button.title = "粘贴并插入 HTML";
  button.style.cssText = [
    "margin-left:8px",
    "padding:5px 12px",
    "border:1px solid #1677ff",
    "border-radius:5px",
    "background:#1677ff",
    "color:#fff",
    "font-size:13px",
    "line-height:20px",
    "cursor:pointer",
  ].join(";");
  button.addEventListener("click", openImportPanel);
  return button;
}

function mountButton(): void {
  if (document.getElementById(BUTTON_ID)) {
    return;
  }
  const toolbar = document.getElementById("js_toolbar_0");
  if (toolbar) {
    toolbar.appendChild(createOpenButton());
  }
}

function initialize(): void {
  void initializeWechatBridge();
  mountButton();
  const observer = new MutationObserver(mountButton);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  window.addEventListener(
    "pagehide",
    () => {
      observer.disconnect();
    },
    { once: true },
  );
}

initialize();
