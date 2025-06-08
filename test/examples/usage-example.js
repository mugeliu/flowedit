/**
 * 使用示例文件
 * 展示如何使用新的模块化代码结构
 */

import { saveToOriginalEditor } from '../../src/content/utils/editor.js';
// 直接从对应的管理器导入功能
import styleManager from '../../src/content/utils/style-manager.js';
import styleSyncService from '../../src/content/services/style-sync-service.js';
import htmlGenerator from '../../src/content/utils/html-generator.js';
import blockProcessor from '../../src/content/utils/block-processor.js';
import { styleConfig } from '../../src/content/config/style-config.js';

/**
 * 基本使用示例
 */
export async function basicUsageExample() {
  // 模拟EditorJS数据
  const editorData = {
    blocks: [
      {
        type: 'header',
        data: {
          text: '这是一个标题',
          level: 1
        }
      },
      {
        type: 'paragraph',
        data: {
          text: '这是一个段落，包含一些<b>粗体</b>和<i>斜体</i>文本。'
        }
      },
      {
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            '第一个列表项',
            '第二个列表项',
            '第三个列表项'
          ]
        }
      }
    ]
  };

  try {
    // 保存到原编辑器
    const success = await saveToOriginalEditor(editorData.blocks);
    console.log('保存结果:', success);
  } catch (error) {
    console.error('保存失败:', error);
  }
}

/**
 * 使用远程样式的示例
 */
export async function remoteStyleExample() {
  // 设置远程样式URL
  const remoteUrl = 'https://api.example.com/styles';
  styleManager.setRemoteStyleUrl(remoteUrl);

  // 预加载远程样式
  const styleLoaded = await styleSyncService.manualSync();
  console.log('远程样式加载状态:', styleLoaded);

  // 模拟EditorJS数据
  const editorData = {
    blocks: [
      {
        type: 'header',
        data: {
          text: '使用远程样式的标题',
          level: 2
        }
      },
      {
        type: 'paragraph',
        data: {
          text: '这个段落将使用远程加载的样式。'
        }
      }
    ]
  };

  try {
    // 保存时使用远程样式
    const success = await saveToOriginalEditor(editorData.blocks, {
      loadRemoteStyles: true,
      remoteStyleUrl: remoteUrl,
      injectStyles: true
    });
    console.log('使用远程样式保存结果:', success);
  } catch (error) {
    console.error('保存失败:', error);
  }
}

/**
 * 自定义样式配置示例
 */
export function customStyleExample() {
  // 应用不同主题
  styleConfig.applyTheme('minimal');
  console.log('当前主题:', styleConfig.getCurrentTheme());

  // 自定义配置
  styleConfig.set({
    autoInjectStyles: true,
    wrapperClassName: 'custom-editor-content',
    skipEmptyBlocks: false
  });

  // 获取当前样式配置
  const currentStyles = styleManager.getAllStyles();
  console.log('当前样式配置:', currentStyles);
}

/**
 * 手动处理块数据示例
 */
export function manualProcessingExample() {
  // 模拟单个块数据
  const headerBlock = {
    type: 'header',
    data: {
      text: '手动处理的标题',
      level: 3
    }
  };

  const paragraphBlock = {
    type: 'paragraph',
    data: {
      text: '手动处理的段落内容。'
    }
  };

  // 处理单个块
  const processedHeader = blockProcessor.processBlock(headerBlock);
  const processedParagraph = blockProcessor.processBlock(paragraphBlock);
  
  console.log('处理后的标题块:', processedHeader);
  console.log('处理后的段落块:', processedParagraph);

  // 生成HTML
  const headerHtml = htmlGenerator.generateBlockHtml(processedHeader);
  const paragraphHtml = htmlGenerator.generateBlockHtml(processedParagraph);
  
  console.log('标题HTML:', headerHtml);
  console.log('段落HTML:', paragraphHtml);
}

/**
 * 批量处理示例
 */
