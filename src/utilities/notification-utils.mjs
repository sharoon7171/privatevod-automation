/**
 * Notification Utilities
 * Reusable utilities for replacing browser alerts with custom notifications
 */

import { notificationManager } from "../ui/basic/notification.mjs";

/**
 * Replace browser alert with custom notification
 * @param {string} message - The message to display
 * @param {Object} options - Notification options
 * @returns {string} - Notification ID
 */
export function showAlert(message, options = {}) {
  return notificationManager.info(message, {
    title: "PrivateVOD Automation",
    duration: 4000,
    ...options,
  });
}

/**
 * Show success notification
 * @param {string} message - The success message
 * @param {Object} options - Notification options
 * @returns {string} - Notification ID
 */
export function showSuccess(message, options = {}) {
  return notificationManager.success(message, {
    title: "Success",
    duration: 3000,
    ...options,
  });
}

/**
 * Show error notification
 * @param {string} message - The error message
 * @param {Object} options - Notification options
 * @returns {string} - Notification ID
 */
export function showError(message, options = {}) {
  return notificationManager.error(message, {
    title: "Error",
    duration: 6000,
    ...options,
  });
}

/**
 * Show warning notification
 * @param {string} message - The warning message
 * @param {Object} options - Notification options
 * @returns {string} - Notification ID
 */
export function showWarning(message, options = {}) {
  return notificationManager.warning(message, {
    title: "Warning",
    duration: 5000,
    ...options,
  });
}

/**
 * Show confirmation dialog (replaces confirm)
 * @param {string} message - The confirmation message
 * @param {Object} options - Dialog options
 * @returns {Promise<boolean>} - User's choice
 */
export function showConfirm(message, options = {}) {
  return new Promise((resolve) => {
    const {
      title = "Confirm Action",
      confirmText = "Yes",
      cancelText = "No",
      type = "warning",
    } = options;

    const notificationId = notificationManager.show(message, {
      type,
      title,
      duration: 0,
      persistent: true,
      closable: false,
    });

    // Create custom buttons
    const notification = document.querySelector(
      `[data-id="${notificationId}"]`,
    );
    if (notification) {
      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 12px;
        justify-content: flex-end;
      `;

      const confirmBtn = document.createElement("button");
      confirmBtn.textContent = confirmText;
      confirmBtn.className = "btn btn-primary";
      confirmBtn.style.cssText = `
        padding: 6px 12px;
        font-size: 12px;
        min-height: 28px;
      `;
      confirmBtn.onclick = () => {
        notificationManager.hide(notificationId);
        resolve(true);
      };

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = cancelText;
      cancelBtn.className = "btn btn-secondary";
      cancelBtn.style.cssText = `
        padding: 6px 12px;
        font-size: 12px;
        min-height: 28px;
      `;
      cancelBtn.onclick = () => {
        notificationManager.hide(notificationId);
        resolve(false);
      };

      buttonContainer.appendChild(cancelBtn);
      buttonContainer.appendChild(confirmBtn);
      notification.appendChild(buttonContainer);
    }
  });
}

/**
 * Show loading notification
 * @param {string} message - The loading message
 * @returns {string} - Notification ID
 */
export function showLoading(message = "Loading...") {
  return notificationManager.info(message, {
    title: "Processing",
    duration: 0,
    persistent: true,
    closable: false,
  });
}

/**
 * Hide loading notification
 * @param {string} notificationId - The notification ID to hide
 */
export function hideLoading(notificationId) {
  notificationManager.hide(notificationId);
}

/**
 * Replace window.alert globally
 */
export function replaceGlobalAlerts() {
  if (typeof window !== "undefined") {
    window.alert = showAlert;
    window.confirm = showConfirm;
  }
}

/**
 * Initialize notification system
 */
export function initNotificationSystem() {
  // Replace global alerts
  replaceGlobalAlerts();

  // Add to global scope for easy access
  if (typeof window !== "undefined") {
    window.showAlert = showAlert;
    window.showSuccess = showSuccess;
    window.showError = showError;
    window.showWarning = showWarning;
    window.showConfirm = showConfirm;
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
  }
}
