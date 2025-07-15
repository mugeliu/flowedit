# Parser 模块优化建议

## 概述
基于当前 Parser 模块的分析，以下是重点优化建议，主要聚焦于：简化 List 模板结构、统一条件渲染处理、解耦内联样式处理器和渲染器、以及统一错误处理。

## 1. 简化 List 模板结构（重点）

### 当前问题
List 模板的 nested 定义增加了复杂性，维护成本高。每种列表类型都需要定义三个模板（wrapper、item、nested）。

### 当前实现
```json
"List": {
  "ordered": {
    "wrapper": "<ol style='...'>{{items}}</ol>",
    "item": "<li style='...'>{{content}}</li>",
    "nested": "<ol style='...'>{{items}}</ol>"  // 重复定义
  }
}
```

### 优化方案
移除 nested 定义，通过递归复用同一配置，用 CSS 类或内联样式控制嵌套层级差异。

#### 新的模板结构
```json
"list": {
  "ordered": {
    "wrapper": "<ol style='list-style: decimal; margin: 0.5em 0; padding-left: 1.5em;' class='{{class}}'>{{items}}</ol>",
    "item": "<li style='padding: 4px 0; line-height: 1.6;'>{{content}}</li>"
  },
  "unordered": {
    "wrapper": "<ul style='list-style: disc; margin: 0.5em 0; padding-left: 1.5em;' class='{{class}}'>{{items}}</ul>",
    "item": "<li style='padding: 4px 0; line-height: 1.6;'>{{content}}</li>"
  },
  "checklist": {
    "wrapper": "<ul style='list-style: none; margin: 0.5em 0; padding-left: 0.5em;' class='{{class}}'>{{items}}</ul>",
    "item": "<li style='padding: 4px 0; display: flex; align-items: flex-start;'><span style='margin-right: 0.5em;'>{{checkbox}}</span><span>{{content}}</span></li>",
    "checked": "✅",
    "unchecked": "☐"
  }
}
```

#### 代码修改 (ListRenderer.js)
```javascript
class ListRenderer extends BaseBlockRenderer {
  render(data, renderer, depth = 0) {
    const style = data.style || 'unordered';
    const template = this.templateLoader.getBlockTemplate('List')?.[style];
    if (!template) return '';

    const items = (data.items || []).map(item => 
      this.renderItem(item, style, template, renderer, depth)
    ).join('');

    return this.replaceVariables(template.wrapper, {
      items,
      class: depth > 0 ? 'nested-list' : 'main-list'
    });
  }

  renderItem(item, style, template, renderer, depth) {
    const itemData = typeof item === 'string' ? { content: item } : item;
    const content = renderer.processInlineStyles(itemData.content || '');
    
    // 处理嵌套列表
    let nestedContent = '';
    if (itemData.items?.length > 0) {
      // 递归渲染，增加深度
      nestedContent = this.render(
        { style, items: itemData.items }, 
        renderer, 
        depth + 1
      );
    }
    
    // 处理 checklist
    const checkbox = style === 'checklist' 
      ? (itemData.meta?.checked ? template.checked : template.unchecked)
      : '';
    
    return this.replaceVariables(template.item, {
      content: content + nestedContent,
      checkbox
    });
  }
}
```

## 2. 统一条件渲染处理（使用占位符方案）

### 优化方案
使用 `{{?field}}` 占位符语法，配合 optional 配置定义可选内容。

#### 新的模板格式
```json
"quote": {
  "template": "<blockquote style='border-left: 4px solid #10b981;'>{{text}}{{?caption}}</blockquote>",
  "optional": {
    "caption": "<footer style='text-align: right; margin-top: 8px;'>— {{value}}</footer>"
  }
}

"image": {
  "template": "<figure style='margin: 1em 0;'><img src='{{url}}' alt='{{alt}}' />{{?caption}}</figure>",
  "optional": {
    "caption": "<figcaption style='text-align: center;'>{{value}}</figcaption>"
  }
}
```

#### 代码修改 (BaseBlockRenderer.js)
```javascript
class BaseBlockRenderer {
  renderTemplate(config, data) {
    let template = config.template || config;
    
    // 处理可选占位符
    template = this.processOptionalFields(template, data, config.optional || {});
    
    // 处理普通变量
    return this.replaceVariables(template, data);
  }
  
  processOptionalFields(template, data, optionalConfigs) {
    return template.replace(/\{\{\?(\w+)\}\}/g, (match, fieldName) => {
      if (data[fieldName] && optionalConfigs[fieldName]) {
        // 渲染可选内容
        return this.replaceVariables(optionalConfigs[fieldName], {
          value: data[fieldName]
        });
      }
      return ''; // 字段不存在或为空时，移除占位符
    });
  }
}
```

## 3. 解耦 InlineStyleProcessor 和 Renderer（重点）

