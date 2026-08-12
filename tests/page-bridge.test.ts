import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const BRIDGE_SOURCE = "flowedit-wechat-bridge";
const bridgeScript = readFileSync("scripts/page-injector.js", "utf8");

interface InvokeOptions {
  apiName: string;
  apiParam: Record<string, unknown>;
  sucCb(result: Record<string, unknown>): void;
  errCb(error: unknown): void;
}

function requestInvoke(
  invoke: (options: InvokeOptions) => void,
): Record<string, unknown> {
  let messageHandler:
    | ((event: {
        source: unknown;
        origin: string;
        data: Record<string, unknown>;
      }) => void)
    | null = null;
  const responses: Array<Record<string, unknown>> = [];
  const fakeWindow = {
    location: { origin: "https://mp.weixin.qq.com" },
    wx: { uin: "123" },
    __MP_Editor_JSAPI__: { invoke },
    addEventListener(
      type: string,
      handler: typeof messageHandler,
    ): void {
      if (type === "message") {
        messageHandler = handler;
      }
    },
    postMessage(message: Record<string, unknown>): void {
      responses.push(message);
    },
  };

  vm.runInNewContext(bridgeScript, {
    window: fakeWindow,
    Error,
    String,
  });

  assert.ok(messageHandler);
  messageHandler({
    source: fakeWindow,
    origin: fakeWindow.location.origin,
    data: {
      source: BRIDGE_SOURCE,
      direction: "request",
      requestId: "request-1",
      action: "invoke",
      payload: {
        apiName: "mp_editor_insert_html",
        apiParam: { html: "<p>正文</p>" },
      },
    },
  });
  assert.equal(responses.length, 1);
  return responses[0];
}

test("页面桥接调用微信编辑器并返回成功结果", () => {
  const response = requestInvoke((options) => {
    assert.equal(options.apiName, "mp_editor_insert_html");
    assert.deepEqual(
      JSON.parse(JSON.stringify(options.apiParam)),
      { html: "<p>正文</p>" },
    );
    options.sucCb({ inserted: true });
  });

  assert.equal(response.ok, true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(response.payload)),
    { inserted: true },
  );
});

test("页面桥接透传微信编辑器错误", () => {
  const response = requestInvoke((options) => {
    options.errCb({ err_msg: "插入失败" });
  });

  assert.equal(response.ok, false);
  assert.equal(response.error, "插入失败");
});
