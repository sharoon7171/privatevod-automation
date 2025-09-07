/**
 * Shared Delay Function for Content Scripts
 * Reusable delay function with Promise wrapper
 */

/**
 * Wait for specified number of seconds
 * @param {number} seconds - Number of seconds to wait
 * @returns {Promise<void>} Promise that resolves after delay
 */
export function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

