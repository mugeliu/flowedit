# FlowEdit

FlowEdit 是一个只运行在微信公众号文章编辑页的 Chrome 扩展，用于粘贴 HTML、实时预览并插入微信编辑器。

## 功能

1. 在左侧输入区粘贴 HTML 源码。
2. 在右侧无脚本沙箱中自动显示预览。
3. 通过安全校验后，将完整 HTML 一次性插入微信编辑器。

扩展不读取本地 HTML 文件或文章文件夹，不处理 Markdown，不上传本地图片，也不包含 Editor.js、模板、历史记录、React Popup 或后台 AI 服务。

## 工作原理

- FlowEdit 通过 Chrome 内容脚本挂载到微信公众号文章编辑页。
- 右侧预览使用 `sandbox` iframe 渲染用户粘贴的 HTML，默认禁止脚本执行。
- 点击“插入微信编辑器”后，扩展通过页面桥接调用微信编辑器的 `mp_editor_insert_html` JSAPI。
- 预览与插入是两条独立链路；控制台出现 iframe 阻止脚本执行的提示，表示预览沙箱正在生效，不代表微信 JSAPI 调用失败。

## HTML 限制

- 内容不能为空。
- 禁止 `script`、`iframe`、`object`、`embed`、`link`、`meta`、`base` 和 `form` 等高风险标签。
- 禁止事件属性和 `javascript:` 地址。
- 图片不能使用 `blob:`、`data:`、`file:` 或相对路径，必须使用微信可访问的远程 URL。
- 校验或插入失败时，不会向微信编辑器写入残缺正文。

## 使用

```bash
npm install
npm run verify
```

然后：

1. 打开 `chrome://extensions/`。
2. 开启开发者模式。
3. 选择“加载已解压的扩展程序”。
4. 选择项目中的 `dist/`。
5. 打开微信公众号文章编辑页。
6. 点击微信工具栏中的 `FlowEdit`。
7. 在左侧粘贴 HTML，确认右侧预览后点击“插入微信编辑器”。

## 预览安全说明

预览 iframe 不包含 `allow-scripts` 权限。不要为了消除浏览器控制台中的沙箱提示而开启脚本权限，否则用户粘贴的 HTML 可能在微信公众号页面上下文中执行非预期代码。

## 开发命令

```bash
npm run typecheck
npm test
npm run build
npm run verify
```

## 项目结构

```text
src/
  content/   Chrome 内容脚本入口
  ui/        HTML 输入与实时预览面板
  wechat/    微信编辑器桥接与 HTML 插入
scripts/
  page-injector.js
assets/
  icons/
tests/
```
