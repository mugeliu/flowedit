@echo off
chcp 65001 >nul
REM Windows Startup Script

echo =================================
echo   FlowEdit Backend Service
echo =================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found!
    echo.
    echo Please create and setup virtual environment first:
    echo   1. python -m venv venv
    echo   2. venv\Scripts\activate
    echo   3. pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "venv\Lib\site-packages\fastapi" (
    echo [ERROR] Dependencies not installed!
    echo.
    echo Please install dependencies first:
    echo   1. venv\Scripts\activate
    echo   2. pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

REM Check environment file
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo.
    echo Please create .env file with required configuration.
    echo See .env.example for reference.
    echo.
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat
echo [OK] Virtual environment activated

REM Start service
echo [START] Starting FlowEdit Backend Service...
echo.
python main.py

pause