/**
 * PrivateVOD Automation - Video Protection Content Script
 * Adds video protection to all video elements on the page
 */

// Check if already initialized
if (window.videoProtectionContentScriptInitialized) {
} else {
  window.videoProtectionContentScriptInitialized = true;

  // Initialize content script
  (async function initVideoProtectionContentScript() {
    try {
      // Bundle all dynamic imports in parallel
      const [
        { initVideoProtection, createProtectedPlayer },
        { getSettings }
      ] = await Promise.all([
        import(chrome.runtime.getURL("utilities/video-protection.mjs")),
        import(chrome.runtime.getURL("core/settings.mjs"))
      ]);

      // Initialize video protection system
      initVideoProtection();

      // Get settings to check if video protection is enabled
      const settings = await getSettings();
      
      if (!settings.enabled) {
        console.log('🎬 Video Protection: Extension disabled, skipping video protection');
        return;
      }

      /**
       * Protect all video elements on the page
       */
      function protectVideoElements() {
        const videos = document.querySelectorAll('video');
        console.log(`🎬 Video Protection: Found ${videos.length} video elements`);

        videos.forEach((video, index) => {
          const playerId = `video-${index}`;
          
          // Create protected player wrapper
          const protectedPlayer = createProtectedPlayer(video, playerId);
          
          // Override native play/pause methods
          const originalPlay = video.play.bind(video);
          const originalPause = video.pause.bind(video);
          
          video.play = async function() {
            console.log(`🎬 Video Protection: Intercepting play() for video ${index}`);
            return await protectedPlayer.play();
          };
          
          video.pause = async function() {
            console.log(`🎬 Video Protection: Intercepting pause() for video ${index}`);
            return await protectedPlayer.pause();
          };
          
          // Add event listeners for better tracking
          video.addEventListener('play', () => {
            console.log(`🎬 Video Protection: Video ${index} started playing`);
          });
          
          video.addEventListener('pause', () => {
            console.log(`🎬 Video Protection: Video ${index} paused`);
          });
          
          video.addEventListener('error', (event) => {
            console.log(`🎬 Video Protection: Video ${index} error:`, event.error);
          });
          
          console.log(`✅ Video Protection: Protected video ${index}`);
        });
      }

      /**
       * Watch for new video elements added dynamically
       */
      function watchForNewVideos() {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if the added node is a video
                if (node.tagName === 'VIDEO') {
                  console.log('🎬 Video Protection: New video element detected');
                  protectVideoElements();
                }
                
                // Check for video elements within the added node
                const videos = node.querySelectorAll && node.querySelectorAll('video');
                if (videos && videos.length > 0) {
                  console.log(`🎬 Video Protection: ${videos.length} new video elements detected`);
                  protectVideoElements();
                }
              }
            });
          });
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        console.log('🎬 Video Protection: Watching for new video elements');
      }

      // Protect existing videos immediately
      protectVideoElements();
      
      // Watch for new videos
      watchForNewVideos();

      console.log('✅ Video Protection: Content script initialized successfully');
    } catch (error) {
      console.error('❌ Video Protection: Content script initialization failed:', error);
    }
  })();
}
