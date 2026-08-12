# FlowEdit 开发说明

所有项目规则以 `AGENTS.md` 为准，实时进度以 `ROADMAP.md` 为准。

## 当前边界

- 只保留粘贴 HTML、实时预览和插入微信编辑器。
- 不读取本地 HTML 文件或文章文件夹，不处理 Markdown 或上传本地图片。
- 不恢复 Editor.js、模板、历史记录、侧边栏、React Popup 或后台 AI 服务。
- 不实现飞书同步。

## 验证命令

```bash
npm run verify
```
