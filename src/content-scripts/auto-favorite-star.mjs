/**
 * Auto-Favorite Star Content Script
 * Automatically favorites stars on pornstars.html pages
 */

/**
 * Initialize auto-favorite star functionality
 */
async function initializeAutoFavoriteStar() {
  try {
    // Dynamic imports for shared utilities
    const { getSettings } = await import(
      chrome.runtime.getURL("services/storage/get-settings.mjs")
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
    if (!settings.autoFavoriteStar) {
      return;
    }


    // Click favorite button
    const success = await clickFavoriteButton("Star");

    // Auto-close tab if enabled (regardless of whether button was clicked or skipped)
    if (settings.autoCloseAfterFavoriteStar) {
      await closeCurrentTab();
    }
  } catch (error) {}
}

// Wait for complete page load
(async () => {
  const { waitForPageLoad } = await import(
    chrome.runtime.getURL("functions/dom/page-loader.mjs")
  );
  waitForPageLoad(initializeAutoFavoriteStar, "Auto-Favorite Star");
})();