### 当前问题
InlineStyleProcessor 直接修改 Renderer 的 globalLinkCounter，造成强耦合。

### 优化方案：回调机制
通过回调函数传递链接处理逻辑，让 Renderer 保持对链接管理的控制权。

#### 代码修改 (InlineStyleProcessor.js)
```javascript
class InlineStyleProcessor {
  constructor(templateLoader) {
    this.templateLoader = templateLoader;
  }

  /**
   * 处理内联样式
   * @param {string} text - 要处理的文本
   * @param {Object} callbacks - 回调函数集合
   * @param {Function} callbacks.onLink - 链接处理回调
   * @returns {string} 处理后的文本
   */
  processStyles(text, callbacks = {}) {
    if (!text || typeof text !== "string") return text || "";
    
    // 1. 处理非链接样式
    text = this.processNonLinkStyles(text);
    
    // 2. 处理链接（如果提供了回调）
    if (callbacks.onLink) {
      text = this.processLinks(text, callbacks.onLink);
    }
    
    return text;
  }

  processLinks(text, onLinkCallback) {
    return text.replace(/<a([^>]*)>([^<]*)<\/a>/g, (match, attributes, content) => {
      const hrefMatch = attributes.match(/href=["']([^"']*)['"]/);
      const href = hrefMatch?.[1] || "";
      
      // 微信公众号文章链接保持原样
      if (href.startsWith("https://mp.weixin.qq.com/s/")) {
        const aStyle = this.templateLoader.getInlineStyle("a") || "";
        return `<a href="${href}" style="${aStyle}">${content}</a>`;
      }
      
      // 其他链接通过回调处理
      const linkData = onLinkCallback(href, content);
      
      if (linkData.asFootnote) {
        const aStyle = this.templateLoader.getInlineStyle("a") || "";
        const supStyle = this.templateLoader.getInlineStyle("sup") || "";
        return `<span style="${aStyle}">${content}</span><sup style="${supStyle}">[${linkData.index}]</sup>`;
      }
      
      return match;
    });
  }

  processNonLinkStyles(text) {
    // 保持现有逻辑不变
    return text.replace(/<(code|u|mark|i|em|strong|b|sup)(?:\s[^>]*)?>/g, (match, tag) => {
      const style = this.templateLoader.getInlineStyle(tag);
      return style ? `<${tag} style="${style}">` : match;
    });
  }
}
```

#### 代码修改 (Renderer.js)
```javascript
class Renderer {
  constructor(templateLoader, inlineStyleProcessor) {
    this.templateLoader = templateLoader;
    this.inlineStyleProcessor = inlineStyleProcessor;
    this.globalLinkCounter = 1;
    this.extractedLinks = [];
  }

  processInlineStyles(text) {
    return this.inlineStyleProcessor.processStyles(text, {
      onLink: (href, content) => {
        // 在 Renderer 中管理链接状态
        const index = this.globalLinkCounter++;
        this.extractedLinks.push(`[${index}]: ${href}`);
        
        return {
          asFootnote: true,
          index: index
        };
      }
    });
  }
}
```

## 4. 统一错误处理（重点）

### 创建专门的错误类和错误处理机制

#### 新建 ParserError.js
```javascript
// 自定义错误类
export class ParserError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'ParserError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }

  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

// 错误代码常量
export const ErrorCodes = {
  // 模板相关
  TEMPLATE_NOT_LOADED: 'TEMPLATE_NOT_LOADED',
  TEMPLATE_INVALID: 'TEMPLATE_INVALID',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  
  // 数据相关
  INVALID_EDITOR_DATA: 'INVALID_EDITOR_DATA',
  INVALID_BLOCK_TYPE: 'INVALID_BLOCK_TYPE',
  INVALID_BLOCK_DATA: 'INVALID_BLOCK_DATA',
  
  // 渲染相关
  RENDER_FAILED: 'RENDER_FAILED',
  RENDERER_NOT_FOUND: 'RENDERER_NOT_FOUND',
  
  // 处理相关
  INLINE_STYLE_ERROR: 'INLINE_STYLE_ERROR',
  VARIABLE_REPLACE_ERROR: 'VARIABLE_REPLACE_ERROR'
};
```

#### 在各模块中使用统一错误处理

