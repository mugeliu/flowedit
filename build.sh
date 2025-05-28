#!/bin/bash

# 清理旧的构建文件
rm -rf build/*

# 运行Rollup构建
npx rollup -c

echo "构建完成！扩展程序文件已生成到build目录。"
