/**
 * Shared Page Loading Logic for Content Scripts
 * Page load detection and initialization logic
 */

/**
 * Wait for page to be fully loaded
 * @param {Function} callback - Function to call when page is loaded
 * @param {string} context - Context for logging
 */
export function waitForPageLoad(callback, context = "Content Script") {
  if (document.readyState === 'complete') {
    // Page already fully loaded
    callback();
  } else {
    // Wait for window.onload event (after all scripts and resources loaded)
    window.addEventListener('load', callback, { once: true });
  }
}

/**
 * Wait for specific element to be available
 * @param {string} selector - CSS selector for element
 * @param {number} timeout - Timeout in seconds
 * @returns {Promise<Element|null>} Element when found or null if timeout
 */
export async function waitForElement(selector, timeout = 10) {
  const startTime = Date.now();
  const timeoutMs = timeout * 1000;
  
  while (Date.now() - startTime < timeoutMs) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return null;
}

