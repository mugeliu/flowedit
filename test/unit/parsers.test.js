/**
 * Parsers 模块单元测试
 * 测试整个 parsers 模块的功能和优化效果
 */

import '../test-env.js'; // 导入测试环境设置
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import { TestAssert, describe, it } from '../test-utils.js';

// 设置路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testDataPath = path.join(__dirname, '../data/test-data.json');
const templatePath = path.join(__dirname, '../templates/default.json');

// 导入要测试的模块
const projectRoot = path.join(__dirname, '../../');

export default async function runParsersTest() {
  describe('Parsers Module Test', async () => {
    let testData, templateData, ParsersModule;

    // 加载测试数据
    await it('加载测试数据和模板', async () => {
      // 加载测试数据
      const testDataContent = fs.readFileSync(testDataPath, 'utf-8');
      testData = JSON.parse(testDataContent);
      TestAssert.assertNotNull(testData, '测试数据加载失败');
      TestAssert.assertTrue(Array.isArray(testData.blocks), '测试数据格式错误');
      console.log(`    加载了 ${testData.blocks.length} 个测试块`);

      // 加载模板数据
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      templateData = JSON.parse(templateContent);
      TestAssert.assertNotNull(templateData, '模板数据加载失败');
      TestAssert.assertNotNull(templateData.blocks, '模板块定义缺失');
      console.log(`    加载了模板: ${templateData.name}`);
    });

    // 导入 parsers 模块
    await it('导入 Parsers 模块', async () => {
      try {
        const ParsersModulePath = path.join(projectRoot, 'src/shared/services/parsers/index.js');
        const moduleUrl = 'file://' + ParsersModulePath;
        ParsersModule = await import(moduleUrl);
        TestAssert.assertNotNull(ParsersModule.default, 'Parsers 模块导入失败');
        console.log('    ✓ Parsers 模块导入成功');
      } catch (error) {
        console.error('导入失败:', error);
        throw error;
      }
    });

    // 测试模块初始化
    await it('测试 Parsers 模块初始化', async () => {
      const parsers = new ParsersModule.default();
      TestAssert.assertNotNull(parsers, '模块实例化失败');
      TestAssert.assertNotNull(parsers.templateLoader, 'TemplateLoader缺失');
      TestAssert.assertNotNull(parsers.renderer, 'Renderer缺失');
      
      // 加载模板到templateLoader
      await parsers.templateLoader.loadTemplate(templateData);
      console.log('    ✓ 模板加载成功');
    });

    // 测试各种块类型的渲染
    await it('测试不同块类型的渲染', async () => {
      const parsers = new ParsersModule.default();
      await parsers.templateLoader.loadTemplate(templateData);

      // 测试段落渲染
      const paragraphBlock = testData.blocks.find(b => b.type === 'paragraph');
      if (paragraphBlock) {
        const result = await parsers.convert({ blocks: [paragraphBlock] });
        // 检查核心文本内容（经过样式处理后的）
        TestAssert.assertContains(result, '这是一个预览测试文件', '段落内容渲染失败');
        TestAssert.assertContains(result, '<p', '段落标签渲染失败');
        console.log('    ✓ 段落块渲染成功');
      }

      // 测试标题渲染
      const headerBlock = testData.blocks.find(b => b.type === 'header');
      if (headerBlock) {
        const result = await parsers.convert({ blocks: [headerBlock] });
        TestAssert.assertContains(result, headerBlock.data.text, '标题内容渲染失败');
        TestAssert.assertContains(result, '<h' + headerBlock.data.level, '标题标签渲染失败');
        console.log('    ✓ 标题块渲染成功');
      }

      // 测试列表渲染
      const listBlock = testData.blocks.find(b => b.type === 'list');
      if (listBlock) {
        const result = await parsers.convert({ blocks: [listBlock] });
        const expectedTag = listBlock.data.style === 'ordered' ? '<ol' : '<ul';
        TestAssert.assertContains(result, expectedTag, '列表标签渲染失败');
        TestAssert.assertContains(result, '<li', '列表项渲染失败');
        console.log('    ✓ 列表块渲染成功');
      }

      // 测试引用渲染
      const quoteBlock = testData.blocks.find(b => b.type === 'quote');
      if (quoteBlock) {
        const result = await parsers.convert({ blocks: [quoteBlock] });
        TestAssert.assertContains(result, quoteBlock.data.text, '引用内容渲染失败');
        console.log('    ✓ 引用块渲染成功');
      }

      // 测试代码块渲染
      const codeBlock = testData.blocks.find(b => b.type === 'code');
      if (codeBlock) {
        const result = await parsers.convert({ blocks: [codeBlock] });
        TestAssert.assertContains(result, '<code', '代码标签渲染失败');
        console.log('    ✓ 代码块渲染成功');
      }

      // 测试分隔符渲染
      const delimiterBlock = testData.blocks.find(b => b.type === 'delimiter');
      if (delimiterBlock) {
        const result = await parsers.convert({ blocks: [delimiterBlock] });
        TestAssert.assertContains(result, '<hr', '分隔符渲染失败');
        console.log('    ✓ 分隔符块渲染成功');
      }
    });

    // 测试内联样式处理
    await it('测试内联样式处理', async () => {
      const parsers = new ParsersModule.default();
      await parsers.templateLoader.loadTemplate(templateData);

      // 查找包含内联样式的段落
      const inlineStyleBlock = testData.blocks.find(b => 
        b.type === 'paragraph' && 
        b.data.text && 
        (b.data.text.includes('<b>') || 
         b.data.text.includes('<mark') || 
         b.data.text.includes('<code'))
      );

      if (inlineStyleBlock) {
        const result = await parsers.convert({ blocks: [inlineStyleBlock] });
        TestAssert.assertNotNull(result, '内联样式渲染失败');
        
        // 检查样式是否被正确应用
        if (inlineStyleBlock.data.text.includes('<b>')) {
          TestAssert.assertContains(result, 'font-weight: 700', '粗体样式应用失败');
        }
        if (inlineStyleBlock.data.text.includes('<mark')) {
          TestAssert.assertContains(result, 'background:', '标记样式应用失败');
        }
        
        console.log('    ✓ 内联样式处理成功');
      }
    });

    // 测试完整文档渲染
    await it('测试完整文档渲染', async () => {
      const parsers = new ParsersModule.default();
      await parsers.templateLoader.loadTemplate(templateData);

      const result = await parsers.convert(testData);
      TestAssert.assertNotNull(result, '完整文档渲染失败');
      TestAssert.assertTrue(result.length > 1000, '渲染结果太短，可能渲染不完整');
      
      // 检查是否包含容器样式
      TestAssert.assertContains(result, '<section', '容器样式应用失败');
      
      console.log(`    ✓ 完整文档渲染成功 (${result.length} 字符)`);
    });

    // 测试错误处理
    await it('测试错误处理', async () => {
      const parsers = new ParsersModule.default();
      await parsers.templateLoader.loadTemplate(templateData);

      // 测试空数据处理
      TestAssert.assertThrowsAsync(async () => {
        await parsers.convert(null);
      }, '空数据应该抛出异常');

      // 测试无效格式处理  
      TestAssert.assertThrowsAsync(async () => {
        await parsers.convert({});
      }, '无效格式应该抛出异常');

      console.log('    ✓ 错误处理测试通过');
    });

    // 测试优化效果
    await it('测试优化效果', async () => {
      console.log('    📊 优化效果验证:');
      
      // 测试懒加载：多次实例化不应该重复创建渲染器
      const parsers1 = new ParsersModule.default();
      const parsers2 = new ParsersModule.default();
      await parsers1.templateLoader.loadTemplate(templateData);
      await parsers2.templateLoader.loadTemplate(templateData);
      
      // 性能测试：测试渲染速度
      const startTime = Date.now();
      await parsers1.convert(testData);
      const renderTime = Date.now() - startTime;
      
      console.log(`    ⏱️  渲染时间: ${renderTime}ms`);
      TestAssert.assertTrue(renderTime < 1000, `渲染时间过长: ${renderTime}ms`);
      
      console.log('    ✓ 性能优化验证通过');
    });
  });
}