import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs-extra";

// 工具函数：处理Chrome扩展文件名限制
function sanitizeFileName(fileName) {
  return fileName.startsWith("_") ? "vendor" + fileName.substring(1) : fileName;
}

// 清理并复制静态资源（仅content脚本需要的部分）
async function setupStaticAssets() {
  // 确保 dist 目录存在
  await fs.ensureDir("dist");
  
  // 复制 manifest.json
  await fs.copy("manifest.json", "dist/manifest.json");
  
  // 复制静态文件
  const staticFiles = [
    { src: "background.js", dest: "dist/background.js" },
    { src: "assets", dest: "dist/assets" },
    { src: "scripts", dest: "dist/scripts" }
  ];
  
  for (const { src, dest } of staticFiles) {
    if (await fs.pathExists(src)) {
      await fs.copy(src, dest);
    }
  }
}

export default defineConfig({
  plugins: [
    {
      name: "content-script-build",
      buildStart: setupStaticAssets,
    }
  ],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, "src/content/main.js"),
      output: {
        // 入口文件命名
        entryFileNames: "content/content.js",
        
        // Chunk文件命名  
        chunkFileNames: (chunkInfo) => {
          const fileName = sanitizeFileName(chunkInfo.name || "chunk");
          return `${fileName}.js`;
        },
        
        // 使用IIFE格式避免ES模块问题
        format: 'iife',
        inlineDynamicImports: true,
        
        sourcemap: false,
      },
    },
  },
});