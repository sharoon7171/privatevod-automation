/**
 * PrivateVOD Automation - Video Hiding Content Script
 * Hides liked/watched videos on all pages
 */

// Check if already initialized
if (window.videoHidingInitialized) {
  // Already initialized
} else {
  window.videoHidingInitialized = true;

  // Initialize content script
  (async function initVideoHiding() {
    try {
      // Bundle all dynamic imports in parallel
      const [
        { videoHidingService },
        { getSettings }
      ] = await Promise.all([
        import(chrome.runtime.getURL('services/video-hiding-service.mjs')),
        import(chrome.runtime.getURL('core/settings.mjs'))
      ]);

      // Listen for settings changes
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.privatevod_settings) {
          const newSettings = changes.privatevod_settings.newValue;
          const oldSettings = changes.privatevod_settings.oldValue;
          
          // Check if hiding settings changed
          if (newSettings.hideLikedVideos !== oldSettings.hideLikedVideos || 
              newSettings.hideFavoritedVideos !== oldSettings.hideFavoritedVideos) {
            videoHidingService.refreshHiding();
          }
        }
      });

      // Listen for storage changes (favorites/likes)
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
          // Check if favorites or likes changed
          if (changes.privatevod_favorites || changes.privatevod_likes) {
            videoHidingService.refreshHiding();
          }
        }
      });

      /**
       * Start video hiding when page is ready
       */
      async function startVideoHidingWhenReady() {
        try {
          // Wait for document to be ready
          if (document.readyState === 'loading') {
            await new Promise(resolve => {
              document.addEventListener('DOMContentLoaded', resolve, { once: true });
            });
          }
          
          // Additional check to ensure body exists
          if (!document.body) {
            await new Promise(resolve => {
              const checkBody = () => {
                if (document.body) {
                  resolve();
                } else {
                  setTimeout(checkBody, 50);
                }
              };
              checkBody();
            });
          }

          // Always start video hiding service to handle both hiding and showing
          await videoHidingService.start();

        } catch (error) {
          console.error('Video Hiding: Error:', error);
        }
      }

      // Wait for videos to be available
      const checkForVideos = () => {
        const videos = document.querySelectorAll('.grid-item[id^="ascene_"]');
        return videos.length > 0;
      };

      // Always start video hiding service if settings are enabled
      await startVideoHidingWhenReady();

      // Also poll for videos if not immediately available
      if (!checkForVideos()) {
        const pollInterval = setInterval(async () => {
          if (checkForVideos()) {
            clearInterval(pollInterval);
            videoHidingService.refreshHiding();
          }
        }, 500);

        // Stop polling after 10 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 10000);
      }

    } catch (error) {
      console.error('Video Hiding: Initialization error:', error);
    }
  })();
}
