/**
 * Auto-Favorite Video Content Script
 * Automatically favorites videos on video.html and videos.html pages
 */

/**
 * Initialize auto-favorite video functionality
 */
async function initializeAutoFavoriteVideo() {
  try {
    // Dynamic imports for shared utilities
    const { getSettings } = await import(chrome.runtime.getURL('services/storage/get-settings.mjs'));
    const { delay } = await import(chrome.runtime.getURL('functions/async/delay.mjs'));
    const { closeCurrentTab } = await import(chrome.runtime.getURL('functions/dom/close-tab.mjs'));
    const { clickFavoriteButton } = await import(chrome.runtime.getURL('functions/dom/click-favorite.mjs'));
    
    // Get settings
    const settings = await getSettings();
    
    // Check if auto-favorite is enabled
    if (!settings.autoFavoriteVideo) {
      return;
    }
    
    // Wait for timer if specified
    if (settings.autoFavoriteVideoTimer > 0) {
      await delay(settings.autoFavoriteVideoTimer);
    }
    
    // Click favorite button
    const success = await clickFavoriteButton('Video');
    
    // Auto-close tab if enabled (regardless of whether button was clicked or skipped)
    if (settings.autoCloseAfterFavoriteVideo) {
      await closeCurrentTab();
    }
    
  } catch (error) {
  }
}

// Wait for complete page load
(async () => {
  const { waitForPageLoad } = await import(chrome.runtime.getURL('functions/dom/page-loader.mjs'));
  waitForPageLoad(initializeAutoFavoriteVideo, 'Auto-Favorite Video');
})();
