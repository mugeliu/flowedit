import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import css from "rollup-plugin-css-only";

export default [
  // 内容脚本配置
  {
    input: "src/content/content.js",
    output: {
      file: "build/content.js",
      format: "iife",
      name: "WxFloatingToolbarPlugin",
    },
    plugins: [
      nodeResolve(),
      css({
        output: "styles.css", // 将所有CSS合并到一个文件
        // 确保CSS处理正确
        minimize: false, // 不压缩CSS，以便于调试
      }),
      terser(),
      copy({
        targets: [
          // 确保资源文件被正确复制
          { src: "assets/**/*", dest: "build/assets" },
          {
            src: "manifest.json",
            dest: "build",
            transform: (contents) => {
              const manifest = JSON.parse(contents.toString());
              // 更新manifest中的路径
              manifest.background.service_worker = "background.js";
              manifest.background.type = "module"; // 保留module类型
              manifest.content_scripts[0].js = ["content.js"];
              manifest.content_scripts[0].css = ["styles.css"]; // 只使用一个CSS文件
              // 移除web_accessible_resources，因为我们不再需要它
              delete manifest.web_accessible_resources;
              return JSON.stringify(manifest, null, 2);
            },
          },
        ],
      }),
    ],
  },
  // 背景脚本配置
  {
    input: "src/background/background.js",
    output: {
      file: "build/background.js",
      format: "iife",
    },
    plugins: [nodeResolve(), terser()],
  },
];
