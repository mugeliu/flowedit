// 调试列表处理器
import { HtmlParser } from './src/content/utils/parser-html.js';

const testData = {
  blocks: [
    {
      type: 'list',
      data: {
        style: 'ordered',
        items: ['第一项', '第二项'],
        meta: { counterType: 'decimal' }
      }
    }
  ]
};

const parser = new HtmlParser();
console.log('测试数据:', JSON.stringify(testData, null, 2));
console.log('\n解析结果:');
try {
  const result = parser.parse(testData);
  console.log('解析成功:', result);
} catch (error) {
  console.error('解析失败:', error);
  console.error('错误堆栈:', error.stack);
}