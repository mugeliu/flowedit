# 微信公众号 HTML 样式规范指南

## ✅ 可以使用的 HTML 标签

### 基础文本标签

- `<p>` - 段落
- `<h1>` ~ `<h6>` - 标题
- `<strong>` 或 `<b>` - 加粗
- `<em>` 或 `<i>` - 斜体
- `<u>` - 下划线
- `<br>` - 换行
- `<span>` - 行内元素

### 列表标签

- `<ul>` - 无序列表
- `<ol>` - 有序列表
- `<li>` - 列表项

### 其他标签

- `<a>` - 超链接
- `<img>` - 图片
- `<svg>` - SVG 图形

### 微信特有标签

- `<mpvoice>` - 语音
- `<mpvideo>` - 视频

## ✅ 可以使用的 CSS 属性

### 文本样式

- `font-size` - 字体大小
- `color` - 文字颜色
- `font-weight` - 字体粗细
- `font-style` - 字体样式
- `line-height` - 行高
- `letter-spacing` - 字间距
- `text-align` - 文本对齐
- `text-decoration` - 文本装饰

### 布局样式

- `margin` - 外边距
- `padding` - 内边距
- `display` - 显示类型（block, inline-block 等）
- `vertical-align` - 垂直对齐
- `float` - 浮动（谨慎使用）
- `overflow` - 溢出处理

### 背景和边框

- `background-color` - 背景色
- `background` - 背景（支持渐变，但需测试兼容性）
- `border` - 边框
- `border-radius` - 圆角
- `box-shadow` - 阴影

### 其他属性

- `opacity` - 透明度
- `z-index` - 层级（需配合 display:flex 使用）
- `pointer-events` - 交互控制
- `transform` - 变换（部分支持，需测试）
- `scroll-snap-type` - 滚动捕捉

## ❌ 不可以使用的功能

### 被过滤的 CSS 属性

- `position` - 定位属性（absolute, relative, fixed 等）**完全失效**
- `transform` - 变换属性（在某些情况下失效，特别是暗黑模式）
- 百分比单位 - 如 `margin-top: -100%`，`transform: translateY(-100%)`

### 不支持的 HTML 标签

- `<script>` - 脚本标签
- `<style>` - 样式块
- `<iframe>` - 内联框架
- `<object>` - 对象
- `<embed>` - 嵌入内容
- `<form>` - 表单
- `<input>` - 输入框
- `<audio>` - 音频（使用`<mpvoice>`替代）
- `<video>` - 视频（使用`<mpvideo>`替代）
- `<div>` - 容器（使用`<section>`替代）

### 不支持的 CSS 功能

- 外部 CSS 文件引入
- `<style>`标签内的 CSS
- 媒体查询 `@media`
- 关键帧动画 `@keyframes`
- 伪类选择器 `:hover`、`:active`等
- CSS 选择器（因为没有`<style>`标签）
- CSS counter 不支持

### 被删除的属性

- `id` 属性 - **完全被删除**
- 事件处理属性 - `onclick`、`onload`等

## ⚠️ 特殊限制和注意事项

### SVG 相关限制

- 不能嵌套 SVG 标签
- 图片必须使用素材库链接，不支持外链或 base64
- `<g>`标签内的 style 在 iOS 上失效
- 某些 SVG 动画属性在不同系统表现不一致

### 图片限制

- GIF 不能超过 300 帧
- 图片大小不能超过 10M
- 普通图片总像素不能超过 600 万
- 宽度建议不超过 1080px
- 必须设置 width 和 height 属性

### 布局限制

- 无法使用定位布局
- 推荐使用`display:flex`配合`z-index`控制层级
- 不能使用媒体查询，建议使用 vw/vh 单位做响应式

### 暗黑模式影响

- 深色模式会给元素添加 transform 属性
- 可能导致层级混乱
- 建议使用`display:flex`和`z-index`控制层级

## 💡 最佳实践

### 推荐的单位

- 使用`px`作为主要单位
- 使用`vw`、`vh`做响应式适配
- 避免使用百分比`%`

### 推荐的布局方式

- 使用标准文档流布局
- 利用`display:flex`进行布局
- 使用`text-align:center`居中对齐

### 样式编写方式

- **必须使用内联样式**：`<p style="color:red;">`
- 不能使用外部 CSS 或`<style>`标签
- 建议将常用样式组合成模板

### 图片处理

- 上传到微信素材库后获取链接
- 添加圆角和阴影美化：`border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.15);`
- 使用`max-width:100%`保证响应式

### 兼容性测试

- 多设备预览测试
- 注意 iOS 和 Android 的差异
- 测试暗黑模式下的表现

## 📝 HTML 模板示例

```html
<!-- 标题 -->
<h1
  style="font-size:24px; color:#2c3e50; line-height:1.2; letter-spacing:1px; text-align:center; margin:0.5em 0;"
>
  文章标题
</h1>

<!-- 正文段落 -->
<p
  style="font-size:16px; color:#333333; line-height:1.75; letter-spacing:0.5px; margin:0 0 1em 0;"
>
  这里是正文内容，使用了适当的行高和字间距来增强可读性。
</p>

<!-- 居中图片 -->
<p style="text-align:center; margin:1.5em 0;">
  <img
    src="素材库图片链接"
    alt="图片描述"
    style="max-width:100%; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.15);"
  />
</p>
```

---

**总结**：微信公众号的 HTML 非常受限，主要依靠内联样式实现排版，不支持复杂的定位、动画和交互效果。重点是使用支持的基础样式属性，通过合理的字体、颜色、间距和简单的视觉效果来实现美观的排版。


行高应该高于文字高度的30%  
