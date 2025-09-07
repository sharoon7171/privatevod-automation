/**
 * Shared DOM Element Management for UI Pages
 * DOM element selection and management utilities
 */

/**
 * Get DOM element by ID
 * @param {string} id - Element ID
 * @returns {Element|null} DOM element or null
 */
export function getElementById(id) {
  return document.getElementById(id);
}

/**
 * Get multiple DOM elements by IDs
 * @param {string[]} ids - Array of element IDs
 * @returns {Object} Object with element IDs as keys and elements as values
 */
export function getElementsByIds(ids) {
  const elements = {};
  ids.forEach(id => {
    elements[id] = getElementById(id);
  });
  return elements;
}

/**
 * Get all UI elements for the extension
 * @returns {Object} Object containing all UI elements
 */
export function getAllUIElements() {
  const elementIds = [
    'autoplay-toggle',
    'timer-input',
    'auto-favorite-video-toggle',
    'auto-favorite-video-timer-input',
    'auto-close-after-favorite-video-toggle',
    'auto-favorite-star-toggle',
    'auto-favorite-star-timer-input',
    'auto-close-after-favorite-star-toggle',
    'auto-screenshot-modal-toggle',
    'move-user-actions-toggle',
    'block-scene-download-toggle',
    'block-hd-download-toggle',
    'block-stream-for-life-toggle',
    'block-hd-rental-toggle',
    'style-active-buttons-toggle'
  ];
  
  return getElementsByIds(elementIds);
}

/**
 * Check if all required elements are present
 * @param {Object} elements - Elements object
 * @returns {boolean} True if all elements are present
 */
export function validateElements(elements) {
  const missingElements = [];
  
  Object.entries(elements).forEach(([id, element]) => {
    if (!element) {
      missingElements.push(id);
    }
  });
  
  if (missingElements.length > 0) {
    console.error('Missing DOM elements:', missingElements);
    return false;
  }
  
  return true;
}

/**
 * Add class to element
 * @param {Element} element - DOM element
 * @param {string} className - Class name to add
 */
export function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove class from element
 * @param {Element} element - DOM element
 * @param {string} className - Class name to remove
 */
export function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Set element value
 * @param {Element} element - DOM element
 * @param {any} value - Value to set
 */
export function setValue(element, value) {
  if (element) {
    element.value = value;
  }
}
