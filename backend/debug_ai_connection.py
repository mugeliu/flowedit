#!/usr/bin/env python3
"""
Diagnostic script to test AI API connection
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.config.settings import settings
from langchain_openai import ChatOpenAI
import time
import asyncio

async def test_ai_connection():
    """Test basic AI connection"""
    print(f"[AI TEST] Testing AI connection...")
    print(f"[AI TEST] Model: {settings.openai_model}")
    print(f"[AI TEST] Base URL: {settings.openai_base_url}")
    print(f"[AI TEST] API Key: {'*' * 20 + settings.openai_api_key[-8:] if settings.openai_api_key else 'NOT SET'}")
    
    try:
        llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.1,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
            timeout=30  # 30 second timeout
        )
        
        print(f"[AI TEST] Sending test message...")
        start_time = time.time()
        
        response = await llm.ainvoke("Hello, please respond with 'Connection successful'")
        
        elapsed = time.time() - start_time
        print(f"[AI TEST] SUCCESS - AI Response received in {elapsed:.2f}s: {response.content}")
        return True
        
    except Exception as e:
        print(f"[AI TEST] ERROR - AI Connection failed: {str(e)}")
        return False

async def test_simple_agent():
    """Test a simple agent execution"""
    print(f"\n[AGENT TEST] Testing ContentAnalystAgent...")
    
    try:
        from src.agents.content_analyst import ContentAnalystAgent
        from src.models.schemas import AgentState
        
        # Create test state
        test_state = AgentState(
            task_id="test-123",
            original_content="<p>测试内容</p>",
            style_requirements={"style_name": "简单测试", "features": ["测试"]},
            current_step="content_analysis"
        )
        
        agent = ContentAnalystAgent()
        print(f"[AGENT TEST] Executing content analysis...")
        
        start_time = time.time()
        result = await asyncio.to_thread(agent.execute, test_state)
        elapsed = time.time() - start_time
        
        print(f"[AGENT TEST] SUCCESS - Agent execution completed in {elapsed:.2f}s")
        print(f"[AGENT TEST] Result: {type(result).__name__}")
        return True
        
    except Exception as e:
        print(f"[AGENT TEST] ERROR - Agent test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    print("[DIAGNOSTIC] Starting AI diagnostic tests...\n")
    
    # Test 1: Basic AI connection
    ai_ok = await test_ai_connection()
    
    if ai_ok:
        # Test 2: Simple agent execution
        agent_ok = await test_simple_agent()
        
        if agent_ok:
            print(f"\n[RESULT] SUCCESS - All tests passed! System should be working correctly.")
        else:
            print(f"\n[RESULT] PARTIAL - AI connection works but agent execution failed.")
    else:
        print(f"\n[RESULT] FAILED - AI connection failed. Check your API configuration.")

if __name__ == "__main__":
    asyncio.run(main())