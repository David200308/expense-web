class Logger {
  constructor() {
    this.ensureLogDir();
  }

  private ensureLogDir() {
    // In browser environment, we can't create directories
    // This is handled by the build process or server
  }

  private writeLog(level: string, message: string, ...args: any[]) {
    // Log to console
    console.log(`[${level}] ${message}`, ...args);
    
    // In a real application, you might want to send logs to a server
    // For now, we'll just use console logging
  }

  info(message: string, ...args: any[]) {
    this.writeLog('INFO', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.writeLog('ERROR', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.writeLog('WARN', message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.writeLog('DEBUG', message, ...args);
  }
}

export const logger = new Logger();
