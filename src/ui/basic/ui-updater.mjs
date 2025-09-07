/**
 * Shared UI Update Functions for UI Pages
 * UI state update utilities
 */

import { addClass, removeClass, setValue } from './dom-manager.mjs';

/**
 * Update toggle state
 * @param {Element} toggleElement - Toggle element
 * @param {boolean} isActive - Whether toggle should be active
 */
export function updateToggleState(toggleElement, isActive) {
  if (!toggleElement) return;
  
  if (isActive) {
    addClass(toggleElement, 'active');
  } else {
    removeClass(toggleElement, 'active');
  }
}

/**
 * Update input value
 * @param {Element} inputElement - Input element
 * @param {any} value - Value to set
 */
export function updateInputValue(inputElement, value) {
  if (inputElement) {
    setValue(inputElement, value);
  }
}

/**
 * Update UI with settings
 * @param {Object} settings - Settings object
 * @param {Object} elements - DOM elements object
 */
export function updateUI(settings, elements) {
  // Update autoplay toggle state
  updateToggleState(elements['autoplay-toggle'], settings.autoplay);
  
  // Update autoplay timer input
  updateInputValue(elements['timer-input'], settings.timer);
  
  // Update auto-favorite video toggles
  updateToggleState(elements['auto-favorite-video-toggle'], settings.autoFavoriteVideo);
  updateToggleState(elements['auto-close-after-favorite-video-toggle'], settings.autoCloseAfterFavoriteVideo);
  
  // Update auto-favorite video timer input
  updateInputValue(elements['auto-favorite-video-timer-input'], settings.autoFavoriteVideoTimer);
  
  // Update auto-favorite star toggles
  updateToggleState(elements['auto-favorite-star-toggle'], settings.autoFavoriteStar);
  updateToggleState(elements['auto-close-after-favorite-star-toggle'], settings.autoCloseAfterFavoriteStar);
  
  // Update auto-favorite star timer input
  updateInputValue(elements['auto-favorite-star-timer-input'], settings.autoFavoriteStarTimer);
  
  // Update screenshot automation toggle
  updateToggleState(elements['auto-screenshot-modal-toggle'], settings.autoScreenshotModal);
}

/**
 * Create UI updater function with elements bound
 * @param {Object} elements - DOM elements object
 * @returns {Function} UI updater function
 */
export function createUIUpdater(elements) {
  return function updateUIWithElements(settings) {
    updateUI(settings, elements);
  };
}

