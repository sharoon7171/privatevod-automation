/**
 * Auto-Favorite Star Content Script
 * Automatically favorites stars on pornstars.html pages
 */

/**
 * Initialize auto-favorite star functionality
 */
async function initializeAutoFavoriteStar() {
  const { autoFavoriteStar } = await import(
    chrome.runtime.getURL("services/auto-favorite-service.mjs")
  );
  
  await autoFavoriteStar();
}

// Wait for complete page load
(async () => {
  const { waitForPageLoad } = await import(
    chrome.runtime.getURL("functions/dom/page-loader.mjs")
  );
  waitForPageLoad(initializeAutoFavoriteStar, "Auto-Favorite Star");
})();
