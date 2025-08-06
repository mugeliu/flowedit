# AI 风格化内容生成服务 - 需求文档

## 核心功能概述

构建一个智能内容风格化系统，将用户的任意文本内容转换为符合特定设计风格的微信公众号 HTML 格式。

## 系统架构设计

### 1. 风格 DNA 系统

**定义**：风格 DNA 是一套完整的样式配置规则，**严格限制在微信允许的 CSS 属性范围内**：

- 字体配置：`font-size`, `font-weight`, `color`, `line-height`, `letter-spacing`
- 背景色彩：`background-color`（仅纯色，不使用复杂渐变）
- 间距规范：`margin`, `padding`（使用 px 或 vw 单位）
- 边框装饰：`border`, `border-radius`, `box-shadow`
- 对齐方式：`text-align`, `vertical-align`
- 显示控制：`display`（推荐使用 flex），`opacity`

**禁止使用**：`position`, `transform`, `z-index`（除非配合 flex 使用）, 所有动画属性

**存储格式**：JSON 配置对象，仅包含微信支持的 CSS 属性和数值

### 2. 内容层次识别系统

**功能**：AI 自动解析用户输入内容，识别以下结构：

- 主标题（H1 级别）
- 副标题（H2-H3 级别）
- 正文段落
- 强调文本（重点内容）
- 引用内容
- 列表项目
- 分隔符/过渡段落

**输出**：结构化的内容对象，每个元素带有层次标签

### 3. 风格映射规则

**机制**：为每种内容层次定义对应的样式应用规则

```
内容层次 → 风格DNA中的样式配置 → CSS样式输出
主标题 → 风格DNA.主标题样式 → H1的CSS类
正文 → 风格DNA.正文样式 → P的CSS类
```

## 用户交互流程

### 首次风格创建流程

```
输入：
1. 原始内容（纯文本，任意格式）
2. 风格主题名称（如"新粗野主义"、"极简主义"）
3. 风格特征描述（详细的设计风格描述）

处理步骤：
1. 内容结构化分析
2. 基于风格描述生成风格DNA
3. 应用风格DNA到内容结构
4. 生成微信兼容HTML
5. 保存风格DNA供后续使用

输出：
- 风格化的HTML内容片段（仅内容部分）
- 风格DNA配置文件
- 样式预览说明
```

### 复用风格流程

```
输入：
1. 新的原始内容
2. 指定已有的风格主题

处理步骤：
1. 内容结构化分析
2. 加载对应风格DNA
3. 直接应用样式规则
4. 生成HTML

输出：
- 风格一致的HTML内容片段
```

### 风格调整流程

```
输入：
1. 具体的样式调整需求
2. 指定风格主题

处理步骤：
1. 修改风格DNA中的对应参数
2. 重新生成样式规则
3. 更新保存风格DNA

输出：
- 更新后的风格DNA
- 调整说明
```

## 技术实现要求

### 微信公众号 HTML 严格规范

#### ✅ 允许使用的 HTML 标签

- 文本标签：`<p>`, `<h1>`~`<h6>`, `<strong>`, `<b>`, `<em>`, `<i>`, `<u>`, `<br>`, `<span>`
- 列表标签：`<ul>`, `<ol>`, `<li>`
- 其他标签：`<a>`, `<img>`, `<svg>`, `<section>`（替代 div）

#### ❌ 严禁使用的 HTML 标签

- `<div>` - **必须用`<section>`替代**
- `<script>`, `<style>`, `<iframe>`, `<form>`, `<input>` 等交互标签

#### ✅ 允许使用的 CSS 属性

- **文本样式**：`font-size`, `color`, `font-weight`, `line-height`, `letter-spacing`, `text-align`, `text-decoration`
- **布局样式**：`margin`, `padding`, `display`, `vertical-align`, `overflow`
- **视觉效果**：`background-color`, `border`, `border-radius`, `box-shadow`, `opacity`

#### ❌ 严禁使用的 CSS 属性

- **`position`** - 完全失效，包括 relative、absolute、fixed
- **`transform`** - 在暗黑模式下失效
- **百分比负值** - 如`margin-top: -100%`
- **媒体查询**、**伪类选择器**、**关键帧动画**

#### 强制要求

