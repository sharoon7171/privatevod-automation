/**
 * Scene ID Extractor Utility
 * Extracts scene ID from PrivateVOD video URLs
 */

/**
 * Extract scene ID from PrivateVOD video URL
 * @param {string} url - The current page URL
 * @returns {string|null} Scene ID or null if not found
 */
export function extractSceneId(url = window.location.href) {
  try {
    // Pattern: https://www.privatevod.com/249662/private-vod-sexy-brunette...
    const match = url.match(/\/\/(?:www\.)?privatevod\.com\/(\d+)\//);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Scene ID Extractor: Error extracting scene ID:', error);
    return null;
  }
}

/**
 * Check if current page is a video page
 * @param {string} url - The current page URL
 * @returns {boolean} True if video page
 */
export function isVideoPage(url = window.location.href) {
  return /\/\/(?:www\.)?privatevod\.com\/\d+\/.*-video\.html/.test(url);
}

/**
 * Get current scene ID from page
 * @returns {string|null} Current scene ID
 */
export function getCurrentSceneId() {
  return extractSceneId();
}
