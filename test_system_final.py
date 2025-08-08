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
    
    # Step 1: Create transformation task
    api_url = "http://127.0.0.1:8000/api/v1/transform"
    
    request_data = {
        "content": original_content,
        "style_name": "Bauhaus",
        "style_features": ["geometric", "bold_colors", "minimal_design"]
    }
    
    print("Step 1: Creating transformation task...")
    print(f"Request URL: {api_url}")
    
    try:
        # Send task creation request
        response = requests.post(
            api_url,
            json=request_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Task creation response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Task creation failed: {response.status_code}")
            print(f"Error details: {response.text}")
            return False
        
        task_response = response.json()
        task_id = task_response["task_id"]
        print(f"Task created successfully! Task ID: {task_id}")
        
        # Step 2: Monitor task progress
        return monitor_task_progress(task_id, expected_output)
        
    except Exception as e:
        print(f"Task creation exception: {str(e)}")
        return False

def monitor_task_progress(task_id, expected_output):
    """Monitor task progress and get results"""
    
    print(f"\nStep 2: Monitoring task progress for {task_id}...")
    
    status_url = f"http://127.0.0.1:8000/api/v1/task/{task_id}"
    max_attempts = 60  # 2 minutes with 2-second intervals
    attempt = 0
    
    while attempt < max_attempts:
        try:
            response = requests.get(status_url, timeout=10)
            
            if response.status_code != 200:
                print(f"Status check failed: {response.status_code}")
                return False
            
            task_status = response.json()
            status = task_status["status"]
            progress = task_status["progress"]
            
            print(f"Attempt {attempt + 1}: Status = {status}, Progress = {progress:.1f}%")
            
            if status == "completed":
                print("Task completed successfully!")
                
                # Get detailed results
                result_html = task_status.get("result")
                if result_html:
                    analyze_results(task_id, result_html, expected_output)
                    return True
                else:
                    print("No result HTML found in completed task")
                    return False
            
            elif status == "failed":
                error_msg = task_status.get("error", "Unknown error")
                print(f"Task failed: {error_msg}")
                return False
            
            elif status == "running":
                # Continue monitoring
                time.sleep(2)
                attempt += 1
            
        except Exception as e:
            print(f"Status check exception: {str(e)}")
            attempt += 1
            time.sleep(2)
    
    print("Task monitoring timed out after 2 minutes")
    return False

def analyze_results(task_id, generated_html, expected_output):
    """Analyze the final results"""
    
    print(f"\nStep 3: Analyzing Results for Task {task_id}")
    print("=" * 60)
    
    # Save generated HTML
    output_file = Path("F:/project/flowedit/test/generated_output.html")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(generated_html)
    print(f"Generated HTML saved to: {output_file}")
    print(f"Generated HTML length: {len(generated_html)} characters")
    
    # Get detailed execution steps
    get_task_details(task_id)
    
    # Analyze HTML quality
    analyze_html_quality(generated_html, expected_output)

def get_task_details(task_id):
    """Get detailed task execution information"""
    
    try:
        details_url = f"http://127.0.0.1:8000/api/v1/task/{task_id}/steps"
        response = requests.get(details_url, timeout=10)
        
        if response.status_code == 200:
            details = response.json()
            
            print(f"\nTask Execution Details:")
            print(f"Current Step: {details['current_step']}")
            
            steps = details.get("steps", [])
            print(f"Total Steps: {len(steps)}")
            
            for i, step in enumerate(steps, 1):
                agent = step["agent_name"]
                status = step["status"]
                exec_time = step.get("execution_time", 0)
                
                print(f"  {i}. {agent}: {status} ({exec_time:.2f}s)")
                
                if step.get("error_message"):
                    print(f"     Error: {step['error_message']}")
            
            # Quality report
            quality_report = details.get("quality_report")
            if quality_report:
                print(f"\nQuality Report:")
                print(f"  Score: {quality_report.get('quality_score', 'N/A')}")
                print(f"  Summary: {quality_report.get('summary', 'N/A')}")
        
    except Exception as e:
        print(f"Failed to get task details: {str(e)}")

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
    bauhaus_pass_count = 0
    for check, passed in bauhaus_checks.items():
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {check}")
        if passed:
            bauhaus_pass_count += 1
    
    # Complexity comparison
    expected_sections = expected_output.count("<section")
    generated_sections = generated_html.count("<section")
    
    expected_styles = expected_output.count("style=")
    generated_styles = generated_html.count("style=")
    
    print(f"\nStructure Comparison:")
    print(f"  Sections: Expected {expected_sections} vs Generated {generated_sections}")
    print(f"  Style elements: Expected {expected_styles} vs Generated {generated_styles}")
    
    # Calculate overall success metrics
    basic_pass_rate = sum(basic_checks.values()) / len(basic_checks) * 100
    bauhaus_pass_rate = bauhaus_pass_count / len(bauhaus_checks) * 100
    
    print(f"\nOverall Assessment:")
    print(f"  Basic Structure: {basic_pass_rate:.1f}% ({sum(basic_checks.values())}/{len(basic_checks)} checks passed)")
    print(f"  Bauhaus Features: {bauhaus_pass_rate:.1f}% ({bauhaus_pass_count}/{len(bauhaus_checks)} features present)")
    
    # Calculate similarity score
    similarity_score = calculate_similarity_score(generated_html, expected_output)
    print(f"  Structural Similarity: {similarity_score:.2f}")
    
    # Overall assessment
    if basic_pass_rate >= 80 and bauhaus_pass_rate >= 60 and similarity_score >= 0.5:
        print(f"\nOVERALL: EXCELLENT - System produces high-quality styled HTML")
    elif basic_pass_rate >= 70 and bauhaus_pass_rate >= 40:
        print(f"\nOVERALL: GOOD - System produces acceptable styled HTML")
    elif basic_pass_rate >= 50:
        print(f"\nOVERALL: ACCEPTABLE - Basic functionality working")
    else:
        print(f"\nOVERALL: NEEDS IMPROVEMENT - Multiple issues detected")

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
    
    # Test health check first
    try:
        health_response = requests.get("http://127.0.0.1:8000/api/v1/health", timeout=5)
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"Backend Service Status: {health_data['status']}")
            print(f"Active Tasks: {health_data['active_tasks']}")
        else:
            print("Backend service health check failed")
    except Exception as e:
        print(f"Cannot connect to backend service: {e}")
        print("Please ensure the backend server is running on http://127.0.0.1:8000")
        exit(1)
    
    success = test_complete_system()
    
    print("\n" + "=" * 80)
    if success:
        print("END-TO-END TEST COMPLETED SUCCESSFULLY!")
        print("The optimized LangGraph + LangChain system is functioning properly.")
    else:
        print("END-TO-END TEST FAILED")
        print("Please review the error messages and check system configuration.")
    
    print("=" * 80)