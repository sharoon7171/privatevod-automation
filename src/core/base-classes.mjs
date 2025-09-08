/**
 * Base Classes for PrivateVOD Automation Extension
 * Foundation classes that other components extend
 */

/**
 * Base Component Class
 * Provides common functionality for all UI components
 */
export class BaseComponent {
  constructor(config = {}) {
    this.config = config;
    this.element = null;
    this.eventListeners = new Map();
    this.initialize();
  }

  /**
   * Initialize the component
   * Override in subclasses for custom initialization
   */
  initialize() {
    // Base initialization logic
    this.render();
    this.addEventListeners();
  }

  /**
   * Render the component
   * Override in subclasses to define component structure
   * @returns {Element} The rendered element
   */
  render() {
    throw new Error('render() method must be implemented by subclass');
  }

  /**
   * Add event listeners
   * Override in subclasses to add specific event listeners
   */
  addEventListeners() {
    // Base event listener logic
  }

  /**
   * Remove event listeners
   * Clean up event listeners to prevent memory leaks
   */
  removeEventListeners() {
    this.eventListeners.forEach((handler, event) => {
      if (this.element) {
        this.element.removeEventListener(event, handler);
      }
    });
    this.eventListeners.clear();
  }

  /**
   * Add event listener with automatic cleanup tracking
   * @param {string} event - Event type
   * @param {Function} handler - Event handler function
   */
  addEventListener(event, handler) {
    if (this.element) {
      this.element.addEventListener(event, handler);
      this.eventListeners.set(event, handler);
    }
  }

  /**
   * Create DOM element with options
   * @param {string} tag - HTML tag name
   * @param {Object} options - Element options
   * @returns {Element} Created element
   */
  createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) element.className = options.className;
    if (options.id) element.id = options.id;
    if (options.textContent) element.textContent = options.textContent;
    if (options.innerHTML) element.innerHTML = options.innerHTML;
    if (options.dataset) {
      Object.entries(options.dataset).forEach(([key, value]) => {
        element.dataset[key] = value;
      });
    }
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    return element;
  }

  /**
   * Update component state
   * @param {Object} newState - New state values
   */
  updateState(newState) {
    this.config = { ...this.config, ...newState };
    this.render();
  }

  /**
   * Destroy the component
   * Clean up resources and remove from DOM
   */
  destroy() {
    this.removeEventListeners();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

/**
 * Base Service Class
 * Provides common functionality for all services
 */
export class BaseService {
  constructor(config = {}) {
    this.config = config;
    this.initialize();
  }

  /**
   * Initialize the service
   * Override in subclasses for custom initialization
   */
  initialize() {
    // Base service initialization logic
  }

  /**
   * Handle errors consistently
   * @param {Error} error - Error object
   * @param {string} context - Error context
   */
  handleError(error, context = 'Service') {
    // Add error reporting logic here
  }

  /**
   * Log messages consistently
   * @param {string} message - Log message
   * @param {string} level - Log level (info, warn, error)
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] ${this.constructor.name}: ${message}`);
  }
}
