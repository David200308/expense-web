package main

import (
	"expense-scheduler/internal/config"
	"expense-scheduler/internal/database"
	"expense-scheduler/internal/handlers"
	"expense-scheduler/internal/logger"
	"expense-scheduler/internal/models"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

// Mock producer for testing
type MockProducer struct{}

func (m *MockProducer) PublishTaskEvent(event models.TaskEvent) error {
	logger.Info("Mock: Publishing task event: %+v", event)
	return nil
}

func (m *MockProducer) PublishEmailNotification(notification models.EmailNotification) error {
	logger.Info("Mock: Publishing email notification: %+v", notification)
	return nil
}

func main() {
	// Initialize logger
	if err := logger.Init(); err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}

	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Init(cfg.Database)
	if err != nil {
		logger.Error("Failed to initialize database: %v", err)
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.Close()

	// Create mock producer
	producer := &MockProducer{}

	// Initialize handlers
	handlers := handlers.New(db.DB, producer)

	logger.Info("Starting Expense Scheduler Service (Simple Mode)...")

	// Start HTTP server
	if err := handlers.Start(cfg.Server.Port); err != nil {
		logger.Error("Failed to start HTTP server: %v", err)
		log.Fatal("Failed to start HTTP server:", err)
	}
}
