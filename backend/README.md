# FlowEdit Backend Service

这是 FlowEdit Chrome 扩展的后端服务，提供 AI 驱动的内容处理功能。

## 功能特性

- 🤖 支持 OpenAI GPT 模型进行内容处理
- 📝 处理文本和 HTML 内容
- 🔄 用户自定义提示词
- 🔒 CORS 配置支持 Chrome 扩展
- 📊 详细的日志和错误处理

## 快速开始

### 1. 环境准备

确保已安装 Python 3.8+

```bash
python3 --version
```

### 2. 安装依赖

```bash
# 创建虚拟环境（推荐）
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

### 3. 配置环境变量

复制 `.env` 文件并配置你的 API 密钥：

```bash
# 编辑 .env 文件
# 设置你的 OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# 可选：设置自定义的 OpenAI base URL（如使用代理服务）
# OPENAI_BASE_URL=https://api.openai-proxy.com/v1
```

### 4. 启动服务

```bash
# 直接运行
python main.py

# 或使用 uvicorn（推荐用于开发）
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

服务将在 http://localhost:8000 启动

## API 文档

启动服务后，访问以下地址查看 API 文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 主要端点

#### POST /api/process
处理用户内容的核心接口

**请求体：**
```json
{
  "content": "要处理的内容",
  "user_prompt": "用户自定义提示词",
  "content_type": "text",  // 或 "html"
  "model": "gpt-4o-mini"   // 可选，默认使用配置的模型
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "title": "处理后的标题",
    "summary": "内容摘要",
    "processed_content": "处理后的内容",
    "key_points": ["要点1", "要点2"],
    "model_used": "gpt-4o-mini",
    "tokens_used": 1234,
    "processing_time": 2.5
  }
}
```

#### GET /api/health
健康检查端点

#### GET /api/status
获取服务详细状态

## 项目结构

```
backend/
├── .env                    # 环境变量配置
├── .env.example           # 环境变量示例
├── main.py                 # FastAPI 应用入口
├── requirements.txt       # Python 依赖
├── README.md              # 项目文档
└── app/
    ├── api/               # API 路由
    │   └── routes.py      # 主要端点定义
    ├── config/            # 配置管理
    │   └── settings.py    # 应用设置
    ├── core/              # 核心逻辑
    │   └── prompts.py     # AI 提示词模板
    ├── models/            # 数据模型
    │   └── schemas.py     # Pydantic 模型
    ├── services/          # 业务服务
    │   └── ai_service.py  # AI 模型交互
    └── utils/             # 工具函数
        ├── logger.py      # 日志配置
        └── exceptions.py  # 自定义异常
```

## 开发说明

### 添加新的提示词模板

在 `app/core/prompts.py` 中添加新的系统提示词：

```python
SYSTEM_PROMPTS = {
    "your_prompt_type": """你的系统提示词内容..."""
}
```

### 调试模式

在 `.env` 中设置 `DEBUG=true` 启用调试模式，这将：
- 启用自动重载
- 显示详细错误信息
- 开放 API 文档访问

### 日志

日志格式：`[时间] [模块名] [级别] 消息`

查看日志输出以调试问题。

### AI 模型配置

支持灵活的 AI 模型配置：

1. **使用官方 OpenAI API**：
   ```bash
   OPENAI_API_KEY=sk-xxx...
   OPENAI_BASE_URL=  # 留空使用官方API
   ```

2. **使用兼容 OpenAI 的代理服务**：
   ```bash
   OPENAI_API_KEY=your_api_key
   OPENAI_BASE_URL=https://api.openai-proxy.com/v1
   ```

3. **支持的模型**：
   - gpt-4o-mini（默认）
   - gpt-4o
   - gpt-3.5-turbo
   - 其他兼容 OpenAI API 的模型

## 部署

### 使用 Docker（待实现）

```bash
docker build -t flowedit-backend .
docker run -p 8000:8000 --env-file .env flowedit-backend
```

### 使用 PM2

```bash
pm2 start main.py --name flowedit-backend --interpreter python3
```

## 注意事项

1. **API 密钥安全**：确保不要将包含真实 API 密钥的 `.env` 文件提交到版本控制
2. **CORS 配置**：当前配置允许所有 Chrome 扩展访问，生产环境建议限制为特定扩展 ID
3. **请求限制**：建议在生产环境添加请求频率限制
4. **错误处理**：所有 API 错误都会被捕获并返回标准格式的错误响应

## 故障排除

### 常见问题

1. **ImportError**: 确保所有依赖都已安装
2. **API Key 错误**: 检查 `.env` 文件中的 API 密钥是否正确
3. **CORS 错误**: 确保请求来源在允许的域名列表中

### 获取帮助

如有问题，请查看：
- 服务日志输出
- API 文档 (http://localhost:8000/docs)
- 检查 `.env` 配置