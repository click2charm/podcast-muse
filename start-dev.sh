#!/bin/bash

# AI Podcast Generator - Development Startup Script

echo "🚀 Starting AI Podcast Generator Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Run database migrations (if needed)
echo "🗄️ Setting up database..."
docker-compose exec backend python -c "
from database import engine
from models import *
Base.metadata.create_all(bind=engine)
print('✅ Database tables created successfully!')
"

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📍 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "📚 Useful Commands:"
echo "   View logs: docker-compose logs -f [backend|frontend|db|redis]"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
echo "👤 Default User:"
echo "   You can register a new account at http://localhost:3000/register"
echo "   New users get 100 free credits!"
echo ""