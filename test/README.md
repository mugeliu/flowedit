# FlowEdit 测试文件组织 - 简化版

本文档描述了FlowEdit项目测试文件的简化组织结构，采用最小分类原则，便于维护和查找。

## 设计原则

1. **最小分类**: 只保留必要的分类，避免过度复杂化
2. **清晰注释**: 每个文件开头都有详细的注释说明测试内容
3. **扁平结构**: 减少嵌套层级，提高文件查找效率
4. **统一命名**: 采用一致的命名规则

## 简化后的目录结构

```
test/
├── README.md                    # 测试说明文档
├── run-all-tests.js            # 统一测试入口
├── unit/                        # 所有单元测试
│   ├── editor-simple.test.js    # 编辑器简单功能测试
│   ├── editor-integration.test.js # 编辑器集成测试
│   ├── styled-parser.test.js    # 样式解析器测试
│   └── template-parser.test.js  # 模板解析器测试
└── examples/                    # 所有示例和预览
    ├── simple-demo.html         # 基础用法示例
    ├── wechat-demo.html         # 微信集成示例HTML
    ├── wechat-demo.js           # 微信集成示例JS
    ├── html-parser.js           # HTML解析器示例
    ├── index.html               # 通用测试页面
    ├── styled-result.html       # 样式解析器预览
    └── template-result.html     # 模板解析器预览
```

## ✅ 重组完成状态

所有文件已成功重组，目录结构清晰，测试运行正常。

## 简化优势

1. **结构简单**: 只有两个主要分类，降低认知负担
2. **查找便捷**: 所有测试文件集中在unit目录，所有示例集中在examples目录
3. **维护容易**: 减少目录层级，文件移动和重命名更简单
4. **扩展灵活**: 新增文件只需考虑是测试还是示例
5. **注释清晰**: 每个文件开头的注释说明了具体测试内容

## 使用说明

### 运行自动化测试

```bash
# 运行所有测试
node test/run-all-tests.js

# 运行特定测试
node test/unit/styled-parser.test.js
node test/unit/template-parser.test.js
node test/unit/editor-simple.test.js
```

### 查看示例和预览

在浏览器中打开以下文件:

- **基础用法示例**: `test/examples/simple-demo.html`
- **微信集成示例**: `test/examples/wechat-demo.html`
- **样式解析器预览**: `test/examples/styled-result.html`
- **模板解析器预览**: `test/examples/template-result.html`
- **编辑器集成测试**: `test/unit/editor-integration.test.js`

### 开发新测试

1. **单元测试**: 在 `test/unit/` 目录下创建 `*.test.js` 文件，文件开头添加清晰的注释说明
2. **示例文件**: 在 `test/examples/` 目录下创建相应文件
3. **命名规则**: 测试文件使用 `功能名.test.js` 格式，示例文件使用描述性名称

## 完成状态

✅ **简化重组已完成** (2024-01-XX)

- [x] 采用最小分类结构：unit/ 和 examples/
- [x] 所有测试文件移动到unit目录
- [x] 所有示例和预览文件移动到examples目录
- [x] 每个测试文件添加了清晰的功能说明注释
- [x] 导入路径已全部更新
- [x] 统一测试入口已更新

### 简化效果

- ✅ 目录层级减少，结构更简洁
- ✅ 文件查找更便捷
- ✅ 维护成本降低
- ✅ 扩展更灵活
- ✅ 所有测试正常运行

简化重组工作已完成，新结构更符合"不要过度设计"的原则。