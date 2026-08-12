import { cp, copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";

async function copyExtensionAssets(): Promise<void> {
  await mkdir("dist/assets", { recursive: true });
  await mkdir("dist/scripts", { recursive: true });
  await copyFile("manifest.json", "dist/manifest.json");
  await cp("assets/icons", "dist/assets/icons", { recursive: true });
  await copyFile(
    "scripts/page-injector.js",
    "dist/scripts/page-injector.js",
  );
}

export default defineConfig({
  plugins: [
    {
      name: "copy-extension-assets",
      closeBundle: copyExtensionAssets,
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    rollupOptions: {
      input: resolve(import.meta.dirname, "src/content/main.ts"),
      output: {
        entryFileNames: "content/content.js",
        format: "iife",
        inlineDynamicImports: true,
      },
    },
  },
});
