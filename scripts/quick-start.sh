#!/bin/bash

# Expense Tracker - Quick Start Script
echo "⚡ Quick Start - Expense Tracker"

# Check if setup has been run
if [ ! -f "backend/.env" ] || [ ! -f "frontend/.env" ]; then
    echo "🔧 Running setup first..."
    ./scripts/setup.sh
fi

# Ask user which mode to start
echo ""
echo "Choose startup mode:"
echo "1) Development (with hot reload)"
echo "2) Production (Docker containers)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "🚀 Starting in Development Mode..."
        ./scripts/start-dev.sh
        ;;
    2)
        echo "🚀 Starting in Production Mode..."
        ./scripts/start-prod.sh
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
        exit 1
        ;;
esac