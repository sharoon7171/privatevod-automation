/**
 * Shared Favorite Button Clicking Function
 * Favorite button detection and clicking logic
 */

/**
 * Find and click favorite button
 * @param {string} context - Context for logging (e.g., "Video", "Star")
 * @returns {Promise<boolean>} True if button was clicked, false if not found or already favorited
 */
export async function clickFavoriteButton(context = "Item") {
  try {
    // Look for favorite button with ToggleProductFavorite onclick
    const favoriteButton = document.querySelector('a[onclick*="ToggleProductFavorite"]');
    
    if (!favoriteButton) {
      return false;
    }
    
    // Check if already favorited (has 'active' class)
    if (favoriteButton.classList.contains('active')) {
      return false;
    }
    
    // Click the button using simple click method
    favoriteButton.click();
    
    return true;
  } catch (error) {
    return false;
  }
}

