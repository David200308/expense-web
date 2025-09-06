#!/bin/bash

# Expense Tracker - Setup Script
echo "🔧 Setting up Expense Tracker..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install pnpm. Please install manually:"
        echo "npm install -g pnpm"
        exit 1
    fi
else
    echo "✅ pnpm is already installed"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "https://docs.docker.com/get-docker/"
    exit 1
else
    echo "✅ Docker is installed"
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
else
    echo "✅ Docker is running"
fi

# Create environment files
echo "📝 Creating environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "ℹ️  backend/.env already exists"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "ℹ️  frontend/.env already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
pnpm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pnpm install
cd ..

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 Quick Start:"
echo "   Development: pnpm dev"
echo "   Production:  pnpm prod"
echo ""
echo "🛑 Stop Scripts:"
echo "   Development: pnpm stop:dev"
echo "   Production:  pnpm stop:prod"
echo ""
echo "📝 Next Steps:"
echo "   1. Update backend/.env with your database credentials"
echo "   2. Update frontend/.env with your API URL if needed"
echo "   3. Run pnpm dev to start development"
echo ""