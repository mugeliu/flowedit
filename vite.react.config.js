import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import fs from "fs-extra";

// 工具函数：处理Chrome扩展文件名限制
function sanitizeFileName(fileName) {
  return fileName.startsWith("_") ? "vendor" + fileName.substring(1) : fileName;
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "react-app-build",
      closeBundle: async () => {
        // 移动HTML文件到正确位置
        const htmlMoves = [
          { from: "dist/src/popup/index.html", to: "dist/popup/popup.html" },
          { from: "dist/src/options/index.html", to: "dist/options/options.html" }
        ];
        
        for (const { from, to } of htmlMoves) {
          if (await fs.pathExists(from)) {
            // 如果目标文件已存在，先删除
            if (await fs.pathExists(to)) {
              await fs.remove(to);
            }
            await fs.move(from, to);
          }
        }
        
        // 清理临时src目录
        if (await fs.pathExists("dist/src")) {
          await fs.remove("dist/src");
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    minify: false,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        // React 应用
        popup: resolve(__dirname, "src/popup/index.html"),
        options: resolve(__dirname, "src/options/index.html"),
      },
      output: {
        // 入口文件命名
        entryFileNames: (chunkInfo) => {
          const nameMap = {
            popup: "popup/popup.js",
            options: "options/options.js",
          };
          return nameMap[chunkInfo.name] || "[name].js";
        },
        
        // Chunk文件命名  
        chunkFileNames: (chunkInfo) => {
          const fileName = sanitizeFileName(chunkInfo.name || "chunk");
          return `${fileName}.js`;
        },
        
        // 使用ES格式（React应用支持）
        format: 'es',
        
        // 资源文件命名
        assetFileNames: (assetInfo) => {
          const fileName = sanitizeFileName(assetInfo.name || "asset");
          
          // HTML文件
          if (fileName.endsWith('.html')) {
            if (fileName.includes('popup') || fileName === 'index.html') {
              return "popup/popup.html";
            }
            if (fileName.includes('options')) {
              return "options/options.html";
            }
          }
          
          // CSS文件
          if (fileName.endsWith('.css')) {
            if (fileName.includes('globals') || fileName.includes('index')) {
              return "assets/css/ui.css";
            }
            return `assets/css/${fileName}`;
          }
          
          // 其他资源文件
          const ext = fileName.split('.').pop();
          const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
          return `assets/${nameWithoutExt}.${ext}`;
        },
        
        sourcemap: false,
      },
    },
  },
});