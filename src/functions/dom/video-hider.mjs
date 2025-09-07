/**
 * Video Hider Utility
 * Hides/shows videos based on scene ID status
 */

/**
 * Hide a video by scene ID
 * @param {string} sceneId - Scene ID to hide
 */
export function hideVideo(sceneId) {
  const videoElement = document.getElementById(`ascene_${sceneId}`);
  if (videoElement) {
    videoElement.style.display = 'none';
    videoElement.setAttribute('data-hidden-by-extension', 'true');
  }
}

/**
 * Show a video by scene ID
 * @param {string} sceneId - Scene ID to show
 */
export function showVideo(sceneId) {
  const videoElement = document.getElementById(`ascene_${sceneId}`);
  if (videoElement) {
    videoElement.style.display = '';
    videoElement.removeAttribute('data-hidden-by-extension');
  }
}

/**
 * Hide multiple videos by scene IDs
 * @param {string[]} sceneIds - Array of scene IDs to hide
 */
export function hideVideos(sceneIds) {
  sceneIds.forEach(sceneId => hideVideo(sceneId));
}

/**
 * Show multiple videos by scene IDs
 * @param {string[]} sceneIds - Array of scene IDs to show
 */
export function showVideos(sceneIds) {
  sceneIds.forEach(sceneId => showVideo(sceneId));
}


/**
 * Get all video elements on page (visible and hidden)
 * @returns {Element[]} Array of all video elements
 */
export function getAllVideos() {
  return Array.from(document.querySelectorAll('.grid-item[id^="ascene_"]'));
}


/**
 * Extract scene ID from video element
 * @param {Element} videoElement - Video element
 * @returns {string|null} Scene ID or null
 */
export function getSceneIdFromVideoElement(videoElement) {
  const id = videoElement.getAttribute('id');
  if (id && id.startsWith('ascene_')) {
    return id.replace('ascene_', '');
  }
  return null;
}

/**
 * Get all scene IDs from all videos on page (visible and hidden)
 * @returns {string[]} Array of scene IDs
 */
export function getAllSceneIdsOnPage() {
  const videos = getAllVideos();
  return videos.map(video => getSceneIdFromVideoElement(video)).filter(id => id !== null);
}
