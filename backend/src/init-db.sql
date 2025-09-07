-- Initialize the expense_tracker database
CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL,
  `walletAddress` varchar(42) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `email` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_users_walletAddress` (`walletAddress`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create expenses table
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(500) NOT NULL,
  `category` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_expenses_userId` (`userId`),
  CONSTRAINT `FK_expenses_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
