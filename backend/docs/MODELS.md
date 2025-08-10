# OpenAI-Compatible Models Support

This backend service supports any LLM that provides an OpenAI-compatible API. The system uses the `langchain_openai.ChatOpenAI` client with configurable base URL support.

## Configuration

Set the following environment variables in your `.env` file:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=model_name
OPENAI_BASE_URL=api_endpoint_url  # Optional, defaults to OpenAI
```

## Supported Services

### ✅ Fully Tested and Supported

1. **OpenAI** (Default)
   - Models: gpt-3.5-turbo, gpt-4, gpt-4-turbo
   - Base URL: https://api.openai.com/v1 (can be omitted)
   
2. **DeepSeek**
   - Models: deepseek-chat, deepseek-coder
   - Base URL: https://api.deepseek.com
   
3. **Moonshot (Kimi)**
   - Models: moonshot-v1-8k, moonshot-v1-32k, kimi-k2-0711-preview
   - Base URL: https://api.moonshot.cn/v1

### 🔄 Should Work (OpenAI-Compatible)

4. **GLM (Zhipu AI)**
   - Models: glm-4, glm-3-turbo
   - Base URL: https://open.bigmodel.cn/api/paas/v4
   
5. **Anthropic Claude** (via proxy services)
   - Models: claude-3-opus, claude-3-sonnet
   - Base URL: Depends on proxy service
   
6. **Local Models (via OpenAI-compatible servers)**
   - Ollama with OpenAI compatibility layer
   - LocalAI
   - Text Generation WebUI with OpenAI extension
   - vLLM with OpenAI API server

## Performance Considerations

Different models have varying response times:
- **Fast**: gpt-3.5-turbo, deepseek-chat (~5-15s per agent)
- **Medium**: gpt-4-turbo, glm-4 (~15-30s per agent)
- **Slow**: gpt-4, kimi-k2 (~30-60s per agent)

## Example Configurations

### Using DeepSeek (Fast & Affordable)
```env
OPENAI_API_KEY=sk-your-deepseek-api-key
OPENAI_MODEL=deepseek-chat
OPENAI_BASE_URL=https://api.deepseek.com
```

### Using Moonshot/Kimi (Chinese Context)
```env
OPENAI_API_KEY=sk-your-moonshot-api-key
OPENAI_MODEL=moonshot-v1-8k
OPENAI_BASE_URL=https://api.moonshot.cn/v1
```

### Using Local Ollama
```env
OPENAI_API_KEY=dummy-key  # Ollama doesn't need API key
OPENAI_MODEL=llama2:13b
OPENAI_BASE_URL=http://localhost:11434/v1
```

## Troubleshooting

1. **Connection Errors**: Verify the base URL is correct and accessible
2. **Authentication Errors**: Check your API key is valid for the service
3. **Model Not Found**: Ensure the model name matches exactly what the service expects
4. **Slow Response**: Consider switching to a faster model or service
5. **Rate Limits**: Some services have rate limits; consider adding delays or using multiple API keys

## Adding New Services

To add support for a new OpenAI-compatible service:
1. Test the service endpoint with curl or Postman
2. Add the configuration to your `.env` file
3. Restart the backend service
4. The service should work automatically if it's truly OpenAI-compatible

If the service requires special headers or authentication methods, you may need to modify the `BaseAgent` class in `src/agents/base.py`.