/**
 * Button Status Tracker Utility
 * Tracks favorite and like button status changes
 */

/**
 * Check if button is active (favorited/liked)
 * @param {Element} button - Button element
 * @returns {boolean} True if button has 'active' class
 */
export function isButtonActive(button) {
  return button && button.classList.contains('active');
}

/**
 * Get button type (favorite or like)
 * @param {Element} button - Button element
 * @returns {string|null} 'favorite', 'like', or null
 */
export function getButtonType(button) {
  if (!button) return null;
  
  const text = button.textContent?.toLowerCase() || '';
  const onclick = button.getAttribute('onclick') || '';
  
  if (text.includes('favorite') || onclick.includes('ToggleProductFavorite')) {
    return 'favorite';
  } else if (text.includes('like') || onclick.includes('ToggleLike')) {
    return 'like';
  }
  
  return null;
}

/**
 * Get scene ID from button's onclick attribute
 * @param {Element} button - Button element
 * @returns {string|null} Scene ID or null
 */
export function getSceneIdFromButton(button) {
  if (!button) return null;
  
  const onclick = button.getAttribute('onclick') || '';
  const match = onclick.match(/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Find favorite button on page
 * @returns {Element|null} Favorite button element
 */
export function findFavoriteButton() {
  const buttons = document.querySelectorAll('.btn.btn-secondary');
  for (const button of buttons) {
    if (getButtonType(button) === 'favorite') {
      return button;
    }
  }
  return null;
}

/**
 * Find like button on page
 * @returns {Element|null} Like button element
 */
export function findLikeButton() {
  const buttons = document.querySelectorAll('.btn.btn-secondary');
  for (const button of buttons) {
    if (getButtonType(button) === 'like') {
      return button;
    }
  }
  return null;
}

/**
 * Get current button status
 * @param {string} type - 'favorite' or 'like'
 * @returns {Object} Status object with type, sceneId, and isActive
 */
export function getButtonStatus(type) {
  const button = type === 'favorite' ? findFavoriteButton() : findLikeButton();
  
  if (!button) {
    return {
      type,
      sceneId: null,
      isActive: false,
      button: null
    };
  }
  
  return {
    type,
    sceneId: getSceneIdFromButton(button),
    isActive: isButtonActive(button),
    button
  };
}

/**
 * Get both favorite and like status
 * @returns {Object} Combined status object
 */
export function getBothButtonStatus() {
  return {
    favorite: getButtonStatus('favorite'),
    like: getButtonStatus('like')
  };
}
