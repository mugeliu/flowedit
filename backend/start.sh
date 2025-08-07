#!/bin/bash

echo "================================="
echo "   FlowEdit Backend Service"
echo "================================="
echo

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo
    echo "Please create and setup virtual environment first:"
    echo "  1. python -m venv venv"
    echo "  2. source venv/bin/activate"
    echo "  3. pip install -r requirements.txt"
    echo
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "venv/lib/python"*/site-packages/fastapi ]; then
    echo "❌ Dependencies not installed!"
    echo
    echo "Please install dependencies first:"
    echo "  1. source venv/bin/activate"
    echo "  2. pip install -r requirements.txt"
    echo
    exit 1
fi

# Check environment file
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo
    echo "Please create .env file with required configuration."
    echo "See .env.example for reference."
    echo
    exit 1
fi

# Activate virtual environment
source venv/bin/activate
echo "✅ Virtual environment activated"

# Start service
echo "🚀 Starting FlowEdit Backend Service..."
echo
python main.py