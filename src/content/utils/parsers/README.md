# HTML Parser 重构版本

这是重构后的 EditorJS HTML 解析器，采用了清晰的架构设计和简化的依赖关系。

## 架构概览

### 职责划分

- **TemplateManager** - 专门管理HTML模板
- **ProcessorRegistry** - 专门管理处理器注册
- **HtmlParser** - 专门负责解析逻辑
- **BlockProcessor** - 保持现有基类设计
- **ConfigManager** - 配置集中化管理

### 依赖流向

```
HtmlParser → ProcessorRegistry → BlockProcessor → TemplateManager
```

每个类只依赖下一层，避免循环依赖，确保架构清晰。

## 快速开始

### 基本使用

```javascript
import { createHtmlParser, parseToHtml } from './parsers/index.js';

// 方式1：使用工厂方法
const parser = createHtmlParser();
const html = parser.parseDocument(editorData);

// 方式2：使用便捷方法
const html = parseToHtml(editorData);
```

### 使用预设配置

```javascript
import { createParserWithPreset } from './parsers/index.js';

// 使用基础配置
const basicParser = createParserWithPreset('basic');

// 使用标准配置
const standardParser = createParserWithPreset('standard');

// 使用完整配置
const fullParser = createParserWithPreset('full');

// 使用严格模式配置
const strictParser = createParserWithPreset('strict');
```

### 自定义配置

```javascript
import { createHtmlParser } from './parsers/index.js';

const config = {
  templates: {
    // 自定义模板配置
    header: {
      default: '<h{{level}} class="custom-header">{{content}}</h{{level}}>'
    }
  },
  processors: {
    // 处理器配置
    header: { enabled: true, options: {} },
    paragraph: { enabled: true, options: {} }
  },
  options: {
    // 全局选项
    skipEmpty: true,
    wrapInContainer: false,
    includeMetadata: false
  }
};

const parser = createHtmlParser(config);
```

## API 接口

### HtmlParser 类

#### 解析方法

```javascript
// 解析单个块
const blockHtml = parser.parseBlock(block);

// 解析整个文档
const documentHtml = parser.parseDocument(editorData, options);

// 解析并返回元数据
const result = parser.parseWithMeta(editorData, options);
// result: { html: string, metadata: object }

// 安全解析（包含错误处理）
const result = parser.safeParse(editorData, options);
// result: { success: boolean, html: string, errors: array, warnings: array }
```

#### 配置方法

```javascript
// 注册自定义模板
parser.registerTemplate('header', '<h{{level}}>{{content}}</h{{level}}>');

// 注册自定义处理器
parser.registerProcessor('custom', CustomProcessor);

// 设置模板配置
parser.setTemplates(newTemplates);

// 更新选项
parser.updateOptions({ skipEmpty: false });
```

#### 查询方法

```javascript
// 检查块类型是否支持
const isSupported = parser.isBlockTypeSupported('header');

// 获取支持的块类型
const types = parser.getSupportedBlockTypes();

// 获取处理器统计信息
const stats = parser.getProcessorStats();

// 验证EditorJS数据
const validation = parser.validateEditorData(editorData);
```

### 便捷方法

```javascript
import {
  parseToHtml,
  parseWithMetadata,
  safeParse,
  validateEditorData,
  getSupportedBlockTypes
} from './parsers/index.js';

// 快速解析为HTML
const html = parseToHtml(editorData, config);

// 解析并获取元数据
const result = parseWithMetadata(editorData, config);

// 安全解析
const result = safeParse(editorData, config);

// 验证数据
const validation = validateEditorData(editorData, config);

// 获取支持的块类型
const types = getSupportedBlockTypes(config);
```

## 配置选项

### 模板配置

```javascript
const templates = {
  header: {
    default: '<h{{level}}>{{content}}</h{{level}}>',
    variant1: '<h{{level}} class="custom">{{content}}</h{{level}}>'
  },
  paragraph: {
    default: '<p>{{content}}</p>'
  },
  // ... 其他模板
};
```

### 处理器配置

