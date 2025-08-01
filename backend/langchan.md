# LangGraph + LangChain 驱动的微信公众号 HTML 风格化系统

## 一、项目总览

- 目标：将用户提供的基础 HTML 内容，转化为完整的「按照指定风格」设置的「微信公众号支持」的全 HTML 页面
- 核心需求：

  1. 根据内容进行标题级别分析 (h1/h2/blockquote...)
  2. 基于用户提供的风格名称和特征，动态生成统一的样式规则
  3. 确保相同标签（如所有h1）样式完全一致，整体风格协调
  4. 保留微信公众号特有的标签，如 <mpvideo> 不改变

---

## 二、技术框架

| 模块                  | 技术选型                                               | 说明                                   |
| --------------------- | ------------------------------------------------------ | -------------------------------------- |
| 流程调度              | [LangGraph](https://github.com/langchain-ai/langgraph) | 有状态、分支流程控制，核心引擎         |
| LLM 接入、Prompt 管理 | [LangChain](https://github.com/langchain-ai/langchain) | 模型调用、提示词模板、解析器等辅助模块 |
| 内容分析 / 规则转换   | BeautifulSoup / Lxml                                   | HTML 解析 + 结构检测优于大模型         |
| 样式规则生成          | OpenAI GPT-4 / Claude 3.5 / Qwen-Max                   | 基于风格特征生成结构化样式规则         |
| 样式应用引擎          | Python + BeautifulSoup                                 | 基于规则的样式应用，确保一致性         |
| 输出模型              | HTML + 微信内联样式                                    | 适配公众号编辑器                       |

---

## 三、架构关系图：LangGraph + LangChain 协作流程

```text
        【Start】
           |
    【1. ParseHTML】
           |
    【2. ProtectSpecialTags】
           |
    【3. SegmentAndAnalyze】
           |      ↘
           |     使用 LangChain 调用 LLMChain 进行段落分析
           |
    【4. GenerateStyleRules】
           |      ↘
           |     使用 LangChain 基于风格特征生成结构化样式规则
           |
    【5. ApplyStyleRules】
           |      ↘
           |     基于生成的规则机械化应用样式，确保一致性
           |
    【6. ValidateConsistency】
           |      ↘
           |     验证样式一致性和风格协调性
           |
    【7. ReinstateSpecialTags】
           |
    【8. ValidateOutput】
           |
    【9. ExportHTML】
           |
         [END]
```

---

## 四、LangGraph 各节点设计（结合 LangChain）

### 1. `ParseHTML`

- 使用 BeautifulSoup 解析 HTML，补全未闭合标签、格式标准化
- 删除 `<script>`, `<style>`, `<meta>`（可配置保留）

### 2. `ProtectSpecialTags`

- 替换如 `<mpvideo>` 为占位符，并记录在状态中

### 3. `SegmentAndAnalyze`

- 使用 LangChain 的 `PromptTemplate` 和 `LLMChain` 对段落内容进行分类和分析：

  ```json
  [
    { "tag": "h1", "content": "标题1" },
    { "tag": "p", "content": "此处是段落" }
  ]
  ```

### 4. `GenerateStyleRules`

- 使用 LangChain 的 `PromptTemplate` 和 `LLMChain` 基于用户提供的风格名称和特征生成完整的样式规则
- 输入：风格名称（如"包豪斯"）、风格特征（如"极简几何、黑白红配色"）、检测到的HTML标签列表
- 输出：结构化JSON样式规则，包含所有标签的完整CSS属性定义

  ```json
  {
    "style_name": "包豪斯",
    "rules": {
      "h1": {
        "font-family": "Futura, Arial, sans-serif",
        "font-size": "28px",
        "font-weight": "bold",
        "text-transform": "uppercase",
        "border-bottom": "3px solid #000",
        "margin": "20px 0 15px 0",
        "padding": "0 0 10px 0"
      },
      "h2": {
        "font-family": "Futura, Arial, sans-serif",
        "font-size": "22px",
        "color": "#0066cc",
        "margin": "18px 0 12px 0"
      },
      "p": {
        "font-size": "16px",
        "line-height": "1.6em",
        "margin": "12px 0"
      }
    }
  }
  ```

### 5. `ApplyStyleRules`

- 基于 `GenerateStyleRules` 生成的结构化样式规则，机械化地将样式应用到HTML元素
- **关键特性**：确保相同标签使用完全相同的样式，不再依赖LLM生成
- 将CSS属性转换为内联样式格式

### 6. `ValidateConsistency`

- 验证所有相同标签的样式是否完全一致
- 检查整体风格协调性
- 发现不一致时触发修复流程

### 7. `ReinstateSpecialTags`

- 将之前替换的特殊标签还原

### 8. `ValidateOutput`

- 校验 HTML 合法性，是否闭合，是否保留所需标签

### 9. `ExportHTML`

- 输出最终 HTML 页面，带 inline 样式，符合微信公众平台编辑器要求

---

## 五、动态风格规则生成示例

### LLM提示词模板

```text
根据风格名称和特征，生成完整的HTML标签样式规则JSON：

风格名称：{style_name}
风格特征：{style_features}
检测到的HTML标签：{detected_tags}

要求：
1. 生成的样式必须严格符合指定风格特征
2. 确保所有样式协调统一，形成一致的视觉风格
3. 每个标签包含完整的CSS属性定义（字体、颜色、间距、装饰等）
4. 样式适配微信公众号编辑器要求

输出JSON格式：
{
  "style_name": "风格名称",
  "description": "风格描述",
  "rules": {
    "h1": { "font-size": "28px", "color": "#000", ... },
    "h2": { "font-size": "22px", "color": "#333", ... },
    "p": { "font-size": "16px", "line-height": "1.6", ... },
    ...
  }
}
```

### 使用示例

**输入**：
- 风格名称：包豪斯
- 风格特征：极简几何、黑白红三色、Futura字体、粗线条装饰、功能主义
- 检测标签：["h1", "h2", "p", "blockquote", "ul", "li"]

**LLM生成**：完整的结构化样式规则JSON

**应用结果**：所有h1标签样式完全一致，整体风格高度协调

---

## 六、合理的目录结构设计

基于现有项目结构，做最小化合理扩展：

```text
backend/
├── main.py                           # FastAPI应用入口 (已存在)
├── requirements.txt                  # 依赖管理 (已存在)
├── .env                             # 环境配置 (已存在)
├── app/
│   ├── __init__.py
│   ├── config/                       # 配置模块 (已存在)
│   │   ├── __init__.py
│   │   └── settings.py               # 扩展LangGraph配置 (已存在)
│   ├── api/                          # API路由 (已存在)
│   │   ├── __init__.py
│   │   ├── routes.py                 # 扩展样式处理端点 (已存在)
│   │   └── graph_routes.py           # 新增：图工作流API端点
│   ├── core/                         # 核心模块 (已存在)
│   │   ├── __init__.py
│   │   ├── prompts.py                # 扩展样式生成提示词 (已存在)
│   │   └── graph_state.py            # 新增：图工作流状态定义
│   ├── models/                       # 数据模型 (已存在)
│   │   ├── __init__.py
│   │   ├── schemas.py                # 扩展样式请求响应模型 (已存在)
│   │   └── graph_models.py           # 新增：图工作流数据模型
│   ├── services/                     # 业务服务 (已存在)
│   │   ├── __init__.py
│   │   ├── ai_service.py             # 集成LangChain支持 (已存在)
│   │   ├── graph_service.py          # 新增：图工作流服务
│   │   └── style_service.py          # 新增：样式处理服务
│   ├── graph/                        # 新增：LangGraph工作流
│   │   ├── __init__.py
│   │   ├── workflow.py               # 主工作流定义
│   │   ├── nodes.py                  # 所有节点实现
│   │   └── conditions.py             # 流程条件和边
│   ├── utils/                        # 工具模块 (已存在)
│   │   ├── __init__.py
│   │   ├── exceptions.py             # 扩展图工作流异常 (已存在)
│   │   ├── logger.py                 # 日志工具 (已存在)
│   │   ├── html_utils.py             # 新增：HTML处理工具
│   │   └── style_utils.py            # 新增：样式工具
│   └── storage/                      # 新增：缓存和存储
│       ├── __init__.py
│       ├── cache.py                  # 样式规则缓存
│       └── templates/                # 样式模板文件夹
├── tests/                            # 测试 (可选)
│   ├── test_graph_workflow.py
│   └── test_style_service.py
└── prompts/                          # 提示词模板文件
    ├── style_generation.txt
    └── content_analysis.txt
```

### 设计原则

#### 1. **最小化扩展**
- 保持现有文件结构不变
- 只添加必要的新模块
- 复用现有的配置、异常、日志系统

#### 2. **功能清晰**
- `graph/`: LangGraph工作流的完整实现
- `services/`: 新增样式处理和图工作流服务
- `utils/`: 添加HTML和样式处理工具
- `storage/`: 简单的缓存和模板管理

#### 3. **易于维护**
- 每个模块职责单一
- 依赖关系简单清晰
- 便于测试和调试

### 核心文件说明

#### 新增核心文件
```python
# app/graph/workflow.py - 主工作流
def create_style_workflow():
    workflow = StateGraph()
    # 定义9个节点的完整流程
    return workflow.compile()

# app/graph/nodes.py - 所有节点实现
class ParseHTMLNode:
    def __call__(self, state): ...

class GenerateStyleRulesNode:
    def __call__(self, state): ...
    
# app/services/style_service.py - 样式服务
class StyleService:
    async def generate_style_rules(self, style_name, features): ...
    async def apply_styles(self, html, rules): ...
```

#### 扩展现有文件
```python
# app/config/settings.py - 添加配置
class Settings(BaseSettings):
    # 现有配置...
    
    # 新增LangGraph配置
    enable_graph_workflow: bool = True
    style_cache_ttl: int = 3600

# app/api/routes.py - 添加端点
@router.post("/process-with-style")
async def process_with_style(request: StyleProcessRequest):
    return await graph_service.process_content_with_style(request)
```

### 数据流设计

```text
用户请求 → API路由 → GraphService → LangGraph工作流 → 各节点 → 返回结果
                                        ↓
                                   AIService (LangChain)
                                        ↓
                                   StyleService (缓存)
```

这样的设计既满足了功能需求，又保持了项目的简洁性和可维护性。

---

## 七、是否可以不使用 LangChain？

- 是的，LangGraph 可单独运行
- 但 LangChain 提供了：

  - 模型封装（OpenAI/Claude/Qwen）
  - Prompt 管理和复用
  - OutputParser 工具链

**建议：LangGraph 负责流程编排，LangChain 提供智能样式规则生成，确保样式一致性通过代码逻辑保证。**

## 八、关键设计优势

### 1. **动态样式生成**
- 用户只需提供风格名称和特征描述
- LLM自动生成完整的结构化样式规则
- 支持任意风格的动态创建

### 2. **样式一致性保证**
- 通过结构化规则确保相同标签样式完全一致
- 避免LLM随机性导致的样式不一致问题
- 机械化应用样式，可预测且可控

### 3. **整体风格协调**
- LLM在生成阶段就考虑所有标签的风格协调性
- 统一的色彩体系、字体体系和间距体系
- 形成完整的视觉设计系统

### 4. **高效的处理流程**
- 样式规则生成一次，可重复使用
- 避免对每个元素重复调用LLM
- 支持样式规则缓存和复用
