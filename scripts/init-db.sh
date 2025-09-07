#!/bin/bash

# Database initialization script for Docker container
set -e

echo "Waiting for MySQL to be ready..."
while ! mysqladmin ping -h mysql -u${DB_USERNAME:-expense_user} -p${DB_PASSWORD} --silent; do
    echo "MySQL is not ready yet, waiting..."
    sleep 2
done

echo "MySQL is ready. Creating database and tables..."

# Create database and tables
mysql -h mysql -u${DB_USERNAME:-expense_user} -p${DB_PASSWORD} << EOF
CREATE DATABASE IF NOT EXISTS ${DB_DATABASE:-expense_tracker};
USE ${DB_DATABASE:-expense_tracker};

-- Create users table
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` varchar(36) NOT NULL,
  \`walletAddress\` varchar(42) NOT NULL,
  \`currency\` varchar(3) NOT NULL DEFAULT 'USD',
  \`email\` varchar(255) DEFAULT NULL,
  \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`IDX_users_walletAddress\` (\`walletAddress\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create expenses table
CREATE TABLE IF NOT EXISTS \`expenses\` (
  \`id\` varchar(36) NOT NULL,
  \`userId\` varchar(36) NOT NULL,
  \`amount\` decimal(10,2) NOT NULL,
  \`description\` varchar(500) NOT NULL,
  \`category\` varchar(100) NOT NULL,
  \`date\` date NOT NULL,
  \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  KEY \`FK_expenses_userId\` (\`userId\`),
  CONSTRAINT \`FK_expenses_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tasks table for task scheduler
CREATE TABLE IF NOT EXISTS \`tasks\` (
  \`id\` varchar(36) NOT NULL,
  \`user_id\` varchar(36) NOT NULL,
  \`title\` varchar(255) NOT NULL,
  \`description\` text,
  \`amount\` decimal(10,2) NOT NULL,
  \`category\` varchar(100) NOT NULL,
  \`schedule\` varchar(100) NOT NULL,
  \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
  \`last_run\` datetime DEFAULT NULL,
  \`next_run\` datetime NOT NULL,
  \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  KEY \`FK_tasks_user_id\` (\`user_id\`),
  CONSTRAINT \`FK_tasks_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
EOF

echo "Database initialization completed successfully!"
