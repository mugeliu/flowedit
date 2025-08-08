#!/usr/bin/env python3
"""
Complete System End-to-End Test
Test the optimized 5-Agent collaboration system for high-quality HTML output
"""

import requests
import json
import time
from pathlib import Path

def test_complete_system():
    """Test complete end-to-end system workflow"""
    
    print("Starting complete system end-to-end test...")
    
    # Read test files
    test_dir = Path("F:/project/flowedit/test")
    
    print("Reading test files...")
    with open(test_dir / "test.html", "r", encoding="utf-8") as f:
        original_content = f.read()
    
    with open(test_dir / "bauhaus_compact.html", "r", encoding="utf-8") as f:
        expected_output = f.read()
    
    print(f"Original content length: {len(original_content)} characters")
    print(f"Expected output length: {len(expected_output)} characters")
    
    # Build API request
    api_url = "http://127.0.0.1:8000/api/transform/style"
    
    request_data = {
        "content": original_content,
        "style_requirements": "Bauhaus style"
    }
    
    print("Sending API request to backend service...")
    print(f"Request URL: {api_url}")
    
    try:
        # Send request
        response = requests.post(
            api_url,
            json=request_data,
            headers={"Content-Type": "application/json"},
            timeout=120  # 2 minute timeout
        )
        
        print(f"API response status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("API request successful!")
            
            # Analyze response
            analyze_response(result, expected_output)
            return True
            
        else:
            print(f"API request failed: {response.status_code}")
            print(f"Error details: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("API request timeout (2 minutes)")
        return False
    except requests.exceptions.ConnectionError:
        print("Cannot connect to backend service, ensure server is running")
        return False
    except Exception as e:
        print(f"Request exception: {str(e)}")
        return False

def analyze_response(result, expected_output):
    """Analyze API response results"""
    
    print("\nDetailed Result Analysis:")
    print("=" * 60)
    
    # Basic structure check
    if "success" in result:
        print(f"Request success status: {result['success']}")
    
    if "generated_html" in result:
        generated_html = result["generated_html"]
        print(f"Generated HTML length: {len(generated_html)} characters")
        
        # Save generated HTML to file
        output_file = Path("F:/project/flowedit/test/generated_output.html")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(generated_html)
        print(f"Generated HTML saved to: {output_file}")
        
        # Content quality analysis
        analyze_html_quality(generated_html, expected_output)
    
    if "quality_score" in result:
        quality_score = result["quality_score"]
        print(f"Quality Score: {quality_score:.3f}")
        
        if quality_score >= 0.8:
            print("Quality Score: Excellent (>=0.8)")
        elif quality_score >= 0.7:
            print("Quality Score: Good (>=0.7)")
        elif quality_score >= 0.6:
            print("Quality Score: Acceptable (>=0.6)")
        else:
            print("Quality Score: Below Standard (<0.6)")
    
    if "processing_time" in result:
        print(f"Processing Time: {result['processing_time']:.2f} seconds")
    
    if "agent_execution_log" in result:
        agent_logs = result["agent_execution_log"]
        print(f"Agent Execution Log: {len(agent_logs)} steps")
        
        for i, log in enumerate(agent_logs, 1):
            print(f"  {i}. {log.get('agent', 'Unknown')}: {log.get('status', 'Unknown')}")
    
    if "errors" in result and result["errors"]:
        print(f"Found Errors: {len(result['errors'])}")
        for error in result["errors"]:
            print(f"   - {error}")

def analyze_html_quality(generated_html, expected_output):
    """Analyze generated HTML quality"""
    
    print("\nHTML Quality Analysis:")
    print("-" * 40)
    
    # Basic structure checks
    basic_checks = {
        "Contains HTML tags": "<" in generated_html and ">" in generated_html,
        "Contains inline styles": "style=" in generated_html,
        "Contains section structure": "<section" in generated_html,
        "Contains headings": "<h1" in generated_html,
        "Contains paragraphs": "<p" in generated_html,
        "Contains emphasis": "font-weight" in generated_html,
    }
    
    for check, passed in basic_checks.items():
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {check}")
    
    # Bauhaus style feature checks
    bauhaus_checks = {
        "Geometric section numbers": any(pattern in generated_html for pattern in ["01", "02", "03"]),
        "Color contrast": any(color in generated_html for color in ["#E53E3E", "#3182CE", "#D69E2E"]),
        "Border styling": "border-left:" in generated_html,
        "Background colors": "background:" in generated_html or "background-color:" in generated_html,
        "Typography settings": "font-family:" in generated_html,
        "Separators": "<hr" in generated_html or "■" in generated_html,
    }
    
    print("\nBauhaus Style Features:")
    for check, passed in bauhaus_checks.items():
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {check}")
    
    # Complexity comparison
    expected_sections = expected_output.count("<section")
    generated_sections = generated_html.count("<section")
    
    expected_styles = expected_output.count("style=")
    generated_styles = generated_html.count("style=")
    
    print(f"\nStructure Comparison:")
    print(f"  Sections: Expected {expected_sections} vs Generated {generated_sections}")
    print(f"  Style elements: Expected {expected_styles} vs Generated {generated_styles}")
    
    # Calculate similarity score
    similarity_score = calculate_similarity_score(generated_html, expected_output)
    print(f"  Structural Similarity: {similarity_score:.2f}")

def calculate_similarity_score(generated_html, expected_output):
    """Calculate similarity score between generated and expected HTML"""
    
    score = 0.0
    
    # Structure similarity (30%)
    expected_sections = expected_output.count("<section")
    generated_sections = generated_html.count("<section")
    if expected_sections > 0:
        section_similarity = min(generated_sections / expected_sections, 1.0)
        score += section_similarity * 0.3
    
    # Style complexity (25%)
    expected_styles = expected_output.count("style=")
    generated_styles = generated_html.count("style=")
    if expected_styles > 0:
        style_similarity = min(generated_styles / expected_styles, 1.0)
        score += style_similarity * 0.25
    
    # Bauhaus features (25%)
    bauhaus_features = ["#E53E3E", "#3182CE", "#D69E2E", "border-left:", "font-weight: 700"]
    expected_features = sum(1 for feature in bauhaus_features if feature in expected_output)
    generated_features = sum(1 for feature in bauhaus_features if feature in generated_html)
    if expected_features > 0:
        feature_similarity = min(generated_features / expected_features, 1.0)
        score += feature_similarity * 0.25
    
    # Content length (20%)
    expected_length = len(expected_output)
    generated_length = len(generated_html)
    if expected_length > 0:
        length_similarity = min(generated_length / expected_length, 1.0)
        score += length_similarity * 0.2
    
    return score

if __name__ == "__main__":
    print("LangGraph + LangChain Optimized System - Complete End-to-End Test")
    print("=" * 80)
    
    success = test_complete_system()
    
    print("\n" + "=" * 80)
    if success:
        print("End-to-End Test Complete!")
        print("Please review detailed analysis results to verify system performance")
    else:
        print("End-to-End Test Failed")
        print("Please check backend service status and configuration")
    
    print("=" * 80)