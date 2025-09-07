/**
 * PrivateVOD Automation - Move User Actions Content Script
 * Moves user actions element to match membership container styling
 */

// Check if already initialized
if (window.userActionsExtensionInitialized) {
  console.log('User Actions extension already initialized');
} else {
  window.userActionsExtensionInitialized = true;

  // Initialize content script
  (async function initUserActionsContentScript() {
    try {
      // Bundle all dynamic imports in parallel
      const [
        { moveAndStyleUserActions },
        { getSettings },
        { watchForTwoElements }
      ] = await Promise.all([
        import(chrome.runtime.getURL('functions/dom/element-mover.mjs')),
        import(chrome.runtime.getURL('core/settings.mjs')),
        import(chrome.runtime.getURL('functions/dom/element-watcher.mjs'))
      ]);

      /**
       * Move user actions when elements are available
       */
      async function moveUserActionsWhenReady(elements) {
        try {
          // Check if feature is enabled
          const settings = await getSettings();
          if (!settings.moveUserActions) {
            console.log('User Actions Mover: Feature disabled in settings');
            return;
          }

          console.log('User Actions Mover: Elements found, moving user actions...');

          // Move and style the user actions
          const success = moveAndStyleUserActions('User Actions Mover');
          
          if (success) {
            console.log('User Actions Mover: Successfully moved and styled user actions');
          } else {
            console.error('User Actions Mover: Failed to move user actions');
          }

        } catch (error) {
          console.error('User Actions Mover: Error:', error);
        }
      }

      // Watch for both elements to become available
      watchForTwoElements(
        '.user-actions',
        '.membership-cards-container .card.m-2:first-child',
        moveUserActionsWhenReady,
        {
          maxRetries: 50,
          retryInterval: 100,
          context: 'User Actions Mover'
        }
      );

    } catch (error) {
      console.error('User Actions Content Script: Failed to load modules:', error);
    }
  })();
}
