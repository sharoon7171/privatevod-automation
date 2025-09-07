/**
 * Shared Settings Function for Content Scripts
 * Unified settings retrieval with fallback defaults
 */

// Default settings for content scripts
const defaultSettings = {
  autoplay: false,
  timer: 0,
  enabled: true,
  // Auto-favorite video settings
  autoFavoriteVideo: false,
  autoFavoriteVideoTimer: 0,
  autoCloseAfterFavoriteVideo: false,
  // Auto-favorite star settings
  autoFavoriteStar: false,
  autoFavoriteStarTimer: 0,
  autoCloseAfterFavoriteStar: false,
  // Screenshot automation settings
  autoScreenshotModal: false
};

/**
 * Get settings from Chrome storage
 * @returns {Promise<Object>} Current settings with defaults
 */
export async function getSettings() {
  try {
    const result = await chrome.storage.sync.get(['privatevod_settings']);
    return { ...defaultSettings, ...result.privatevod_settings };
  } catch (error) {
    console.error('Error getting settings:', error);
    return defaultSettings;
  }
}

/**
 * Get specific setting value
 * @param {string} key - Setting key
 * @param {any} defaultValue - Default value if not found
 * @returns {Promise<any>} Setting value
 */
export async function getSetting(key, defaultValue = null) {
  try {
    const settings = await getSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
}

// Export default settings for reference
export { defaultSettings };
