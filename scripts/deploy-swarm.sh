#!/bin/bash

# Docker Swarm Deployment Script for Production
# This script initializes Docker Swarm, creates secrets, and deploys the stack

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

# Check if Docker Swarm is already initialized
if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q "active"; then
    print_status "Initializing Docker Swarm..."
    docker swarm init
    print_status "Docker Swarm initialized successfully!"
else
    print_info "Docker Swarm is already initialized"
fi

# Function to create Docker secret
create_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if [ -z "$secret_value" ]; then
        print_warning "Secret $secret_name is empty, skipping..."
        return
    fi
    
    # Check if secret already exists
    if docker secret ls --format "{{.Name}}" | grep -q "^${secret_name}$"; then
        print_warning "Secret $secret_name already exists, updating..."
        # Remove the old secret (this will fail if it's in use, but that's ok)
        docker secret rm "$secret_name" 2>/dev/null || true
        # Wait a moment for the secret to be fully removed
        sleep 2
    fi
    
    # Create the secret
    echo "$secret_value" | docker secret create "$secret_name" -
    print_status "Created/updated secret: $secret_name"
}

# Create Docker secrets for sensitive data
print_status "Creating Docker secrets..."

# Database secrets
create_secret "EXPENSE_WEB_mysql_root_password" "$MYSQL_ROOT_PASSWORD"
create_secret "EXPENSE_WEB_mysql_password" "$MYSQL_PASSWORD"
create_secret "EXPENSE_WEB_db_password" "$DB_PASSWORD"

# JWT secret
create_secret "EXPENSE_WEB_jwt_secret" "$JWT_SECRET"

# SMTP secrets
create_secret "EXPENSE_WEB_smtp_password" "$SMTP_PASSWORD"

# Kafka secrets (if any)
if [ ! -z "$KAFKA_PASSWORD" ]; then
    create_secret "EXPENSE_WEB_kafka_password" "$KAFKA_PASSWORD"
fi

# Other sensitive secrets
if [ ! -z "$ENCRYPTION_KEY" ]; then
    create_secret "EXPENSE_WEB_encryption_key" "$ENCRYPTION_KEY"
fi

if [ ! -z "$API_KEY" ]; then
    create_secret "EXPENSE_WEB_api_key" "$API_KEY"
fi

print_status "Docker secrets created successfully!"

# Build Docker images
print_status "Building Docker images..."
docker build -t expense-backend:latest ./backend
docker build -t expense-scheduler:latest ./expense-scheduler
docker build -t expense-frontend:latest ./frontend
print_status "Docker images built successfully!"

# Deploy the stack
print_status "Deploying stack to Docker Swarm..."

# Check if stack already exists
if docker stack ls --format "{{.Name}}" | grep -q "^expense-prod$"; then
    print_warning "Stack 'expense-prod' already exists, removing it first..."
    docker stack rm expense-prod
    print_status "Waiting for stack to be removed..."
    sleep 10
fi

# Deploy the new stack
docker stack deploy -c docker-compose.swarm.yml expense-prod

print_status "Stack deployed successfully!"

# Wait a moment for services to start
print_status "Waiting for services to start..."
sleep 5

# Show stack status
print_status "Stack status:"
docker stack services expense-prod

print_status "Deployment completed!"
print_info "You can view logs with: docker service logs -f expense-prod_backend"
print_info "You can scale services with: docker service scale expense-prod_backend=2"
print_info "To remove the stack: docker stack rm expense-prod"
