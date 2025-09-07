/**
 * PrivateVOD Automation - Style Active Buttons Content Script
 * Styles buttons with active class to red color (#BB1D1C)
 */

// Check if already initialized
if (window.activeButtonStylerInitialized) {
  console.log('Active Button Styler extension already initialized');
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
            console.log('Active Button Styler: Feature disabled in settings');
            return;
          }

          console.log('Active Button Styler: Elements found, styling active buttons...');

          // Style existing active buttons
          const success = styleFavoriteButtons('Active Button Styler');
          
          if (success) {
            console.log('Active Button Styler: Successfully styled active buttons');
          } else {
            console.log('Active Button Styler: No active buttons found to style');
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
          console.error('Active Button Styler: Error:', error);
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
      console.error('Active Button Styler Content Script: Failed to load modules:', error);
    }
  })();
}
