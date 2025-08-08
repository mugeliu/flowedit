@echo off
chcp 65001 >nul
REM Windows Startup Script for StyleFlow Backend

echo =================================
echo   StyleFlow Backend Service
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
    echo   4. python init_db.py
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
    echo   3. python init_db.py
    echo.
    pause
    exit /b 1
)

REM Check environment file
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo.
    echo Please create .env file with required configuration:
    echo   copy .env.example .env
    echo   # Edit .env file with your OpenAI API key
    echo.
    pause
    exit /b 1
)

REM Check if database is initialized
if not exist "style_flow.db" (
    echo [SETUP] Initializing database...
    call venv\Scripts\activate.bat
    python init_db.py
    if errorlevel 1 (
        echo [ERROR] Database initialization failed!
        pause
        exit /b 1
    )
    echo [OK] Database initialized successfully
)

REM Activate virtual environment
call venv\Scripts\activate.bat
echo [OK] Virtual environment activated

REM Start service
echo [START] Starting StyleFlow Backend Service...
echo [INFO] API Documentation will be available at: http://localhost:8000/docs
echo [INFO] Service endpoint: http://localhost:8000
echo.
python main.py

pause