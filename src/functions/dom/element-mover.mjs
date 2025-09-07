/**
 * Shared Element Moving Function
 * Reusable DOM element moving and repositioning functionality
 */

/**
 * Move element to match target container styling
 * @param {string} sourceSelector - CSS selector for source element
 * @param {string} targetSelector - CSS selector for target container
 * @param {Object} options - Configuration options
 * @param {string} options.position - Position relative to target ('before', 'after', 'inside', 'prepend', 'append')
 * @param {boolean} options.preserveEvents - Whether to preserve event listeners
 * @param {string} options.context - Context for logging
 * @returns {boolean} Success status
 */
export function moveElementToContainer(sourceSelector, targetSelector, options = {}) {
  try {
    const {
      position = 'after',
      preserveEvents = true,
      context = 'Element Mover'
    } = options;

    // Find source and target elements
    const sourceElement = document.querySelector(sourceSelector);
    const targetElement = document.querySelector(targetSelector);

    if (!sourceElement) {
      console.warn(`${context}: Source element not found: ${sourceSelector}`);
      return false;
    }

    if (!targetElement) {
      console.warn(`${context}: Target element not found: ${targetSelector}`);
      return false;
    }

    // Clone element to preserve original if needed
    const elementToMove = preserveEvents ? sourceElement : sourceElement.cloneNode(true);

    // Move element based on position
    switch (position) {
      case 'before':
        targetElement.parentNode.insertBefore(elementToMove, targetElement);
        break;
      case 'after':
        targetElement.parentNode.insertBefore(elementToMove, targetElement.nextSibling);
        break;
      case 'inside':
      case 'append':
        targetElement.appendChild(elementToMove);
        break;
      case 'prepend':
        targetElement.insertBefore(elementToMove, targetElement.firstChild);
        break;
      default:
        console.warn(`${context}: Invalid position: ${position}`);
        return false;
    }

    // Remove original if we cloned it
    if (!preserveEvents && sourceElement !== elementToMove) {
      sourceElement.remove();
    }

    console.log(`${context}: Successfully moved element to ${position} target container`);
    return true;

  } catch (error) {
    console.error(`${context}: Error moving element:`, error);
    return false;
  }
}

/**
 * Move user actions to appear above the first card in membership container
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function moveUserActionsToMembershipContainer(context = 'User Actions Mover') {
  try {
    const sourceSelector = '.user-actions';
    const targetSelector = '.membership-cards-container .card.m-2:first-child';
    
    return moveElementToContainer(sourceSelector, targetSelector, {
      position: 'before',
      preserveEvents: true,
      context
    });
  } catch (error) {
    console.error(`${context}: Error moving user actions:`, error);
    return false;
  }
}

/**
 * Apply container styling to element
 * @param {Element} element - Element to style
 * @param {Object} styling - Styling options
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function applyContainerStyling(element, styling = {}, context = 'Container Styler') {
  try {
    if (!element) {
      console.warn(`${context}: No element provided for styling`);
      return false;
    }

    // Default container styling to match membership cards
    const defaultStyling = {
      'd-flex': true,
      'flex-row': true,
      'flex-wrap': true,
      'justify-content-around': true,
      'align-items-center': true,
      'mb-3': true
    };

    // Merge with provided styling
    const finalStyling = { ...defaultStyling, ...styling };

    // Apply classes
    Object.entries(finalStyling).forEach(([className, shouldApply]) => {
      if (shouldApply) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    });

    console.log(`${context}: Successfully applied container styling`);
    return true;

  } catch (error) {
    console.error(`${context}: Error applying container styling:`, error);
    return false;
  }
}

/**
 * Move and style user actions to match membership container
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function moveAndStyleUserActions(context = 'User Actions Handler') {
  try {
    // First move the element
    const moved = moveUserActionsToMembershipContainer(context);
    if (!moved) {
      return false;
    }

    // Then apply card styling to match the individual cards
    const userActionsElement = document.querySelector('.user-actions');
    if (userActionsElement) {
      return applyContainerStyling(userActionsElement, {
        'card': true,
        'm-2': true,
        'd-flex': true,
        'flex-row': true,
        'flex-wrap': true,
        'justify-content-around': true,
        'align-items-center': true,
        'p-3': true,
        'w-100': true
      }, context);
    }

    return false;
  } catch (error) {
    console.error(`${context}: Error moving and styling user actions:`, error);
    return false;
  }
}
