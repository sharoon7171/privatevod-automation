/**
 * Shared Button Styling Function
 * Reusable button styling functionality for active/favorited states
 */

/**
 * Apply active button styling
 * @param {Element} button - Button element to style
 * @param {Object} options - Styling options
 * @param {string} options.backgroundColor - Background color (default: #BB1D1C)
 * @param {string} options.textColor - Text color (default: white)
 * @param {string} options.borderColor - Border color (default: #BB1D1C)
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function applyActiveButtonStyling(button, options = {}, context = 'Button Styler') {
  try {
    if (!button) {
      return false;
    }

    const {
      backgroundColor = '#BB1D1C',
      textColor = 'white',
      borderColor = '#BB1D1C'
    } = options;

    // Apply active styling
    button.style.backgroundColor = backgroundColor;
    button.style.color = textColor;
    button.style.borderColor = borderColor;
    button.style.transition = 'all 0.3s ease';

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Remove active button styling
 * @param {Element} button - Button element to reset
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function removeActiveButtonStyling(button, context = 'Button Styler') {
  try {
    if (!button) {
      return false;
    }

    // Reset to default styling
    button.style.backgroundColor = '';
    button.style.color = '';
    button.style.borderColor = '';
    button.style.transition = '';

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Style all active buttons on the page
 * @param {string} selector - CSS selector for buttons to check
 * @param {Object} options - Styling options
 * @param {string} context - Context for logging
 * @returns {Object} Results object with success count and details
 */
export function styleActiveButtons(selector, options = {}, context = 'Active Button Styler') {
  try {
    const buttons = document.querySelectorAll(selector);
    let styledCount = 0;
    const results = {
      totalButtons: buttons.length,
      styledCount: 0,
      details: []
    };

    buttons.forEach((button, index) => {
      try {
        if (button.classList.contains('active')) {
          const success = applyActiveButtonStyling(button, options, context);
          if (success) {
            styledCount++;
            results.details.push({ index, success: true, button: button.textContent.trim() });
          } else {
            results.details.push({ index, success: false, error: 'Styling failed' });
          }
        } else {
          results.details.push({ index, success: true, skipped: true, reason: 'Not active' });
        }
      } catch (error) {
        results.details.push({ index, success: false, error: error.message });
      }
    });

    results.styledCount = styledCount;
    return results;
  } catch (error) {
    return { totalButtons: 0, styledCount: 0, details: [], error: error.message };
  }
}

/**
 * Watch for button state changes and apply styling
 * @param {string} selector - CSS selector for buttons to watch
 * @param {Object} options - Styling options
 * @param {string} context - Context for logging
 * @returns {Function} Function to stop watching
 */
export function watchButtonStateChanges(selector, options = {}, context = 'Button State Watcher') {
  try {
    let isWatching = true;

    const checkAndStyleButtons = () => {
      if (!isWatching) return;

      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        if (button.classList.contains('active')) {
          applyActiveButtonStyling(button, options, context);
        } else {
          removeActiveButtonStyling(button, context);
        }
      });
    };

    // Initial styling
    checkAndStyleButtons();

    // Set up mutation observer for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const button = mutation.target;
          if (button.matches && button.matches(selector)) {
            if (button.classList.contains('active')) {
              applyActiveButtonStyling(button, options, context);
            } else {
              removeActiveButtonStyling(button, context);
            }
          }
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    });


    // Return stop function
    return () => {
      isWatching = false;
      observer.disconnect();
    };

  } catch (error) {
    return () => {}; // Return empty function
  }
}

/**
 * Style favorite buttons specifically
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function styleFavoriteButtons(context = 'Favorite Button Styler') {
  try {
    const selector = '.btn.btn-secondary';
    const options = {
      backgroundColor: '#BB1D1C',
      textColor: 'white',
      borderColor: '#BB1D1C'
    };

    const results = styleActiveButtons(selector, options, context);
    
    if (results.styledCount > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
