/**
 * PrivateVOD Automation - Screenshot URL Generator
 * Generates missing screenshot URLs based on detected pattern
 */

/**
 * Generate all missing URLs based on pattern
 * @param {Object} pattern - Pattern information from detectScreenshotPattern
 * @param {number} totalItems - Total number of carousel items
 * @param {Array} existingUrls - Array of existing URLs
 * @returns {Array} Array of generated URLs
 */
export function generateMissingUrls(pattern, totalItems, existingUrls) {
  if (!pattern) {
    return [];
  }
  
  const generatedUrls = [];
  const existingTimecodes = extractTimecodesFromUrls(existingUrls);
  
  // Generate URLs for all carousel items
  for (let i = 1; i <= totalItems; i++) {
    const expectedTimecode = pattern.firstTimecode + (pattern.increment * (i - 1));
    
    // Skip if this timecode already exists
    if (existingTimecodes.includes(expectedTimecode)) {
      continue;
    }
    
    const url = generateUrlFromPattern(pattern, expectedTimecode);
    if (url) {
      generatedUrls.push({
        index: i,
        timecode: expectedTimecode,
        url: url
      });
    }
  }
  
  return generatedUrls;
}

/**
 * Generate a single URL from pattern and timecode
 * @param {Object} pattern - Pattern information
 * @param {number} timecode - Timecode value
 * @returns {string} Generated URL
 */
function generateUrlFromPattern(pattern, timecode) {
  try {
    // Format timecode with leading zeros (5 digits)
    const formattedTimecode = timecode.toString().padStart(5, '0');
    
    // Construct URL: {baseUrl}_{timecode}_{suffix}
    return `${pattern.baseUrl}_${formattedTimecode}_${pattern.suffix}`;
    
  } catch (error) {
    return null;
  }
}

/**
 * Extract timecodes from existing URLs
 * @param {Array} urls - Array of existing URLs
 * @returns {Array} Array of timecode numbers
 */
function extractTimecodesFromUrls(urls) {
  return urls.map(url => {
    try {
      const urlObj = new URL(url);
      const filename = urlObj.pathname.split('/').pop();
      const timecodePart = filename.split('_')[1];
      return parseInt(timecodePart, 10);
    } catch (error) {
      return null;
    }
  }).filter(timecode => timecode !== null);
}

/**
 * Validate generated URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export function validateGeneratedUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && 
           urlObj.hostname === 'caps1cdn.adultempire.com' &&
           urlObj.pathname.includes('_') &&
           urlObj.pathname.endsWith('.jpg');
  } catch (error) {
    return false;
  }
}
