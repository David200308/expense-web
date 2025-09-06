package kafka

import (
	"encoding/json"
	"expense-scheduler/internal/config"
	"expense-scheduler/internal/models"
	"fmt"
	"log"

	"github.com/Shopify/sarama"
)

type Producer struct {
	producer sarama.SyncProducer
	topic    string
}

func NewProducer(cfg config.KafkaConfig) (*Producer, error) {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Return.Successes = true

	producer, err := sarama.NewSyncProducer(cfg.Brokers, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kafka producer: %w", err)
	}

	return &Producer{
		producer: producer,
		topic:    cfg.Topic,
	}, nil
}

func (p *Producer) PublishTaskEvent(event models.TaskEvent) error {
	eventBytes, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal task event: %w", err)
	}

	msg := &sarama.ProducerMessage{
		Topic: p.topic,
		Key:   sarama.StringEncoder(event.TaskID),
		Value: sarama.ByteEncoder(eventBytes),
	}

	partition, offset, err := p.producer.SendMessage(msg)
	if err != nil {
		return fmt.Errorf("failed to send message: %w", err)
	}

	log.Printf("Message sent to partition %d at offset %d", partition, offset)
	return nil
}

func (p *Producer) PublishEmailNotification(notification models.EmailNotification) error {
	notificationBytes, err := json.Marshal(notification)
	if err != nil {
		return fmt.Errorf("failed to marshal email notification: %w", err)
	}

	msg := &sarama.ProducerMessage{
		Topic: "email-notifications",
		Key:   sarama.StringEncoder(notification.TaskID),
		Value: sarama.ByteEncoder(notificationBytes),
	}

	_, _, err = p.producer.SendMessage(msg)
	if err != nil {
		return fmt.Errorf("failed to send email notification: %w", err)
	}

	return nil
}

func (p *Producer) Close() error {
	return p.producer.Close()
}
