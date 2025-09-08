/**
 * Shared Button Clicking Function
 * Generic button clicking functionality
 */

/**
 * Click button using simple click method
 * @param {Element} button - Button element to click
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function clickButton(button, context = "Button") {
  try {
    if (!button) {
      return false;
    }
    
    button.click();
    return true;
  } catch (error) {
    return false;
  }
}

