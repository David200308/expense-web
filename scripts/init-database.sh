#!/bin/bash

# Database Initialization Script
# This script creates the necessary database tables for the expense tracker

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

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please create .env.production file with your production configuration."
    exit 1
fi

print_status "Reading .env.production file..."

# Source the .env.production file
set -a
source .env.production
set +a

# Check if MySQL is running
print_status "Checking MySQL connection..."
if ! docker exec expense-mysql-prod mysqladmin ping -h localhost --silent; then
    print_error "MySQL container is not running or not accessible!"
    print_warning "Please start the MySQL container first:"
    print_warning "docker-compose -f docker-compose.prod.env.yml up -d mysql"
    exit 1
fi

print_status "MySQL is running. Initializing database..."

# Execute the SQL script
docker exec -i expense-mysql-prod mysql -u${DB_USERNAME:-expense_user} -p${DB_PASSWORD} < backend/src/init-db.sql

print_status "Database initialization completed!"
print_status "Tables created:"
print_status "  - users"
print_status "  - expenses"

print_status "You can now start the backend service."
