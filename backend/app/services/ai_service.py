import json
import time
import asyncio
import logging
import html
from typing import Dict, Any, Optional
import openai
from openai import AsyncOpenAI
import httpx

from app.config.settings import settings
from app.core.prompts import SYSTEM_PROMPT
from app.utils.exceptions import AIServiceError, ModelNotAvailableError


logger = logging.getLogger(__name__)


class AIService:
    """AI模型交互服务"""
    
    def __init__(self):
        """初始化AI服务"""
        self.openai_client = None
        self._initialize_clients()
        
    def _initialize_clients(self):
        """初始化AI客户端"""
        if settings.openai_api_key:
            # 如果配置了自定义base_url则使用，否则使用默认
            client_params = {
                "api_key": settings.openai_api_key,
                "timeout": httpx.Timeout(settings.request_timeout, connect=10.0)
            }
            
            if settings.openai_base_url:
                client_params["base_url"] = settings.openai_base_url
                logger.info(f"Using custom OpenAI base URL: {settings.openai_base_url}")
            
            self.openai_client = AsyncOpenAI(**client_params)
            logger.info("OpenAI client initialized")
        else:
            logger.warning("OpenAI API key not configured")
            
    async def process_content(
        self,
        content: str,
        user_prompt: str,
        content_type: str = "text",
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        处理用户内容
        
        Args:
            content: 要处理的内容
            user_prompt: 用户自定义提示词
            content_type: 内容类型 (text/html)
            model: 指定使用的模型
            
        Returns:
            处理结果字典
        """
        start_time = time.time()
        model = model or settings.default_model
        
        # 验证内容长度并处理
        original_length = len(content)
        if original_length > settings.max_content_length:
            logger.warning(f"Content too long ({original_length} chars), will use chunk processing")
            return await self._process_content_in_chunks(content, user_prompt, content_type, model, start_time)
        
        try:
            return await self._process_single_content(content, user_prompt, content_type, model, start_time)
            
        except openai.APIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise AIServiceError(f"OpenAI API error: {str(e)}")
            
        except openai.APIConnectionError as e:
            logger.error(f"OpenAI connection error: {str(e)}")
            raise AIServiceError("Failed to connect to OpenAI API")
            
        except openai.RateLimitError as e:
            logger.error(f"OpenAI rate limit error: {str(e)}")
            raise AIServiceError("API rate limit exceeded. Please try again later.")
            
        except openai.AuthenticationError as e:
            logger.error(f"OpenAI authentication error: {str(e)}")
            raise AIServiceError("Invalid API key")
            
        except Exception as e:
            logger.exception(f"Unexpected error in AI service: {str(e)}")
            raise AIServiceError(f"Unexpected error: {str(e)}")
            
    def _smart_truncate_content(self, content: str, max_length: int) -> str:
        """
        智能截断内容，优先保留段落完整性
        
        Args:
            content: 原始内容
            max_length: 最大长度
            
        Returns:
            截断后的内容
        """
        if len(content) <= max_length:
            return content
            
        # 预留截断提示的空间
        truncate_notice = "\n\n[内容过长，已智能截断...]"
        effective_length = max_length - len(truncate_notice)
        
        # 先按照有效长度截断
        truncated = content[:effective_length]
        
        # 寻找合适的截断点（优先级：段落 > 句子 > 行）
        cut_points = [
            truncated.rfind('\n\n'),  # 段落分隔
            truncated.rfind('。'),     # 句号
            truncated.rfind('！'),     # 感叹号
            truncated.rfind('？'),     # 问号
            truncated.rfind('\n'),    # 换行
        ]
        
        # 找到最佳截断点（必须在80%以上位置，避免截断太多）
        min_position = int(effective_length * 0.8)
        best_cut = effective_length
        
        for cut_point in cut_points:
            if cut_point > min_position:
                best_cut = cut_point + 1 if truncated[cut_point] in '。！？' else cut_point
                break
        
        # 返回截断后的内容
        final_content = truncated[:best_cut].rstrip()
        return final_content + truncate_notice
        
    async def _process_content_in_chunks(self, content: str, user_prompt: str, content_type: str, model: str, start_time: float) -> Dict[str, Any]:
        """
        分段处理长内容
        
        Args:
            content: 原始内容
            user_prompt: 用户提示词
            content_type: 内容类型
            model: 使用的模型
            start_time: 开始时间
            
        Returns:
            合并后的处理结果
        """
        try:
            # 智能分段
            chunks = self._split_content_intelligently(content, settings.max_content_length)
            logger.info(f"Split content into {len(chunks)} chunks")
            
            processed_chunks = []
            total_tokens = 0
            
            # 逐段处理
            for i, chunk in enumerate(chunks):
                logger.info(f"Processing chunk {i+1}/{len(chunks)} (length: {len(chunk)})")
                
                # 为分段调整用户提示词
                chunk_prompt = f"{user_prompt}\n\n注意：这是第{i+1}部分（共{len(chunks)}部分），请保持风格一致。"
                
                # 构建消息
                messages = [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"{chunk_prompt}\n\n内容如下：\n{chunk}"}
                ]
                
                # 调用API
                response = await self.openai_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=settings.max_tokens,
                    temperature=settings.temperature,
                    response_format={"type": "json_object"}
                )
                
                result_text = response.choices[0].message.content
                chunk_tokens = response.usage.total_tokens if response.usage else 0
                total_tokens += chunk_tokens
                
                # 解析结果
                try:
                    chunk_result = json.loads(result_text)
                    # 处理HTML转义
                    if "processed_content" in chunk_result:
                        chunk_result["processed_content"] = html.unescape(chunk_result["processed_content"])
                    processed_chunks.append(chunk_result)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse chunk {i+1} response: {e}")
                    processed_chunks.append({
                        "processed_content": html.unescape(result_text),
                        "title": f"分段{i+1}处理结果",
                        "summary": "解析异常"
                    })
            
            # 合并结果
            merged_result = self._merge_chunk_results(processed_chunks, content_type)
            
            # 计算总处理时间
            processing_time = time.time() - start_time
            
            # 添加处理统计信息
            merged_result.update({
                "model_used": model,
                "tokens_used": total_tokens,
                "processing_time": round(processing_time, 2),
                "content_type": content_type,
                "chunks_processed": len(chunks),
                "original_length": len(content)
            })
            
            return merged_result
            
        except Exception as e:
            logger.exception(f"Error in chunk processing: {str(e)}")
            # 降级到截断处理
            logger.info("Falling back to truncation method")
            truncated_content = self._smart_truncate_content(content, settings.max_content_length)
            return await self._process_single_content(truncated_content, user_prompt, content_type, model, start_time)
    
    def _split_content_intelligently(self, content: str, max_chunk_size: int) -> list:
        """
        智能分段，尽量保持段落完整性
        """
        if len(content) <= max_chunk_size:
            return [content]
        
        chunks = []
        current_chunk = ""
        
        # 按段落分割
        paragraphs = content.split('\n\n')
        
        for paragraph in paragraphs:
            # 如果单个段落就超长，需要强制分割
            if len(paragraph) > max_chunk_size:
                # 先保存当前chunk
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""
                
                # 按句子分割长段落
                sentences = paragraph.replace('。', '。\n').replace('！', '！\n').replace('？', '？\n').split('\n')
                for sentence in sentences:
                    if len(current_chunk + sentence) > max_chunk_size:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = sentence
                    else:
                        current_chunk += sentence
            else:
                # 检查加入这个段落是否超长
                if len(current_chunk + '\n\n' + paragraph) > max_chunk_size:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    current_chunk = paragraph
                else:
                    current_chunk += ('\n\n' if current_chunk else '') + paragraph
        
        # 添加最后一个chunk
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def _merge_chunk_results(self, chunk_results: list, content_type: str) -> Dict[str, Any]:
        """
        合并分段处理结果
        """
        if not chunk_results:
            return {
                "title": "处理失败",
                "summary": "分段处理未返回结果",
                "processed_content": "",
                "word_count": 0,
                "has_images": False
            }
        
        # 合并标题（使用第一段的标题）
        title = chunk_results[0].get("title", "长文档处理结果")
        
        # 合并内容
        processed_contents = []
        all_key_points = []
        total_word_count = 0
        has_images = False
        
        for i, chunk in enumerate(chunk_results):
            content = chunk.get("processed_content", "")
            if content:
                processed_contents.append(content)
            
            # 收集关键点
            key_points = chunk.get("key_points", [])
            if isinstance(key_points, list):
                all_key_points.extend(key_points)
            
            # 统计字数
            word_count = chunk.get("word_count", 0)
            if isinstance(word_count, (int, float)):
                total_word_count += word_count
            
            # 检查是否有图片
            if chunk.get("has_images", False):
                has_images = True
        
        # 生成摘要
        summaries = [chunk.get("summary", "") for chunk in chunk_results if chunk.get("summary")]
        summary = " ".join(summaries[:3])  # 取前3段的摘要
        if len(summary) > 100:
            summary = summary[:97] + "..."
        
        return {
            "title": title,
            "summary": summary or "长文档已分段处理完成",
            "processed_content": "\n\n".join(processed_contents),
            "key_points": all_key_points[:5],  # 最多保留5个关键点
            "word_count": total_word_count,
            "has_images": has_images,
            "content_type": content_type
        }
    
    async def _process_single_content(self, content: str, user_prompt: str, content_type: str, model: str, start_time: float) -> Dict[str, Any]:
        """
        处理单个内容（原有逻辑的提取）
        """
        max_retries = 2
        last_error = None
        
        for attempt in range(max_retries + 1):
            try:
                # 构建消息 - 使用固定的系统提示词
                messages = [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"{user_prompt}\n\n内容如下：\n{content}"}
                ]
                
                logger.info(f"Calling {model} with content_type: {content_type} (attempt {attempt + 1})")
                
                # 调用OpenAI API
                if not self.openai_client:
                    raise ModelNotAvailableError("OpenAI client not initialized")
                    
                response = await self.openai_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=settings.max_tokens,
                    temperature=settings.temperature,
                    response_format={"type": "json_object"}
                )
                
                # 提取响应
                result_text = response.choices[0].message.content
                tokens_used = response.usage.total_tokens if response.usage else None
                
                # 解析JSON响应
                try:
                    result_data = json.loads(result_text)
                    # 处理HTML转义
                    if "processed_content" in result_data:
                        result_data["processed_content"] = html.unescape(result_data["processed_content"])
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse AI response as JSON: {e}")
                    result_data = {
                        "processed_content": html.unescape(result_text),
                        "title": "处理结果",
                        "summary": "AI响应格式异常",
                        "error": "Response was not valid JSON"
                    }
                
                # 计算处理时间
                processing_time = time.time() - start_time
                
                # 构建返回结果
                return {
                    **result_data,
                    "model_used": model,
                    "tokens_used": tokens_used,
                    "processing_time": round(processing_time, 2),
                    "content_type": content_type
                }
                
            except (openai.APITimeoutError, openai.APIConnectionError) as e:
                last_error = e
                if attempt < max_retries:
                    wait_time = 2 ** attempt  # 指数退避：2, 4秒
                    logger.warning(f"Request failed (attempt {attempt + 1}), retrying in {wait_time}s: {str(e)}")
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"All retry attempts failed: {str(e)}")
                    raise e
            except Exception as e:
                # 其他异常不重试
                raise e