export function batchProcessingExample() {
  // 模拟大量块数据
  const blocks = [];
  for (let i = 1; i <= 10; i++) {
    blocks.push({
      type: 'paragraph',
      data: {
        text: `这是第 ${i} 个段落。`
      }
    });
  }

  // 批量处理
  const processedBlocks = blockProcessor.processBlocks(blocks);
  console.log('批量处理结果:', processedBlocks);

  // 生成完整HTML
  const fullHtml = htmlGenerator.generateFromEditorData(blocks, {
    injectStyles: true,
    wrapperClass: 'batch-content',
    skipEmpty: true
  });
  
  console.log('完整HTML:', fullHtml);
}

/**
 * 错误处理示例
 */
export async function errorHandlingExample() {
  // 测试无效数据
  const invalidBlocks = [
    null,
    undefined,
    { type: 'unknown', data: {} },
    { type: 'paragraph' }, // 缺少data
    { data: { text: 'test' } } // 缺少type
  ];

  try {
    const success = await saveToOriginalEditor(invalidBlocks);
    console.log('处理无效数据结果:', success);
  } catch (error) {
    console.error('处理无效数据时出错:', error);
  }

  // 测试网络错误
  styleManager.setRemoteStyleUrl('https://invalid-url.example.com/styles');
  const networkResult = await styleSyncService.manualSync();
  console.log('网络错误测试结果:', networkResult);
}

/**
 * 性能测试示例
 */
export function performanceExample() {
  // 生成大量测试数据
  const largeBlocks = [];
  for (let i = 1; i <= 1000; i++) {
    largeBlocks.push({
      type: i % 2 === 0 ? 'paragraph' : 'header',
      data: {
        text: `性能测试内容 ${i}`,
        level: i % 2 === 0 ? undefined : (i % 3) + 1
      }
    });
  }

  console.time('大量数据处理');
  
  // 处理大量数据
  const processedBlocks = blockProcessor.processBlocks(largeBlocks);
  const html = htmlGenerator.generateFromEditorData(largeBlocks);
  
  console.timeEnd('大量数据处理');
  console.log('处理了', processedBlocks.length, '个块');
  console.log('生成HTML长度:', html.length);
}

/**
 * 缓存管理示例
 */
export function cacheManagementExample() {
  // 检查远程样式加载状态
  console.log('远程样式已加载:', styleManager.isRemoteStylesLoaded());

  // 清除缓存
  // 清除样式缓存
  styleManager.clearCache();
  styleSyncService.clearCache();
  htmlGenerator.clearInjectedContentStyles();
  console.log('缓存已清除');

  // 重新检查状态
  console.log('清除后远程样式状态:', styleManager.isRemoteStylesLoaded());
}

/**
 * 自定义块处理器示例
 */
export function customProcessorExample() {
  // 注册自定义块处理器
  blockProcessor.registerProcessor('custom', (block) => {
    return {
      type: 'custom',
      tag: 'div',
      className: 'custom-block',
      styles: {
        'background-color': '#f0f8ff',
        'padding': '16px',
        'border-radius': '8px',
        'margin': '16px 0'
      },
      content: `自定义块: ${block.data?.text || ''}`,
      isEmpty: !block.data?.text
    };
  });

  // 注册自定义HTML生成器
  htmlGenerator.registerGenerator('custom', (block) => {
    return `<${block.tag} class="${block.className}">${block.content}</${block.tag}>`;
  });

  // 测试自定义块
  const customBlock = {
    type: 'custom',
    data: {
      text: '这是一个自定义块'
    }
  };

  const processed = blockProcessor.processBlock(customBlock);
  const html = htmlGenerator.generateBlockHtml(processed);
  
  console.log('自定义块处理结果:', processed);
  console.log('自定义块HTML:', html);
}

// 导出所有示例函数
export const examples = {
  basicUsageExample,
  remoteStyleExample,
  customStyleExample,
  manualProcessingExample,
  batchProcessingExample,
  errorHandlingExample,
  performanceExample,
  cacheManagementExample,
  customProcessorExample
};

export default examples;