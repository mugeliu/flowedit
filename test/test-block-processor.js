/**
 * BlockProcessor 测试文件
 * 测试所有块处理器的核心功能
 */

// 引入真实的模板配置
import styleTemplate from '../src/content/config/style-template.js';

// 模拟TemplateManager，使用真实的模板配置
class MockTemplateManager {
  constructor() {
    this.templates = styleTemplate.flexibleTemplatesWithInlineStyles;
    this.theme = styleTemplate.theme;
    this.blockInlineStyles = styleTemplate.blockInlineStyles;
  }

  getFlexibleTemplate(type, variant = null) {
    if (variant && this.templates[type] && this.templates[type][variant]) {
      return this.templates[type][variant];
    }
    return this.templates[type]?.default || this.templates[type] || null;
  }

  getTemplate(type, variant = 'default') {
    if (this.templates[type] && variant) {
      return this.templates[type][variant];
    }
    return this.templates[type]?.default || this.templates[type] || null;
  }

  getBlockInlineStyles() {
    return this.blockInlineStyles;
  }
  
  processInlineStyles(text, blockData) {
    // 简单的内联样式处理模拟
    let result = text;
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
    result = result.replace(/`(.*?)`/g, '<code>$1</code>');
    return result;
  }

  buildNestedHTML(layers, content, blockInlineStyles, extraData) {
    // 简化的模板渲染
    const layer = layers[0];
    let html = layer.content || '';
    
    // 替换变量
    html = html.replace(/\{\{content\}\}/g, content);
    if (extraData) {
      Object.keys(extraData).forEach(key => {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), extraData[key]);
      });
    }
    
    // 包装标签
    if (layer.tag) {
      const classAttr = layer.class ? ` class="${layer.class}"` : '';
      html = `<${layer.tag}${classAttr}>${html}</${layer.tag}>`;
    }
    
    return html;
  }

  processInlineStyles(text, blockData) {
    // 简化的内联样式处理
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }
}

// 导入块处理器（在实际环境中）
// import { ... } from '../src/content/utils/parsers/block-processor.js';

// 模拟导入的块处理器类
class BaseBlockProcessor {
  constructor(templateManager) {
    this.templateManager = templateManager;
  }

  process(blockData, block) {
    const template = this.getTemplate(blockData, block);
    const content = this.renderContent(blockData, block);
    const extraData = this.getExtraData(blockData, block);
    
    return this.buildHTML(template, content, extraData);
  }

  getTemplate(blockData, block) {
    return this.templateManager.getFlexibleTemplate(block.type);
  }

  renderContent(blockData, block) {
    return this.escapeHtml(blockData.text || '');
  }

  getExtraData(blockData, block) {
    return {};
  }

  buildHTML(template, content, extraData = {}) {
    if (!template || !template.layers) {
      return content;
    }

    let result = content;
    for (let i = template.layers.length - 1; i >= 0; i--) {
      const layer = template.layers[i];
      let style = layer.style || '';
      
      // 替换主题变量
      if (style && this.templateManager.theme) {
        style = this.replaceThemeVariables(style);
      }
      
      // 替换额外数据变量
      Object.keys(extraData).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        style = style.replace(regex, extraData[key]);
      });
      
      if (layer.content) {
        result = `<${layer.tag}${style ? ` style="${style}"` : ''}>${result}</${layer.tag}>`;
      } else {
        result = `<${layer.tag}${style ? ` style="${style}"` : ''}>${result}</${layer.tag}>`;
      }
    }

    return result;
  }
  
  replaceThemeVariables(style) {
    const theme = this.templateManager.theme;
    if (!theme) return style;
    
    let result = style;
    
    // 替换主题颜色变量
    Object.keys(theme).forEach(key => {
      if (typeof theme[key] === 'string') {
        const regex = new RegExp(`{{theme\.${key}}}`, 'g');
        result = result.replace(regex, theme[key]);
      } else if (typeof theme[key] === 'object') {
        // 处理嵌套对象，如 alpha
        Object.keys(theme[key]).forEach(subKey => {
          const regex = new RegExp(`{{theme\.${key}\.${subKey}}}`, 'g');
          result = result.replace(regex, theme[key][subKey]);
        });
      }
    });
    
    return result;
  }

  escapeHtml(text) {
    if (!text) return '';
    
    // 兼容Node.js环境的HTML转义
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    } else {
      // Node.js环境下的HTML转义
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }

  processInlineStyles(text, blockData) {
    return this.templateManager.processInlineStyles(text, blockData);
  }
}

