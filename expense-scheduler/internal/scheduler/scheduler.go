package scheduler

import (
	"database/sql"
	"expense-scheduler/internal/models"
	"fmt"
	"log"
	"time"

	"github.com/robfig/cron/v3"
)

type TaskEventPublisher interface {
	PublishTaskEvent(event models.TaskEvent) error
	PublishEmailNotification(notification models.EmailNotification) error
}

type Scheduler struct {
	db       *sql.DB
	producer TaskEventPublisher
	cron     *cron.Cron
}

func New(db *sql.DB, producer TaskEventPublisher) *Scheduler {
	c := cron.New(cron.WithLocation(time.UTC))
	return &Scheduler{
		db:       db,
		producer: producer,
		cron:     c,
	}
}

func (s *Scheduler) Start() {
	s.cron.Start()
	log.Println("Task scheduler started")

	// Check for tasks that need to be triggered every minute
	s.cron.AddFunc("@every 1m", s.checkAndTriggerTasks)
}

func (s *Scheduler) Stop() {
	s.cron.Stop()
}

func (s *Scheduler) CreateTask(task models.Task) error {
	// Calculate next run time based on schedule
	nextRun, err := s.calculateNextRun(task.Schedule)
	if err != nil {
		return fmt.Errorf("failed to calculate next run: %w", err)
	}
	task.NextRun = nextRun

	query := `
		INSERT INTO tasks (id, user_id, title, description, amount, category, schedule, is_active, next_run, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err = s.db.Exec(query, task.ID, task.UserID, task.Title, task.Description, task.Amount, task.Category, task.Schedule, task.IsActive, task.NextRun, time.Now(), time.Now())
	if err != nil {
		return fmt.Errorf("failed to create task: %w", err)
	}

	log.Printf("Task created: %s", task.ID)
	return nil
}

func (s *Scheduler) UpdateTask(task models.Task) error {
	// Recalculate next run time
	nextRun, err := s.calculateNextRun(task.Schedule)
	if err != nil {
		return fmt.Errorf("failed to calculate next run: %w", err)
	}
	task.NextRun = nextRun

	query := `
		UPDATE tasks 
		SET title = ?, description = ?, amount = ?, category = ?, schedule = ?, is_active = ?, next_run = ?, updated_at = ?
		WHERE id = ?
	`

	_, err = s.db.Exec(query, task.Title, task.Description, task.Amount, task.Category, task.Schedule, task.IsActive, task.NextRun, time.Now(), task.ID)
	if err != nil {
		return fmt.Errorf("failed to update task: %w", err)
	}

	log.Printf("Task updated: %s", task.ID)
	return nil
}

func (s *Scheduler) DeleteTask(taskID string) error {
	query := `DELETE FROM tasks WHERE id = ?`
	_, err := s.db.Exec(query, taskID)
	if err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	log.Printf("Task deleted: %s", taskID)
	return nil
}

func (s *Scheduler) TriggerTask(taskID string) error {
	// Get task details
	var task models.Task
	query := `SELECT id, user_id, title, description, amount, category, schedule, is_active, last_run, next_run, created_at, updated_at FROM tasks WHERE id = ?`

	err := s.db.QueryRow(query, taskID).Scan(
		&task.ID, &task.UserID, &task.Title, &task.Description, &task.Amount, &task.Category, &task.Schedule, &task.IsActive, &task.LastRun, &task.NextRun, &task.CreatedAt, &task.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to get task: %w", err)
	}

	if !task.IsActive {
		return fmt.Errorf("task is not active")
	}

	// Send email notification
	notification := models.EmailNotification{
		To:      "", // This should be fetched from user table
		Subject: fmt.Sprintf("Expense Reminder: %s", task.Title),
		Body:    fmt.Sprintf("Don't forget to record your %s expense of $%.2f for %s", task.Category, task.Amount, task.Description),
		TaskID:  task.ID,
	}

	if err := s.producer.PublishEmailNotification(notification); err != nil {
		log.Printf("Failed to send email notification: %v", err)
	}

	// Update last run time and calculate next run
	now := time.Now()
	nextRun, err := s.calculateNextRun(task.Schedule)
	if err != nil {
		return fmt.Errorf("failed to calculate next run: %w", err)
	}

	updateQuery := `UPDATE tasks SET last_run = ?, next_run = ?, updated_at = ? WHERE id = ?`
	_, err = s.db.Exec(updateQuery, now, nextRun, now, taskID)
	if err != nil {
		return fmt.Errorf("failed to update task after trigger: %w", err)
	}

	log.Printf("Task triggered: %s", taskID)
	return nil
}

func (s *Scheduler) checkAndTriggerTasks() {
	now := time.Now()
	query := `SELECT id FROM tasks WHERE is_active = TRUE AND next_run <= ?`

	rows, err := s.db.Query(query, now)
	if err != nil {
		log.Printf("Failed to query tasks: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var taskID string
		if err := rows.Scan(&taskID); err != nil {
			log.Printf("Failed to scan task ID: %v", err)
			continue
		}

		if err := s.TriggerTask(taskID); err != nil {
			log.Printf("Failed to trigger task %s: %v", taskID, err)
		}
	}
}

func (s *Scheduler) calculateNextRun(schedule string) (time.Time, error) {
	parser := cron.NewParser(cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow)
	sched, err := parser.Parse(schedule)
	if err != nil {
		return time.Time{}, fmt.Errorf("failed to parse schedule: %w", err)
	}

	return sched.Next(time.Now()), nil
}
