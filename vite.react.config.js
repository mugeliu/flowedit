import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import fs from "fs-extra";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "move-html",
      closeBundle: async () => {
        // 移动HTML文件到正确位置
        if (await fs.pathExists("dist/src/popup/index.html")) {
          await fs.ensureDir("dist/popup");
          // 如果目标存在，先删除
          if (await fs.pathExists("dist/popup/popup.html")) {
            await fs.remove("dist/popup/popup.html");
          }
          await fs.move("dist/src/popup/index.html", "dist/popup/popup.html");
        }
        // 清理临时目录
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
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html")
      },
      output: {
        entryFileNames: "popup/popup.js",
        chunkFileNames: "popup/[name].js", 
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";
          // CSS文件
          if (name.endsWith('.css')) {
            return "assets/css/popup.css";
          }
          return "assets/[name].[ext]";
        },
        format: 'es',
        sourcemap: false,
        // 禁用代码分割，全部打包到一个文件
        inlineDynamicImports: true,
      },
    },
  },
});