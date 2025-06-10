# EditorJS 样式配置系统

这是一个专为 EditorJS 数据转换设计的样式配置系统，能够将 EditorJS 的块数据转换为带样式的 HTML 片段，所有内联样式都转换为 `span` 标签形式。

## 核心特性

### 1. 统一的 span 标签转换
- 所有 EditorJS 内联标签（`<b>`, `<i>`, `<code>`, `<mark>`, `<u>`, `<s>`, `<a>`）都转换为 `span` 标签
- 每个 `span` 标签都包含 `textstyle=""` 属性
- 样式通过 `style` 属性应用

### 2. section 标签包装
- 块级元素（段落、标题）使用 `section` 标签包装
- 内容包装在 `<span leaf="">` 中
- 统一的 `text-indent: 0px` 和 `margin-bottom: 8px` 样式

### 3. 多主题支持
- **默认主题**：经典的绿色主题
- **暗色主题**：适合暗色界面的蓝色主题
- **简洁主题**：现代简洁的设计风格

## 使用示例

### 基本用法

```javascript
import { 
  createStyleProvider, 
  defaultStyleConfig 
} from './style-config.js';
import { paragraph, header } from './blocks/index.js';

// 创建样式提供函数
const styleProvider = createStyleProvider(defaultStyleConfig);

// EditorJS 数据
const block = {
  type: 'paragraph',
  data: {
    text: '这是<b>粗体</b>和<i>斜体</i>的<mark>标记</mark>文本。'
  }
};

// 转换为 HTML
const html = paragraph(block, styleProvider);
console.log(html);
```

### 输出示例

```html
<section style="text-indent: 0px; margin-bottom: 8px; margin: 1.5em 8px; letter-spacing: 0.1em;">
  <span leaf="">这是<span textstyle="" style="font-weight: bold">粗体</span>和<span textstyle="" style="font-style: italic">斜体</span>的<span textstyle="" style="background-color: #ff6827; color: #ffffff; padding: 1px 2px; border-radius: 2px">标记</span>文本。</span>
</section>
```

## 样式配置结构

### 基础配置

```javascript
export const defaultStyleConfig = {
  // 全局基础样式
  base: {
    textAlign: 'left',
    lineHeight: 1.75,
    fontFamily: "Menlo, Monaco, 'Courier New', monospace",
    fontSize: '14px',
    color: '#3f3f3f'
  },
  
  // 标题样式
  header: {
    h1: { /* h1 样式 */ },
    h2: { /* h2 样式 */ },
    // ...
  },
  
  // 段落样式
  paragraph: {
    margin: '1.5em 8px',
    letterSpacing: '0.1em'
  },
  
  // 内联样式配置
  emphasis: {
    strong: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
    code: { /* 代码样式 */ },
    mark: { /* 标记样式 */ },
    u: { /* 下划线样式 */ },
    s: { /* 删除线样式 */ },
    link: { /* 链接样式 */ }
  }
};
```

## 支持的内联样式

| EditorJS 标签 | 转换后 | 样式配置键 | 说明 |
|---------------|--------|------------|------|
| `<b>` | `<span textstyle="">` | `emphasis.strong` | 粗体 |
| `<i>` | `<span textstyle="">` | `emphasis.em` | 斜体 |
| `<code>` | `<span textstyle="">` | `emphasis.code` | 代码 |
| `<mark>` | `<span textstyle="">` | `emphasis.mark` | 标记/高亮 |
| `<u>` | `<span textstyle="">` | `emphasis.u` | 下划线 |
| `<s>` | `<span textstyle="">` | `emphasis.s` | 删除线 |
| `<a>` | `<span textstyle="">` | `emphasis.link` | 链接 |

## 自定义主题

### 创建自定义主题

```javascript
const customTheme = {
  base: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    color: '#333'
  },
  emphasis: {
    strong: {
      fontWeight: '600',
      color: '#e74c3c'
    },
    mark: {
      backgroundColor: '#f39c12',
      color: '#fff',
      padding: '2px 4px',
      borderRadius: '3px'
    }
  }
};

const styleProvider = createStyleProvider(customTheme);
```

## API 参考

### createStyleProvider(styleConfig)

创建样式提供函数。

**参数：**
- `styleConfig` (Object): 样式配置对象

**返回：**
- Function: 样式提供函数

### styleProvider(elementType, variant)

获取指定元素的样式。

**参数：**
- `elementType` (string): 元素类型（'header', 'paragraph', 'emphasis'等）
- `variant` (string): 样式变体（'h1', 'strong', 'em'等）

**返回：**
- Object: 样式对象

### processInlineStyles(text, styleProvider)

处理文本中的内联样式。

**参数：**
- `text` (string): 包含 EditorJS 内联标签的文本
- `styleProvider` (Function): 样式提供函数

**返回：**
- string: 处理后的 HTML 文本

## 注意事项

1. **样式继承**：内联样式元素（emphasis 类型）不会继承基础样式，避免样式冲突
2. **驼峰转换**：JavaScript 驼峰命名会自动转换为 CSS 的短横线命名
3. **属性转义**：所有 HTML 属性值都会进行转义处理
4. **兼容性**：生成的 HTML 结构与用户期望的格式完全一致

## 测试

运行测试文件查看转换效果：

```bash
node test-span-conversion.js
node example-usage.js
```