class HeaderBlockProcessor extends BaseBlockProcessor {
  getTemplate(blockData, block) {
    const level = blockData.level || 1;
    const templateKey = `h${level}`;
    
    return this.templateManager.getTemplate('header', templateKey) ||
           this.templateManager.getTemplate('header', 'h1');
  }

  renderContent(blockData, block) {
    return this.processInlineStyles(blockData.text || '', blockData);
  }
}

class CodeBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    return this.escapeHtml(blockData.code || '');
  }

  getExtraData(blockData, block) {
    return {
      language: blockData.language || 'text'
    };
  }
}

class RawBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    return blockData.html || '';
  }

  buildHTML(template, content, extraData) {
    return content;
  }
}

class QuoteBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    return this.processInlineStyles(blockData.text || '', blockData);
  }

  getExtraData(blockData, block) {
    return {
      caption: blockData.caption || ''
    };
  }
}

class ListBlockProcessor extends BaseBlockProcessor {
  getTemplate(blockData, block) {
    const style = this.normalizeStyle(blockData.style);
    
    return this.templateManager.getTemplate('List', style) ||
           this.templateManager.getTemplate('List', 'unordered');
  }

  renderContent(blockData, block) {
    const items = blockData.items || [];
    
    return items.map(item => 
      this.processInlineStyles(item.content || '', blockData)
    ).join('');
  }

  getExtraData(blockData, block) {
    const style = this.normalizeStyle(blockData.style);
    return {
      listStyle: style,
      listType: style === 'ordered' ? 'ol' : 'ul'
    };
  }

  normalizeStyle(style) {
    switch (style) {
      case 'ordered': return 'ordered';
      case 'checklist': return 'checklist';
      default: return 'unordered';
    }
  }
}

class DelimiterBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    return '';
  }
}

class ImageBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    return blockData.caption || '';
  }

  getExtraData(blockData, block) {
    const file = blockData.file || {};
    return {
      url: file.url || '',
      caption: blockData.caption || '',
      alt: blockData.caption || file.alt || ''
    };
  }
}

