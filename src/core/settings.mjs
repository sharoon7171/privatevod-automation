/**
 * Shared Settings for PrivateVOD Automation Extension
 * Used by options page
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
  autoCloseAfterFavoriteStar: false,
  // Screenshot automation settings
  autoScreenshotModal: true,
  // User actions mover settings
  moveUserActions: true,
  // Container px-0 mover settings
  moveContainerPx0: true,
  // Download blocker settings (blocks all download types)
  blockDownload: true,
  // Stream blocker settings (blocks all stream types)
  blockStreamForLife: true,
  // Rental blocker settings (blocks all rental types)
  blockHDRental: true,
  // DVD blocker settings (blocks any card containing DVD)
  blockDVDRental: true,
  // Active button styling settings
  styleActiveButtons: true,
  // Favorite and like tracking settings
  trackFavoritesLikes: true,
  // Video hiding settings
  hideLikedVideos: true,
  hideFavoritedVideos: false,
  // Studio URL redirect settings
  autoRedirectStudioUrls: true,
  // Pornstar URL redirect settings
  autoRedirectPornstarUrls: true,
  // Link merging settings
  mergeTitleWithImageLinks: true,
};

// Settings storage key
const STORAGE_KEY = "privatevod_settings";

/**
 * Get current settings from storage
 * @returns {Promise<Object>} Current settings
 */
export async function getSettings() {
  try {
    const result = await chrome.storage.sync.get([STORAGE_KEY]);
    return { ...defaultSettings, ...result[STORAGE_KEY] };
  } catch (error) {
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
      autoFavoriteVideoTimer: Math.max(
        0,
        Math.min(10, Number(settings.autoFavoriteVideoTimer) || 0),
      ),
      autoCloseAfterFavoriteVideo: Boolean(
        settings.autoCloseAfterFavoriteVideo,
      ),
      // Auto-favorite star validation
      autoFavoriteStar: Boolean(settings.autoFavoriteStar),
      autoFavoriteStarTimer: Math.max(
        0,
        Math.min(10, Number(settings.autoFavoriteStarTimer) || 0),
      ),
      autoCloseAfterFavoriteStar: Boolean(settings.autoCloseAfterFavoriteStar),
      // Screenshot automation validation
      autoScreenshotModal: Boolean(settings.autoScreenshotModal),
      // User actions mover validation
      moveUserActions: Boolean(settings.moveUserActions),
      // Container px-0 mover validation
      moveContainerPx0: Boolean(settings.moveContainerPx0),
      // Download blocker validation
      blockDownload: Boolean(settings.blockDownload),
      // Stream blocker validation
      blockStreamForLife: Boolean(settings.blockStreamForLife),
      // HD rental blocker validation
      blockHDRental: Boolean(settings.blockHDRental),
      // DVD rental blocker validation
      blockDVDRental: Boolean(settings.blockDVDRental),
      // Active button styling validation
      styleActiveButtons: Boolean(settings.styleActiveButtons),
      // Favorite and like tracking validation
      trackFavoritesLikes: Boolean(settings.trackFavoritesLikes),
      // Video hiding validation
      hideLikedVideos: Boolean(settings.hideLikedVideos),
      hideFavoritedVideos: Boolean(settings.hideFavoritedVideos),
      // Studio URL redirect validation
      autoRedirectStudioUrls: Boolean(settings.autoRedirectStudioUrls),
      // Pornstar URL redirect validation
      autoRedirectPornstarUrls: Boolean(settings.autoRedirectPornstarUrls),
      // Link merging validation
      mergeTitleWithImageLinks: Boolean(settings.mergeTitleWithImageLinks),
    };

    await chrome.storage.sync.set({ [STORAGE_KEY]: validatedSettings });
    return true;
  } catch (error) {
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
    return false;
  }
}

/**
 * Listen for settings changes
 * @param {Function} callback - Callback function for changes
 */
export function onSettingsChange(callback) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue);
    }
  });
}

// Export default settings for reference
export { defaultSettings };
