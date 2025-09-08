/**
 * Shared Event Handling Functions for UI Pages
 * Toggle and timer event handling utilities
 */

import { getSettings, saveSettings } from "../core/settings.mjs";
import {
  showSuccess,
  showError,
  initNotificationSystem,
} from "../utilities/notification-utils.mjs";

/**
 * Handle toggle click event
 * @param {string} settingName - Name of the setting to toggle
 * @param {Function} updateUI - UI update function
 * @returns {Function} Event handler function
 */
export function createToggleHandler(settingName, updateUI) {
  return async function handleToggleClick() {
    try {
      const currentSettings = await getSettings();
      const newSettings = {
        ...currentSettings,
        [settingName]: !currentSettings[settingName],
      };

      await saveSettings(newSettings);
      updateUI(newSettings);
    } catch (error) {}
  };
}

/**
 * Handle timer input change event
 * @param {string} settingName - Name of the setting to update
 * @param {Element} inputElement - Input element
 * @param {Function} updateUI - UI update function
 * @returns {Function} Event handler function
 */
export function createTimerHandler(settingName, inputElement, updateUI) {
  return async function handleTimerChange() {
    try {
      const timerValue = parseInt(inputElement.value) || 0;
      const currentSettings = await getSettings();
      const newSettings = {
        ...currentSettings,
        [settingName]: Math.max(0, Math.min(10, timerValue)),
      };

      await saveSettings(newSettings);
      updateUI(newSettings);
    } catch (error) {}
  };
}

/**
 * Setup all event listeners for a page
 * @param {Object} elements - DOM elements object
 * @param {Function} updateUI - UI update function
 */