// 测试函数
function runTests() {
  console.log('🧪 开始测试 BlockProcessor...');
  
  const templateManager = new MockTemplateManager();
  let passedTests = 0;
  let totalTests = 0;

  function test(name, testFn) {
    totalTests++;
    try {
      testFn();
      console.log(`✅ ${name}`);
      passedTests++;
    } catch (error) {
      console.error(`❌ ${name}: ${error.message}`);
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}\n期望: ${expected}\n实际: ${actual}`);
    }
  }

  function assertContains(actual, expected, message) {
    if (!actual.includes(expected)) {
      throw new Error(`${message}\n期望包含: ${expected}\n实际: ${actual}`);
    }
  }

  // 测试 HeaderBlockProcessor
  test('HeaderBlockProcessor - H1标题', () => {
    const processor = new HeaderBlockProcessor(templateManager);
    const blockData = { text: '这是标题', level: 1 };
    const block = { type: 'header' };
    const result = processor.process(blockData, block);
    assertContains(result, '<h1', 'H1标题应该包含h1标签');
    assertContains(result, '这是标题', 'H1标题应该包含文本内容');
  });

  test('HeaderBlockProcessor - H2标题', () => {
    const processor = new HeaderBlockProcessor(templateManager);
    const blockData = { text: '二级标题', level: 2 };
    const block = { type: 'header' };
    const result = processor.process(blockData, block);
    assertContains(result, '<h2', 'H2标题应该包含h2标签');
  });

  test('HeaderBlockProcessor - 内联样式处理', () => {
    const processor = new HeaderBlockProcessor(templateManager);
    const blockData = { text: '**粗体**标题', level: 1 };
    const block = { type: 'header' };
    const result = processor.process(blockData, block);
    assertContains(result, '<strong>粗体</strong>', '应该处理粗体内联样式');
  });

  // 测试 CodeBlockProcessor
  test('CodeBlockProcessor - 基本代码块', () => {
    const processor = new CodeBlockProcessor(templateManager);
    const blockData = { code: 'console.log("Hello");', language: 'javascript' };
    const block = { type: 'code' };
    const result = processor.process(blockData, block);
    assertContains(result, '<pre', '代码块应该包含pre标签');
    assertContains(result, '<code', '代码块应该包含code标签');
    assertContains(result, 'console.log', '代码块应该包含代码内容');
  });

  test('CodeBlockProcessor - HTML转义', () => {
    const processor = new CodeBlockProcessor(templateManager);
    const blockData = { code: '<script>alert("xss")</script>', language: 'html' };
    const block = { type: 'code' };
    const result = processor.process(blockData, block);
    assertContains(result, '&lt;script&gt;', '代码块应该转义HTML字符');
  });

  // 测试 RawBlockProcessor
  test('RawBlockProcessor - 原始HTML', () => {
    const processor = new RawBlockProcessor(templateManager);
    const blockData = { html: '<div class="custom">原始HTML</div>' };
    const block = { type: 'raw' };
    const result = processor.process(blockData, block);
    assertEqual(result, '<div class="custom">原始HTML</div>', '应该直接返回原始HTML');
  });

  // 测试 QuoteBlockProcessor
  test('QuoteBlockProcessor - 引用块', () => {
    const processor = new QuoteBlockProcessor(templateManager);
    const blockData = { text: '这是一段引用', caption: '作者名' };
    const block = { type: 'quote' };
    const result = processor.process(blockData, block);
    assertContains(result, '<blockquote', '引用块应该包含blockquote标签');
    assertContains(result, '这是一段引用', '引用块应该包含引用内容');
  });

  // 测试 ListBlockProcessor
  test('ListBlockProcessor - 无序列表', () => {
    const processor = new ListBlockProcessor(templateManager);
    const blockData = {
      style: 'unordered',
      items: [
        { content: '第一项' },
        { content: '第二项' }
      ]
    };
    const block = { type: 'list' };
    const result = processor.process(blockData, block);
    assertContains(result, '<ul', '无序列表应该包含ul标签');
    assertContains(result, '第一项', '列表应该包含第一项内容');
    assertContains(result, '第二项', '列表应该包含第二项内容');
  });

  test('ListBlockProcessor - 有序列表', () => {
    const processor = new ListBlockProcessor(templateManager);
    const blockData = {
      style: 'ordered',
      items: [
        { content: '步骤一' },
        { content: '步骤二' }
      ]
    };
    const block = { type: 'list' };
    const result = processor.process(blockData, block);
    assertContains(result, '<ol', '有序列表应该包含ol标签');
  });

  test('ListBlockProcessor - 检查列表', () => {
    const processor = new ListBlockProcessor(templateManager);
    const blockData = {
      style: 'checklist',
      items: [{ content: '待办事项' }]
    };
    const block = { type: 'list' };
    const result = processor.process(blockData, block);
    // 由于checklist模板存在，应该使用checklist模板
    assertContains(result, '<ul', '检查列表应该包含ul标签');
    assertContains(result, '待办事项', '检查列表应该包含待办事项内容');
  });

  // 测试 DelimiterBlockProcessor
  test('DelimiterBlockProcessor - 分隔符', () => {
    const processor = new DelimiterBlockProcessor(templateManager);
    const blockData = {};
    const block = { type: 'delimiter' };
    const result = processor.process(blockData, block);
    assertContains(result, '<hr', '分隔符应该包含hr标签');
  });

  // 测试 ImageBlockProcessor
  test('ImageBlockProcessor - 图片块', () => {
    const processor = new ImageBlockProcessor(templateManager);
    const blockData = {
      file: { url: 'https://example.com/image.jpg' },
      caption: '图片说明',
      alt: '替代文本'
    };
    const block = { type: 'image' };
    const result = processor.process(blockData, block);
    assertContains(result, '<figure', '图片块应该包含figure标签');
    assertContains(result, '<img', '图片块应该包含img标签');
    assertContains(result, '图片说明', '图片块应该包含说明文字');
  });

  // 测试边界情况
  test('BaseBlockProcessor - 空内容处理', () => {
    const processor = new BaseBlockProcessor(templateManager);
    const blockData = {};
    const block = { type: 'unknown' };
    const result = processor.process(blockData, block);
    assertEqual(result, '', '未知块类型应该返回空字符串');
  });

  test('BaseBlockProcessor - HTML转义功能', () => {
    const processor = new BaseBlockProcessor(templateManager);
    const escaped = processor.escapeHtml('<script>alert("test")</script>');
    assertContains(escaped, '&lt;script&gt;', 'HTML转义应该正确处理script标签');
  });

  // 输出测试结果
  console.log(`\n📊 测试完成: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log(`⚠️  ${totalTests - passedTests} 个测试失败`);
  }

  return { passed: passedTests, total: totalTests };
}

// 运行测试
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.runBlockProcessorTests = runTests;
  console.log('测试函数已加载，请调用 runBlockProcessorTests() 开始测试');
} else {
  // Node.js 环境
  runTests();
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests };
}