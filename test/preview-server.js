#!/usr/bin/env node

/**
 * 模板预览服务器
 * 提供HTTP服务来预览模板效果
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

function getContentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'text/plain';
}

function serveFile(filePath, res) {
  try {
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    const content = readFileSync(filePath);
    const contentType = getContentType(filePath);
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
}

const server = createServer((req, res) => {
  // 启用CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath;
  const url = req.url === '/' ? '/template-preview.html' : req.url;

  // 路由处理
  if (url === '/template-preview.html' || url === '/') {
    filePath = join(__dirname, 'template-preview.html');
  } else if (url.startsWith('/templates/')) {
    filePath = join(__dirname, url);
  } else if (url.startsWith('/data/')) {
    filePath = join(__dirname, url);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  console.log(`${req.method} ${req.url} -> ${filePath}`);
  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log(`🚀 模板预览服务已启动!`);
  console.log(`📁 访问地址: http://localhost:${PORT}`);
  console.log(`🎨 预览页面: http://localhost:${PORT}/template-preview.html`);
  console.log(`⏹️  按 Ctrl+C 停止服务`);
  console.log('');
  console.log('📋 功能说明:');
  console.log('  • 选择不同模板查看效果');
  console.log('  • 配置全局样式开关');
  console.log('  • 实时预览渲染结果');
  console.log('  • 导出HTML文件');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});