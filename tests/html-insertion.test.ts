import assert from "node:assert/strict";
import test from "node:test";

import {
  HtmlInsertionError,
  validateHtmlForInsertion,
} from "../src/wechat/html-inserter.ts";

test("HTML 插入校验接受安全内容并清理首尾空白", () => {
  assert.equal(
    validateHtmlForInsertion("  <section><p>安全内容</p></section>\n"),
    "<section><p>安全内容</p></section>",
  );
});

test("HTML 插入校验拒绝空内容和高风险内容", () => {
  for (const html of [
    "   ",
    "<script>alert(1)</script>",
    '<p onclick="alert(1)">内容</p>',
    '<img src="blob:local-image">',
    '<img src="./images/local.jpg">',
    '<a href="javascript:alert(1)">链接</a>',
  ]) {
    assert.throws(() => validateHtmlForInsertion(html), HtmlInsertionError);
  }
});
