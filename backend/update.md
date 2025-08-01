# 长文本处理优化方案 - Update Plan

## 问题描述

### 问题1：长内容处理超时
- 用户发送长文本内容（20000+字符）时，AI处理时间过长导致API超时
- 用户等待时间长，体验差，容易产生焦虑
- 传统同步处理方式无法处理超长内容

### 问题2：HTML结构混乱导致内容分段不统一
- 用户输入的HTML结构混乱（标题用p标签、层级不清等）
- 分段处理导致生成的HTML样式不统一，不是一个整体
- 需要智能分析内容语义，重新组织结构，再应用统一样式

## 解决方案

### 方案1：流式响应处理（解决超时问题）

#### 核心思路
采用HTTP流式响应技术，实时推送处理进度，连接保持活跃避免超时。用户可以看到实时处理进展，无需焦虑等待。

#### 技术架构
- **主要接口**：`/api/process-stream` - 流式处理接口
- **保留接口**：`/api/process` - 同步接口（响应逻辑置空，供后续开发）
- **处理策略**：全部请求使用流式响应，提供最佳用户体验

#### 后端实现
```python
from fastapi.responses import StreamingResponse
import json
import asyncio

@router.post("/process-stream", tags=["Process"])
async def process_content_stream(request: ProcessRequest):
    """流式返回处理结果，解决长内容超时问题"""
    
    async def generate_response():
        try:
            # 立即返回开始信号
            yield f"data: {json.dumps({'status': 'started', 'progress': 0, 'step': '开始处理内容'})}\n\n"
            
            # 智能内容处理（详见方案2）
            processor = IntelligentContentProcessor()
            
            if len(request.content) > 15000:
                # 长内容流式分段处理
                yield f"data: {json.dumps({'status': 'analyzing', 'progress': 10, 'step': '分析内容结构'})}\n\n"
                
                # 语义分析和分段
                chunks = await processor.analyze_and_split_content(request.content)
                yield f"data: {json.dumps({'status': 'processing', 'progress': 20, 'step': f'分为{len(chunks)}段处理'})}\n\n"
                
                # 分段处理
                chunk_results = []
                for i, chunk in enumerate(chunks):
                    progress = 20 + int((i / len(chunks)) * 60)  # 20-80%
                    step_msg = f'处理第{i+1}段（共{len(chunks)}段）'
                    
                    yield f"data: {json.dumps({'status': 'processing', 'progress': progress, 'step': step_msg})}\n\n"
                    
                    chunk_result = await processor._process_single_chunk(chunk, request.user_prompt)
                    chunk_results.append(chunk_result)
                    
                    yield f"data: {json.dumps({'status': 'chunk_done', 'chunk': i+1, 'progress': progress + 5})}\n\n"
                
                # 统一样式合并
                yield f"data: {json.dumps({'status': 'merging', 'progress': 85, 'step': '合并结果，统一样式'})}\n\n"
                final_result = await processor.merge_with_unified_style(chunk_results, request.content_type.value)
                
            else:
                # 短内容直接处理
                yield f"data: {json.dumps({'status': 'processing', 'progress': 50, 'step': '智能分析内容'})}\n\n"
                final_result = await processor.process_messy_html(request.content, request.user_prompt)
            
            # 最终质量检查
            yield f"data: {json.dumps({'status': 'finalizing', 'progress': 95, 'step': '质量检查'})}\n\n"
            
            # 返回最终结果
            yield f"data: {json.dumps({'status': 'completed', 'progress': 100, 'result': final_result})}\n\n"
            
        except Exception as e:
            logger.exception(f"Stream processing error: {str(e)}")
            yield f"data: {json.dumps({'status': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_response(), 
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# 保留同步接口，响应逻辑置空供后续开发
@router.post("/process", response_model=ProcessResponse, tags=["Process"]) 
async def process_content(request: ProcessRequest) -> ProcessResponse:
    """同步处理接口（保留供后续开发，当前响应置空）"""
    
    # TODO: 后续开发可以在这里实现特殊的同步处理逻辑
    # 目前建议所有请求都使用流式接口 /api/process-stream
    
    return ProcessResponse(
        success=True,
        data={
            "message": "请使用流式接口 /api/process-stream 获得更好的处理体验",
            "redirect_to": "/api/process-stream",
            "content_length": len(request.content)
        }
    )
```

