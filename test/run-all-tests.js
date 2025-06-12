#!/usr/bin/env node
/**
 * 统一测试入口文件 - 简化版
 * 运行所有测试并生成报告
 * 采用最小分类结构：unit/ 和 examples/ 两个目录
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 测试配置
 */
const testConfig = {
  parsers: [
    {
      name: '样式解析器测试',
      file: 'unit/styled-parser.test.js',
      description: '测试样式配置系统和块解析器'
    },
    {
      name: '模板解析器测试', 
      file: 'unit/template-parser.test.js',
      description: '测试基于模板的HTML解析器模块'
    }
  ],
  editor: [
    {
      name: '编辑器简单测试',
      file: 'unit/editor-simple.test.js', 
      description: '测试saveToOriginalEditor函数适配'
    }
  ],
  manual: [
    {
       name: '编辑器集成测试页面',
       file: 'examples/editor-integration.html',
       description: '在浏览器中测试EditorJS编辑器的完整功能'
     },
     {
       name: '编辑器集成测试脚本',
       file: 'unit/editor-integration.test.js',
       description: '编辑器集成功能的自动化测试脚本'
     },
    {
      name: '样式解析结果预览',
      file: 'examples/styled-result.html',
      description: '查看样式解析器的输出效果'
    },
    {
      name: '模板解析结果预览', 
      file: 'examples/template-result.html',
      description: '查看模板解析器的输出效果'
    },
    {
      name: '基础用法示例',
      file: 'examples/simple-demo.html',
      description: '查看FlowEdit的基础用法示例'
    },
    {
      name: '微信集成示例',
      file: 'examples/wechat-demo.html',
      description: '查看微信公众号集成示例'
    }
  ]
};

/**
 * 运行单个测试文件
 */
function runTest(testFile) {
  const fullPath = join(__dirname, testFile);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`测试文件不存在: ${fullPath}`);
  }
  
  try {
    console.log(`\n🔄 运行测试: ${testFile}`);
    const output = execSync(`node "${fullPath}"`, { 
      encoding: 'utf8',
      cwd: __dirname 
    });
    console.log('✅ 测试通过');
    if (output.trim()) {
      console.log('📋 输出:', output.trim());
    }
    return { success: true, output };
  } catch (error) {
    console.log('❌ 测试失败');
    console.log('💥 错误:', error.message);
    if (error.stdout) {
      console.log('📋 标准输出:', error.stdout.toString());
    }
    if (error.stderr) {
      console.log('🚨 错误输出:', error.stderr.toString());
    }
    return { success: false, error: error.message };
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始运行所有自动化测试...\n');
  console.log('=' .repeat(60));
  
  const results = {
    parsers: [],
    editor: [],
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // 运行解析器测试
  console.log('\n📦 解析器测试');
  console.log('-'.repeat(40));
  for (const test of testConfig.parsers) {
    console.log(`\n📝 ${test.name}`);
    console.log(`   ${test.description}`);
    const result = runTest(test.file);
    results.parsers.push({ ...test, ...result });
    results.total++;
    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // 运行编辑器测试
  console.log('\n🖊️  编辑器测试');
  console.log('-'.repeat(40));
  for (const test of testConfig.editor) {
    console.log(`\n📝 ${test.name}`);
    console.log(`   ${test.description}`);
    const result = runTest(test.file);
    results.editor.push({ ...test, ...result });
    results.total++;
    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // 显示手动测试项目
  console.log('\n🖱️  手动测试项目');
  console.log('-'.repeat(40));
  for (const test of testConfig.manual) {
    const fullPath = join(__dirname, test.file);
    const exists = fs.existsSync(fullPath);
    console.log(`\n📄 ${test.name}`);
    console.log(`   ${test.description}`);
    console.log(`   文件: ${test.file} ${exists ? '✅' : '❌ 文件不存在'}`);
    if (exists) {
      console.log(`   打开命令: open "${fullPath}"`);
    }
  }
  
  // 显示测试总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));
  console.log(`总计: ${results.total} 个自动化测试`);
  console.log(`通过: ${results.passed} 个 ✅`);
  console.log(`失败: ${results.failed} 个 ❌`);
  console.log(`手动测试: ${testConfig.manual.length} 个 🖱️`);
  
  if (results.failed > 0) {
    console.log('\n❌ 部分测试失败，请检查上述错误信息');
    process.exit(1);
  } else {
    console.log('\n🎉 所有自动化测试通过！');
    console.log('\n💡 提示: 请手动运行上述手动测试项目以完成完整测试');
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runTest, testConfig };