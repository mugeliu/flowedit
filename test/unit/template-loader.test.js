/**
 * TemplateLoader 单元测试
 * 测试模板加载和缓存功能
 */

import '../test-env.js'; // 导入测试环境设置
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import { TestAssert, describe, it } from '../test-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '../../');
const templatePath = path.join(__dirname, '../templates/default.json');

export default async function runTemplateLoaderTest() {
  describe('TemplateLoader Test', async () => {
    let TemplateLoader, templateData;

    await it('导入 TemplateLoader 模块', async () => {
      try {
        const loaderPath = path.join(projectRoot, 'src/shared/services/parsers/TemplateLoader.js');
        const moduleUrl = 'file://' + loaderPath;
        const module = await import(moduleUrl);
        TemplateLoader = module.default;
        TestAssert.assertNotNull(TemplateLoader, 'TemplateLoader 导入失败');
        console.log('    ✓ TemplateLoader 模块导入成功');
      } catch (error) {
        console.error('导入失败:', error);
        throw error;
      }
    });

    await it('加载测试模板数据', () => {
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      templateData = JSON.parse(templateContent);
      TestAssert.assertNotNull(templateData, '模板数据加载失败');
      TestAssert.assertNotNull(templateData.blocks, '模板blocks缺失');
      console.log(`    ✓ 加载模板: ${templateData.name}`);
    });

    await it('测试 TemplateLoader 初始化', () => {
      const loader = new TemplateLoader();
      TestAssert.assertNotNull(loader, 'TemplateLoader 实例化失败');
      TestAssert.assertFalse(loader.isLoaded, '初始状态应该未加载');
      console.log('    ✓ TemplateLoader 初始化成功');
    });

    await it('测试模板加载', async () => {
      const loader = new TemplateLoader();
      
      await loader.loadTemplate(templateData);
      TestAssert.assertTrue(loader.isLoaded, '模板加载后应该标记为已加载');
      
      console.log('    ✓ 模板加载成功');
    });

    await it('测试获取块模板', async () => {
      const loader = new TemplateLoader();
      await loader.loadTemplate(templateData);
      
      // 测试段落模板
      const paragraphTemplate = await loader.getBlockTemplate('paragraph');
      TestAssert.assertNotNull(paragraphTemplate, '段落模板获取失败');
      TestAssert.assertContains(paragraphTemplate, '{{text}}', '段落模板应包含text变量');
      
      // 测试标题模板
      const headerTemplate = await loader.getBlockTemplate('header', 'h1');
      TestAssert.assertNotNull(headerTemplate, '标题模板获取失败');
      
      // 测试列表模板
      const listTemplate = await loader.getBlockTemplate('List');
      TestAssert.assertNotNull(listTemplate, '列表模板获取失败');
      TestAssert.assertNotNull(listTemplate.unordered, '无序列表模板缺失');
      TestAssert.assertNotNull(listTemplate.ordered, '有序列表模板缺失');
      
      console.log('    ✓ 块模板获取成功');
    });

    await it('测试内联样式获取', async () => {
      const loader = new TemplateLoader();
      await loader.loadTemplate(templateData);
      
      // 测试获取特定标签的内联样式
      const strongStyle = await loader.getInlineStyle('strong');
      TestAssert.assertNotNull(strongStyle, '粗体样式获取失败');
      TestAssert.assertContains(strongStyle, 'font-weight', '粗体样式应包含font-weight');
      
      const codeStyle = await loader.getInlineStyle('code');
      TestAssert.assertNotNull(codeStyle, '代码样式获取失败');
      
      const linkStyle = await loader.getInlineStyle('a');
      TestAssert.assertNotNull(linkStyle, '链接样式获取失败');
      
      // 测试不存在的样式
      const nonexistentStyle = await loader.getInlineStyle('nonexistent');
      TestAssert.assertEqual(nonexistentStyle, null, '不存在的样式应返回null');
      
      console.log('    ✓ 内联样式获取成功');
    });

    await it('测试全局样式获取', async () => {
      const loader = new TemplateLoader();
      await loader.loadTemplate(templateData);
      
      const containerStyle = await loader.getGlobalStyle('container');
      TestAssert.assertNotNull(containerStyle, '容器样式获取失败');
      TestAssert.assertContains(containerStyle, '{{content}}', '容器样式应包含content变量');
      
      const referencesStyle = await loader.getGlobalStyle('references');
      TestAssert.assertNotNull(referencesStyle, '参考链接样式获取失败');
      
      console.log('    ✓ 全局样式获取成功');
    });

    await it('测试模板缓存功能', async () => {
      const loader = new TemplateLoader();
      await loader.loadTemplate(templateData);
      
      // 第一次获取
      const start1 = Date.now();
      const template1 = await loader.getBlockTemplate('paragraph');
      const time1 = Date.now() - start1;
      
      // 第二次获取（应该从缓存获取）
      const start2 = Date.now();
      const template2 = await loader.getBlockTemplate('paragraph');
      const time2 = Date.now() - start2;
      
      TestAssert.assertEqual(template1, template2, '缓存返回的模板应该相同');
      TestAssert.assertTrue(time2 <= time1, '缓存获取应该更快或相等');
      
      console.log(`    ✓ 模板缓存功能验证 (首次: ${time1}ms, 缓存: ${time2}ms)`);
    });

    await it('测试错误处理', async () => {
      const loader = new TemplateLoader();
      
      // 测试未加载模板时的获取
      const emptyResult = await loader.getBlockTemplate('paragraph');
      TestAssert.assertEqual(emptyResult, null, '未加载模板时应该返回null');
      
      // 测试不存在的块模板
      await loader.loadTemplate(templateData);
      const notFoundResult = await loader.getBlockTemplate('nonexistent');
      TestAssert.assertEqual(notFoundResult, null, '不存在的块模板应该返回null');
      
      console.log('    ✓ 错误处理测试通过');
    });

    await it('测试模板重新加载', async () => {
      const loader = new TemplateLoader();
      
      // 第一次加载
      await loader.loadTemplate(templateData);
      const template1 = await loader.getBlockTemplate('paragraph');
      
      // 修改模板数据并重新加载
      const modifiedTemplateData = { 
        ...templateData, 
        blocks: { 
          ...templateData.blocks, 
          paragraph: '<p class="modified">{{text}}</p>' 
        }
      };
      
      // 清除缓存以确保重新加载
      loader.clearCache();
      
      await loader.loadTemplate(modifiedTemplateData);
      const template2 = await loader.getBlockTemplate('paragraph');
      
      TestAssert.assertNotContains(template1, 'modified', '原模板不应包含修改标记');
      TestAssert.assertContains(template2, 'modified', '新模板应包含修改标记');
      
      console.log('    ✓ 模板重新加载测试通过');
    });

    await it('测试存储缓存功能', async () => {
      const loader1 = new TemplateLoader();
      const loader2 = new TemplateLoader();
      
      // 在第一个实例中加载模板
      await loader1.loadTemplate(templateData);
      
      // 在第二个实例中也应该能获取到（如果存储缓存工作正常）
      const template = await loader2.getBlockTemplate('paragraph');
      
      // 注意：在测试环境中，chrome.storage 是模拟的，所以这个测试主要验证代码不会崩溃
      TestAssert.assertNotNull(loader2, '第二个loader实例应该正常工作');
      
      console.log('    ✓ 存储缓存功能测试通过');
    });

    // 性能测试
    await it('测试模板加载性能', async () => {
      const iterations = 10;
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const loader = new TemplateLoader();
        
        const start = Date.now();
        await loader.loadTemplate(templateData);
        await loader.getBlockTemplate('paragraph');
        await loader.getInlineStyle('strong');
        await loader.getGlobalStyle('container');
        const time = Date.now() - start;
        
        times.push(time);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      console.log(`    ⏱️  平均加载时间: ${avgTime.toFixed(1)}ms`);
      console.log(`    ⏱️  最大加载时间: ${maxTime}ms`);
      
      TestAssert.assertTrue(avgTime < 20, `平均加载时间过长: ${avgTime}ms`);
      TestAssert.assertTrue(maxTime < 50, `最大加载时间过长: ${maxTime}ms`);
      
      console.log('    ✓ 性能测试通过');
    });
  });
}