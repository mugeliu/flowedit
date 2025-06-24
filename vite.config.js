import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs-extra";

async function copyManifestAndAssets() {
  await fs.ensureDir("dist");
  await fs.ensureDir("dist/popup");
  await fs.ensureDir("dist/content");
  
  // 复制并修改 manifest.json
  const manifest = await fs.readJson("manifest.json");
  // 更新路径引用
  manifest.action.default_popup = "popup/popup.html";
  manifest.content_scripts[0].js = ["content/content.js"];
  await fs.writeJson("dist/manifest.json", manifest, { spaces: 2 });
  
  // 复制 background.js
  await fs.copy("background.js", "dist/background.js");
  // 复制 popup.html 到 popup 目录
  await fs.copy("src/popup/popup.html", "dist/popup/popup.html");
  
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
        popup: resolve(__dirname, "src/popup/popup.js"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // 根据chunk名称决定输出路径
          if (chunkInfo.name === 'popup') {
            return 'popup/popup.js';
          } else if (chunkInfo.name === 'content') {
            return 'content/content.js';
          }
          return '[name].js';
        },
        chunkFileNames: (chunkInfo) => {
          // 根据chunk名称决定输出路径
          if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.includes('/popup/')) {
            return 'popup/[name].js';
          } else if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.includes('/content/')) {
            return 'content/[name].js';
          }
          return '[name].js';
        },
        assetFileNames: (assetInfo) => {
          // 根据资源类型和名称决定输出路径
          const info = assetInfo.name.split('.');
          const ext = info.pop();
          const name = info.join('.');
          
          if (name === 'popup' && ext === 'css') {
            return 'popup/popup.css';
          }
          return '[name].[ext]';
        },
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
