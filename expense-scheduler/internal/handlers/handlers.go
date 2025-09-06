package handlers

import (
	"database/sql"
	"expense-scheduler/internal/logger"
	"expense-scheduler/internal/models"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

type TaskEventPublisher interface {
	PublishTaskEvent(event models.TaskEvent) error
	PublishEmailNotification(notification models.EmailNotification) error
}

type Handlers struct {
	db       *sql.DB
	producer TaskEventPublisher
}

func New(db *sql.DB, producer TaskEventPublisher) *Handlers {
	return &Handlers{
		db:       db,
		producer: producer,
	}
}

func (h *Handlers) Start(port string) error {
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		logger.Info("Health check requested")
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Task management endpoints
	api := r.Group("/api/v1")
	{
		api.POST("/tasks", h.createTask)
		api.GET("/tasks/:userID", h.getUserTasks)
		api.PUT("/tasks/:id", h.updateTask)
		api.DELETE("/tasks/:id", h.deleteTask)
		api.POST("/tasks/:id/trigger", h.triggerTask)
	}

	return r.Run(port)
}

func (h *Handlers) createTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		logger.Error("Failed to bind JSON for task creation: %v", err)
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Generate ID and set timestamps
	task.ID = generateID()
	task.CreatedAt = time.Now()
	task.UpdatedAt = time.Now()

	logger.Info("Creating task: %s for user: %s", task.Title, task.UserID)

	// Publish task creation event
	event := models.TaskEvent{
		Type:      "create",
		TaskID:    task.ID,
		UserID:    task.UserID,
		Timestamp: time.Now(),
		Data:      task,
	}

	if err := h.producer.PublishTaskEvent(event); err != nil {
		logger.Error("Failed to publish task creation event: %v", err)
		c.JSON(500, gin.H{"error": "Failed to create task"})
		return
	}

	logger.Info("Task created successfully: %s", task.ID)
	c.JSON(201, gin.H{"message": "Task created successfully", "task_id": task.ID})
}

func (h *Handlers) getUserTasks(c *gin.Context) {
	userID := c.Param("userID")
	logger.Info("Fetching tasks for user: %s", userID)

	query := `SELECT id, user_id, title, description, amount, category, schedule, is_active, last_run, next_run, created_at, updated_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC`
	rows, err := h.db.Query(query, userID)
	if err != nil {
		logger.Error("Failed to query tasks for user %s: %v", userID, err)
		c.JSON(500, gin.H{"error": "Failed to fetch tasks"})
		return
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		err := rows.Scan(
			&task.ID, &task.UserID, &task.Title, &task.Description, &task.Amount, &task.Category, &task.Schedule, &task.IsActive, &task.LastRun, &task.NextRun, &task.CreatedAt, &task.UpdatedAt,
		)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to scan task"})
			return
		}
		tasks = append(tasks, task)
	}

	c.JSON(200, gin.H{"tasks": tasks})
}

func (h *Handlers) updateTask(c *gin.Context) {
	taskID := c.Param("id")

	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	task.ID = taskID
	task.UpdatedAt = time.Now()

	// Publish task update event
	event := models.TaskEvent{
		Type:      "update",
		TaskID:    task.ID,
		UserID:    task.UserID,
		Timestamp: time.Now(),
		Data:      task,
	}

	if err := h.producer.PublishTaskEvent(event); err != nil {
		c.JSON(500, gin.H{"error": "Failed to update task"})
		return
	}

	c.JSON(200, gin.H{"message": "Task updated successfully"})
}

func (h *Handlers) deleteTask(c *gin.Context) {
	taskID := c.Param("id")

	// Publish task deletion event
	event := models.TaskEvent{
		Type:      "delete",
		TaskID:    taskID,
		Timestamp: time.Now(),
	}

	if err := h.producer.PublishTaskEvent(event); err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete task"})
		return
	}

	c.JSON(200, gin.H{"message": "Task deleted successfully"})
}

func (h *Handlers) triggerTask(c *gin.Context) {
	taskID := c.Param("id")

	// Publish task trigger event
	event := models.TaskEvent{
		Type:      "trigger",
		TaskID:    taskID,
		Timestamp: time.Now(),
	}

	if err := h.producer.PublishTaskEvent(event); err != nil {
		c.JSON(500, gin.H{"error": "Failed to trigger task"})
		return
	}

	c.JSON(200, gin.H{"message": "Task triggered successfully"})
}

func generateID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
