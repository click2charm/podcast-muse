#!/bin/bash

echo "🎧 AI Podcast Generator - No Docker Setup"
echo "=========================================="

# Try to find Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found! Please install Python 3.8+"
    exit 1
fi

echo "✅ Using Python: $PYTHON_CMD"
echo ""

cd backend

# Check if simple backend exists
if [ ! -f "simple-main.py" ]; then
    echo "❌ simple-main.py not found!"
    exit 1
fi

echo "📦 Installing minimal dependencies..."
$PYTHON_CMD -m pip install --user -r simple-requirements.txt

echo ""
echo "🚀 Starting Simple Backend..."
echo "   • Backend: http://localhost:8000"
echo "   • API Docs: http://localhost:8000/docs"
echo "   • Health: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

$PYTHON_CMD simple-main.py