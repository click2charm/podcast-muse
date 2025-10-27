#!/bin/bash

echo "🎧 AI Podcast Generator - Docker Development Setup"
echo "=================================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running! Please start Docker Desktop first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose not found!"
    exit 1
fi

echo "✅ Docker is running"
echo "✅ Docker Compose is available"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose-dev.yml down --remove-orphans 2>/dev/null

# Remove old images if they exist
echo "🗑️  Cleaning up old images..."
docker rmi podcast_muse_frontend:latest 2>/dev/null || true
docker rmi podcast_muse_backend:latest 2>/dev/null || true

echo ""
echo "🔧 Building and starting services..."
echo ""

# Start services
docker-compose -f docker-compose-dev.yml up --build -d

# Check if containers started successfully
sleep 5

if docker ps | grep -q "podcast_muse_backend"; then
    echo "✅ Backend container started successfully"
else
    echo "❌ Backend container failed to start"
    docker-compose -f docker-compose-dev.yml logs backend
    exit 1
fi

if docker ps | grep -q "podcast_muse_frontend"; then
    echo "✅ Frontend container started successfully"
else
    echo "❌ Frontend container failed to start"
    docker-compose -f docker-compose-dev.yml logs frontend
    exit 1
fi

echo ""
echo "🚀 Development servers are running!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo "📍 Health:   http://localhost:8000/health"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose -f docker-compose-dev.yml logs -f"
echo "  Stop all:  docker-compose -f docker-compose-dev.yml down"
echo "  Restart:   docker-compose -f docker-compose-dev.yml restart"
echo ""
echo "Press Ctrl+C to stop monitoring logs (containers keep running)"
echo ""

# Show logs
docker-compose -f docker-compose-dev.yml logs -f