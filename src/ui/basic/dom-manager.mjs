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
    'auto-favorite-video-toggle',
    'auto-close-after-favorite-video-toggle',
    'auto-favorite-star-toggle',
    'auto-close-after-favorite-star-toggle',
    'auto-screenshot-modal-toggle',
    'move-user-actions-toggle',
    'move-container-px0-toggle',
    'block-download-toggle',
    'block-stream-for-life-toggle',
    'block-hd-rental-toggle',
    'block-dvd-rental-toggle',
    'style-active-buttons-toggle',
    'track-favorites-likes-toggle',
    'clear-favorites-btn',
    'clear-likes-btn',
    'refresh-storage-btn',
    'storage-display',
    'hide-liked-videos-toggle',
    'hide-favorited-videos-toggle',
    'auto-redirect-studio-urls-toggle',
    'auto-redirect-pornstar-urls-toggle',
    'merge-title-with-image-links-toggle'
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
