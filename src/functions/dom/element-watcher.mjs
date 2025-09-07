/**
 * Shared Element Watcher Function
 * Reusable element watching functionality for content scripts
 */

/**
 * Watch for elements to become available and execute callback
 * @param {string[]} selectors - Array of CSS selectors to watch for
 * @param {Function} callback - Function to call when all elements are found
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum number of retries (default: 50)
 * @param {number} options.retryInterval - Retry interval in ms (default: 100)
 * @param {string} options.context - Context for logging
 * @returns {Function} Function to clear the watcher
 */
export function watchForElements(selectors, callback, options = {}) {
  const {
    maxRetries = 50,
    retryInterval = 100,
    context = 'Element Watcher'
  } = options;

  let retryCount = 0;
  
  const checkElements = async () => {
    try {
      // Check if all elements are available
      const elements = selectors.map(selector => document.querySelector(selector));
      const allFound = elements.every(element => element !== null);
      
      if (allFound) {
        await callback(elements);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  // Check immediately
  checkElements().then(found => {
    if (found) return;
    
    // If not found, retry with interval
    const retryTimer = setInterval(async () => {
      retryCount++;
      
      const found = await checkElements();
      if (found) {
        clearInterval(retryTimer);
      } else if (retryCount >= maxRetries) {
        clearInterval(retryTimer);
      }
    }, retryInterval);
  });

  // Return function to clear watcher
  return () => {
    // This would need to be implemented if we need to clear the watcher
  };
}

/**
 * Watch for specific elements and execute callback when found
 * @param {string} selector1 - First CSS selector
 * @param {string} selector2 - Second CSS selector
 * @param {Function} callback - Function to call when both elements are found
 * @param {Object} options - Configuration options
 * @returns {Function} Function to clear the watcher
 */
export function watchForTwoElements(selector1, selector2, callback, options = {}) {
  return watchForElements([selector1, selector2], callback, options);
}
