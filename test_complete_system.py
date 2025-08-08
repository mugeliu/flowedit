#!/usr/bin/env python3
"""
完整系统端到端测试脚本
测试优化后的5-Agent协作系统是否能产生高质量的HTML输出
"""

import requests
import json
import time
from pathlib import Path

def test_complete_system():
    """测试完整的系统端到端流程"""
    
    print("🚀 开始完整系统端到端测试...")
    
    # 读取测试文件
    test_dir = Path("F:/project/flowedit/test")
    
    print("📖 读取测试文件...")
    with open(test_dir / "test.html", "r", encoding="utf-8") as f:
        original_content = f.read()
    
    with open(test_dir / "bauhaus_compact.html", "r", encoding="utf-8") as f:
        expected_output = f.read()
    
    print(f"✅ 原始内容长度: {len(original_content)} 字符")
    print(f"✅ 期望输出长度: {len(expected_output)} 字符")
    
    # 构建API请求
    api_url = "http://127.0.0.1:8000/api/transform/style"
    
    request_data = {
        "content": original_content,
        "style_requirements": "包豪斯风格"
    }
    
    print("📡 发送API请求到后端服务...")
    print(f"请求URL: {api_url}")
    
    try:
        # 发送请求
        response = requests.post(
            api_url,
            json=request_data,
            headers={"Content-Type": "application/json"},
            timeout=120  # 2分钟超时
        )
        
        print(f"📊 API响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API请求成功!")
            
            # 分析响应结果
            analyze_response(result, expected_output)
            
        else:
            print(f"❌ API请求失败: {response.status_code}")
            print(f"错误详情: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ API请求超时 (2分钟)")
        return False
    except requests.exceptions.ConnectionError:
        print("🔌 无法连接到后端服务，请确保服务正在运行")
        return False
    except Exception as e:
        print(f"❌ 请求异常: {str(e)}")
        return False
    
    return True

def analyze_response(result, expected_output):
    """分析API响应结果"""
    
    print("\n🔍 详细结果分析:")
    print("=" * 60)
    
    # 基本结构检查
    if "success" in result:
        print(f"✅ 请求成功状态: {result['success']}")
    
    if "generated_html" in result:
        generated_html = result["generated_html"]
        print(f"✅ 生成HTML长度: {len(generated_html)} 字符")
        
        # 保存生成的HTML到文件
        output_file = Path("F:/project/flowedit/test/generated_output.html")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(generated_html)
        print(f"💾 生成的HTML已保存到: {output_file}")
        
        # 内容质量分析
        analyze_html_quality(generated_html, expected_output)
    
    if "quality_score" in result:
        quality_score = result["quality_score"]
        print(f"🎯 质量评分: {quality_score:.3f}")
        
        if quality_score >= 0.8:
            print("🏆 质量评分优秀 (≥0.8)")
        elif quality_score >= 0.7:
            print("✅ 质量评分良好 (≥0.7)")
        elif quality_score >= 0.6:
            print("⚠️  质量评分可接受 (≥0.6)")
        else:
            print("❌ 质量评分不达标 (<0.6)")
    
    if "processing_time" in result:
        print(f"⏱️  处理时间: {result['processing_time']:.2f}秒")
    
    if "agent_execution_log" in result:
        agent_logs = result["agent_execution_log"]
        print(f"🤖 Agent执行记录: {len(agent_logs)}个步骤")
        
        for i, log in enumerate(agent_logs, 1):
            print(f"  {i}. {log.get('agent', 'Unknown')}: {log.get('status', 'Unknown')}")
    
    if "errors" in result and result["errors"]:
        print(f"⚠️  发现错误: {len(result['errors'])}个")
        for error in result["errors"]:
            print(f"   - {error}")

def analyze_html_quality(generated_html, expected_output):
    """分析生成HTML的质量"""
    
    print("\n🎨 HTML质量分析:")
    print("-" * 40)
    
    # 基本结构检查
    basic_checks = {
        "包含HTML标签": "<" in generated_html and ">" in generated_html,
        "包含内联样式": "style=" in generated_html,
        "包含章节结构": "<section" in generated_html,
        "包含标题": "<h1" in generated_html,
        "包含段落": "<p" in generated_html,
        "包含强调内容": "font-weight" in generated_html,
    }
    
    for check, passed in basic_checks.items():
        status = "✅" if passed else "❌"
        print(f"  {status} {check}")
    
    # 包豪斯风格特征检查
    bauhaus_checks = {
        "几何形状标号": any(pattern in generated_html for pattern in ["01", "02", "03"]),
        "颜色对比": any(color in generated_html for color in ["#E53E3E", "#3182CE", "#D69E2E"]),
        "边框样式": "border-left:" in generated_html,
        "背景颜色": "background:" in generated_html or "background-color:" in generated_html,
        "字体设置": "font-family:" in generated_html,
        "分割线": "<hr" in generated_html or "■" in generated_html,
    }
    
    print("\n📐 包豪斯风格特征:")
    for check, passed in bauhaus_checks.items():
        status = "✅" if passed else "❌"
        print(f"  {status} {check}")
    
    # 复杂度对比
    expected_sections = expected_output.count("<section")
    generated_sections = generated_html.count("<section")
    
    expected_styles = expected_output.count("style=")
    generated_styles = generated_html.count("style=")
    
    print(f"\n📊 结构对比:")
    print(f"  章节数量: 期望{expected_sections} vs 生成{generated_sections}")
    print(f"  样式元素: 期望{expected_styles} vs 生成{generated_styles}")
    
    # 计算相似度得分
    similarity_score = calculate_similarity_score(generated_html, expected_output)
    print(f"  📈 结构相似度: {similarity_score:.2f}")

def calculate_similarity_score(generated_html, expected_output):
    """计算生成HTML与期望输出的相似度"""
    
    score = 0.0
    
    # 结构相似度 (30%)
    expected_sections = expected_output.count("<section")
    generated_sections = generated_html.count("<section")
    if expected_sections > 0:
        section_similarity = min(generated_sections / expected_sections, 1.0)
        score += section_similarity * 0.3
    
    # 样式复杂度 (25%)
    expected_styles = expected_output.count("style=")
    generated_styles = generated_html.count("style=")
    if expected_styles > 0:
        style_similarity = min(generated_styles / expected_styles, 1.0)
        score += style_similarity * 0.25
    
    # 包豪斯特征 (25%)
    bauhaus_features = ["#E53E3E", "#3182CE", "#D69E2E", "border-left:", "font-weight: 700"]
    expected_features = sum(1 for feature in bauhaus_features if feature in expected_output)
    generated_features = sum(1 for feature in bauhaus_features if feature in generated_html)
    if expected_features > 0:
        feature_similarity = min(generated_features / expected_features, 1.0)
        score += feature_similarity * 0.25
    
    # 内容长度 (20%)
    expected_length = len(expected_output)
    generated_length = len(generated_html)
    if expected_length > 0:
        length_similarity = min(generated_length / expected_length, 1.0)
        score += length_similarity * 0.2
    
    return score

if __name__ == "__main__":
    print("🧪 LangGraph + LangChain 优化系统 - 完整端到端测试")
    print("=" * 80)
    
    success = test_complete_system()
    
    print("\n" + "=" * 80)
    if success:
        print("🎉 端到端测试完成!")
        print("📋 请查看详细分析结果以验证系统性能")
    else:
        print("❌ 端到端测试失败")
        print("🔧 请检查后端服务状态和配置")
    
    print("=" * 80)