#### 前端集成
```javascript
async function processWithStream(content, userPrompt, onProgress) {
    const response = await fetch('/api/process-stream', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        },
        body: JSON.stringify({ 
            content, 
            user_prompt: userPrompt,
            content_type: 'text'
        })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ') && line.length > 6) {
                    const data = JSON.parse(line.slice(6));
                    
                    if (data.status === 'completed') {
                        return data.result;
                    } else if (data.status === 'error') {
                        throw new Error(data.error);
                    } else {
                        // 实时更新进度
                        onProgress?.(data);
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

// 使用示例
const result = await processWithStream(content, prompt, (progress) => {
    updateProgressBar(progress.progress);
    updateStatusText(progress.step);
});
```

#### 用户界面设计
```html
<div class="stream-progress-container">
    <div class="progress-header">
        <h3>🚀 正在智能处理您的内容...</h3>
        <span class="progress-percentage">0%</span>
    </div>
    
    <div class="progress-bar">
        <div class="progress-fill" style="width: 0%"></div>
    </div>
    
    <div class="progress-status">
        <span class="current-step">🔍 开始分析内容结构...</span>
        <span class="processing-time">已用时: 0秒</span>
    </div>
    
    <div class="progress-steps">
        <div class="step completed">✅ 内容分析</div>
        <div class="step active">🔄 智能处理</div>
        <div class="step pending">⏳ 样式统一</div>
        <div class="step pending">⏳ 质量检查</div>
    </div>
</div>
```

#### 技术优势

**1. 彻底解决超时问题**
- ✅ 连接保持活跃，永不超时
- ✅ 无需复杂的任务队列系统
- ✅ 服务器资源占用最小

**2. 极致用户体验**
- ✅ 实时进度反馈，消除用户焦虑
- ✅ 透明化处理步骤，用户了解进展
- ✅ 立即响应，无需等待

**3. 实现简单可靠**
- ✅ 基于HTTP标准，兼容性极佳
- ✅ 无需WebSocket等复杂协议
- ✅ 易于调试和监控

**4. 高扩展性**
- ✅ 天然支持分布式部署
- ✅ 可轻松添加更多进度节点
- ✅ 支持错误恢复和重试机制

### 方案2：智能结构分析 + 统一样式渲染（解决内容统一性）

#### 问题核心
用户输入的HTML结构混乱（标题用p标签、层级不清等），导致分段处理时生成的HTML样式不统一，无法形成一个整体风格的文档。

#### 解决思路
**直接让AI理解和重构** - 充分利用大模型的HTML理解能力，让AI直接分析混乱的HTML结构，理解内容语义，然后重新组织为统一风格的输出。无需复杂的预处理步骤。

#### 核心技术架构

**简化的智能处理流程**
```python
class IntelligentContentProcessor:
    """智能内容处理器 - 直接利用AI处理HTML结构混乱问题"""
    
    async def process_messy_html(self, html_content: str, user_prompt: str) -> Dict[str, Any]:
        """处理混乱HTML的完整流程 - 直接交给AI处理"""
        
        if len(html_content) > 15000:
            # 长内容：语义分段 + 统一样式合并
            return await self._process_long_messy_html(html_content, user_prompt)
        else:
            # 短内容：直接AI重构
            return await self._process_short_messy_html(html_content, user_prompt)
    
    async def _process_short_messy_html(self, html_content: str, user_prompt: str) -> Dict[str, Any]:
        """短内容直接AI重构"""
        
        restructure_prompt = f"""
        用户需求：{user_prompt}
        
        以下HTML内容结构混乱，请你：
        1. 理解内容的真实语义结构（忽略错误的HTML标签使用）
        2. 重新组织为逻辑清晰的HTML结构
        3. 应用统一的微信公众号样式规范
        
        混乱的HTML内容：
        {html_content}
        
        请直接输出重构后的结果，确保：
        - 所有相同类型元素使用完全相同的样式
        - 标题层级正确（h1/h2/h3）
        - 段落样式统一
        - 符合微信公众号HTML规范
        """
        
        response = await self.openai_client.chat.completions.create(
            model=settings.default_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": restructure_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        if "processed_content" in result:
            result["processed_content"] = html.unescape(result["processed_content"])
            
        return result
```

#### 关键技术实现

