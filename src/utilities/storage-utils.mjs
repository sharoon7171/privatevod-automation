/**
 * Storage Utilities
 * Simple utility functions for communicating with service worker storage
 * Replaces the need for a separate storage service file
 */

/**
 * Send message to service worker and handle response
 * @param {Object} message - Message to send
 * @returns {Promise<Object>} Response from service worker
 */
async function sendStorageMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response && response.success) {
        resolve(response);
      } else {
        reject(new Error(response?.error || 'Unknown error'));
      }
    });
  });
}

// =============================================================================
//                    ⭐ FAVORITES MANAGEMENT ⭐
// =============================================================================

/**
 * Get all favorites
 * @returns {Promise<Set<string>>} Set of favorited scene IDs
 */
export async function getFavorites() {
  try {
    const response = await sendStorageMessage({ action: "getFavorites" });
    return new Set(response.data);
  } catch (error) {
    console.error('🗄️ Storage Utils: Error getting favorites:', error);
    return new Set();
  }
}

/**
 * Add favorite
 * @param {string} sceneId - Scene ID to add
 * @returns {Promise<boolean>} Success status
 */
export async function addFavorite(sceneId) {
  try {
    const response = await sendStorageMessage({ 
      action: "addFavorite", 
      sceneId: sceneId 
    });
    
    // Trigger video hiding refresh if successful
    if (response.success) {
      refreshVideoHiding();
    }
    
    return response.success;
  } catch (error) {
    console.error('🗄️ Storage Utils: Error adding favorite:', error);
    return false;
  }
}

/**
 * Remove favorite
 * @param {string} sceneId - Scene ID to remove
 * @returns {Promise<boolean>} Success status
 */
export async function removeFavorite(sceneId) {
  try {
    const response = await sendStorageMessage({ 
      action: "removeFavorite", 
      sceneId: sceneId 
    });
    
    // Trigger video hiding refresh if successful
    if (response.success) {
      refreshVideoHiding();
    }
    
    return response.success;
  } catch (error) {
    console.error('🗄️ Storage Utils: Error removing favorite:', error);
    return false;
  }
}

/**
 * Check if scene is favorited
 * @param {string} sceneId - Scene ID to check
 * @returns {Promise<boolean>} True if favorited
 */
export async function isFavorited(sceneId) {
  try {
    const response = await sendStorageMessage({ 
      action: "isFavorited", 
      sceneId: sceneId 
    });
    return response.data;
  } catch (error) {
    console.error('🗄️ Storage Utils: Error checking if favorited:', error);
    return false;
  }
}

/**
 * Clear all favorites
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllFavorites() {
  try {
    const response = await sendStorageMessage({ action: "clearAllFavorites" });
    return response.success;
  } catch (error) {
    console.error('🗄️ Storage Utils: Error clearing favorites:', error);
    return false;
  }
}

// =============================================================================
//                    ❤️ LIKES MANAGEMENT ❤️
// =============================================================================

/**
 * Get all likes
 * @returns {Promise<Set<string>>} Set of liked scene IDs
 */
export async function getLikes() {
  try {
    const response = await sendStorageMessage({ action: "getLikes" });
    return new Set(response.data);
  } catch (error) {
    console.error('🗄️ Storage Utils: Error getting likes:', error);
    return new Set();
  }
}

/**
 * Add like
 * @param {string} sceneId - Scene ID to add
 * @returns {Promise<boolean>} Success status
 */
export async function addLike(sceneId) {
  try {
    const response = await sendStorageMessage({ 
      action: "addLike", 
      sceneId: sceneId 
    });
    
    // Trigger video hiding refresh if successful
    if (response.success) {
      refreshVideoHiding();
    }
    
    return response.success;
  } catch (error) {
    console.error('🗄️ Storage Utils: Error adding like:', error);
    return false;
  }
}

/**
 * Remove like
 * @param {string} sceneId - Scene ID to remove
 * @returns {Promise<boolean>} Success status
 */
export async function removeLike(sceneId) {
  try {
    const response = await sendStorageMessage({ 
      action: "removeLike", 
      sceneId: sceneId 
    });
    
    // Trigger video hiding refresh if successful
    if (response.success) {
      refreshVideoHiding();
    }
    
    return response.success;
  } catch (error) {
    console.error('🗄️ Storage Utils: Error removing like:', error);
    return false;
  }
}

/**
 * Check if scene is liked
 * @param {string} sceneId - Scene ID to check
 * @returns {Promise<boolean>} True if liked
 */
export async function isLiked(sceneId) {
  try {
    const response = await sendStorageMessage({ 
      action: "isLiked", 
      sceneId: sceneId 
    });
    return response.data;
  } catch (error) {
    console.error('🗄️ Storage Utils: Error checking if liked:', error);
    return false;
  }
}

/**
 * Clear all likes
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllLikes() {
  try {
    const response = await sendStorageMessage({ action: "clearAllLikes" });
    return response.success;
  } catch (error) {
    console.error('🗄️ Storage Utils: Error clearing likes:', error);
    return false;
  }
}

// =============================================================================
//                    📊 STORAGE STATISTICS 📊
// =============================================================================

/**
 * Get storage statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getStorageStats() {
  try {
    const response = await sendStorageMessage({ action: "getStorageStats" });
    return response.data;
  } catch (error) {
    console.error('🗄️ Storage Utils: Error getting storage stats:', error);
    return {
      favoritesCount: 0,
      likesCount: 0,
      favorites: [],
      likes: []
    };
  }
}

// =============================================================================
//                    🔄 VIDEO HIDING REFRESH 🔄
// =============================================================================

/**
 * Refresh video hiding on all tabs
 * @returns {Promise<void>}
 */
async function refreshVideoHiding() {
  try {
    await sendStorageMessage({ action: "refreshVideoHiding" });
  } catch (error) {
    console.error('🗄️ Storage Utils: Error refreshing video hiding:', error);
  }
}
