/**
 * Video Hider Utility
 * Hides/shows videos based on scene ID status
 */

/**
 * Hide a video by scene ID
 * @param {string} sceneId - Scene ID to hide
 */
export function hideVideo(sceneId) {
  // Try ascene_ format first
  let videoElement = document.getElementById(`ascene_${sceneId}`);
  
  // If not found, try other formats
  if (!videoElement) {
    const allVideos = getAllVideos();
    videoElement = allVideos.find(video => getSceneIdFromVideoElement(video) === sceneId);
  }
  
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
  // Try ascene_ format first
  let videoElement = document.getElementById(`ascene_${sceneId}`);
  
  // If not found, try other formats
  if (!videoElement) {
    const allVideos = getAllVideos();
    videoElement = allVideos.find(video => getSceneIdFromVideoElement(video) === sceneId);
  }
  
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
 * Supports three formats: ascene_ ID, data-scene-id attribute, and href URL
 * @returns {Element[]} Array of all video elements
 */
export function getAllVideos() {
  // Get all three grid formats: ascene_ format, data-scene-id format, and href format
  const asceneVideos = Array.from(document.querySelectorAll('.grid-item[id^="ascene_"]'));
  
  // For data-scene-id format, get the .grid-item containers that contain [data-scene-id] elements
  const dataSceneIdElements = Array.from(document.querySelectorAll('[data-scene-id]'));
  const dataSceneIdVideos = dataSceneIdElements.map(element => element.closest('.grid-item')).filter(Boolean);
  
  // Get href format videos by finding all grid-items and filtering those with video links
  const allGridItems = Array.from(document.querySelectorAll('.grid-item'));
  const hrefVideos = allGridItems.filter(item => {
    // Skip if it's already an ascene_ format
    if (item.id && item.id.startsWith('ascene_')) return false;
    
    // Skip if it's already a data-scene-id format
    if (item.querySelector('[data-scene-id]')) return false;
    
    // Check if it has a link with scene ID pattern
    const links = item.querySelectorAll('a[href*="/"][href*="-video.html"]');
    return links.length > 0;
  });
  
  return [...asceneVideos, ...dataSceneIdVideos, ...hrefVideos];
}


/**
 * Extract scene ID from video element
 * Supports three formats: ascene_ ID, data-scene-id attribute, and href URL
 * @param {Element} videoElement - Video element
 * @returns {string|null} Scene ID or null
 */
export function getSceneIdFromVideoElement(videoElement) {
  // Check for ascene_ format first
  const id = videoElement.getAttribute('id');
  if (id && id.startsWith('ascene_')) {
    return id.replace('ascene_', '');
  }
  
  // Check for data-scene-id format
  const dataSceneIdElement = videoElement.querySelector('[data-scene-id]');
  if (dataSceneIdElement) {
    return dataSceneIdElement.getAttribute('data-scene-id');
  }
  
  // Check for href format - look for links with scene ID in href
  const links = videoElement.querySelectorAll('a[href*="/"][href*="-video.html"]');
  for (const link of links) {
    const href = link.getAttribute('href');
    if (href) {
      // Extract scene ID from href like "/1749438/private-vod-scene-1-streaming-scene-video.html"
      const match = href.match(/\/(\d+)\//);
      if (match) {
        return match[1];
      }
    }
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
