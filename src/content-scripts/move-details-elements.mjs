/**
 * PrivateVOD Automation - Move Details Elements Content Script
 * Moves user actions and container px-0 elements to match membership container styling
 */

// Check if already initialized
if (window.detailsElementsExtensionInitialized) {
} else {
  window.detailsElementsExtensionInitialized = true;

  // Initialize content script
  (async function initDetailsElementsContentScript() {
    try {
      // Bundle all dynamic imports in parallel
      const [
        { moveUserActionsAndContainerPx0 },
        { getSettings },
        { watchForElements },
      ] = await Promise.all([
        import(chrome.runtime.getURL("functions/dom/element-mover.mjs")),
        import(chrome.runtime.getURL("core/settings.mjs")),
        import(chrome.runtime.getURL("functions/dom/element-watcher.mjs")),
      ]);

      /**
       * Move details elements when they are available
       */
      async function moveDetailsElementsWhenReady() {
        try {
          // Get current settings
          const settings = await getSettings();
          
          // Check if any details movement features are enabled
          if (!settings.moveUserActions && !settings.moveContainerPx0) {
            return;
          }

          // Move both elements in proper order
          const results = await moveUserActionsAndContainerPx0(settings, "Details Elements Mover");

          if (results.success) {
            console.log("Details elements moved successfully:", results);
          } else {
            console.log("Details elements movement failed:", results);
          }
        } catch (error) {
          console.error("Details elements movement error:", error);
        }
      }

      // Watch for required elements to become available
      // We need: user-actions (if enabled), container.px-0 (if enabled), and target card
      const selectorsToWatch = [];
      
      // Add selectors based on enabled features
      const settings = await getSettings();
      if (settings.moveUserActions) {
        selectorsToWatch.push(".user-actions");
      }
      if (settings.moveContainerPx0) {
        selectorsToWatch.push(".container.px-0");
      }
      
      // Always need the target card
      selectorsToWatch.push(".membership-cards-container .card.m-2:first-child");

      if (selectorsToWatch.length > 0) {
        watchForElements(
          selectorsToWatch,
          moveDetailsElementsWhenReady,
          {
            maxRetries: 50,
            retryInterval: 100,
            context: "Details Elements Mover",
          },
        );
      }
    } catch (error) {
      console.error("Details elements content script initialization error:", error);
    }
  })();
}
