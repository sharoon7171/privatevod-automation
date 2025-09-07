/**
 * Shared Event Handling Functions for UI Pages
 * Toggle and timer event handling utilities
 */

import { getSettings, saveSettings } from '../core/settings.mjs';

/**
 * Handle toggle click event
 * @param {string} settingName - Name of the setting to toggle
 * @param {Function} updateUI - UI update function
 * @returns {Function} Event handler function
 */
export function createToggleHandler(settingName, updateUI) {
  return async function handleToggleClick() {
    try {
      const currentSettings = await getSettings();
      const newSettings = {
        ...currentSettings,
        [settingName]: !currentSettings[settingName]
      };
      
      await saveSettings(newSettings);
      updateUI(newSettings);
    } catch (error) {
      console.error(`Error toggling ${settingName}:`, error);
    }
  };
}

/**
 * Handle timer input change event
 * @param {string} settingName - Name of the setting to update
 * @param {Element} inputElement - Input element
 * @param {Function} updateUI - UI update function
 * @returns {Function} Event handler function
 */
export function createTimerHandler(settingName, inputElement, updateUI) {
  return async function handleTimerChange() {
    try {
      const timerValue = parseInt(inputElement.value) || 0;
      const currentSettings = await getSettings();
      const newSettings = {
        ...currentSettings,
        [settingName]: Math.max(0, Math.min(10, timerValue))
      };
      
      await saveSettings(newSettings);
      updateUI(newSettings);
    } catch (error) {
      console.error(`Error updating ${settingName}:`, error);
    }
  };
}

/**
 * Setup all event listeners for a page
 * @param {Object} elements - DOM elements object
 * @param {Function} updateUI - UI update function
 */
export function setupEventListeners(elements, updateUI) {
  // Autoplay toggle click handler
  if (elements['autoplay-toggle']) {
    elements['autoplay-toggle'].addEventListener('click', createToggleHandler('autoplay', updateUI));
  }
  
  // Autoplay input change handlers (instant save)
  if (elements['timer-input']) {
    const timerHandler = createTimerHandler('timer', elements['timer-input'], updateUI);
    elements['timer-input'].addEventListener('input', timerHandler);
    elements['timer-input'].addEventListener('change', timerHandler);
  }
  
  // Auto-favorite video handlers
  if (elements['auto-favorite-video-toggle']) {
    elements['auto-favorite-video-toggle'].addEventListener('click', createToggleHandler('autoFavoriteVideo', updateUI));
  }
  
  if (elements['auto-favorite-video-timer-input']) {
    const videoTimerHandler = createTimerHandler('autoFavoriteVideoTimer', elements['auto-favorite-video-timer-input'], updateUI);
    elements['auto-favorite-video-timer-input'].addEventListener('input', videoTimerHandler);
    elements['auto-favorite-video-timer-input'].addEventListener('change', videoTimerHandler);
  }
  
  if (elements['auto-close-after-favorite-video-toggle']) {
    elements['auto-close-after-favorite-video-toggle'].addEventListener('click', createToggleHandler('autoCloseAfterFavoriteVideo', updateUI));
  }
  
  // Auto-favorite star handlers
  if (elements['auto-favorite-star-toggle']) {
    elements['auto-favorite-star-toggle'].addEventListener('click', createToggleHandler('autoFavoriteStar', updateUI));
  }
  
  if (elements['auto-favorite-star-timer-input']) {
    const starTimerHandler = createTimerHandler('autoFavoriteStarTimer', elements['auto-favorite-star-timer-input'], updateUI);
    elements['auto-favorite-star-timer-input'].addEventListener('input', starTimerHandler);
    elements['auto-favorite-star-timer-input'].addEventListener('change', starTimerHandler);
  }
  
  if (elements['auto-close-after-favorite-star-toggle']) {
    elements['auto-close-after-favorite-star-toggle'].addEventListener('click', createToggleHandler('autoCloseAfterFavoriteStar', updateUI));
  }
  
  // Screenshot automation handlers
  if (elements['auto-screenshot-modal-toggle']) {
    elements['auto-screenshot-modal-toggle'].addEventListener('click', createToggleHandler('autoScreenshotModal', updateUI));
  }
}