```javascript
const processors = {
  header: {
    enabled: true,
    options: {
      // 处理器特定选项
    }
  },
  paragraph: {
    enabled: true,
    options: {}
  },
  // ... 其他处理器
};
```

### 全局选项

```javascript
const options = {
  skipEmpty: true,           // 跳过空块
  wrapInContainer: false,    // 是否包装在容器中
  includeMetadata: false,    // 是否包含元数据
  enableLogging: false,      // 启用日志
  strictMode: false,         // 严格模式
  fallbackProcessor: 'raw',  // 后备处理器
  maxBlockSize: 1000000,     // 最大块大小（字节）
  timeout: 5000,             // 超时时间（毫秒）
  encoding: 'utf-8'          // 编码
};
```

## 预设配置

### basic - 基础配置
最小功能集，只包含基本的块类型处理器。

### standard - 标准配置
常用功能，包含大部分常见的块类型处理器。

### full - 完整配置
所有功能，包含所有可用的块类型处理器。

### strict - 严格模式配置
启用所有验证和安全检查。

## 自定义处理器

### 创建自定义处理器

```javascript
import { BaseBlockProcessor } from './parsers/index.js';

class CustomBlockProcessor extends BaseBlockProcessor {
  constructor(templateManager, options = {}) {
    super(templateManager, options);
  }

  process(data, block) {
    // 实现自定义处理逻辑
    const template = this.getTemplate('custom');
    return this.renderTemplate(template, data);
  }

  preprocess(data) {
    // 数据预处理
    return data;
  }

  postprocess(html, data) {
    // HTML后处理
    return html;
  }
}

// 注册自定义处理器
parser.registerProcessor('custom', CustomBlockProcessor);
```

## 错误处理

### 验证结果格式

```javascript
const validation = {
  isValid: boolean,
  errors: string[],
  warnings: string[]
};
```

### 安全解析结果格式

```javascript
const result = {
  success: boolean,
  html: string,
  metadata: object | null,
  errors: string[],
  warnings: string[]
};
```

## 性能优化

1. **延迟实例化** - 处理器只在需要时才创建实例
2. **模板缓存** - 模板编译结果会被缓存
3. **配置验证** - 可选的配置验证以提高性能
4. **批量处理** - 支持批量注册处理器

## 迁移指南

### 从旧版本迁移

1. **更新导入路径**
   ```javascript
   // 旧版本
   import { HtmlParser } from '../parser-html.js';
   
   // 新版本
   import { HtmlParser } from './parsers/index.js';
   ```

2. **更新配置格式**
   ```javascript
   // 旧版本
   const parser = new HtmlParser(templates);
   
   // 新版本
   const parser = new HtmlParser({
     templates,
     processors: {},
     options: {}
   });
   ```

3. **更新方法调用**
   ```javascript
   // 旧版本
   const html = parser.parse(editorData);
   
   // 新版本
   const html = parser.parseDocument(editorData);
   ```

## 测试

### 单元测试示例

```javascript
import { createHtmlParser, validateEditorData } from './parsers/index.js';

describe('HtmlParser', () => {
  test('should parse basic blocks', () => {
    const parser = createHtmlParser();
    const editorData = {
      blocks: [
        { type: 'header', data: { text: 'Hello', level: 1 } },
        { type: 'paragraph', data: { text: 'World' } }
      ]
    };
    
    const html = parser.parseDocument(editorData);
    expect(html).toContain('<h1>Hello</h1>');
    expect(html).toContain('<p>World</p>');
  });
  
  test('should validate editor data', () => {
    const validation = validateEditorData({ blocks: [] });
    expect(validation.isValid).toBe(true);
  });
});
```

## 贡献指南

1. 遵循现有的代码风格
2. 添加适当的注释和文档
3. 编写单元测试
4. 确保所有测试通过
5. 更新相关文档

## 许可证

MIT License

## 更新日志

### v2.0.0
- 重构整体架构
- 简化依赖关系
- 统一接口设计
- 配置集中化
- 处理器标准化
- 添加预设配置
- 改进错误处理
- 性能优化