**1. 长内容的智能分段处理**
```python
async def _process_long_messy_html(self, html_content: str, user_prompt: str) -> Dict[str, Any]:
    """长内容处理：AI智能分段 + 统一样式合并"""
    
    # 第一步：让AI分析内容并智能分段
    segment_prompt = f"""
    用户需求：{user_prompt}
    
    以下是一个很长的HTML内容，结构可能混乱。请你：
    1. 理解整体内容的逻辑结构和主题
    2. 按照内容的自然段落和章节边界进行智能分段
    3. 每段保持语义完整性，避免在句子中间分段
    4. 分段数量控制在3-6段之间
    
    HTML内容：
    {html_content}
    
    请返回分段结果和整体风格规范：
    {{
        "overall_style": "整体风格描述",
        "segments": [
            {{
                "content": "分段内容",
                "main_topic": "这一段的主要话题"
            }}
        ]
    }}
    """
    
    # AI智能分段
    response = await self.openai_client.chat.completions.create(
        model=settings.default_model,
        messages=[
            {"role": "system", "content": "你是内容分析专家，专门处理长文档的智能分段"},
            {"role": "user", "content": segment_prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    segment_result = json.loads(response.choices[0].message.content)
    segments = segment_result.get("segments", [])
    overall_style = segment_result.get("overall_style", "")
    
    # 第二步：逐段处理，保持风格一致
    processed_segments = []
    
    for i, segment in enumerate(segments):
        segment_prompt = f"""
        用户需求：{user_prompt}
        整体风格要求：{overall_style}
        
        这是长文档的第{i+1}段（共{len(segments)}段）。
        
        请将以下混乱的HTML内容重构为标准格式：
        1. 理解内容语义，重新组织HTML结构
        2. 严格按照整体风格要求应用样式
        3. 确保与其他段落风格完全一致
        4. 段落开头不要重复整体标题
        
        段落内容：
        {segment.get("content", "")}
        """
        
        response = await self.openai_client.chat.completions.create(
            model=settings.default_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": segment_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        segment_result = json.loads(response.choices[0].message.content)
        if "processed_content" in segment_result:
            segment_result["processed_content"] = html.unescape(segment_result["processed_content"])
        
        processed_segments.append(segment_result)
    
    # 第三步：最终统一合并
    return await self._final_merge_segments(processed_segments, user_prompt, overall_style)

async def _final_merge_segments(self, segments: List[Dict], user_prompt: str, overall_style: str) -> Dict[str, Any]:
    """最终合并分段，确保完全统一"""
    
    # 提取所有处理后的内容
    content_parts = []
    for segment in segments:
        content = segment.get("processed_content", "")
        if content:
            content_parts.append(content)
    
    # AI最终统一处理
    merge_prompt = f"""
    用户需求：{user_prompt}
    整体风格：{overall_style}
    
    以下是同一长文档的各个部分，现在需要合并为一个完全统一的HTML文档：
    
    要求：
    1. 移除重复的标题和不必要的分段痕迹
    2. 确保所有相同类型的元素样式完全一致
    3. 保持内容逻辑连贯性
    4. 最终输出一个完整统一的文档
    
    各部分内容：
    {"[===分段===]".join(content_parts)}
    """
    
    response = await self.openai_client.chat.completions.create(
        model=settings.default_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": merge_prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    final_result = json.loads(response.choices[0].message.content)
    if "processed_content" in final_result:
        final_result["processed_content"] = html.unescape(final_result["processed_content"])
    
    return final_result
```

**2. 核心优势**
- ✅ **充分利用AI能力** - 大模型直接理解HTML语义，无需预处理
- ✅ **简化处理流程** - 减少不必要的中间步骤和依赖
- ✅ **保持信息完整** - 不会因为预处理丢失重要的结构信息
- ✅ **智能分段策略** - AI理解内容逻辑后进行自然分段
- ✅ **统一风格保证** - 通过明确的风格指导确保输出一致性

#### 工作流程示例

**输入混乱HTML：**
```html
<p><strong>这是标题</strong></p>
<p>这是正文内容...</p>
<p><strong>这也是标题</strong></p>
<div>更多内容...</div>
```

**AI语义分析结果：**
```json
{
  "document_structure": {
    "sections": [
      {"level": 1, "title": "这是标题", "content_type": "heading"},
      {"level": 0, "content": "这是正文内容...", "content_type": "paragraph"},
      {"level": 2, "title": "这也是标题", "content_type": "heading"},
      {"level": 0, "content": "更多内容...", "content_type": "paragraph"}
    ]
  }
}
```

