#!/bin/bash

# Environment Variable Deployment Script for Production
# This script deploys using environment variables instead of Docker secrets

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

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please create .env.production file with your production configuration."
    print_warning "You can use .env.production.template as a reference."
    exit 1
fi

print_status "Reading .env.production file..."

# Source the .env.production file
set -a
source .env.production
set +a

# Validate required environment variables
required_vars=("MYSQL_ROOT_PASSWORD" "MYSQL_PASSWORD" "DB_PASSWORD" "JWT_SECRET" "SMTP_PASSWORD")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        print_error "  - $var"
    done
    exit 1
fi

print_status "All required environment variables are set!"

# Stop existing containers if running
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.env.yml down || true

# Build and start services
print_status "Building and starting services with environment variables..."
docker-compose -f docker-compose.prod.env.yml up -d --build

# Wait for services to start
print_status "Waiting for services to start..."
sleep 10

# Show container status
print_status "Container status:"
docker-compose -f docker-compose.prod.env.yml ps

print_status "Deployment completed!"
print_info "You can view logs with: docker-compose -f docker-compose.prod.env.yml logs -f"
print_info "To stop services: docker-compose -f docker-compose.prod.env.yml down"
