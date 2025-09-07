/**
 * Auto-Favorite Star Content Script
 * Automatically favorites stars on pornstars.html pages
 */

// Default settings for auto-favorite star
const autoFavoriteStarSettings = {
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

/**
 * Get settings from Chrome storage
 * @returns {Promise<Object>} Current settings with defaults
 */
async function getSettings() {
  try {
    const result = await chrome.storage.sync.get(['privatevod_settings']);
    return { ...autoFavoriteStarSettings, ...result.privatevod_settings };
  } catch (error) {
    console.error('Error getting settings:', error);
    return autoFavoriteStarSettings;
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
 * Close the current tab
 * @returns {Promise<boolean>} Success status
 */
async function closeCurrentTab() {
  try {
    await chrome.runtime.sendMessage({ action: 'closeTab' });
    return true;
  } catch (error) {
    console.error('Error closing tab:', error);
    return false;
  }
}

/**
 * Find and click favorite button
 * @param {string} context - Context for logging (e.g., "Video", "Star")
 * @returns {Promise<boolean>} True if button was clicked, false if not found or already favorited
 */
async function clickFavoriteButton(context = "Item") {
  try {
    // Look for favorite button with ToggleProductFavorite onclick
    const favoriteButton = document.querySelector('a[onclick*="ToggleProductFavorite"]');
    
    if (!favoriteButton) {
      return false;
    }
    
    // Check if already favorited (has 'active' class)
    if (favoriteButton.classList.contains('active')) {
      return false;
    }
    
    // Click the button using simple click method
    favoriteButton.click();
    
    return true;
  } catch (error) {
    console.error(`Auto-Favorite ${context}: Error clicking button:`, error);
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
 * Initialize auto-favorite star functionality
 */
async function initializeAutoFavoriteStar() {
  try {
    // Get settings
    const settings = await getSettings();
    
    // Check if auto-favorite is enabled
    if (!settings.autoFavoriteStar) {
      return;
    }
    
    // Wait for timer if specified
    if (settings.autoFavoriteStarTimer > 0) {
      await delay(settings.autoFavoriteStarTimer);
    }
    
    // Click favorite button
    const success = await clickFavoriteButton('Star');
    
    // Auto-close tab if enabled (regardless of whether button was clicked or skipped)
    if (settings.autoCloseAfterFavoriteStar) {
      await closeCurrentTab();
    }
    
  } catch (error) {
    console.error('Auto-Favorite Star: Error in initialization:', error);
  }
}

// Wait for complete page load
waitForPageLoad(initializeAutoFavoriteStar, 'Auto-Favorite Star');
