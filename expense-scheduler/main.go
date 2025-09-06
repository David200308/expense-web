package main

import (
	"expense-scheduler/internal/config"
	"expense-scheduler/internal/database"
	"expense-scheduler/internal/handlers"
	"expense-scheduler/internal/kafka"
	"expense-scheduler/internal/scheduler"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Init(cfg.Database)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.Close()

	// Initialize Kafka producer and consumer
	producer, err := kafka.NewProducer(cfg.Kafka)
	if err != nil {
		log.Fatal("Failed to initialize Kafka producer:", err)
	}
	defer producer.Close()

	consumer, err := kafka.NewConsumer(cfg.Kafka)
	if err != nil {
		log.Fatal("Failed to initialize Kafka consumer:", err)
	}
	defer consumer.Close()

	// Initialize scheduler
	taskScheduler := scheduler.New(db.DB, producer)

	// Initialize handlers
	handlers := handlers.New(db.DB, producer)

	// Start Kafka consumer for task events
	go func() {
		if err := consumer.ConsumeTaskEvents(taskScheduler); err != nil {
			log.Fatal("Failed to start Kafka consumer:", err)
		}
	}()

	// Start the scheduler
	go taskScheduler.Start()

	// Start HTTP server
	go func() {
		if err := handlers.Start(cfg.Server.Port); err != nil {
			log.Fatal("Failed to start HTTP server:", err)
		}
	}()

	log.Println("Expense Scheduler Service started successfully")

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down Expense Scheduler Service...")
}
