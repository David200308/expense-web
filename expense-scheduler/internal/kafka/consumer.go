package kafka

import (
	"encoding/json"
	"expense-scheduler/internal/config"
	"expense-scheduler/internal/models"
	"fmt"
	"log"

	"github.com/Shopify/sarama"
)

type TaskEventHandler interface {
	CreateTask(task models.Task) error
	UpdateTask(task models.Task) error
	DeleteTask(taskID string) error
	TriggerTask(taskID string) error
}

type Consumer struct {
	consumer sarama.Consumer
}

func NewConsumer(cfg config.KafkaConfig) (*Consumer, error) {
	config := sarama.NewConfig()
	config.Consumer.Return.Errors = true

	consumer, err := sarama.NewConsumer(cfg.Brokers, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kafka consumer: %w", err)
	}

	return &Consumer{consumer: consumer}, nil
}

func (c *Consumer) ConsumeTaskEvents(handler TaskEventHandler) error {
	partitionConsumer, err := c.consumer.ConsumePartition("expense-tasks", 0, sarama.OffsetNewest)
	if err != nil {
		return fmt.Errorf("failed to create partition consumer: %w", err)
	}
	defer partitionConsumer.Close()

	for {
		select {
		case message := <-partitionConsumer.Messages():
			var event models.TaskEvent
			if err := json.Unmarshal(message.Value, &event); err != nil {
				log.Printf("Failed to unmarshal task event: %v", err)
				continue
			}

			if err := c.handleTaskEvent(handler, event); err != nil {
				log.Printf("Failed to handle task event: %v", err)
			}

		case err := <-partitionConsumer.Errors():
			log.Printf("Kafka consumer error: %v", err)
		}
	}
}

func (c *Consumer) handleTaskEvent(handler TaskEventHandler, event models.TaskEvent) error {
	switch event.Type {
	case "create":
		return handler.CreateTask(event.Data)
	case "update":
		return handler.UpdateTask(event.Data)
	case "delete":
		return handler.DeleteTask(event.TaskID)
	case "trigger":
		return handler.TriggerTask(event.TaskID)
	default:
		return fmt.Errorf("unknown event type: %s", event.Type)
	}
}

func (c *Consumer) Close() error {
	return c.consumer.Close()
}
