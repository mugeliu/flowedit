import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs-extra";

async function copyManifestAndAssets() {
  await fs.ensureDir("dist");
  
  // 复制 manifest.json
  await fs.copy("manifest.json", "dist/manifest.json");
  // 复制 background.js
  await fs.copy("background.js", "dist/background.js");
  
  // 复制整个 assets 目录（包含 editorjs）
  if (await fs.pathExists("assets")) {
    await fs.copy("assets", "dist/assets");
  }
}

// 主项目 build 配置
const mainConfig = defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content/main.js"),
      },
      output: {
        format: "iife", // 输出为IIFE格式，兼容Chrome插件
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
        extend: true,
        sourcemap: false,
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
  },
  plugins: [
    {
      name: "copy-manifest-and-assets",
      closeBundle: async () => {
        await copyManifestAndAssets();
      },
    },
  ],
});

// Editor.js bundle 独立 build 配置
const editorjsBundleConfig = defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/editorjs-bundle.js"),
      name: "EditorJSBundle",
      formats: ["iife"],
      fileName: () => "editorjs-bundle.js",
    },
    outDir: "assets/editorjs",
    emptyOutDir: false, // 不要清空 assets/editorjs 目录
    rollupOptions: {
      output: {
        name: "EditorJSBundle",
        extend: true,
      },
    },
    minify: "terser",
  },
});



export default defineConfig(({ mode }) => {
  return mode === 'editorjs' ? editorjsBundleConfig : mainConfig;
});
