/**
 * PrivateVOD Automation - Block Scene Download Content Script
 * Blocks the specific scene download card ($3.49) from loading
 */

// Check if already initialized
if (window.sceneDownloadBlockerInitialized) {
} else {
  window.sceneDownloadBlockerInitialized = true;

  // Initialize content script
  (async function initSceneDownloadBlocker() {
    try {
      // Bundle all dynamic imports in parallel
      const [
        { 
          blockDownloadCard, 
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

          // Block Download cards
          if (settings.blockDownload) {
            const success = blockDownloadCard('Download Blocker');
            if (success) totalBlocked++;
          }

          // Block Stream cards
          if (settings.blockStreamForLife) {
            const success = blockStreamForLifeCard('Stream Blocker');
            if (success) totalBlocked++;
          }

          // Block HD Rental cards
          if (settings.blockHDRental) {
            const success = blockHDRentalCard('HD Rental Blocker');
            if (success) totalBlocked++;
          }

          if (totalBlocked > 0) {
          } else {
          }

        } catch (error) {
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
    }
  })();
}
