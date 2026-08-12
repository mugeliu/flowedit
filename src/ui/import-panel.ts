import {
  insertHtmlIntoWechat,
  validateHtmlForInsertion,
} from "../wechat/html-inserter.ts";

const PANEL_HOST_ID = "flowedit-import-panel";
const PREVIEW_DELAY_MS = 120;

const PANEL_STYLES = `
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; }
  button, textarea { font: inherit; }
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(15, 23, 42, 0.56);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #172033;
  }
  .panel {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(1240px, 100%);
    height: min(820px, 94vh);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.42);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 28px 90px rgba(15, 23, 42, 0.32);
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 18px 22px;
    border-bottom: 1px solid #e8ecf2;
  }
  .title-group { min-width: 0; }
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 650;
    line-height: 1.4;
    color: #172033;
  }
  .subtitle {
    margin: 3px 0 0;
    color: #718096;
    font-size: 13px;
    line-height: 1.5;
  }
  .close {
    display: grid;
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    place-items: center;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #64748b;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
  }
  .close:hover { background: #f1f5f9; color: #334155; }
  .close:disabled { cursor: not-allowed; opacity: 0.5; }
  .content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    min-height: 0;
  }
  .pane {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
  }
  .source-pane { border-right: 1px solid #e8ecf2; }
  .pane-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
    padding: 10px 16px;
    border-bottom: 1px solid #edf1f5;
    background: #f8fafc;
  }
  .pane-title {
    color: #334155;
    font-size: 13px;
    font-weight: 600;
  }
  .pane-note {
    color: #94a3b8;
    font-size: 12px;
  }
  textarea {
    width: 100%;
    height: 100%;
    min-height: 0;
    resize: none;
    border: 0;
    outline: 0;
    padding: 18px;
    background: #fff;
    color: #172033;
    font: 13px/1.65 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    tab-size: 2;
  }
  textarea::placeholder { color: #a0aec0; }
  textarea:focus { box-shadow: inset 3px 0 0 #1677ff; }
  textarea:disabled { background: #f8fafc; color: #64748b; }
  .preview-surface {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    padding: 16px;
    background: #edf2f7;
  }
  iframe {
    width: 100%;
    height: 100%;
    border: 1px solid #dce3eb;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 3px 14px rgba(15, 23, 42, 0.06);
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    min-height: 66px;
    padding: 12px 18px;
    border-top: 1px solid #e8ecf2;
    background: #fff;
  }
  .status {
    min-width: 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
  }
  .status[data-kind="error"] { color: #c53030; }
  .status[data-kind="success"] { color: #16803c; }
  .insert-button {
    flex: 0 0 auto;
    min-width: 138px;
    border: 1px solid #1677ff;
    border-radius: 8px;
    padding: 9px 16px;
    background: #1677ff;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .insert-button:hover:not(:disabled) {
    border-color: #0958d9;
    background: #0958d9;
  }
  .insert-button:disabled { cursor: not-allowed; opacity: 0.5; }
  @media (max-width: 820px) {
    .overlay { padding: 12px; }
    .panel { height: 96vh; border-radius: 12px; }
    .content {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: minmax(240px, 1fr) minmax(240px, 1fr);
    }
    .source-pane {
      border-right: 0;
      border-bottom: 1px solid #e8ecf2;
    }
    .preview-surface { padding: 10px; }
  }
`;

