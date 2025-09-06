package logger

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"
)

type Logger struct {
	infoLogger  *log.Logger
	errorLogger *log.Logger
	debugLogger *log.Logger
}

var GlobalLogger *Logger

func Init() error {
	// Create logs directory if it doesn't exist
	logsDir := "logs/scheduler"
	if err := os.MkdirAll(logsDir, 0755); err != nil {
		return fmt.Errorf("failed to create logs directory: %w", err)
	}

	// Generate log filename with current date
	date := time.Now().Format("20060102")
	logFile := filepath.Join(logsDir, fmt.Sprintf("%s.log", date))

	// Open log file for writing
	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return fmt.Errorf("failed to open log file: %w", err)
	}

	// Create multi-writer to write to both file and stdout
	multiWriter := io.MultiWriter(os.Stdout, file)

	// Create loggers with different prefixes
	GlobalLogger = &Logger{
		infoLogger:  log.New(multiWriter, "[INFO] ", log.LstdFlags),
		errorLogger: log.New(multiWriter, "[ERROR] ", log.LstdFlags),
		debugLogger: log.New(multiWriter, "[DEBUG] ", log.LstdFlags),
	}

	return nil
}

func (l *Logger) Info(format string, v ...interface{}) {
	l.infoLogger.Printf(format, v...)
}

func (l *Logger) Error(format string, v ...interface{}) {
	l.errorLogger.Printf(format, v...)
}

func (l *Logger) Debug(format string, v ...interface{}) {
	l.debugLogger.Printf(format, v...)
}

// Convenience functions
func Info(format string, v ...interface{}) {
	if GlobalLogger != nil {
		GlobalLogger.Info(format, v...)
	}
}

func Error(format string, v ...interface{}) {
	if GlobalLogger != nil {
		GlobalLogger.Error(format, v...)
	}
}

func Debug(format string, v ...interface{}) {
	if GlobalLogger != nil {
		GlobalLogger.Debug(format, v...)
	}
}
