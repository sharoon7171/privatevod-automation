/**
 * Reusable Notification Component
 * Modern, accessible notification system for Chrome extension
 */

export class NotificationManager {
  constructor() {
    this.notifications = new Map();
    this.container = null;
    this.init();
  }

  init() {
    this.createContainer();
    this.setupStyles();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);
  }

  setupStyles() {
    if (document.getElementById('notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      }

      .notification {
        background: var(--white, #ffffff);
        border: 1px solid var(--gray-200, #e2e8f0);
        border-radius: var(--radius-lg, 8px);
        box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
        padding: 16px 20px;
        min-width: 300px;
        max-width: 400px;
        pointer-events: auto;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .notification.show {
        transform: translateX(0);
        opacity: 1;
      }

      .notification.hide {
        transform: translateX(100%);
        opacity: 0;
      }

      .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .notification-title {
        font-size: var(--font-size-md, 16px);
        font-weight: var(--font-weight-semibold, 600);
        color: var(--text-primary, #0f172a);
        margin: 0;
      }

      .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: var(--radius-sm, 4px);
        color: var(--text-muted, #64748b);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
      }

      .notification-close:hover {
        background: var(--gray-100, #f1f5f9);
        color: var(--text-primary, #0f172a);
      }

      .notification-message {
        font-size: var(--font-size-sm, 14px);
        font-weight: var(--font-weight-medium, 500);
        color: var(--text-secondary, #334155);
        line-height: 1.4;
        margin: 0;
      }

      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: var(--primary-color, #BB1D1C);
        transition: width linear;
        border-radius: 0 0 var(--radius-lg, 8px) 0;
      }

      /* Notification Types */
      .notification.success {
        border-left: 4px solid var(--success-color, #10b981);
      }

      .notification.success .notification-progress {
        background: var(--success-color, #10b981);
      }

      .notification.error {
        border-left: 4px solid var(--danger-color, #ef4444);
      }

      .notification.error .notification-progress {
        background: var(--danger-color, #ef4444);
      }

      .notification.warning {
        border-left: 4px solid var(--warning-color, #f59e0b);
      }

      .notification.warning .notification-progress {
        background: var(--warning-color, #f59e0b);
      }

      .notification.info {
        border-left: 4px solid var(--info-color, #06b6d4);
      }

      .notification.info .notification-progress {
        background: var(--info-color, #06b6d4);
      }

      /* Responsive */
      @media (max-width: 480px) {
        .notification-container {
          top: 10px;
          right: 10px;
          left: 10px;
        }

        .notification {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  show(message, options = {}) {
    const {
      type = 'info',
      title = 'PrivateVOD Automation',
      duration = 5000,
      closable = true,
      persistent = false
    } = options;

    const id = this.generateId();
    const notification = this.createNotification(id, message, { type, title, closable });
    
    this.container.appendChild(notification);
    this.notifications.set(id, { element: notification, duration, persistent });

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Auto-remove if not persistent
    if (!persistent && duration > 0) {
      this.scheduleRemoval(id, duration);
    }

    return id;
  }

  createNotification(id, message, { type, title, closable }) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.dataset.id = id;

    // Create notification structure safely
    const header = document.createElement('div');
    header.className = 'notification-header';
    
    const titleElement = document.createElement('h4');
    titleElement.className = 'notification-title';
    titleElement.textContent = title;
    header.appendChild(titleElement);
    
    if (closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'notification-close';
      closeBtn.setAttribute('aria-label', 'Close notification');
      closeBtn.textContent = '×';
      header.appendChild(closeBtn);
    }
    
    const messageElement = document.createElement('p');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    
    const progressElement = document.createElement('div');
    progressElement.className = 'notification-progress';
    
    notification.appendChild(header);
    notification.appendChild(messageElement);
    notification.appendChild(progressElement);

    // Add close functionality
    if (closable) {
      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => this.hide(id));
    }

    return notification;
  }

  hide(id) {
    const notificationData = this.notifications.get(id);
    if (!notificationData) return;

    const { element } = notificationData;
    element.classList.remove('show');
    element.classList.add('hide');

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.notifications.delete(id);
    }, 300);
  }

  scheduleRemoval(id, duration) {
    const notificationData = this.notifications.get(id);
    if (!notificationData) return;

    const { element } = notificationData;
    const progressBar = element.querySelector('.notification-progress');
    
    // Animate progress bar
    if (progressBar) {
      progressBar.style.width = '100%';
      progressBar.style.transitionDuration = `${duration}ms`;
    }

    setTimeout(() => {
      this.hide(id);
    }, duration);
  }

  generateId() {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convenience methods
  success(message, options = {}) {
    return this.show(message, { ...options, type: 'success' });
  }

  error(message, options = {}) {
    return this.show(message, { ...options, type: 'error' });
  }

  warning(message, options = {}) {
    return this.show(message, { ...options, type: 'warning' });
  }

  info(message, options = {}) {
    return this.show(message, { ...options, type: 'info' });
  }

  // Clear all notifications
  clearAll() {
    this.notifications.forEach((_, id) => {
      this.hide(id);
    });
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();
