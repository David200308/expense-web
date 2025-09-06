#!/bin/bash

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "📋 Loaded production environment variables"
elif [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "📋 Loaded environment variables"
else
    echo "⚠️  No .env file found, using default values"
fi

# Expense Tracker - Production Start Script
echo "🚀 Starting Expense Tracker in Production Mode..."

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create logs directory
mkdir -p logs/{backend,scheduler,frontend}

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "✅ Expense Tracker is running in production mode!"
echo ""
echo "🌐 Frontend: ${VITE_FRONTEND_URL:-https://your-domain.com}"
echo "�� Backend API: ${VITE_API_BASE_URL:-https://api.your-domain.com/api}"
echo "📚 Swagger Docs: ${VITE_API_BASE_URL:-https://api.your-domain.com/api}/docs"
echo "⏰ Task Scheduler: ${VITE_TASK_SCHEDULER_URL:-https://tasks.your-domain.com}"
echo "🗄️  Database: ${DB_HOST:-your-db-host}:${DB_PORT:-3306}"
echo ""
echo "📝 View logs with: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 Stop services with: docker-compose -f docker-compose.prod.yml down"
