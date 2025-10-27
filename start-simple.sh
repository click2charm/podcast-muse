#!/bin/bash

echo "🚀 AI Podcast Generator - Simple Startup"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please open Docker Desktop from Applications folder and wait for it to start."
    echo ""
    echo "📋 Steps:"
    echo "1. Open Applications folder"
    echo "2. Find and open 'Docker Desktop'"
    echo "3. Wait until it says 'Docker is running'"
    echo "4. Run this script again"
    exit 1
fi

echo "✅ Docker is running!"
echo ""

# Use simple docker-compose
echo "🐳 Starting services with simple setup..."
docker-compose -f docker-compose-simple.yml up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 15

# Check status
echo "📋 Checking service status:"
docker-compose -f docker-compose-simple.yml ps

echo ""
echo ""
echo "🎉 AI Podcast Generator is ready!"
echo "=================================="
echo ""
echo "📍 Access URLs:"
echo "   • Backend API:     http://localhost:8000"
echo "   • API Docs:        http://localhost:8000/docs"
echo "   • Health Check:    http://localhost:8000/health"
echo ""
echo "🔧 Quick Test Commands:"
echo "   curl http://localhost:8000/health"
echo "   curl http://localhost:8000/"
echo ""
echo "📚 Next Steps:"
echo "   1. Open http://localhost:8000/docs to test API"
echo "   2. Register new user via API"
echo "   3. Setup frontend (next step)"
echo ""
echo "🛑 To stop: docker-compose -f docker-compose-simple.yml down"
echo ""