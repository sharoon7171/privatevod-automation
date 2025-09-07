/**
 * PrivateVOD Automation - Block Scene Download Content Script
 * Blocks the specific scene download card ($3.49) from loading
 */

// Check if already initialized
if (window.sceneDownloadBlockerInitialized) {
  console.log('Scene Download Blocker extension already initialized');
} else {
  window.sceneDownloadBlockerInitialized = true;

  // Initialize content script
  (async function initSceneDownloadBlocker() {
    try {
      // Bundle all dynamic imports in parallel
      const [
        { 
          blockSceneDownloadCard, 
          blockHDDownloadCard, 
          blockStreamForLifeCard, 
          blockHDRentalCard 
        },
        { getSettings },
        { watchForElements }
      ] = await Promise.all([
        import(chrome.runtime.getURL('functions/dom/element-blocker.mjs')),
        import(chrome.runtime.getURL('core/settings.mjs')),
        import(chrome.runtime.getURL('functions/dom/element-watcher.mjs'))
      ]);

      /**
       * Block purchase cards when available
       */
      async function blockPurchaseCardsWhenReady(elements) {
        try {
          // Get settings
          const settings = await getSettings();
          
          let totalBlocked = 0;

          // Block Scene Download cards
          if (settings.blockSceneDownload) {
            const success = blockSceneDownloadCard('Scene Download Blocker');
            if (success) totalBlocked++;
          }

          // Block HD Download cards
          if (settings.blockHDDownload) {
            const success = blockHDDownloadCard('HD Download Blocker');
            if (success) totalBlocked++;
          }

          // Block Stream for Life cards
          if (settings.blockStreamForLife) {
            const success = blockStreamForLifeCard('Stream for Life Blocker');
            if (success) totalBlocked++;
          }

          // Block HD Rental cards
          if (settings.blockHDRental) {
            const success = blockHDRentalCard('HD Rental Blocker');
            if (success) totalBlocked++;
          }

          if (totalBlocked > 0) {
            console.log(`Purchase Card Blocker: Successfully blocked ${totalBlocked} card type(s)`);
          } else {
            console.log('Purchase Card Blocker: No cards to block based on current settings');
          }

        } catch (error) {
          console.error('Purchase Card Blocker: Error:', error);
        }
      }

      // Watch for membership cards container to become available
      watchForElements(
        ['.membership-cards-container'],
        blockPurchaseCardsWhenReady,
        {
          maxRetries: 50,
          retryInterval: 100,
          context: 'Purchase Card Blocker'
        }
      );

    } catch (error) {
      console.error('Scene Download Blocker Content Script: Failed to load modules:', error);
    }
  })();
}
