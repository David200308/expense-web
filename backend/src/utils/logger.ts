import * as fs from 'fs';
import * as path from 'path';

class Logger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs', 'backend');
    this.ensureLogDir();
    this.logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0].replace(/-/g, '')}.log`);
  }

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeLog(level: string, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] [BACKEND] ${message} ${args.length ? JSON.stringify(args) : ''}\n`;
    
    // Write to file
    fs.appendFileSync(this.logFile, logMessage);
    
    // Also log to console
    console.log(`[${level}] ${message}`, ...args);
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
