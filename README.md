# Expense Tracker Application - Login with your Web3 Wallet

## Tech Stack

| Frontend                                                               | Backend                                                                                  | **Infrastructure**                                  |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| - React (TypeScript)<br />- Vite<br />- Tailwind CSS<br />- Ethers.js | - NestJS (Fastify) & Go Gin<br />- TypeScript & GoLang<br />- TypeORM<br />- Ethers.js | - MySQL Database<br />- Kafka<br />- Docker<br />- PNPM |

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd expense-web
   ```
2. **Start the application**

   ```bash
   # Production
   docker-compose up -d

   # Development
   docker-compose -f docker-compose.dev.yml up -d
   ```
3. **Access the application**

   - Frontend: http://localhost:3010
   - Backend API: http://localhost:3020
   - Swagger Docs: http://localhost:3020/api/docs
   - Task API: http://localhost:3030
   - Database: localhost:3306

### Manual Setup

1. **Install dependencies**

   ```bash
   # Root
   pnpm install

   # Frontend
   cd frontend
   pnpm install

   # Backend
   cd ../backend
   pnpm install
   ```
2. **Set up environment variables**

   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your database credentials

   # Frontend
   cp frontend/env.example frontend/.env
   # Edit frontend/.env with your API URL
   ```
3. **Set up MySQL database**

   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE expense_tracker;
   ```
4. **Start the applications**

   ```bash
   # Terminal 1 - Backend
   cd backend
   pnpm start:dev

   # Terminal 2 - Frontend
   cd frontend
   pnpm dev
   ```
