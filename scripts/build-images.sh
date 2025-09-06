#!/bin/bash

# Docker Images Build Script
# This script builds all required Docker images for the expense tracker application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_status "Building Docker images for expense tracker..."

# Build Backend API image
print_status "Building backend image..."
docker build -t expense-backend:latest ./backend
print_status "Backend image built successfully: expense-backend:latest"

# Build Task Scheduler image
print_status "Building task scheduler image..."
docker build -t expense-scheduler:latest ./expense-scheduler
print_status "Task scheduler image built successfully: expense-scheduler:latest"

# Build Frontend image (if needed)
if [ -f "./frontend/Dockerfile" ]; then
    print_status "Building frontend image..."
    docker build -t expense-frontend:latest ./frontend
    print_status "Frontend image built successfully: expense-frontend:latest"
else
    print_warning "Frontend Dockerfile not found, skipping frontend build"
fi

print_status "All Docker images built successfully!"
print_info "Built images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep expense

print_status "Build completed!"
print_info "You can now deploy using:"
print_info "  - Docker Swarm: ./scripts/deploy-swarm.sh"
print_info "  - Environment Variables: ./scripts/deploy-env.sh"
print_info "  - Quick Fix: ./scripts/fix-prod-deployment.sh"
