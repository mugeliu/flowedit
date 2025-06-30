import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs-extra";

async function copyManifestAndAssets() {
  await fs.ensureDir("dist");
  await fs.ensureDir("dist/popup");
  await fs.ensureDir("dist/content");
  await fs.ensureDir("dist/scripts");

  // 复制原始 manifest.json（不做修改）
  await fs.copy("manifest.json", "dist/manifest.json");

  // 复制 background.js
  await fs.copy("background.js", "dist/background.js");
  // 复制 popup.html 到 popup 目录
  await fs.copy("src/popup/popup.html", "dist/popup/popup.html");

  // 复制整个 assets 目录
  if (await fs.pathExists("assets")) {
    await fs.copy("assets", "dist/assets");
  }

  // 复制整个 scripts 目录
  if (await fs.pathExists("scripts")) {
    await fs.copy("scripts", "dist/scripts");
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
        "editorjs-bundle": resolve(__dirname, "src/editorjs-bundle.js"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // 根据chunk名称决定输出路径
          if (chunkInfo.name === "content") {
            return "content/content.js";
          } else if (chunkInfo.name === "editorjs-bundle") {
            return "scripts/editorjs-bundle.js";
          }
          return "[name].js";
        },
        chunkFileNames: (chunkInfo) => {
          // 根据chunk名称决定输出路径
          if (
            chunkInfo.facadeModuleId &&
            chunkInfo.facadeModuleId.includes("/content/")
          ) {
            return "content/[name].js";
          }
          return "[name].js";
        },
        assetFileNames: (assetInfo) => {
          // 根据资源类型和名称决定输出路径
          return "[name].[ext]";
        },
        sourcemap: false,
      },
    },
    minify: false,
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

export default mainConfig;