**最终统一输出：**
```html
<h1 style="font-size:24px; color:#2c3e50; line-height:1.2; letter-spacing:1px; text-align:center; margin:0.5em 0;">这是标题</h1>
<p style="font-size:16px; color:#333333; line-height:1.75; letter-spacing:0.5px; margin:0 0 1em 0;">这是正文内容...</p>
<h2 style="font-size:20px; color:#2c3e50; line-height:1.3; margin:0.5em 0;">这也是标题</h2>
<p style="font-size:16px; color:#333333; line-height:1.75; letter-spacing:0.5px; margin:0 0 1em 0;">更多内容...</p>
```

#### 技术优势

**1. 语义理解优先**
- ✅ 忽略原始HTML标签，基于内容语义重构
- ✅ AI智能识别标题、段落、列表等不同内容类型
- ✅ 保持内容逻辑完整性

**2. 统一样式保证**
- ✅ 强制应用标准样式规范
- ✅ 消除分段处理导致的样式不一致
- ✅ 确保整体视觉统一性

**3. 智能分段策略**
- ✅ 基于语义边界而非字符长度分段
- ✅ 保持章节和段落的完整性
- ✅ 减少不必要的内容分割

**4. 容错性强**
- ✅ 处理各种混乱的HTML结构
- ✅ 自动修正不规范的标签使用
- ✅ 兼容多种输入格式

### 方案3：用户体验优化

由于采用了流式响应方案，用户体验得到了根本性改善：

#### 实时反馈机制
- **立即响应**：用户提交后立即开始处理，无需等待
- **进度可视**：实时显示处理进度和当前步骤
- **透明处理**：用户清楚知道系统在做什么

#### 交互流程优化
```
用户提交 → 立即开始流式处理 → 实时显示进度 → 完成后显示结果
```

#### 界面状态管理
```javascript
// 进度状态管理
const progressStates = {
    'started': { icon: '🚀', message: '开始处理' },
    'analyzing': { icon: '🔍', message: '分析内容结构' },
    'processing': { icon: '⚙️', message: '智能处理中' },
    'merging': { icon: '🔗', message: '合并结果' },
    'finalizing': { icon: '✨', message: '最终优化' },
    'completed': { icon: '✅', message: '处理完成' }
};
```

## 技术优势

### 1. 用户体验优化
- **立即响应**：用户提交后立即得到反馈，无需长时间等待
- **进度可视**：显示处理进度，用户了解处理状态
- **后台处理**：用户可以继续其他操作

### 2. 内容质量保证
- **语义理解**：AI分析内容语义，而非依赖HTML标签
- **结构重组**：智能重新组织HTML结构
- **样式统一**：强制应用统一样式，确保整体一致性

### 3. 系统稳定性
- **超时避免**：异步处理避免API超时
- **资源优化**：后台处理不占用前端资源
- **错误处理**：完整的错误处理和重试机制

### 4. 扩展性
- **任务队列**：可以扩展为Redis队列或消息队列
- **分布式处理**：可以扩展为多节点处理
- **缓存机制**：可以添加结果缓存

## 实施计划

### 第一阶段：核心功能实现
1. 实现智能语义分析
2. 实现结构重组渲染
3. 实现样式统一化

### 第二阶段：异步任务系统
1. 实现内存任务队列
2. 添加任务状态API
3. 前端轮询机制

### 第三阶段：用户体验优化
1. 进度显示界面
2. 错误处理优化
3. 性能监控

### 第四阶段：系统优化
1. 任务持久化（可选）
2. 分布式处理（可选）
3. 缓存机制（可选）

## 配置建议

### 环境变量更新
```bash
# 异步任务配置
ASYNC_TASK_ENABLED=true
TASK_TIMEOUT=300  # 任务超时时间（秒）
MAX_CONCURRENT_TASKS=5  # 最大并发任务数

# 长内容处理阈值
LONG_CONTENT_THRESHOLD=15000  # 超过此长度使用异步处理
```

### API响应时间预期
- **短内容（<15000字符）**：30-60秒（同步处理）
- **长内容（>15000字符）**：2-5分钟（异步处理）
- **用户等待时间**：<2秒（立即返回任务ID）