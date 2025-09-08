/**
 * Favorite and Like Storage Service
 * Manages local storage for favorite and like status
 */

// Storage keys
const FAVORITES_KEY = 'privatevod_favorites';
const LIKES_KEY = 'privatevod_likes';

/**
 * Get all favorited scene IDs
 * @returns {Promise<Set<string>>} Set of favorited scene IDs
 */
export async function getFavorites() {
  try {
    const result = await chrome.storage.local.get([FAVORITES_KEY]);
    const favorites = result[FAVORITES_KEY] || [];
    return new Set(favorites);
  } catch (error) {
    return new Set();
  }
}

/**
 * Get all liked scene IDs
 * @returns {Promise<Set<string>>} Set of liked scene IDs
 */
export async function getLikes() {
  try {
    const result = await chrome.storage.local.get([LIKES_KEY]);
    const likes = result[LIKES_KEY] || [];
    return new Set(likes);
  } catch (error) {
    return new Set();
  }
}

/**
 * Add scene ID to favorites
 * @param {string} sceneId - Scene ID to add
 * @returns {Promise<boolean>} Success status
 */
export async function addFavorite(sceneId) {
  try {
    const favorites = await getFavorites();
    favorites.add(sceneId);
    await chrome.storage.local.set({ [FAVORITES_KEY]: Array.from(favorites) });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Remove scene ID from favorites
 * @param {string} sceneId - Scene ID to remove
 * @returns {Promise<boolean>} Success status
 */
export async function removeFavorite(sceneId) {
  try {
    const favorites = await getFavorites();
    favorites.delete(sceneId);
    await chrome.storage.local.set({ [FAVORITES_KEY]: Array.from(favorites) });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Add scene ID to likes
 * @param {string} sceneId - Scene ID to add
 * @returns {Promise<boolean>} Success status
 */
export async function addLike(sceneId) {
  try {
    const likes = await getLikes();
    likes.add(sceneId);
    await chrome.storage.local.set({ [LIKES_KEY]: Array.from(likes) });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Remove scene ID from likes
 * @param {string} sceneId - Scene ID to remove
 * @returns {Promise<boolean>} Success status
 */
export async function removeLike(sceneId) {
  try {
    const likes = await getLikes();
    likes.delete(sceneId);
    await chrome.storage.local.set({ [LIKES_KEY]: Array.from(likes) });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if scene is favorited
 * @param {string} sceneId - Scene ID to check
 * @returns {Promise<boolean>} True if favorited
 */
export async function isFavorited(sceneId) {
  const favorites = await getFavorites();
  return favorites.has(sceneId);
}

/**
 * Check if scene is liked
 * @param {string} sceneId - Scene ID to check
 * @returns {Promise<boolean>} True if liked
 */
export async function isLiked(sceneId) {
  const likes = await getLikes();
  return likes.has(sceneId);
}

/**
 * Clear all favorites
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllFavorites() {
  try {
    await chrome.storage.local.set({ [FAVORITES_KEY]: [] });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Clear all likes
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllLikes() {
  try {
    await chrome.storage.local.set({ [LIKES_KEY]: [] });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get storage statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getStorageStats() {
  try {
    const [favorites, likes] = await Promise.all([getFavorites(), getLikes()]);
    return {
      favoritesCount: favorites.size,
      likesCount: likes.size,
      favorites: Array.from(favorites),
      likes: Array.from(likes)
    };
  } catch (error) {
    return {
      favoritesCount: 0,
      likesCount: 0,
      favorites: [],
      likes: []
    };
  }
}
