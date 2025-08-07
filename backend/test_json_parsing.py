#!/usr/bin/env python3

"""
测试新的JSON解析功能
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.langchain_chains import StyleDNAGeneratorChain

def test_json_parsing():
    """测试JSON解析功能"""
    
    # 创建生成器实例
    generator = StyleDNAGeneratorChain()
    
    # 测试用例1: 正常的JSON
    print("=== 测试用例1: 正常JSON ===")
    normal_json = """
    {
        "theme_name": "测试主题",
        "h1_styles": {"color": "#333", "font-size": "24px"},
        "p_styles": {"color": "#666", "line-height": "1.6"}
    }
    """
    
    try:
        result1 = generator.parse_and_clean_style_dna(normal_json)
        print("正常JSON解析成功")
        print(f"主题名: {result1.get('theme_name')}")
        print(f"样式数量: {len([k for k in result1.keys() if k.endswith('_styles')])}")
    except Exception as e:
        print(f"正常JSON解析失败: {e}")
    
    # 测试用例2: 带有语法错误的JSON
    print("\n=== 测试用例2: 语法错误JSON ===")
    broken_json = """
    {
        "theme_name": "测试主题",
        "h1_styles": {"color": "#333", "font-size": "24px"},
        "p_styles": {"color": "#666", "line-height": "1.6",}  // 多余逗号
    }
    """
    
    try:
        result2 = generator.parse_and_clean_style_dna(broken_json)
        print("语法错误JSON修复成功")
        print(f"主题名: {result2.get('theme_name')}")
        print(f"样式数量: {len([k for k in result2.keys() if k.endswith('_styles')])}")
    except Exception as e:
        print(f"语法错误JSON修复失败: {e}")
    
    # 测试用例3: 不完整的JSON (模拟AI模型截断)
    print("\n=== 测试用例3: 截断JSON ===")
    truncated_json = """
    {
        "theme_name": "测试主题",
        "h1_styles": {"color": "#333", "font-size": "24px"},
        "p_styles": {"color": "#666", "line-height": "1.6
    """
    
    try:
        result3 = generator.parse_and_clean_style_dna(truncated_json)
        print("截断JSON修复成功")
        print(f"主题名: {result3.get('theme_name')}")
        print(f"样式数量: {len([k for k in result3.keys() if k.endswith('_styles')])}")
    except Exception as e:
        print(f"截断JSON修复失败: {e}")
    
    # 测试用例4: 完全无效的内容
    print("\n=== 测试用例4: 完全无效内容 ===")
    invalid_content = "这不是JSON内容，完全无法解析"
    
    try:
        result4 = generator.parse_and_clean_style_dna(invalid_content)
        print("无效内容使用备用方案成功")
        print(f"主题名: {result4.get('theme_name')}")
        print(f"样式数量: {len([k for k in result4.keys() if k.endswith('_styles')])}")
    except Exception as e:
        print(f"无效内容处理失败: {e}")

if __name__ == "__main__":
    test_json_parsing()