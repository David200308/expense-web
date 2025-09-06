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
    
    try {
      // Try to read from Docker secret file first
      const secretValue = readFileSync(secretPath, 'utf8').trim();
      logger.info(`Successfully read secret from file: ${fullSecretName}`);
      return secretValue;
    } catch (error) {
      // Fallback to environment variable
      const envVar = fallbackEnvVar || this.FALLBACK_ENV_VARS[secretName as keyof typeof this.FALLBACK_ENV_VARS];
      
      if (envVar && process.env[envVar]) {
        logger.warn(`Secret file not found, using environment variable: ${envVar}`);
        return process.env[envVar]!;
      }
      
      logger.error(`Failed to read secret ${fullSecretName} from file and no fallback environment variable found`);
      throw new Error(`Secret ${fullSecretName} not found in file or environment`);
    }
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
