#!/bin/bash

# Production Deployment Script with Docker Secrets
# This script sets up Docker secrets and deploys the production environment

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

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please create .env.production file with your production configuration."
    print_warning "You can use env.production.template as a reference."
    exit 1
fi

print_header "Starting Production Deployment with Docker Secrets"

# Step 1: Setup Docker secrets
print_status "Setting up Docker secrets from .env.production..."
./scripts/setup-docker-secrets.sh

if [ $? -ne 0 ]; then
    print_error "Failed to setup Docker secrets. Exiting."
    exit 1
fi

# Step 2: Build and deploy services
print_status "Building and deploying production services..."

# Stop existing containers if running
print_status "Stopping existing production containers..."
docker-compose -f docker-compose.prod.yml down || true

# Build and start services
print_status "Building and starting production services..."
docker-compose -f docker-compose.prod.yml up -d --build

if [ $? -eq 0 ]; then
    print_status "Production deployment completed successfully!"
    print_status "Services are starting up..."
    
    # Wait a moment for services to start
    sleep 10
    
    # Show running containers
    print_status "Running containers:"
    docker-compose -f docker-compose.prod.yml ps
    
    # Show logs
    print_status "Recent logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=20
    
    print_header "Deployment Summary"
    print_status "✓ Docker secrets configured"
    print_status "✓ Production services deployed"
    print_status "✓ MySQL: localhost:3306"
    print_status "✓ Backend API: localhost:3020"
    print_status "✓ Task Scheduler: localhost:3030"
    print_status "✓ Kafka: localhost:9092"
    
    print_warning "Remember to:"
    print_warning "- Update your DNS to point to this server"
    print_warning "- Configure SSL certificates"
    print_warning "- Set up proper firewall rules"
    print_warning "- Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
    
else
    print_error "Production deployment failed!"
    print_status "Check logs: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
