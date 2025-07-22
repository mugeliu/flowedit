/**
 * 测试运行器
 * 运行所有测试文件
 */

import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TestRunner {
  constructor() {
    this.testFiles = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async findTestFiles(directory) {
    const fullPath = path.join(__dirname, directory);
    if (!fs.existsSync(fullPath)) {
      console.log(`目录不存在: ${fullPath}`);
      return;
    }

    const files = fs.readdirSync(fullPath);
    for (const file of files) {
      const filePath = path.join(fullPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        await this.findTestFiles(path.join(directory, file));
      } else if (file.endsWith('.test.js')) {
        this.testFiles.push(path.join(directory, file));
      }
    }
  }

  async runTest(testFile) {
    try {
      const testPath = path.join(__dirname, testFile);
      const testUrl = pathToFileURL(testPath).href;
      
      console.log(`\n🧪 运行测试: ${testFile}`);
      console.log('='.repeat(50));
      
      const testModule = await import(testUrl);
      if (testModule.default && typeof testModule.default === 'function') {
        await testModule.default();
        this.results.passed++;
        console.log('✅ 测试通过');
      } else {
        throw new Error('测试文件必须导出默认函数');
      }
    } catch (error) {
      this.results.failed++;
      console.log('❌ 测试失败:');
      console.error(error);
    }
    this.results.total++;
  }

  async run() {
    console.log('🚀 开始运行测试...\n');
    
    // 查找所有测试文件
    await this.findTestFiles('unit');
    
    if (this.testFiles.length === 0) {
      console.log('⚠️  未找到测试文件');
      return;
    }

    console.log(`发现 ${this.testFiles.length} 个测试文件`);
    
    // 运行所有测试
    for (const testFile of this.testFiles) {
      await this.runTest(testFile);
    }

    // 输出结果
    console.log('\n' + '='.repeat(50));
    console.log('📊 测试结果:');
    console.log(`总计: ${this.results.total}`);
    console.log(`通过: ${this.results.passed} ✅`);
    console.log(`失败: ${this.results.failed} ❌`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ 存在测试失败');
      process.exit(1);
    } else {
      console.log('\n✅ 所有测试通过');
    }
  }
}

// 运行测试
const runner = new TestRunner();
runner.run().catch(console.error);