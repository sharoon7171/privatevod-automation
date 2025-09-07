/**
 * Shared Tab Closing Function for Content Scripts
 * Tab closing via Chrome runtime messaging
 */

/**
 * Close the current tab
 * @returns {Promise<boolean>} Success status
 */
export async function closeCurrentTab() {
  try {
    await chrome.runtime.sendMessage({ action: 'closeTab' });
    return true;
  } catch (error) {
    console.error('Error closing tab:', error);
    return false;
  }
}

/**
 * Close tab after a delay
 * @param {number} delaySeconds - Seconds to wait before closing
 * @returns {Promise<boolean>} Success status
 */
export async function closeTabAfterDelay(delaySeconds = 0) {
  try {
    if (delaySeconds > 0) {
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
    }
    return await closeCurrentTab();
  } catch (error) {
    console.error('Error closing tab after delay:', error);
    return false;
  }
}
