#!/usr/bin/env python3
"""
调试内容解析器的脚本
用于测试多层解析策略是否正常工作
"""

import sys
import os
sys.path.append('/Users/mugeliu/program/project/flowedit/backend')

from app.core.langchain_chains import ContentParserChain
from langchain_openai import ChatOpenAI
from app.core.config import settings
import json

def test_content_parsing():
    """测试内容解析功能"""
    print("🔧 初始化内容解析器...")
    
    # 初始化LLM
    llm = ChatOpenAI(
        model=settings.default_model,
        temperature=settings.temperature,
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        max_tokens=settings.max_tokens
    )
    
    # 创建解析器
    content_parser = ContentParserChain(llm)
    
    # 测试内容1: 简单内容
    print("\n📝 测试1: 简单内容解析")
    simple_content = """# 简单测试内容

## 这是一个简单的标题

这是一个测试段落，用于验证API是否正常工作。

### 子标题

- 列表项目1
- 列表项目2
- 列表项目3

这是另一个段落，**包含加粗文字**和*斜体文字*。"""
    
    try:
        raw_output = content_parser.chain.invoke({"raw_content": simple_content})
        print(f"LLM原始输出 (长度: {len(raw_output)}):")
        print("=" * 50)
        print(raw_output)
        print("=" * 50)
        
        result = content_parser.parse_and_clean(raw_output)
        print(f"✅ 解析成功! 提取到 {len(result.elements)} 个元素:")
        for i, element in enumerate(result.elements):
            print(f"  {i+1}. {element}")
            
    except Exception as e:
        print(f"❌ 解析失败: {str(e)}")
        return False
    
    # 测试内容2: FlowEdit完整内容的前一部分
    print("\n📝 测试2: FlowEdit内容前段解析")
    flowedit_content = """# FlowEdit - 重新定义微信公众号内容创作体验

## 产品概述

FlowEdit 是一款革命性的 Chrome 浏览器扩展，专为微信公众号创作者设计。通过深度集成现代化的 Editor.js 编辑器和 AI 智能功能，FlowEdit 将传统的公众号编辑体验提升到全新高度。

### 为什么选择 FlowEdit？

在内容创作的时代，**效率**和**质量**是每个创作者追求的目标。FlowEdit 正是为解决这一痛点而生：

- 告别繁琐的格式调整，专注内容本身
- 智能化的排版建议，让文章更具专业感
- 丰富的模板库，快速开启创作灵感
- 一键风格化，打造独特的品牌形象"""
    
    try:
        raw_output = content_parser.chain.invoke({"raw_content": flowedit_content})
        print(f"LLM原始输出 (长度: {len(raw_output)}):")
        print("=" * 50)
        print(raw_output[:500] + "..." if len(raw_output) > 500 else raw_output)
        print("=" * 50)
        
        result = content_parser.parse_and_clean(raw_output)
        print(f"✅ 解析成功! 提取到 {len(result.elements)} 个元素:")
        for i, element in enumerate(result.elements):
            print(f"  {i+1}. {element}")
            
    except Exception as e:
        print(f"❌ 解析失败: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 启动内容解析器调试...")
    success = test_content_parsing()
    
    if success:
        print("\n✅ 所有测试通过!")
    else:
        print("\n❌ 存在测试失败!")
        sys.exit(1)