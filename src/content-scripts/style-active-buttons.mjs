/**
 * PrivateVOD Automation - Style Active Buttons Content Script
 * Styles buttons with active class to red color (#BB1D1C)
 */

// Check if already initialized
if (window.activeButtonStylerInitialized) {
} else {
  window.activeButtonStylerInitialized = true;

  // Initialize content script
  (async function initActiveButtonStyler() {
    try {
      // Bundle all dynamic imports in parallel
      const [
        { styleFavoriteButtons, watchButtonStateChanges },
        { getSettings },
        { watchForElements }
      ] = await Promise.all([
        import(chrome.runtime.getURL('functions/dom/button-styler.mjs')),
        import(chrome.runtime.getURL('core/settings.mjs')),
        import(chrome.runtime.getURL('functions/dom/element-watcher.mjs'))
      ]);

      /**
       * Style active buttons when available
       */
      async function styleActiveButtonsWhenReady(elements) {
        try {
          // Check if feature is enabled
          const settings = await getSettings();
          if (!settings.styleActiveButtons) {
            return;
          }


          // Style existing active buttons
          const success = styleFavoriteButtons('Active Button Styler');
          
          if (success) {
          } else {
          }

          // Set up continuous monitoring for state changes
          const stopWatching = watchButtonStateChanges(
            '.btn.btn-secondary',
            {
              backgroundColor: '#BB1D1C',
              textColor: 'white',
              borderColor: '#BB1D1C'
            },
            'Active Button Styler'
          );

          // Store stop function for potential cleanup
          window.stopActiveButtonWatching = stopWatching;

        } catch (error) {
        }
      }

      // Watch for buttons to become available
      watchForElements(
        ['.btn.btn-secondary'],
        styleActiveButtonsWhenReady,
        {
          maxRetries: 50,
          retryInterval: 100,
          context: 'Active Button Styler'
        }
      );

    } catch (error) {
    }
  })();
}