function previewDocument(html: string): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="box-sizing:border-box;max-width:677px;margin:20px auto;padding:24px;background:#fff;">
${html}
</body>
</html>`;
}

function requiredElement<T extends Element>(
  root: ShadowRoot,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`FlowEdit 界面缺少元素：${selector}`);
  }
  return element;
}

export function openImportPanel(): void {
  if (document.getElementById(PANEL_HOST_ID)) {
    return;
  }

  const host = document.createElement("div");
  host.id = PANEL_HOST_ID;
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>${PANEL_STYLES}</style>
    <div class="overlay">
      <section class="panel" role="dialog" aria-modal="true" aria-label="FlowEdit HTML 插入">
        <header class="header">
          <div class="title-group">
            <h2>FlowEdit</h2>
            <p class="subtitle">粘贴 HTML，确认实时预览后插入微信公众号编辑器。</p>
          </div>
          <button class="close" type="button" aria-label="关闭">×</button>
        </header>
        <div class="content">
          <section class="pane source-pane">
            <div class="pane-header">
              <label class="pane-title" for="flowedit-html">HTML 源码</label>
              <span class="pane-note">粘贴或输入</span>
            </div>
            <textarea
              id="flowedit-html"
              spellcheck="false"
              placeholder="在这里粘贴需要插入微信编辑器的 HTML……"
            ></textarea>
          </section>
          <section class="pane preview-pane">
            <div class="pane-header">
              <span class="pane-title">实时预览</span>
              <span class="pane-note">无脚本沙箱</span>
            </div>
            <div class="preview-surface">
              <iframe sandbox="" title="FlowEdit HTML 实时预览"></iframe>
            </div>
          </section>
        </div>
        <footer class="footer">
          <div class="status" role="status" aria-live="polite">在左侧粘贴 HTML，右侧将自动显示预览。</div>
          <button class="insert-button" type="button" disabled>插入微信编辑器</button>
        </footer>
      </section>
    </div>
  `;

  const htmlInput = requiredElement<HTMLTextAreaElement>(
    root,
    "#flowedit-html",
  );
  const iframe = requiredElement<HTMLIFrameElement>(root, "iframe");
  const status = requiredElement<HTMLDivElement>(root, ".status");
  const insertButton = requiredElement<HTMLButtonElement>(
    root,
    ".insert-button",
  );
  const closeButton = requiredElement<HTMLButtonElement>(root, ".close");
  const overlay = requiredElement<HTMLDivElement>(root, ".overlay");

  let previewTimer: number | null = null;
  let insertionInProgress = false;
  let htmlIsValid = false;

  const setStatus = (
    message: string,
    kind: "normal" | "error" | "success" = "normal",
  ): void => {
    status.textContent = message;
    status.dataset.kind = kind;
  };

  const setInsertAvailability = (): void => {
    insertButton.disabled = insertionInProgress || !htmlIsValid;
  };

  const showPreview = (html: string): void => {
    iframe.srcdoc = previewDocument(html);
  };

  const renderPreview = (): void => {
    if (!htmlInput.value.trim()) {
      htmlIsValid = false;
      showPreview("");
      setStatus("在左侧粘贴 HTML，右侧将自动显示预览。");
      setInsertAvailability();
      return;
    }

    try {
      const html = validateHtmlForInsertion(htmlInput.value);
      htmlIsValid = true;
      showPreview(html);
      setStatus("预览已同步，可以插入微信编辑器。", "success");
    } catch (error) {
      htmlIsValid = false;
      showPreview("");
      setStatus(
        error instanceof Error ? error.message : "HTML 预览失败。",
        "error",
      );
    }
    setInsertAvailability();
  };

  const schedulePreview = (): void => {
    if (previewTimer !== null) {
      window.clearTimeout(previewTimer);
    }
    previewTimer = window.setTimeout(() => {
      previewTimer = null;
      renderPreview();
    }, PREVIEW_DELAY_MS);
  };

  const close = (): void => {
    if (insertionInProgress) {
      return;
    }
    if (previewTimer !== null) {
      window.clearTimeout(previewTimer);
    }
    host.remove();
  };

  htmlInput.addEventListener("input", schedulePreview);
  insertButton.addEventListener("click", () => {
    void (async () => {
      insertionInProgress = true;
      htmlInput.disabled = true;
      closeButton.disabled = true;
      setInsertAvailability();
      setStatus("正在插入微信编辑器……");
      try {
        const html = validateHtmlForInsertion(htmlInput.value);
        await insertHtmlIntoWechat(html);
        setStatus("HTML 已插入微信编辑器。", "success");
        window.setTimeout(close, 600);
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "HTML 插入失败。",
          "error",
        );
      } finally {
        insertionInProgress = false;
        htmlInput.disabled = false;
        closeButton.disabled = false;
        setInsertAvailability();
      }
    })();
  });

  closeButton.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      close();
    }
  });
  root.addEventListener("keydown", (event) => {
    if ((event as KeyboardEvent).key === "Escape") {
      close();
    }
  });

  showPreview("");
  htmlInput.focus();
}
