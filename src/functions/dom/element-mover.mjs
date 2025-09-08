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
      return false;
    }

    if (!targetElement) {
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
        return false;
    }

    // Remove original if we cloned it
    if (!preserveEvents && sourceElement !== elementToMove) {
      sourceElement.remove();
    }

    return true;

  } catch (error) {
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

    return true;

  } catch (error) {
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
    return false;
  }
}

/**
 * Move container px-0 (release info) before Pay Per Minute card
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function moveContainerPx0ToMembershipContainer(context = 'Container Px0 Mover') {
  try {
    const sourceSelector = '.container.px-0';
    const targetSelector = '.membership-cards-container .card.m-2:first-child';
    
    return moveElementToContainer(sourceSelector, targetSelector, {
      position: 'before',
      preserveEvents: true,
      context
    });
  } catch (error) {
    return false;
  }
}

/**
 * Apply card styling to container px-0 to match membership cards
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function styleContainerPx0AsCard(context = 'Container Px0 Styler') {
  try {
    const containerElement = document.querySelector('.container.px-0');
    if (!containerElement) {
      return false;
    }

    // Remove existing classes that might conflict
    containerElement.classList.remove('container', 'px-0');
    
    // Apply card styling to match the Pay Per Minute card structure
    const styled = applyContainerStyling(containerElement, {
      'card': true,
      'm-2': true,
      'w-100': true
    }, context);

    // Restructure the content with responsive professional styling
    const rowElement = containerElement.querySelector('.row');
    if (rowElement) {
      // Add card-body class
      rowElement.classList.add('card-body');
      
      // Find all the inner divs (release-date, studio, director, length)
      const innerDivs = rowElement.querySelectorAll('div[class*="col-"] > div, div[class*="release"], div[class*="studio"], div[class*="director"], div[class*="length"]');
      
      // Clear the existing row content
      rowElement.innerHTML = '';
      
      // Create responsive container for the info
      const infoContainer = document.createElement('div');
      infoContainer.className = 'row g-1 justify-content-center align-items-center';
      infoContainer.style.cssText = `
        margin: 0;
        max-width: 100%;
        overflow: hidden;
      `;
      
      // Add each inner div as a responsive column
      innerDivs.forEach((div, index) => {
        const colDiv = document.createElement('div');
        // More conservative responsive classes to prevent overflow
        colDiv.className = 'col-6 col-sm-4 col-md-3 text-center mb-2 mb-md-0';
        colDiv.style.cssText = `
          padding: 0 4px;
          max-width: 100%;
          overflow: hidden;
        `;
        
        // Create a styled info item
        const infoItem = document.createElement('div');
        infoItem.className = 'release-info-item p-1';
        infoItem.style.cssText = `
          border-radius: 4px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #dee2e6;
          transition: all 0.3s ease;
          min-height: 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          word-wrap: break-word;
          font-size: 0.85rem;
        `;
        
        // Add hover effect
        infoItem.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        infoItem.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = 'none';
        });
        
        // Style the content
        const content = div.innerHTML;
        infoItem.innerHTML = content;
        
        // Add professional styling to the text
        const boldElements = infoItem.querySelectorAll('.font-weight-bold');
        boldElements.forEach(el => {
          el.style.cssText = `
            color: #495057;
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 2px;
          `;
        });
        
        // Style links
        const links = infoItem.querySelectorAll('a');
        links.forEach(link => {
          link.style.cssText = `
            color: #dc3545;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
          `;
          link.addEventListener('mouseenter', function() {
            this.style.color = '#a71e2a';
            this.style.textDecoration = 'underline';
          });
          link.addEventListener('mouseleave', function() {
            this.style.color = '#dc3545';
            this.style.textDecoration = 'none';
          });
        });
        
        colDiv.appendChild(infoItem);
        infoContainer.appendChild(colDiv);
      });
      
      // Add the new responsive container to the card body
      rowElement.appendChild(infoContainer);
      
      // Add a subtle divider at the bottom
      const divider = document.createElement('div');
      divider.className = 'mt-2';
      divider.style.cssText = `
        height: 1px;
        background: linear-gradient(90deg, transparent, #dee2e6, transparent);
        margin: 0 10px;
      `;
      rowElement.appendChild(divider);
      
      // Ensure the card body doesn't overflow
      rowElement.style.cssText = `
        padding: 1rem;
        max-width: 100%;
        overflow: hidden;
      `;
    }

    return styled;
  } catch (error) {
    return false;
  }
}

/**
 * Move and style container px-0 to appear before Pay Per Minute card
 * @param {string} context - Context for logging
 * @returns {boolean} Success status
 */
export function moveAndStyleContainerPx0(context = 'Container Px0 Handler') {
  try {
    // First move the element
    const moved = moveContainerPx0ToMembershipContainer(context);
    if (!moved) {
      return false;
    }

    // Then apply card styling to match the Pay Per Minute card
    return styleContainerPx0AsCard(context);
  } catch (error) {
    return false;
  }
}

/**
 * Move both user actions and container px-0 in proper order based on settings
 * Order: 1. User actions, 2. Container px-0, 3. Pay Per Minute card
 * @param {Object} settings - Current settings object
 * @param {string} context - Context for logging
 * @returns {Object} Success status for both operations
 */
export async function moveUserActionsAndContainerPx0(settings, context = 'Combined Mover') {
  try {
    const results = {
      userActionsMoved: false,
      containerMoved: false,
      success: false
    };

    // Move user actions first if enabled (will appear first)
    if (settings.moveUserActions) {
      results.userActionsMoved = moveAndStyleUserActions(`${context} - User Actions`);
    }

    // Move container px-0 second if enabled
    if (settings.moveContainerPx0) {
      // If user actions were moved, we need to place container px-0 after it
      if (settings.moveUserActions && results.userActionsMoved) {
        // Wait a bit to ensure user actions are moved first
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Move container px-0 after user actions
        const sourceSelector = '.container.px-0';
        const targetSelector = '.user-actions';
        
        const moved = moveElementToContainer(sourceSelector, targetSelector, {
          position: 'after',
          preserveEvents: true,
          context: `${context} - Container Px0 After User Actions`
        });
        
        if (moved) {
          results.containerMoved = styleContainerPx0AsCard(`${context} - Container Px0 Styler`);
        }
      } else {
        // If user actions not enabled, move container px-0 before the card
        results.containerMoved = moveAndStyleContainerPx0(`${context} - Container Px0`);
      }
    }

    // Consider success if at least one operation was attempted and succeeded
    // or if both are disabled (no operations needed)
    results.success = (settings.moveUserActions ? results.userActionsMoved : true) && 
                     (settings.moveContainerPx0 ? results.containerMoved : true);

    return results;
  } catch (error) {
    return {
      userActionsMoved: false,
      containerMoved: false,
      success: false
    };
  }
}
