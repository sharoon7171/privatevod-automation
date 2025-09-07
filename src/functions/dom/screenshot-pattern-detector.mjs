/**
 * PrivateVOD Automation - Screenshot Pattern Detector
 * Detects URL patterns from existing carousel images
 */

/**
 * Extract pattern information from two existing URLs
 * @param {string} url1 - First existing image URL
 * @param {string} url2 - Second existing image URL
 * @returns {Object} Pattern information with base URL and increment
 */
export function detectScreenshotPattern(url1, url2) {
  try {
    // Parse URLs to extract components
    const url1Parts = parseImageUrl(url1);
    const url2Parts = parseImageUrl(url2);
    
    if (!url1Parts || !url2Parts) {
      throw new Error('Invalid URL format');
    }
    
    // Verify URLs are from same video (same bucket, folder, videoId)
    if (url1Parts.bucket !== url2Parts.bucket || 
        url1Parts.folder !== url2Parts.folder || 
        url1Parts.videoId !== url2Parts.videoId) {
      throw new Error('URLs are not from the same video');
    }
    
    // Calculate increment
    const increment = url2Parts.timecode - url1Parts.timecode;
    
    if (increment <= 0) {
      throw new Error('Invalid timecode increment');
    }
    
    return {
      baseUrl: url1Parts.baseUrl,
      bucket: url1Parts.bucket,
      folder: url1Parts.folder,
      videoId: url1Parts.videoId,
      resolution: url1Parts.resolution,
      firstTimecode: url1Parts.timecode,
      increment: increment,
      suffix: url1Parts.suffix
    };
    
  } catch (error) {
    console.error('Screenshot Pattern Detection Error:', error);
    return null;
  }
}

/**
 * Parse image URL to extract components
 * @param {string} url - Image URL to parse
 * @returns {Object|null} Parsed URL components or null if invalid
 */
function parseImageUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Expected pattern: https://caps1cdn.adultempire.com/{bucket}/{folder}/{resolution}/{videoId}_{timecode}_{resolution}c.jpg
    const pathParts = urlObj.pathname.split('/');
    
    if (pathParts.length < 5) {
      return null;
    }
    
    const bucket = pathParts[1];
    const folder = pathParts[2];
    const resolution = pathParts[3];
    const filename = pathParts[4];
    
    // Parse filename: {videoId}_{timecode}_{resolution}c.jpg
    const filenameParts = filename.split('_');
    if (filenameParts.length < 3) {
      return null;
    }
    
    const videoId = filenameParts[0];
    const timecode = parseInt(filenameParts[1], 10);
    const suffix = filenameParts.slice(2).join('_'); // Everything after second underscore
    
    // Reconstruct base URL without timecode
    const baseUrl = `${urlObj.origin}/${bucket}/${folder}/${resolution}/${videoId}`;
    
    return {
      baseUrl,
      bucket,
      folder,
      videoId,
      resolution,
      timecode,
      suffix
    };
    
  } catch (error) {
    console.error('URL Parsing Error:', error);
    return null;
  }
}

/**
 * Get existing image URLs from carousel
 * @param {Element} carouselContainer - Carousel container element
 * @returns {Array} Array of existing image URLs
 */
export function getExistingImageUrls(carouselContainer) {
  const imageElements = carouselContainer.querySelectorAll('img[src]');
  return Array.from(imageElements).map(img => img.src);
}

/**
 * Count total carousel items
 * @param {Element} carouselContainer - Carousel container element
 * @returns {number} Total number of carousel items
 */
export function countCarouselItems(carouselContainer) {
  const carouselItems = carouselContainer.querySelectorAll('.carousel-item');
  return carouselItems.length;
}

/**
 * Extract timecode from a single URL
 * @param {string} url - Image URL
 * @returns {number} Timecode or 0 if not found
 */
export function extractTimecodeFromUrl(url) {
  try {
    const parts = parseImageUrl(url);
    return parts ? parts.timecode : 0;
  } catch (error) {
    console.error('Timecode extraction error:', error);
    return 0;
  }
}
