/**
 * Shared Settings for PrivateVOD Automation Extension
 * Used by both popup and options pages
 */

// Default settings
const defaultSettings = {
  autoplay: false,
  timer: 0, // seconds (0-10)
  enabled: true,
  // Auto-favorite video settings
  autoFavoriteVideo: false,
  autoFavoriteVideoTimer: 0, // seconds (0-10)
  autoCloseAfterFavoriteVideo: false,
  // Auto-favorite star settings
  autoFavoriteStar: false,
  autoFavoriteStarTimer: 0, // seconds (0-10)
  autoCloseAfterFavoriteStar: false
};

// Settings storage key
const STORAGE_KEY = 'privatevod_settings';

/**
 * Get current settings from storage
 * @returns {Promise<Object>} Current settings
 */
export async function getSettings() {
  try {
    const result = await chrome.storage.sync.get([STORAGE_KEY]);
    return { ...defaultSettings, ...result[STORAGE_KEY] };
  } catch (error) {
    console.error('Error getting settings:', error);
    return defaultSettings;
  }
}

/**
 * Save settings to storage
 * @param {Object} settings - Settings to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveSettings(settings) {
  try {
    // Validate settings
    const validatedSettings = {
      autoplay: Boolean(settings.autoplay),
      timer: Math.max(0, Math.min(10, Number(settings.timer) || 0)),
      enabled: Boolean(settings.enabled),
      // Auto-favorite video validation
      autoFavoriteVideo: Boolean(settings.autoFavoriteVideo),
      autoFavoriteVideoTimer: Math.max(0, Math.min(10, Number(settings.autoFavoriteVideoTimer) || 0)),
      autoCloseAfterFavoriteVideo: Boolean(settings.autoCloseAfterFavoriteVideo),
      // Auto-favorite star validation
      autoFavoriteStar: Boolean(settings.autoFavoriteStar),
      autoFavoriteStarTimer: Math.max(0, Math.min(10, Number(settings.autoFavoriteStarTimer) || 0)),
      autoCloseAfterFavoriteStar: Boolean(settings.autoCloseAfterFavoriteStar)
    };
    
    await chrome.storage.sync.set({ [STORAGE_KEY]: validatedSettings });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

/**
 * Reset settings to default
 * @returns {Promise<boolean>} Success status
 */
export async function resetSettings() {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: defaultSettings });
    return true;
  } catch (error) {
    console.error('Error resetting settings:', error);
    return false;
  }
}

/**
 * Listen for settings changes
 * @param {Function} callback - Callback function for changes
 */
export function onSettingsChange(callback) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue);
    }
  });
}

// Export default settings for reference
export { defaultSettings };
