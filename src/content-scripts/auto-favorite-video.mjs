/**
 * Auto-Favorite Video Content Script
 * Automatically favorites videos on video.html and videos.html pages
 */

/**
 * Initialize auto-favorite video functionality
 */
async function initializeAutoFavoriteVideo() {
  const { autoFavoriteVideo } = await import(
    chrome.runtime.getURL("services/auto-favorite-service.mjs")
  );
  
  await autoFavoriteVideo();
}

// Wait for complete page load
(async () => {
  const { waitForPageLoad } = await import(
    chrome.runtime.getURL("functions/dom/page-loader.mjs")
  );
  waitForPageLoad(initializeAutoFavoriteVideo, "Auto-Favorite Video");
})();
