/**
 * PrivateVOD Automation - Screenshot Modal Handler
 * Handles screenshot modal interactions
 */

/**
 * Open the screenshot modal
 * @returns {Promise<boolean>} True if modal opened successfully
 */
export async function openScreenshotModal() {
  try {
    // Find the Screenshots button
    const screenshotsButton = document.querySelector('a[data-target="#screenshotModal"]');
    
    if (!screenshotsButton) {
      return false;
    }
    
    // Click the button to open modal
    screenshotsButton.click();
    
    // Wait for modal to be visible
    await waitForModalOpen();
    
    return true;
    
  } catch (error) {
    return false;
  }
}

/**
 * Wait for modal to be visible
 * @returns {Promise<void>}
 */
function waitForModalOpen() {
  return new Promise((resolve) => {
    const checkModal = () => {
      const modal = document.querySelector('#screenshotModal');
      if (modal && modal.classList.contains('show')) {
        resolve();
      } else {
        setTimeout(checkModal, 100);
      }
    };
    checkModal();
  });
}

/**
 * Get carousel container from modal
 * @returns {Element|null} Carousel container element
 */
export function getCarouselContainer() {
  const modal = document.querySelector('#screenshotModal');
  if (!modal) {
    return null;
  }
  
  return modal.querySelector('.carousel-inner');
}

/**
 * Close the screenshot modal instantly
 * @returns {Promise<boolean>} True if modal closed successfully
 */
export async function closeScreenshotModal() {
  try {
    const modal = document.querySelector('#screenshotModal');
    if (!modal) {
      return false;
    }
    
    // Force close by removing classes and hiding
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    
    // Remove backdrop if exists
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    
    return true;
    
  } catch (error) {
    return false;
  }
}



/**
 * Check if modal is currently open
 * @returns {boolean} True if modal is open
 */
export function isModalOpen() {
  const modal = document.querySelector('#screenshotModal');
  return modal && modal.classList.contains('show');
}
