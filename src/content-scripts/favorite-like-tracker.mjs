/**
 * PrivateVOD Automation - Favorite and Like Tracker Content Script
 * Tracks favorite and like button status on video pages
 */

// Check if already initialized
if (window.favoriteLikeTrackerInitialized) {
} else {
  window.favoriteLikeTrackerInitialized = true;

  // Initialize content script
  (async function initFavoriteLikeTracker() {
    try {
      // Bundle all dynamic imports in parallel
      const [
        { favoriteLikeTracker },
        { getSettings }
      ] = await Promise.all([
        import(chrome.runtime.getURL('services/favorite-like-tracker.mjs')),
        import(chrome.runtime.getURL('core/settings.mjs'))
      ]);

      /**
       * Start tracking when page is ready
       */
      async function startTrackingWhenReady() {
        try {
          // Get settings
          const settings = await getSettings();
          
          // Check if tracking is enabled
          if (!settings.trackFavoritesLikes) {
            return;
          }

          // Start tracking
          await favoriteLikeTracker.startTracking();
          

        } catch (error) {
        }
      }

      // Wait for buttons to be available
      const checkForButtons = () => {
        const buttons = document.querySelectorAll('.btn.btn-secondary');
        return buttons.length > 0;
      };

      // Start checking immediately
      if (checkForButtons()) {
        await startTrackingWhenReady();
      } else {
        // Poll for buttons if not immediately available
        const pollInterval = setInterval(async () => {
          if (checkForButtons()) {
            clearInterval(pollInterval);
            await startTrackingWhenReady();
          }
        }, 500);

        // Stop polling after 10 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 10000);
      }

    } catch (error) {
    }
  })();
}
