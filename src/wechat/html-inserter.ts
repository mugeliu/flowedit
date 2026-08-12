import { invokeWechatEditor } from "./editor-bridge.ts";

const DANGEROUS_ELEMENT_PATTERN =
  /<\s*\/?\s*(?:script|iframe|object|embed|link|meta|base|form)\b/i;
const EVENT_HANDLER_PATTERN = /\s+on[a-z\d_-]+\s*=/i;
const JAVASCRIPT_URL_PATTERN =
  /(?:src|href|xlink:href)\s*=\s*["']?\s*javascript:/i;
const LOCAL_IMAGE_PATTERN =
  /<img\b[^>]*\bsrc\s*=\s*["']\s*(?:blob:|data:|file:|\.{0,2}\/)/i;

export class HtmlInsertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HtmlInsertionError";
  }
}

export function validateHtmlForInsertion(html: string): string {
  const normalized = html.trim();
  if (!normalized) {
    throw new HtmlInsertionError("HTML 内容不能为空。");
  }
  if (DANGEROUS_ELEMENT_PATTERN.test(normalized)) {
    throw new HtmlInsertionError("HTML 包含不允许插入的高风险标签。");
  }
  if (EVENT_HANDLER_PATTERN.test(normalized)) {
    throw new HtmlInsertionError("HTML 包含不允许插入的事件属性。");
  }
  if (JAVASCRIPT_URL_PATTERN.test(normalized)) {
    throw new HtmlInsertionError("HTML 包含不允许插入的 JavaScript 地址。");
  }
  if (LOCAL_IMAGE_PATTERN.test(normalized)) {
    throw new HtmlInsertionError(
      "HTML 图片不能使用本地路径、blob:、data: 或 file: 地址。",
    );
  }
  return normalized;
}

export async function insertHtmlIntoWechat(html: string): Promise<void> {
  const validatedHtml = validateHtmlForInsertion(html);
  await invokeWechatEditor("mp_editor_insert_html", {
    isSelect: false,
    html: validatedHtml,
  });
}
