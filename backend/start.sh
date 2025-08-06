#!/bin/bash

# 激活虚拟环境（如果存在）
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "已激活虚拟环境"
fi

# 安装依赖
echo "安装Python依赖..."
pip install -r requirements.txt

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "警告：未找到.env文件，请确保已配置环境变量"
    exit 1
fi

# 启动服务
echo "启动AI风格化内容生成服务..."
python main.py