export function setupEventListeners(elements, updateUI) {
  // Initialize notification system
  initNotificationSystem();
  // Autoplay toggle click handler
  if (elements["autoplay-toggle"]) {
    elements["autoplay-toggle"].addEventListener(
      "click",
      createToggleHandler("autoplay", updateUI),
    );
  }

  // Autoplay input change handlers (instant save)
  if (elements["timer-input"]) {
    const timerHandler = createTimerHandler(
      "timer",
      elements["timer-input"],
      updateUI,
    );
    elements["timer-input"].addEventListener("input", timerHandler);
    elements["timer-input"].addEventListener("change", timerHandler);
  }

  // Auto-favorite video handlers
  if (elements["auto-favorite-video-toggle"]) {
    elements["auto-favorite-video-toggle"].addEventListener(
      "click",
      createToggleHandler("autoFavoriteVideo", updateUI),
    );
  }

  if (elements["auto-favorite-video-timer-input"]) {
    const videoTimerHandler = createTimerHandler(
      "autoFavoriteVideoTimer",
      elements["auto-favorite-video-timer-input"],
      updateUI,
    );
    elements["auto-favorite-video-timer-input"].addEventListener(
      "input",
      videoTimerHandler,
    );
    elements["auto-favorite-video-timer-input"].addEventListener(
      "change",
      videoTimerHandler,
    );
  }

  if (elements["auto-close-after-favorite-video-toggle"]) {
    elements["auto-close-after-favorite-video-toggle"].addEventListener(
      "click",
      createToggleHandler("autoCloseAfterFavoriteVideo", updateUI),
    );
  }

  // Auto-favorite star handlers
  if (elements["auto-favorite-star-toggle"]) {
    elements["auto-favorite-star-toggle"].addEventListener(
      "click",
      createToggleHandler("autoFavoriteStar", updateUI),
    );
  }

  if (elements["auto-favorite-star-timer-input"]) {
    const starTimerHandler = createTimerHandler(
      "autoFavoriteStarTimer",
      elements["auto-favorite-star-timer-input"],
      updateUI,
    );
    elements["auto-favorite-star-timer-input"].addEventListener(
      "input",
      starTimerHandler,
    );
    elements["auto-favorite-star-timer-input"].addEventListener(
      "change",
      starTimerHandler,
    );
  }

  if (elements["auto-close-after-favorite-star-toggle"]) {
    elements["auto-close-after-favorite-star-toggle"].addEventListener(
      "click",
      createToggleHandler("autoCloseAfterFavoriteStar", updateUI),
    );
  }

  // Screenshot automation handlers
  if (elements["auto-screenshot-modal-toggle"]) {
    elements["auto-screenshot-modal-toggle"].addEventListener(
      "click",
      createToggleHandler("autoScreenshotModal", updateUI),
    );
  }

  // User actions mover handlers
  if (elements["move-user-actions-toggle"]) {
    elements["move-user-actions-toggle"].addEventListener(
      "click",
      createToggleHandler("moveUserActions", updateUI),
    );
  }

  // Download blocker handlers
  if (elements["block-download-toggle"]) {
    elements["block-download-toggle"].addEventListener(
      "click",
      createToggleHandler("blockDownload", updateUI),
    );
  }

  // Stream for life blocker handlers
  if (elements["block-stream-for-life-toggle"]) {
    elements["block-stream-for-life-toggle"].addEventListener(
      "click",
      createToggleHandler("blockStreamForLife", updateUI),
    );
  }

  // HD rental blocker handlers
  if (elements["block-hd-rental-toggle"]) {
    elements["block-hd-rental-toggle"].addEventListener(
      "click",
      createToggleHandler("blockHDRental", updateUI),
    );
  }

  // Active button styling handlers
  if (elements["style-active-buttons-toggle"]) {
    elements["style-active-buttons-toggle"].addEventListener(
      "click",
      createToggleHandler("styleActiveButtons", updateUI),
    );
  }

  // Favorite and like tracking handlers
  if (elements["track-favorites-likes-toggle"]) {
    elements["track-favorites-likes-toggle"].addEventListener(
      "click",
      createToggleHandler("trackFavoritesLikes", updateUI),
    );
  }

  // Clear favorites button handler
  if (elements["clear-favorites-btn"]) {
    elements["clear-favorites-btn"].addEventListener("click", async () => {
      try {
        const { clearAllFavorites } = await import(
          "../../services/storage/favorite-like-storage.mjs"
        );
        const success = await clearAllFavorites();
        if (success) {
          showSuccess("All favorites cleared successfully!");
          // Refresh the storage display
          await refreshStorageDisplay(elements);
        } else {
          showError("Error clearing favorites. Please try again.");
        }
      } catch (error) {
        showError("Error clearing favorites. Please try again.");
      }
    });
  }

  // Clear likes button handler
  if (elements["clear-likes-btn"]) {
    elements["clear-likes-btn"].addEventListener("click", async () => {
      try {
        const { clearAllLikes } = await import(
          "../../services/storage/favorite-like-storage.mjs"
        );
        const success = await clearAllLikes();
        if (success) {
          showSuccess("All likes cleared successfully!");
          // Refresh the storage display
          await refreshStorageDisplay(elements);
        } else {
          showError("Error clearing likes. Please try again.");
        }
      } catch (error) {
        showError("Error clearing likes. Please try again.");
      }
    });
  }

  // Refresh storage button handler
  if (elements["refresh-storage-btn"]) {
    elements["refresh-storage-btn"].addEventListener("click", async () => {
      await refreshStorageDisplay(elements);
    });
  }

  // Video hiding handlers
  if (elements["hide-liked-videos-toggle"]) {
    elements["hide-liked-videos-toggle"].addEventListener(
      "click",
      createToggleHandler("hideLikedVideos", updateUI),
    );
  }

  if (elements["hide-favorited-videos-toggle"]) {
    elements["hide-favorited-videos-toggle"].addEventListener(
      "click",
      createToggleHandler("hideFavoritedVideos", updateUI),
    );
  }

  // Studio URL redirect handlers
  if (elements["auto-redirect-studio-urls-toggle"]) {
    elements["auto-redirect-studio-urls-toggle"].addEventListener(
      "click",
      createToggleHandler("autoRedirectStudioUrls", updateUI),
    );
  }

  if (elements["auto-redirect-pornstar-urls-toggle"]) {
    elements["auto-redirect-pornstar-urls-toggle"].addEventListener(
      "click",
      createToggleHandler("autoRedirectPornstarUrls", updateUI),
    );
  }

  // Link merger handlers
  if (elements["merge-title-with-image-links-toggle"]) {
    elements["merge-title-with-image-links-toggle"].addEventListener(
      "click",
      createToggleHandler("mergeTitleWithImageLinks", updateUI),
    );
  }
}

/**
 * Refresh the storage display textarea
 * @param {Object} elements - DOM elements object
 */
async function refreshStorageDisplay(elements) {
  try {
    const { getStorageStats } = await import(
      "../../services/storage/favorite-like-storage.mjs"
    );
    const stats = await getStorageStats();

    const displayText = `FAVORITES (${stats.favoritesCount}):
${stats.favorites.length > 0 ? stats.favorites.join(", ") : "None"}

LIKES (${stats.likesCount}):
${stats.likes.length > 0 ? stats.likes.join(", ") : "None"}

Last updated: ${new Date().toLocaleString()}`;

    if (elements["storage-display"]) {
      elements["storage-display"].value = displayText;
    }
  } catch (error) {
    if (elements["storage-display"]) {
      elements["storage-display"].value = "Error loading storage data.";
    }
  }
}
