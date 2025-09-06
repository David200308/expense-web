#!/bin/bash

# Quick fix script to resolve Docker secrets issue
# This script stops the current deployment and starts with environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Stopping current deployment..."
docker-compose -f docker-compose.prod.yml down || true

print_status "Starting with environment variable approach..."
docker-compose -f docker-compose.prod.env.yml up -d --build

print_status "Deployment fixed! Services are now running with environment variables."
print_status "You can view logs with: docker-compose -f docker-compose.prod.env.yml logs -f"