```javascript
// TemplateLoader.js
loadTemplate(templateSource) {
  try {
    const template = typeof templateSource === "string" 
      ? JSON.parse(templateSource) 
      : templateSource;
    
    // 基础验证
    if (!template || typeof template !== 'object') {
      throw new ParserError(
        '模板格式无效',
        ErrorCodes.TEMPLATE_INVALID,
        { templateSource }
      );
    }
    
    if (!template.blocks || !template.inlineStyles) {
      throw new ParserError(
        '模板缺少必要的 blocks 或 inlineStyles 部分',
        ErrorCodes.TEMPLATE_INVALID,
        { template }
      );
    }
    
    this.template = template;
    this.isLoaded = true;
    return true;
  } catch (error) {
    if (error instanceof ParserError) {
      throw error;
    }
    throw new ParserError(
      `模板加载失败: ${error.message}`,
      ErrorCodes.TEMPLATE_INVALID,
      { originalError: error }
    );
  }
}

// Renderer.js
renderBlock(block) {
  if (!block || !block.type) {
    throw new ParserError(
      '无效的块数据：缺少必要字段',
      ErrorCodes.INVALID_BLOCK_DATA,
      { block }
    );
  }

  const renderer = this.rendererRegistry.getRenderer(block.type);
  if (!renderer) {
    throw new ParserError(
      `未找到块类型 "${block.type}" 的渲染器`,
      ErrorCodes.RENDERER_NOT_FOUND,
      { blockType: block.type, availableTypes: this.rendererRegistry.getTypes() }
    );
  }

  try {
    return renderer.render(block.data || {}, this);
  } catch (error) {
    if (error instanceof ParserError) {
      throw error;
    }
    throw new ParserError(
      `渲染块失败: ${error.message}`,
      ErrorCodes.RENDER_FAILED,
      { block, originalError: error }
    );
  }
}

// index.js - 顶层错误处理
convert(editorData, template) {
  try {
    // 验证输入
    if (!editorData) {
      throw new ParserError(
        'EditorJS 数据不能为空',
        ErrorCodes.INVALID_EDITOR_DATA
      );
    }
    
    if (!editorData.blocks || !Array.isArray(editorData.blocks)) {
      throw new ParserError(
        'EditorJS 数据格式无效：缺少 blocks 数组',
        ErrorCodes.INVALID_EDITOR_DATA,
        { editorData }
      );
    }
    
    // 加载模板
    if (template && !this.templateLoader.loadTemplate(template)) {
      throw new ParserError(
        '模板加载失败',
        ErrorCodes.TEMPLATE_NOT_LOADED
      );
    }
    
    // 确保模板已加载
    if (!this.templateLoader.isTemplateLoaded()) {
      throw new ParserError(
        '没有可用的模板',
        ErrorCodes.TEMPLATE_NOT_LOADED
      );
    }
    
    // 渲染
    return this.renderer.render(editorData);
  } catch (error) {
    // 记录错误日志
    console.error('[Parser Error]', error.toString(), error.context);
    
    // 可以选择返回空字符串或重新抛出错误
    if (error instanceof ParserError) {
      throw error;
    }
    throw new ParserError(
      `转换失败: ${error.message}`,
      ErrorCodes.RENDER_FAILED,
      { originalError: error }
    );
  }
}
```

## 5. 模板验证（基础版）

确保模板格式正确，防止运行时错误。

```javascript
// TemplateValidator.js
export class TemplateValidator {
  static validate(template) {
    const errors = [];
    
    // 检查必需的顶级字段
    const requiredFields = ['blocks', 'inlineStyles'];
    requiredFields.forEach(field => {
      if (!template[field]) {
        errors.push(`缺少必需字段: ${field}`);
      }
    });
    
    // 检查基本块类型
    if (template.blocks) {
      const essentialBlocks = ['paragraph', 'header'];
      essentialBlocks.forEach(blockType => {
        if (!template.blocks[blockType]) {
          errors.push(`缺少基本块类型: ${blockType}`);
        }
      });
    }
    
    // 检查占位符匹配
    this.validatePlaceholders(template, errors);
    
    if (errors.length > 0) {
      throw new ParserError(
        '模板验证失败',
        ErrorCodes.TEMPLATE_INVALID,
        { errors }
      );
    }
    
    return true;
  }
  
  static validatePlaceholders(obj, errors, path = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        // 检查 {{ 和 }} 是否匹配
        const openCount = (value.match(/\{\{/g) || []).length;
        const closeCount = (value.match(/\}\}/g) || []).length;
        if (openCount !== closeCount) {
          errors.push(`占位符不匹配: ${currentPath}`);
        }
      } else if (value && typeof value === 'object') {
        this.validatePlaceholders(value, errors, currentPath);
      }
    });
  }
}
```

## 实施建议

1. **第一阶段**（最高优先级）：
   - 解耦 InlineStyleProcessor 和 Renderer
   - 实现统一错误处理

2. **第二阶段**：
   - 简化 List 模板结构
   - 实现占位符条件渲染

3. **第三阶段**：
   - 添加基础模板验证
   - 完善错误日志和调试信息

## 总结

这些优化将带来以下好处：
- **更好的可维护性**：模块解耦，职责清晰
- **更简洁的模板**：移除重复定义，统一条件渲染语法
- **更好的错误处理**：统一的错误类型和详细的错误上下文
- **更容易调试**：清晰的错误信息和错误追踪