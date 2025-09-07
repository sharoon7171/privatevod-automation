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
      console.warn(`${context}: Element not found: ${selector}`);
      return false;
    }

    if (removeFromDOM) {
      element.remove();
      console.log(`${context}: Element removed from DOM: ${selector}`);
    } else if (hideElement) {
      element.style.display = 'none';
      console.log(`${context}: Element hidden: ${selector}`);
    }

    return true;
  } catch (error) {
    console.error(`${context}: Error blocking element:`, error);
    return false;
  }
}

/**
 * Block scene download card specifically
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function blockSceneDownloadCard(context = 'Scene Download Blocker') {
  try {
    // Look for any scene download card with "+ Stream for Life" title
    const sceneCards = document.querySelectorAll('.card.m-2');
    let blockedCount = 0;
    
    for (const card of sceneCards) {
      const titleElement = card.querySelector('.card-title');
      const priceElement = card.querySelector('.price.text-sale');
      
      // Check if this is a scene download card by looking for the title pattern
      if (titleElement && titleElement.textContent.includes('+ Stream for Life')) {
        // This is a scene download card we want to block
        card.remove();
        blockedCount++;
        console.log(`${context}: Scene download card blocked and removed (Price: ${priceElement?.textContent || 'Unknown'})`);
      }
    }

    if (blockedCount > 0) {
      console.log(`${context}: Successfully blocked ${blockedCount} scene download card(s)`);
      return true;
    } else {
      console.warn(`${context}: No scene download cards found`);
      return false;
    }
  } catch (error) {
    console.error(`${context}: Error blocking scene download cards:`, error);
    return false;
  }
}

/**
 * Block HD Download card specifically
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function blockHDDownloadCard(context = 'HD Download Blocker') {
  try {
    const cards = document.querySelectorAll('.card.m-2');
    let blockedCount = 0;
    
    for (const card of cards) {
      const titleElement = card.querySelector('.card-title');
      const priceElement = card.querySelector('.price.text-sale');
      
      // Check if this is an HD Download card by looking for the title pattern
      if (titleElement && titleElement.textContent.includes('+ Stream in HD for Life')) {
        card.remove();
        blockedCount++;
        console.log(`${context}: HD Download card blocked and removed (Price: ${priceElement?.textContent || 'Unknown'})`);
      }
    }

    if (blockedCount > 0) {
      console.log(`${context}: Successfully blocked ${blockedCount} HD Download card(s)`);
      return true;
    } else {
      console.warn(`${context}: No HD Download cards found`);
      return false;
    }
  } catch (error) {
    console.error(`${context}: Error blocking HD Download cards:`, error);
    return false;
  }
}

/**
 * Block Stream for Life card specifically
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function blockStreamForLifeCard(context = 'Stream for Life Blocker') {
  try {
    const cards = document.querySelectorAll('.card.m-2');
    let blockedCount = 0;
    
    for (const card of cards) {
      const titleElement = card.querySelector('.card-title');
      const priceElement = card.querySelector('.price.text-sale');
      
      // Check if this is a Stream for Life card by looking for the title pattern
      if (titleElement && titleElement.textContent.includes('Stream Only')) {
        card.remove();
        blockedCount++;
        console.log(`${context}: Stream for Life card blocked and removed (Price: ${priceElement?.textContent || 'Unknown'})`);
      }
    }

    if (blockedCount > 0) {
      console.log(`${context}: Successfully blocked ${blockedCount} Stream for Life card(s)`);
      return true;
    } else {
      console.warn(`${context}: No Stream for Life cards found`);
      return false;
    }
  } catch (error) {
    console.error(`${context}: Error blocking Stream for Life cards:`, error);
    return false;
  }
}

/**
 * Block HD Rental card specifically
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function blockHDRentalCard(context = 'HD Rental Blocker') {
  try {
    const cards = document.querySelectorAll('.card.m-2');
    let blockedCount = 0;
    
    for (const card of cards) {
      const titleElement = card.querySelector('.card-title');
      const priceElement = card.querySelector('.price.text-sale');
      
      // Check if this is an HD Rental card by looking for the title pattern
      if (titleElement && titleElement.textContent.includes('Stream in HD for 2 Days')) {
        card.remove();
        blockedCount++;
        console.log(`${context}: HD Rental card blocked and removed (Price: ${priceElement?.textContent || 'Unknown'})`);
      }
    }

    if (blockedCount > 0) {
      console.log(`${context}: Successfully blocked ${blockedCount} HD Rental card(s)`);
      return true;
    } else {
      console.warn(`${context}: No HD Rental cards found`);
      return false;
    }
  } catch (error) {
    console.error(`${context}: Error blocking HD Rental cards:`, error);
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
      console.error(`${context}: Error blocking ${selector}:`, error);
      results.details.push({ selector, success: false, error: error.message });
    }
  });

  console.log(`${context}: Blocked ${results.successCount}/${results.totalCount} elements`);
  return results;
}
