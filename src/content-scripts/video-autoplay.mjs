/**
 * PrivateVOD Automation - Video Autoplay Content Script
 * Handles automatic video playback on PrivateVOD pages
 */

// Default settings for video autoplay
const videoAutoplaySettings = {
  autoplay: false,
  timer: 0,
  enabled: true,
  autoFavoriteVideo: false,
  autoFavoriteVideoTimer: 0,
  autoCloseAfterFavoriteVideo: false,
  autoFavoriteStar: false,
  autoFavoriteStarTimer: 0,
  autoCloseAfterFavoriteStar: false
};

// Target button selector
const TARGET_BUTTON_SELECTOR = '#ppmWatchNow';

/**
 * Get settings from Chrome storage
 * @returns {Promise<Object>} Current settings with defaults
 */
async function getSettings() {
  try {
    const result = await chrome.storage.sync.get(['privatevod_settings']);
    return { ...videoAutoplaySettings, ...result.privatevod_settings };
  } catch (error) {
    console.error('Error getting settings:', error);
    return videoAutoplaySettings;
  }
}

/**
 * Wait for specified number of seconds
 * @param {number} seconds - Number of seconds to wait
 * @returns {Promise<void>} Promise that resolves after delay
 */
function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/**
 * Click button element
 * @param {Element} button - Button element to click
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
function clickButton(button, context = "Button") {
  try {
    if (!button) {
      return false;
    }
    
    // Use simple click method
    button.click();
    
    return true;
  } catch (error) {
    console.error(`${context}: Error clicking button:`, error);
    return false;
  }
}

/**
 * Wait for page to be fully loaded
 * @param {Function} callback - Function to call when page is loaded
 * @param {string} context - Context for logging
 */
function waitForPageLoad(callback, context = "Content Script") {
  if (document.readyState === 'complete') {
    // Page already fully loaded
    callback();
  } else {
    // Wait for window.onload event (after all scripts and resources loaded)
    window.addEventListener('load', callback, { once: true });
  }
}

/**
 * Initialize content script
 */
async function initializeContentScript() {
  try {
    // Get current settings
    const settings = await getSettings();
    
    if (!settings.enabled || !settings.autoplay) {
      return;
    }

    // Find button
    const button = document.querySelector(TARGET_BUTTON_SELECTOR);
    
    if (!button) {
      return;
    }

    // Wait for timer if specified
    if (settings.timer > 0) {
      await delay(settings.timer);
    }
    
    // Click the button
    clickButton(button, 'Video Autoplay');
    
  } catch (error) {
    console.error('Video Autoplay: Error:', error);
  }
}

// Wait for complete page load
waitForPageLoad(initializeContentScript, 'Video Autoplay');
