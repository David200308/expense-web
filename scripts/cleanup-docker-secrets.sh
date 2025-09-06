#!/bin/bash

# Docker Secrets Cleanup Script
# This script removes all Docker secrets created for the expense tracker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# List of secrets to remove
SECRETS=(
    "EXPENSE_WEB_mysql_root_password"
    "EXPENSE_WEB_mysql_password"
    "EXPENSE_WEB_db_password"
    "EXPENSE_WEB_jwt_secret"
    "EXPENSE_WEB_smtp_password"
    "EXPENSE_WEB_kafka_password"
    "EXPENSE_WEB_encryption_key"
    "EXPENSE_WEB_api_key"
)

print_status "Cleaning up Docker secrets..."

# Remove each secret
for secret in "${SECRETS[@]}"; do
    if docker secret ls --format "{{.Name}}" | grep -q "^${secret}$"; then
        print_status "Removing secret: $secret"
        docker secret rm "$secret" || print_warning "Failed to remove secret: $secret"
    else
        print_warning "Secret $secret not found, skipping..."
    fi
done

print_status "Docker secrets cleanup completed!"

# Show remaining secrets
print_status "Remaining Docker secrets:"
docker secret ls
