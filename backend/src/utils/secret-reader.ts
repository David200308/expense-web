import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from './logger';

/**
 * Utility class to read Docker secrets from mounted secret files
 * Docker secrets are mounted at /run/secrets/ inside the container
 */
export class SecretReader {
  private static readonly SECRETS_PATH = '/run/secrets';
  private static readonly FALLBACK_ENV_VARS = {
    DB_PASSWORD: 'DB_PASSWORD',
    JWT_SECRET: 'JWT_SECRET',
    SMTP_PASSWORD: 'SMTP_PASSWORD',
  };

  /**
   * Read a secret from Docker secret file or fallback to environment variable
   * @param secretName - The name of the secret (without EXPENSE_WEB_ prefix)
   * @param fallbackEnvVar - Environment variable to use as fallback
   * @returns The secret value
   */
  static readSecret(secretName: string, fallbackEnvVar?: string): string {
    const fullSecretName = `EXPENSE_WEB_${secretName}`;
    const secretPath = join(this.SECRETS_PATH, fullSecretName);
    
    // First, try to read from environment variable (for non-swarm deployments)
    const envVar = fallbackEnvVar || this.FALLBACK_ENV_VARS[secretName as keyof typeof this.FALLBACK_ENV_VARS];
    if (envVar && process.env[envVar]) {
      logger.info(`Using environment variable for secret: ${envVar}`);
      return process.env[envVar]!;
    }
    
    // Then try to read from Docker secret file (for swarm deployments)
    try {
      const secretValue = readFileSync(secretPath, 'utf8').trim();
      if (secretValue) {
        logger.info(`Successfully read secret from file: ${fullSecretName}`);
        return secretValue;
      }
    } catch (error) {
      logger.debug(`Secret file not found: ${secretPath}`);
    }
    
    // If neither works, throw an error
    logger.error(`Secret ${fullSecretName} not found in file or environment`);
    throw new Error(`Secret ${fullSecretName} not found in file or environment. Please ensure either the Docker secret is mounted or the environment variable ${envVar} is set.`);
  }

  /**
   * Read database password from Docker secret
   */
  static readDbPassword(): string {
    return this.readSecret('db_password', 'DB_PASSWORD');
  }

  /**
   * Read JWT secret from Docker secret
   */
  static readJwtSecret(): string {
    return this.readSecret('jwt_secret', 'JWT_SECRET');
  }

  /**
   * Read SMTP password from Docker secret
   */
  static readSmtpPassword(): string {
    return this.readSecret('smtp_password', 'SMTP_PASSWORD');
  }

  /**
   * Check if running in Docker with secrets mounted
   */
  static isDockerSecretsAvailable(): boolean {
    try {
      const testPath = join(this.SECRETS_PATH, 'EXPENSE_WEB_db_password');
      readFileSync(testPath, 'utf8');
      return true;
    } catch {
      return false;
    }
  }
}
