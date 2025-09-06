package config

import (
	"os"
	"path/filepath"
	"strings"
)

// SecretReader handles reading Docker secrets from mounted secret files
type SecretReader struct {
	secretsPath string
}

// NewSecretReader creates a new SecretReader instance
func NewSecretReader() *SecretReader {
	return &SecretReader{
		secretsPath: "/run/secrets",
	}
}

// readSecret reads a secret from Docker secret file or falls back to environment variable
func (sr *SecretReader) readSecret(secretName, fallbackEnvVar string) (string, error) {
	// Docker secrets are mounted with EXPENSE_WEB_ prefix
	fullSecretName := "EXPENSE_WEB_" + secretName
	secretPath := filepath.Join(sr.secretsPath, fullSecretName)

	// Try to read from Docker secret file first
	if secretData, err := os.ReadFile(secretPath); err == nil {
		return strings.TrimSpace(string(secretData)), nil
	}

	// Fallback to environment variable
	if envValue := os.Getenv(fallbackEnvVar); envValue != "" {
		return envValue, nil
	}

	return "", os.ErrNotExist
}

// ReadDbPassword reads database password from Docker secret
func (sr *SecretReader) ReadDbPassword() (string, error) {
	return sr.readSecret("db_password", "DB_PASSWORD")
}

// ReadSmtpPassword reads SMTP password from Docker secret
func (sr *SecretReader) ReadSmtpPassword() (string, error) {
	return sr.readSecret("smtp_password", "SMTP_PASSWORD")
}

// IsDockerSecretsAvailable checks if Docker secrets are mounted
func (sr *SecretReader) IsDockerSecretsAvailable() bool {
	testPath := filepath.Join(sr.secretsPath, "EXPENSE_WEB_db_password")
	_, err := os.ReadFile(testPath)
	return err == nil
}
