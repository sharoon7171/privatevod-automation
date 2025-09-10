/**
 * Auto-Favorite Service
 * Centralized service for auto-favoriting videos and stars
 */

/**
 * Initialize auto-favorite functionality
 * @param {string} type - Type of item ("Video" or "Star")
 * @param {string} settingName - Setting name to check (e.g., "autoFavoriteVideo")
 * @param {string} closeSettingName - Auto-close setting name (e.g., "autoCloseAfterFavoriteVideo")
 */
export async function initializeAutoFavorite(type, settingName, closeSettingName) {
  try {
    // Dynamic imports for shared utilities
    const { getSettings } = await import(
      chrome.runtime.getURL("core/settings.mjs")
    );
    const { closeCurrentTab } = await import(
      chrome.runtime.getURL("functions/dom/close-tab.mjs")
    );
    const { clickFavoriteButton } = await import(
      chrome.runtime.getURL("functions/dom/click-favorite.mjs")
    );

    // Get settings
    const settings = await getSettings();

    // Check if auto-favorite is enabled
    if (!settings[settingName]) {
      return;
    }

    // Click favorite button
    const success = await clickFavoriteButton(type);

    // Auto-close tab if enabled (regardless of whether button was clicked or skipped)
    if (settings[closeSettingName]) {
      await closeCurrentTab();
    }
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Auto-favorite video functionality
 */
export async function autoFavoriteVideo() {
  return await initializeAutoFavorite(
    "Video",
    "autoFavoriteVideo", 
    "autoCloseAfterFavoriteVideo"
  );
}

/**
 * Auto-favorite star functionality
 */
export async function autoFavoriteStar() {
  return await initializeAutoFavorite(
    "Star",
    "autoFavoriteStar", 
    "autoCloseAfterFavoriteStar"
  );
}
