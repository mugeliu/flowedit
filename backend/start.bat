@echo off
REM Windows启动脚本

REM 激活虚拟环境（如果存在）
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo 已激活虚拟环境
)

REM 安装依赖
echo 安装Python依赖...
pip install -r requirements.txt

REM 检查环境变量文件
if not exist ".env" (
    echo 警告：未找到.env文件，请确保已配置环境变量
    pause
    exit /b 1
)

REM 启动服务
echo 启动AI风格化内容生成服务...
python main.py

pause