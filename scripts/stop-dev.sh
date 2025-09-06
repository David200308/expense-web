#!/bin/bash

# Expense Tracker - Development Stop Script
echo "🛑 Stopping Expense Tracker Development Environment..."

# Kill any running Node.js processes for this project
echo "🔍 Finding and stopping Node.js processes..."
pkill -f "expense-web" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true

# Stop Docker containers
echo "🐳 Stopping Docker containers..."
docker-compose -f docker-compose.dev.yml down

# Clean up any orphaned containers
docker-compose -f docker-compose.dev.yml down --remove-orphans

echo "✅ Development environment stopped successfully!"
echo ""
echo "🧹 To clean up Docker volumes and images:"
echo "   docker-compose -f docker-compose.dev.yml down -v"
echo "   docker system prune -f"