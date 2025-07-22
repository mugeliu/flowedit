/**
 * Utils 工具函数单元测试
 * 测试 parsers/utils.js 中的共享工具函数
 */

import '../test-env.js'; // 导入测试环境设置
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { TestAssert, describe, it } from '../test-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '../../');

export default async function runUtilsTest() {
  describe('Utils Functions Test', async () => {
    let utils;

    await it('导入 Utils 模块', async () => {
      try {
        const utilsPath = path.join(projectRoot, 'src/shared/services/parsers/utils.js');
        const moduleUrl = 'file://' + utilsPath;
        utils = await import(moduleUrl);
        TestAssert.assertNotNull(utils, 'Utils 模块导入失败');
        console.log('    ✓ Utils 模块导入成功');
      } catch (error) {
        console.error('导入失败:', error);
        throw error;
      }
    });

    await it('测试 escapeHtml 函数', () => {
      const { escapeHtml } = utils;
      
      // 测试基本转义
      TestAssert.assertEqual(escapeHtml('<div>test</div>'), '&lt;div&gt;test&lt;/div&gt;', '基本HTML转义失败');
      TestAssert.assertEqual(escapeHtml('A & B'), 'A &amp; B', '&符号转义失败');
      TestAssert.assertEqual(escapeHtml('"quoted"'), '&quot;quoted&quot;', '引号转义失败');
      TestAssert.assertEqual(escapeHtml("'single'"), '&#39;single&#39;', '单引号转义失败');
      
      // 测试边界情况
      TestAssert.assertEqual(escapeHtml(''), '', '空字符串处理失败');
      TestAssert.assertEqual(escapeHtml(null), '', 'null值处理失败');
      TestAssert.assertEqual(escapeHtml(undefined), '', 'undefined值处理失败');
      
      console.log('    ✓ escapeHtml 函数测试通过');
    });

    await it('测试 replaceVariables 函数', () => {
      const { replaceVariables } = utils;
      
      // 测试基本替换
      const template1 = 'Hello {{name}}, you are {{age}} years old!';
      const vars1 = { name: 'Alice', age: 25 };
      const result1 = replaceVariables(template1, vars1);
      TestAssert.assertEqual(result1, 'Hello Alice, you are 25 years old!', '基本变量替换失败');
      
      // 测试多次替换同一变量
      const template2 = '{{greeting}} {{name}}, {{greeting}} again!';
      const vars2 = { greeting: 'Hello', name: 'Bob' };
      const result2 = replaceVariables(template2, vars2);
      TestAssert.assertEqual(result2, 'Hello Bob, Hello again!', '重复变量替换失败');
      
      // 测试清理未匹配变量
      const template3 = 'Known: {{known}}, Unknown: {{unknown}}';
      const vars3 = { known: 'value' };
      const result3 = replaceVariables(template3, vars3);
      TestAssert.assertEqual(result3, 'Known: value, Unknown: ', '未匹配变量清理失败');
      
      // 测试边界情况
      TestAssert.assertEqual(replaceVariables('', {}), '', '空模板处理失败');
      TestAssert.assertEqual(replaceVariables(null, {}), '', 'null模板处理失败');
      TestAssert.assertEqual(replaceVariables('no variables', {}), 'no variables', '无变量模板处理失败');
      
      console.log('    ✓ replaceVariables 函数测试通过');
    });

    await it('测试 isValidUrl 函数', () => {
      const { isValidUrl } = utils;
      
      // 测试有效URL
      TestAssert.assertTrue(isValidUrl('https://example.com'), 'HTTPS URL验证失败');
      TestAssert.assertTrue(isValidUrl('http://test.org'), 'HTTP URL验证失败');
      TestAssert.assertTrue(isValidUrl('https://sub.domain.com/path'), '复杂URL验证失败');
      
      // 测试无效URL
      TestAssert.assertFalse(isValidUrl('not-a-url'), '无效URL应该返回false');
      TestAssert.assertFalse(isValidUrl('http://'), '不完整URL应该返回false');
      TestAssert.assertFalse(isValidUrl(''), '空字符串应该返回false');
      TestAssert.assertFalse(isValidUrl(null), 'null应该返回false');
      
      console.log('    ✓ isValidUrl 函数测试通过');
    });

    await it('测试 validateEditorData 函数', () => {
      const { validateEditorData } = utils;
      
      // 测试有效数据
      const validData = {
        blocks: [
          { type: 'paragraph', data: { text: 'test' } },
          { type: 'header', data: { text: 'title', level: 1 } }
        ]
      };
      TestAssert.assertTrue(validateEditorData(validData), '有效EditorJS数据验证失败');
      
      // 测试无效数据
      TestAssert.assertFalse(validateEditorData(null), 'null数据应该无效');
      TestAssert.assertFalse(validateEditorData({}), '空对象应该无效');
      TestAssert.assertFalse(validateEditorData({ blocks: 'not-array' }), '非数组blocks应该无效');
      TestAssert.assertFalse(validateEditorData({ blocks: [{}] }), '无type的block应该无效');
      
      console.log('    ✓ validateEditorData 函数测试通过');
    });

    await it('测试 processTemplate 函数', () => {
      const { processTemplate } = utils;
      
      // 测试完整模板处理
      const template = 'Hello {{name}}! {{?optional}} Your age: {{age}}.';
      const data = { name: 'Alice', age: 30, optional: 'Nice to meet you!' };
      const result = processTemplate(template, data);
      
      TestAssert.assertContains(result, 'Hello Alice!', '基本变量替换失败');
      TestAssert.assertContains(result, 'Nice to meet you!', '条件渲染失败');
      TestAssert.assertContains(result, 'Your age: 30', '后续变量替换失败');
      
      // 测试条件渲染 - 空值情况
      const data2 = { name: 'Bob', age: 25, optional: '' };
      const result2 = processTemplate(template, data2);
      TestAssert.assertNotContains(result2, 'Nice to meet you!', '空值条件渲染应该被移除');
      
      console.log('    ✓ processTemplate 函数测试通过');
    });

    await it('测试 ParserError 类', () => {
      const { ParserError } = utils;
      
      const error = new ParserError('Test error message');
      TestAssert.assertEqual(error.name, 'ParserError', 'ParserError名称错误');
      TestAssert.assertEqual(error.message, 'Test error message', 'ParserError消息错误');
      TestAssert.assertTrue(error instanceof Error, 'ParserError应该继承Error');
      
      console.log('    ✓ ParserError 类测试通过');
    });

    // 性能测试
    await it('测试工具函数性能', () => {
      const { replaceVariables, processTemplate, escapeHtml } = utils;
      
      const template = 'Hello {{name}}, you are {{age}} years old! {{?greeting}}';
      const data = { name: 'Alice', age: 25, greeting: 'Nice to meet you!' };
      const htmlText = '<div>Hello "World" & <span>more</span></div>';
      
      // 测试大量调用的性能
      const iterations = 1000;
      
      // replaceVariables 性能测试
      const start1 = Date.now();
      for (let i = 0; i < iterations; i++) {
        replaceVariables(template, data);
      }
      const time1 = Date.now() - start1;
      
      // processTemplate 性能测试
      const start2 = Date.now();
      for (let i = 0; i < iterations; i++) {
        processTemplate(template, data);
      }
      const time2 = Date.now() - start2;
      
      // escapeHtml 性能测试
      const start3 = Date.now();
      for (let i = 0; i < iterations; i++) {
        escapeHtml(htmlText);
      }
      const time3 = Date.now() - start3;
      
      console.log(`    ⏱️  replaceVariables: ${time1}ms (${iterations} 次)`);
      console.log(`    ⏱️  processTemplate: ${time2}ms (${iterations} 次)`);
      console.log(`    ⏱️  escapeHtml: ${time3}ms (${iterations} 次)`);
      
      // 性能断言（应该在合理范围内）
      TestAssert.assertTrue(time1 < 100, `replaceVariables性能过低: ${time1}ms`);
      TestAssert.assertTrue(time2 < 150, `processTemplate性能过低: ${time2}ms`);
      TestAssert.assertTrue(time3 < 50, `escapeHtml性能过低: ${time3}ms`);
      
      console.log('    ✓ 性能测试通过');
    });
  });
}