- **必须使用内联样式**：所有样式通过`style`属性定义
- **禁用 id 属性**：微信会删除所有 id 属性
- **单位限制**：推荐使用`px`、`vw`、`vh`，避免百分比
- **图片要求**：必须使用微信素材库链接，设置 width 和 height 属性

### 风格生成规则

1. **微信规范优先**：所有样式生成必须严格遵循微信 HTML 限制
2. **创造性原则**：在允许的 CSS 属性范围内进行创新设计
3. **一致性原则**：同一风格 DNA 下，相同内容层次保持样式一致
4. **移动适配原则**：生成的样式适合微信移动端阅读体验
5. **简洁美观原则**：在技术限制下实现最佳视觉效果

### 输入输出格式规范

#### 输入格式示例

```
原始内容：
"
# 人工智能的未来发展
随着技术的不断进步，人工智能正在改变我们的生活方式。

## 主要应用领域
- 医疗健康
- 教育培训
- 智能制造

*这是一个充满机遇的时代。*
"

风格主题：新粗野主义
风格特征：大胆的几何形状、原始材料质感、强烈色彩对比、不对称布局、工业风格元素
```

#### 输出格式要求

```html
<!-- 仅输出应用风格DNA的内容部分，严格遵循微信规范 -->
<section style="margin: 20px 0; padding: 16px; background-color: #f8f9fa;">
  <h1
    style="font-size: 24px; color: #2c3e50; line-height: 1.2; text-align: center; margin: 0 0 16px 0;"
  >
    人工智能的未来发展
  </h1>
  <p
    style="font-size: 16px; color: #333333; line-height: 1.75; margin: 0 0 16px 0;"
  >
    随着技术的不断进步，人工智能正在改变我们的生活方式。
  </p>
  <h2 style="font-size: 20px; color: #34495e; margin: 20px 0 12px 0;">
    主要应用领域
  </h2>
  <ul style="padding-left: 20px; margin: 0 0 16px 0;">
    <li
      style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 8px;"
    >
      医疗健康
    </li>
    <li
      style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 8px;"
    >
      教育培训
    </li>
    <li
      style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 8px;"
    >
      智能制造
    </li>
  </ul>
  <p style="font-size: 16px; color: #333333; line-height: 1.75; margin: 0;">
    <em style="color: #e74c3c; font-style: italic;"
      >这是一个充满机遇的时代。</em
    >
  </p>
</section>
```

**关键要求**：

- 使用`<section>`替代`<div>`作为容器
- 所有样式必须内联，不使用 class 或 id
- 只使用微信支持的 CSS 属性
- 不使用 position、transform、复杂动画等被禁属性

## 系统优势总结

1. **智能化**：AI 完全驱动的样式生成，无需人工设计
2. **个性化**：每个用户每种风格都有独特的 DNA 配置
3. **一致性**：确保同一风格下内容样式的统一性
4. **可扩展**：支持用户自定义调整和风格迭代
5. **高效性**：风格 DNA 复用机制，快速处理新内容

## 实现重点

### 对 AI 的具体要求

1. 深度理解风格特征描述，转化为具体的设计参数
2. 准确识别内容结构和层次关系
3. 创造性地生成视觉样式，避免模板化
4. 确保生成的 CSS 符合微信平台限制
5. 维护风格的前后一致性

### 质量控制标准

- **微信规范符合度**：严格检查是否使用了被禁的 HTML 标签和 CSS 属性
- **内联样式完整性**：确保所有样式都通过 style 属性定义
- **移动端显示效果**：验证在微信内置浏览器的显示效果
- **暗黑模式兼容性**：避免使用在暗黑模式下会失效的属性
- **风格一致性检查**：同一风格 DNA 下相同内容层次的样式统一性

### 对 AI 的关键约束

1. **绝对禁止使用**：`<div>`, `position`, `transform`, `id`属性, 外部 CSS
2. **强制要求使用**：内联样式, `<section>`容器, 微信支持的 CSS 属性
3. **单位限制**：优先使用 px, 可使用 vw/vh, 避免百分比负值
4. **布局策略**：基于标准文档流 + flex 布局，不依赖定位
5. **兼容性优先**：所有生成的代码必须在微信平台完美显示
