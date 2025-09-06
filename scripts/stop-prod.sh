#!/bin/bash

# Expense Tracker - Production Stop Script
echo "🛑 Stopping Expense Tracker Production Services..."

# Stop Docker Compose services
docker-compose -f docker-compose.prod.yml down

echo "✅ Production services stopped successfully!"
