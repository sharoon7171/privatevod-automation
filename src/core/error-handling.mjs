/**
 * Centralized Error Handling for PrivateVOD Automation Extension
 * Consistent error handling across all components and services
 */

/**
 * Custom Error Classes
 */
export class ExtensionError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = "ExtensionError";
    this.code = code;
    this.originalError = originalError;
    this.timestamp = Date.now();
  }
}

export class StorageError extends ExtensionError {
  constructor(message, originalError = null) {
    super(message, "STORAGE_ERROR", originalError);
    this.name = "StorageError";
  }
}

export class ValidationError extends ExtensionError {
  constructor(message, originalError = null) {
    super(message, "VALIDATION_ERROR", originalError);
    this.name = "ValidationError";
  }
}

export class NetworkError extends ExtensionError {
  constructor(message, originalError = null) {
    super(message, "NETWORK_ERROR", originalError);
    this.name = "NetworkError";
  }
}

export class PermissionError extends ExtensionError {
  constructor(message, originalError = null) {
    super(message, "PERMISSION_ERROR", originalError);
    this.name = "PermissionError";
  }
}

/**
 * Error Handler Class
 * Centralized error handling and reporting
 */
export class ErrorHandler {
  static async handleError(error, context = "Unknown", options = {}) {
    const {
      showNotification = false,
      logToConsole = true,
      reportToAnalytics = false,
      fallbackAction = null,
    } = options;

    // Log error to console
    if (logToConsole) {
      console.error(`[${context}] Error:`, error);
    }

    // Create error report
    const errorReport = {
      message: error.message,
      name: error.name,
      code: error.code || "UNKNOWN",
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location?.href || "unknown",
      stack: error.stack,
    };

    // Store error for debugging
    await this.storeError(errorReport);

    // Show notification if requested
    if (showNotification) {
      this.showErrorNotification(error.message, context);
    }

    // Report to analytics if requested
    if (reportToAnalytics) {
      await this.reportToAnalytics(errorReport);
    }

    // Execute fallback action if provided
    if (fallbackAction && typeof fallbackAction === "function") {
      try {
        await fallbackAction();
      } catch (fallbackError) {
        console.error("Fallback action failed:", fallbackError);
      }
    }

    return errorReport;
  }

  /**
   * Store error for debugging purposes
   * @param {Object} errorReport - Error report object
   */
  static async storeError(errorReport) {
    try {
      const result = await chrome.storage.local.get(["error_logs"]);
      const errorLogs = result.error_logs || [];

      // Keep only last 50 errors
      if (errorLogs.length >= 50) {
        errorLogs.splice(0, errorLogs.length - 50);
      }

      errorLogs.push(errorReport);

      await chrome.storage.local.set({ error_logs: errorLogs });
    } catch (storageError) {
      console.error("Failed to store error:", storageError);
    }
  }

  /**
   * Show error notification to user
   * @param {string} message - Error message
   * @param {string} context - Error context
   */
  static showErrorNotification(message, context) {
    // Simple notification - can be enhanced with proper UI
    console.warn(`[${context}] ${message}`);

    // In a real implementation, this would show a user-friendly notification
    // For now, we'll just log it
  }

  /**
   * Report error to analytics
   * @param {Object} errorReport - Error report object
   */
  static async reportToAnalytics(errorReport) {
    try {
      // In a real implementation, this would send to analytics service
      console.log("Error reported to analytics:", errorReport);
    } catch (analyticsError) {
      console.error("Failed to report to analytics:", analyticsError);
    }
  }

  /**
   * Get stored error logs
   * @returns {Promise<Array>} Array of error reports
   */
  static async getErrorLogs() {
    try {
      const result = await chrome.storage.local.get(["error_logs"]);
      return result.error_logs || [];
    } catch (error) {
      console.error("Failed to get error logs:", error);
      return [];
    }
  }

  /**
   * Clear error logs
   */
  static async clearErrorLogs() {
    try {
      await chrome.storage.local.remove(["error_logs"]);
    } catch (error) {
      console.error("Failed to clear error logs:", error);
    }
  }
}

/**
 * Safe function wrapper
 * Wraps functions with error handling
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context for error handling
 * @param {Object} options - Error handling options
 * @returns {Function} Wrapped function
 */
export function safeFunction(fn, context = "Function", options = {}) {
  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      await ErrorHandler.handleError(error, context, options);
      throw error;
    }
  };
}

/**
 * Safe async operation wrapper
 * @param {Function} operation - Async operation to execute
 * @param {string} context - Context for error handling
 * @param {*} fallbackValue - Value to return on error
 * @returns {Promise<*>} Operation result or fallback value
 */
export async function safeAsync(
  operation,
  context = "Async Operation",
  fallbackValue = null,
) {
  try {
    return await operation();
  } catch (error) {
    await ErrorHandler.handleError(error, context, {
      showNotification: false,
      logToConsole: true,
    });
    return fallbackValue;
  }
}
