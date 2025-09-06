package models

import (
	"time"
)

type Task struct {
	ID          string     `json:"id" db:"id"`
	UserID      string     `json:"user_id" db:"user_id"`
	Title       string     `json:"title" db:"title"`
	Description string     `json:"description" db:"description"`
	Amount      float64    `json:"amount" db:"amount"`
	Category    string     `json:"category" db:"category"`
	Schedule    string     `json:"schedule" db:"schedule"` // cron expression
	IsActive    bool       `json:"is_active" db:"is_active"`
	LastRun     *time.Time `json:"last_run" db:"last_run"`
	NextRun     time.Time  `json:"next_run" db:"next_run"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

type TaskEvent struct {
	Type      string    `json:"type"` // "create", "update", "delete", "trigger"
	TaskID    string    `json:"task_id"`
	UserID    string    `json:"user_id"`
	Timestamp time.Time `json:"timestamp"`
	Data      Task      `json:"data,omitempty"`
}

type EmailNotification struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
	TaskID  string `json:"task_id"`
}
