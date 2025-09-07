/**
 * Shared Element Blocker Function
 * Reusable element blocking and removal functionality
 */

/**
 * Block element by removing it from DOM
 * @param {string} selector - CSS selector for element to block
 * @param {Object} options - Configuration options
 * @param {boolean} options.removeFromDOM - Whether to remove from DOM (default: true)
 * @param {boolean} options.hideElement - Whether to hide element instead of removing (default: false)
 * @param {string} options.context - Context for logging
 * @returns {boolean} Success status
 */
export function blockElement(selector, options = {}) {
  try {
    const {
      removeFromDOM = true,
      hideElement = false,
      context = 'Element Blocker'
    } = options;

    const element = document.querySelector(selector);
    
    if (!element) {
      return false;
    }

    if (removeFromDOM) {
      element.remove();
    } else if (hideElement) {
      element.style.display = 'none';
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Block download cards specifically (any download type)
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function blockDownloadCard(context = 'Download Blocker') {
  try {
    const cards = document.querySelectorAll('.card.m-2');
    let blockedCount = 0;
    
    for (const card of cards) {
      const priceElement = card.querySelector('.price');
      
      // Check if this is a download card by looking for "Download" in the price text
      if (priceElement && priceElement.textContent.includes('Download')) {
        card.remove();
        blockedCount++;
      }
    }

    if (blockedCount > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}


/**
 * Block Stream cards specifically (any stream type)
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function blockStreamForLifeCard(context = 'Stream Blocker') {
  try {
    const cards = document.querySelectorAll('.card.m-2');
    let blockedCount = 0;
    
    for (const card of cards) {
      const priceElement = card.querySelector('.price');
      
      // Check if this is a Stream card by looking for "Stream" in the price text
      if (priceElement && priceElement.textContent.includes('Stream')) {
        card.remove();
        blockedCount++;
      }
    }

    if (blockedCount > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Block Rental card specifically (any rental type)
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function blockHDRentalCard(context = 'Rental Blocker') {
  try {
    const cards = document.querySelectorAll('.card.m-2');
    let blockedCount = 0;
    
    for (const card of cards) {
      const priceElement = card.querySelector('.price');
      
      // Check if this is a Rental card by looking for "Rental" in the price text
      if (priceElement && priceElement.textContent.includes('Rental')) {
        card.remove();
        blockedCount++;
      }
    }

    if (blockedCount > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Block multiple elements by selectors
 * @param {string[]} selectors - Array of CSS selectors to block
 * @param {Object} options - Configuration options
 * @param {string} context - Context for logging
 * @returns {Object} Results object with success count and details
 */
export function blockMultipleElements(selectors, options = {}, context = 'Multi Element Blocker') {
  const results = {
    successCount: 0,
    totalCount: selectors.length,
    details: []
  };

  selectors.forEach(selector => {
    try {
      const success = blockElement(selector, { ...options, context });
      results.details.push({ selector, success });
      if (success) results.successCount++;
    } catch (error) {
      results.details.push({ selector, success: false, error: error.message });
    }
  });

  return results;
}
