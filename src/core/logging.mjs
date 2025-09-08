/**
 * Centralized Logging for PrivateVOD Automation Extension
 * Consistent logging across all components and services
 */

/**
 * Log Levels
 */
export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

/**
 * Logger Class
 * Centralized logging with different levels and contexts
 */
export class Logger {
  constructor(context = "Logger", options = {}) {
    this.context = context;
    this.options = {
      enableConsole: true,
      enableStorage: false,
      maxStorageEntries: 100,
      logLevel: LOG_LEVELS.INFO,
      ...options,
    };
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error|Object} error - Error object or additional data
   */
  error(message, error = null) {
    this.log(LOG_LEVELS.ERROR, message, error);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} data - Additional data
   */
  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} data - Additional data
   */
  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} data - Additional data
   */
  debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  /**
   * Core logging method
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      data: data || null,
    };

    // Console logging
    if (this.options.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Storage logging
    if (this.options.enableStorage) {
      this.logToStorage(logEntry);
    }
  }

  /**
   * Log to console with appropriate method
   * @param {Object} logEntry - Log entry object
   */
  logToConsole(logEntry) {
    const { level, context, message, data, timestamp } = logEntry;
    const formattedMessage = `[${timestamp}] [${context}] ${message}`;

    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(formattedMessage, data || "");
        break;
      case LOG_LEVELS.WARN:
        console.warn(formattedMessage, data || "");
        break;
      case LOG_LEVELS.INFO:
        console.info(formattedMessage, data || "");
        break;
      case LOG_LEVELS.DEBUG:
        console.debug(formattedMessage, data || "");
        break;
      default:
        console.log(formattedMessage, data || "");
    }
  }

  /**
   * Log to storage for persistence
   * @param {Object} logEntry - Log entry object
   */
  async logToStorage(logEntry) {
    try {
      const result = await chrome.storage.local.get(["app_logs"]);
      const logs = result.app_logs || [];

      // Add new log entry
      logs.push(logEntry);

      // Keep only the most recent entries
      if (logs.length > this.options.maxStorageEntries) {
        logs.splice(0, logs.length - this.options.maxStorageEntries);
      }

      await chrome.storage.local.set({ app_logs: logs });
    } catch (error) {
      console.error("Failed to log to storage:", error);
    }
  }

  /**
   * Get stored logs
   * @returns {Promise<Array>} Array of log entries
   */
  async getStoredLogs() {
    try {
      const result = await chrome.storage.local.get(["app_logs"]);
      return result.app_logs || [];
    } catch (error) {
      console.error("Failed to get stored logs:", error);
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  async clearStoredLogs() {
    try {
      await chrome.storage.local.remove(["app_logs"]);
    } catch (error) {
      console.error("Failed to clear stored logs:", error);
    }
  }
}

/**
 * Create logger instance
 * @param {string} context - Logger context
 * @param {Object} options - Logger options
 * @returns {Logger} Logger instance
 */
export function createLogger(context, options = {}) {
  return new Logger(context, options);
}

/**
 * Default logger instances for common contexts
 */
export const loggers = {
  contentScript: createLogger("Content Script", { logLevel: LOG_LEVELS.INFO }),
  options: createLogger("Options", { logLevel: LOG_LEVELS.INFO }),
  background: createLogger("Background", { logLevel: LOG_LEVELS.INFO }),
  shared: createLogger("Shared", { logLevel: LOG_LEVELS.DEBUG }),
};

/**
 * Utility functions for quick logging
 */
export const log = {
  error: (message, error) => loggers.shared.error(message, error),
  warn: (message, data) => loggers.shared.warn(message, data),
  info: (message, data) => loggers.shared.info(message, data),
  debug: (message, data) => loggers.shared.debug(message, data),
};
