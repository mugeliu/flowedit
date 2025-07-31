import { defineConfig } from "vite";
import { resolve } from "path";

// 工具函数：处理Chrome扩展文件名限制
function sanitizeFileName(fileName) {
  return fileName.startsWith("_") ? "vendor" + fileName.substring(1) : fileName;
}

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, "src/editorjs-bundle.js"),
      output: {
        // 入口文件命名
        entryFileNames: "scripts/editorjs-bundle.js",
        
        // Chunk文件命名  
        chunkFileNames: (chunkInfo) => {
          const fileName = sanitizeFileName(chunkInfo.name || "chunk");
          return `scripts/${fileName}.js`;
        },
        
        // 使用IIFE格式避免ES模块问题
        format: 'iife',
        inlineDynamicImports: true,
        
        sourcemap: false,
      },
    },
  },
});