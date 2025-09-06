#!/bin/bash

# Load environment variables
if [ -f .env.development ]; then
    export $(cat .env.development | grep -v '^#' | xargs)
    echo "📋 Loaded development environment variables"
elif [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "📋 Loaded environment variables"
else
    echo "⚠️  No .env file found, using default values"
fi

# Expense Tracker - Development Start Script
echo "🚀 Starting Expense Tracker in Development Mode..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/env.example backend/.env
    echo "✅ Backend .env created. Please update the database credentials if needed."
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/env.example frontend/.env
    echo "✅ Frontend .env created."
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start infrastructure with Docker
echo "🐳 Starting infrastructure services (MySQL, Kafka)..."
docker-compose -f docker-compose.dev.yml up -d mysql zookeeper kafka

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Start backend
echo "🔧 Starting backend server..."
cd backend
pnpm install
pnpm start:dev > ../logs/backend/$(date +%Y%m%d).log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start task scheduler
echo "⏰ Starting task scheduler service..."
cd ../expense-scheduler
go mod download
go run simple-main.go > ../logs/scheduler/$(date +%Y%m%d).log 2>&1 &
SCHEDULER_PID=$!

# Wait a moment for scheduler to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend
pnpm install
pnpm dev > ../logs/frontend/$(date +%Y%m%d).log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✅ Expense Tracker is starting up!"
echo ""
echo "🌐 Frontend: ${VITE_FRONTEND_URL:-http://localhost:3010}"
echo "🔧 Backend API: http://localhost:${BACKEND_PORT:-3020}"
echo "📚 Swagger Docs: http://localhost:${BACKEND_PORT:-3020}/api/docs"
echo "⏰ Task Scheduler: http://localhost:${SCHEDULER_PORT:-3030}"
echo "🗄️  Database: ${DB_HOST:-localhost}:${DB_PORT:-3306}"
echo "📨 Kafka: localhost:9092"
echo ""
echo "📝 Logs:"
echo "   Backend PID: $BACKEND_PID"
echo "   Scheduler PID: $SCHEDULER_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 To stop the application, press Ctrl+C or run: pnpm stop:dev"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping Expense Tracker..."
    kill $BACKEND_PID 2>/dev/null
    kill $SCHEDULER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    docker-compose -f docker-compose.dev.yml down
    echo "✅ Stopped successfully!"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait