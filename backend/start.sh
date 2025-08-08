#!/bin/bash

echo "================================="
echo "   StyleFlow Backend Service"
echo "================================="
echo

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo
    echo "Please create and setup virtual environment first:"
    echo "  1. python -m venv venv"
    echo "  2. source venv/bin/activate (Linux/Mac) or venv\\Scripts\\activate (Windows)"
    echo "  3. pip install -r requirements.txt"
    echo "  4. python init_db.py"
    echo
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "venv/lib/python"*/site-packages/fastapi ] && [ ! -d "venv/Lib/site-packages/fastapi" ]; then
    echo "❌ Dependencies not installed!"
    echo
    echo "Please install dependencies first:"
    echo "  1. source venv/bin/activate (Linux/Mac) or venv\\Scripts\\activate (Windows)"
    echo "  2. pip install -r requirements.txt"
    echo "  3. python init_db.py"
    echo
    exit 1
fi

# Check environment file
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo
    echo "Please create .env file with required configuration:"
    echo "  cp .env.example .env"
    echo "  # Edit .env file with your OpenAI API key"
    echo
    exit 1
fi

# Check if database is initialized
if [ ! -f "style_flow.db" ]; then
    echo "🔧 Initializing database..."
    source venv/bin/activate 2>/dev/null || venv/Scripts/activate 2>/dev/null || true
    python init_db.py
    if [ $? -ne 0 ]; then
        echo "❌ Database initialization failed!"
        exit 1
    fi
    echo "✅ Database initialized successfully"
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || venv/Scripts/activate 2>/dev/null || true
echo "✅ Virtual environment activated"

# Start service
echo "🚀 Starting StyleFlow Backend Service..."
echo "📚 API Documentation will be available at: http://localhost:8000/docs"
echo "🌐 Service endpoint: http://localhost:8000"
echo
python main.py