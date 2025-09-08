/**
 * PrivateVOD Automation - Block DVD Cards Content Script
 * Blocks any cards containing "DVD" in their content
 */

// Check if already initialized
if (window.dvdBlockerExtensionInitialized) {
} else {
  window.dvdBlockerExtensionInitialized = true;

  // Initialize content script
  (async function initDVDBlockerContentScript() {
    try {
      // Bundle all dynamic imports in parallel
      const [
        { getSettings },
        { watchForElements },
      ] = await Promise.all([
        import(chrome.runtime.getURL("core/settings.mjs")),
        import(chrome.runtime.getURL("functions/dom/element-watcher.mjs")),
      ]);

      /**
       * Block DVD cards when they are available
       */
      async function blockDVDCardsWhenReady() {
        try {
          // Get current settings
          const settings = await getSettings();
          
          // Check if DVD blocking is enabled
          if (!settings.blockDVDRental) {
            return;
          }

          // Find all cards in the membership container
          const membershipContainer = document.querySelector('.membership-cards-container');
          if (!membershipContainer) {
            return;
          }

          const cards = membershipContainer.querySelectorAll('.card.m-2');
          let blockedCount = 0;

          cards.forEach(card => {
            // Check if the card contains "DVD" in its text content
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes('dvd')) {
              // Hide the card
              card.style.display = 'none';
              card.setAttribute('data-blocked-by-extension', 'dvd-blocker');
              blockedCount++;
            }
          });

          if (blockedCount > 0) {
            console.log(`DVD Blocker: Blocked ${blockedCount} DVD cards`);
          }
        } catch (error) {
          console.error("DVD Blocker error:", error);
        }
      }

      // Watch for membership cards container to become available
      watchForElements(
        ['.membership-cards-container'],
        blockDVDCardsWhenReady,
        {
          maxRetries: 50,
          retryInterval: 100,
          context: "DVD Blocker",
        },
      );

      // Also watch for new cards being added dynamically
      if (document.querySelector('.membership-cards-container')) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  // Check if a new card was added
                  if (node.classList && node.classList.contains('card')) {
                    blockDVDCardsWhenReady();
                  }
                  // Check if any child elements contain cards
                  const newCards = node.querySelectorAll && node.querySelectorAll('.card');
                  if (newCards && newCards.length > 0) {
                    blockDVDCardsWhenReady();
                  }
                }
              });
            }
          });
        });

        observer.observe(document.querySelector('.membership-cards-container'), {
          childList: true,
          subtree: true
        });
      }
    } catch (error) {
      console.error("DVD Blocker content script initialization error:", error);
    }
  })();
}
