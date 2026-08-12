const BRIDGE_SOURCE = "flowedit-wechat-bridge";
const DEFAULT_TIMEOUT_MS = 10_000;

interface BridgeResponse<T> {
  source: typeof BRIDGE_SOURCE;
  direction: "response";
  requestId: string;
  ok: boolean;
  payload?: T;
  error?: string;
}

let bridgeInitialization: Promise<void> | null = null;

function requestId(): string {
  return crypto.randomUUID();
}

export function initializeWechatBridge(): Promise<void> {
  if (bridgeInitialization) {
    return bridgeInitialization;
  }
  bridgeInitialization = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-flowedit-wechat-bridge="true"]',
    );
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.dataset.floweditWechatBridge = "true";
    script.src = chrome.runtime.getURL("scripts/page-injector.js");
    script.onload = () => {
      script.remove();
      resolve();
    };
    script.onerror = () => {
      script.remove();
      bridgeInitialization = null;
      reject(new Error("无法注入微信编辑器桥接脚本。"));
    };
    document.documentElement.appendChild(script);
  });
  return bridgeInitialization;
}

async function callBridge<T>(
  payload: Record<string, unknown>,
): Promise<T> {
  await initializeWechatBridge();
  const id = requestId();

  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      reject(new Error("微信编辑器响应超时。"));
    }, DEFAULT_TIMEOUT_MS);

    function handleMessage(event: MessageEvent<BridgeResponse<T>>): void {
      if (
        event.source !== window ||
        event.origin !== window.location.origin ||
        event.data?.source !== BRIDGE_SOURCE ||
        event.data.direction !== "response" ||
        event.data.requestId !== id
      ) {
        return;
      }
      window.clearTimeout(timeout);
      window.removeEventListener("message", handleMessage);
      if (event.data.ok) {
        resolve(event.data.payload as T);
      } else {
        reject(new Error(event.data.error || "微信编辑器调用失败。"));
      }
    }

    window.addEventListener("message", handleMessage);
    window.postMessage(
      {
        source: BRIDGE_SOURCE,
        direction: "request",
        requestId: id,
        action: "invoke",
        payload,
      },
      window.location.origin,
    );
  });
}

export async function invokeWechatEditor<T>(
  apiName: string,
  apiParam: Record<string, unknown>,
): Promise<T> {
  return callBridge<T>({ apiName, apiParam });
}

export async function waitForWechatEditor(): Promise<void> {
  const result = await invokeWechatEditor<{ isReady?: boolean }>(
    "mp_editor_get_isready",
    {},
  );
  if (result.isReady !== true) {
    throw new Error("微信编辑器尚未就绪。");
  }
}
