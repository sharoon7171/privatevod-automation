/**
 * PrivateVOD Automation - Video Autoplay Content Script
 * Handles automatic video playback on PrivateVOD pages
 */

// Target button selector
const TARGET_BUTTON_SELECTOR = "#ppmWatchNow";

/**
 * Initialize content script
 */
async function initializeContentScript() {
  try {
    // Dynamic imports for shared utilities
    const { getSettings } = await import(
      chrome.runtime.getURL("services/storage/get-settings.mjs")
    );
    const { clickButton } = await import(
      chrome.runtime.getURL("functions/dom/button-clicker.mjs")
    );
    const { waitForPageLoad } = await import(
      chrome.runtime.getURL("functions/dom/page-loader.mjs")
    );

    // Get current settings
    const settings = await getSettings();

    if (!settings.enabled || !settings.autoplay) {
      return;
    }

    // Find button
    const button = document.querySelector(TARGET_BUTTON_SELECTOR);

    if (!button) {
      return;
    }


    // Click the button
    clickButton(button, "Video Autoplay");
  } catch (error) {}
}

// Wait for complete page load
(async () => {
  const { waitForPageLoad } = await import(
    chrome.runtime.getURL("functions/dom/page-loader.mjs")
  );
  waitForPageLoad(initializeContentScript, "Video Autoplay");
})();
