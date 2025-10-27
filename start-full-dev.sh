#!/bin/bash

echo "🎧 AI Podcast Generator - Full Development Setup"
echo "=============================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo "🔍 Checking requirements..."
if ! command_exists node; then
    echo "❌ Node.js not found! Please install Node.js 18+"
    exit 1
fi

if command_exists python3; then
    PYTHON_CMD="python3"
elif command_exists python; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found! Please install Python 3.8+"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found! Please install npm"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ Python: $PYTHON_CMD"
echo "✅ npm: $(npm --version)"
echo ""

# Check if directories exist
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found!"
    exit 1
fi

# Check backend files
if [ ! -f "backend/simple-main.py" ]; then
    echo "❌ Backend file simple-main.py not found!"
    exit 1
fi

# Check frontend files
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Frontend package.json not found!"
    exit 1
fi

echo "📦 Setting up backend dependencies..."
cd backend

# Create simple requirements if not exists
if [ ! -f "simple-requirements.txt" ]; then
    echo "fastapi==0.104.1" > simple-requirements.txt
    echo "uvicorn==0.24.0" >> simple-requirements.txt
    echo "python-multipart==0.0.6" >> simple-requirements.txt
fi

# Install backend dependencies
$PYTHON_CMD -m pip install --user -r simple-requirements.txt

echo ""
echo "📦 Setting up frontend dependencies..."
cd ../frontend

# Install frontend dependencies
npm install

echo ""
echo "🚀 Starting Development Servers..."
echo ""
echo "📍 Backend: http://localhost:8000"
echo "📍 Frontend: http://localhost:3000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Create logs directory
mkdir -p logs

# Start backend in background
echo "🔧 Starting backend server..."
cd ../backend
$PYTHON_CMD simple-main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend server started successfully (PID: $BACKEND_PID)"
else
    echo "❌ Backend server failed to start!"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "🔍 Check logs in the 'logs' directory"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Wait for user to stop
wait