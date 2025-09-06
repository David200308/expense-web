-- Initialize the database
CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'expense_user'@'%' IDENTIFIED BY 'expense_password';
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_user'@'%';
FLUSH PRIVILEGES;
