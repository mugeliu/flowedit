import TemplateEngine from '../src/content/utils/converter/template-engine.js';
import config from '../src/content/utils/converter/config.js';

const engine = new TemplateEngine(config);

// 测试H2标题
const h2Result = engine.buildHTML({
  type: 'header',
  data: {
    text: '测试标题H2',
    level: 2
  }
});

console.log('H2测试结果:');
console.log(h2Result);
console.log('\n检查span标签是否为空:');
const spanMatch = h2Result.match(/<span[^>]*>([^<]*)<\/span>/);
if (spanMatch) {
  console.log('span内容:', spanMatch[1] === '' ? '空（正确）' : `"${spanMatch[1]}"（错误）`);
} else {
  console.log('未找到span标签');
}

console.log('\n检查h2标签是否包含内容:');
const h2Match = h2Result.match(/<h2[^>]*>([^<]*)<\/h2>/);
if (h2Match) {
  console.log('h2内容:', h2Match[1] || '空');
} else {
  console.log('未找到h2标签');
}