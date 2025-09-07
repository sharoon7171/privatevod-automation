/**
 * PrivateVOD Automation - Image Grid Embedder
 * Creates and embeds image grid with 5 images per row
 */

/**
 * Create and embed image grid after video container details
 * @param {Array} imageData - Array of image data objects with url, index, timecode
 * @returns {Element|null} Created grid element
 */
export function createAndEmbedImageGrid(imageData) {
  try {
    // Find target container
    const targetContainer = document.querySelector('#video-container-details');
    if (!targetContainer) {
      console.error('Target container not found');
      return null;
    }
    
    // Create grid container
    const gridContainer = createGridContainer();
    
    // Create grid rows with 5 images per row
    const rows = createGridRows(imageData);
    rows.forEach(row => gridContainer.appendChild(row));
    
    // Embed after target container
    targetContainer.parentNode.insertBefore(gridContainer, targetContainer.nextSibling);
    
    return gridContainer;
    
  } catch (error) {
    console.error('Grid Creation Error:', error);
    return null;
  }
}

/**
 * Create grid container element
 * @returns {Element} Grid container element
 */
function createGridContainer() {
  const container = document.createElement('div');
  container.className = 'screenshot-grid-container';
  container.style.cssText = `
    margin: 20px 0;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
  `;
  
  // Add title
  const title = document.createElement('h3');
  title.textContent = 'Screenshot Gallery';
  title.style.cssText = `
    margin: 0 0 20px 0;
    color: #333;
    font-size: 1.5rem;
    text-align: center;
  `;
  container.appendChild(title);
  
  return container;
}

/**
 * Create grid rows with 5 images per row
 * @param {Array} imageData - Array of image data
 * @returns {Array} Array of row elements
 */
function createGridRows(imageData) {
  const rows = [];
  const imagesPerRow = 5; // 5 images per row
  
  for (let i = 0; i < imageData.length; i += imagesPerRow) {
    const rowImages = imageData.slice(i, i + imagesPerRow);
    const row = createGridRow(rowImages);
    rows.push(row);
  }
  
  return rows;
}

/**
 * Create a single grid row
 * @param {Array} rowImages - Images for this row
 * @returns {Element} Row element
 */
function createGridRow(rowImages) {
  const row = document.createElement('div');
  row.className = 'screenshot-grid-row';
  row.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-bottom: 15px;
  `;
  
  rowImages.forEach(imageData => {
    const imageElement = createImageElement(imageData);
    row.appendChild(imageElement);
  });
  
  return row;
}

/**
 * Create individual image element
 * @param {Object} imageData - Image data object
 * @returns {Element} Image element
 */
function createImageElement(imageData) {
  const imageContainer = document.createElement('div');
  imageContainer.className = 'screenshot-image-container';
  imageContainer.style.cssText = `
    flex: 0 0 calc(20% - 10px);
    max-width: calc(20% - 10px);
    min-width: 120px;
    aspect-ratio: 16/9;
    overflow: hidden;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
  `;
  
  // Add hover effect
  imageContainer.addEventListener('mouseenter', () => {
    imageContainer.style.transform = 'scale(1.05)';
  });
  
  imageContainer.addEventListener('mouseleave', () => {
    imageContainer.style.transform = 'scale(1)';
  });
  
  const img = document.createElement('img');
  img.src = imageData.url;
  img.alt = `Screenshot ${imageData.index}`;
  img.title = `Timecode: ${imageData.timecode}`;
  img.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
  `;
  
  // Add click handler to open in new tab
  img.addEventListener('click', () => {
    window.open(imageData.url, '_blank');
  });
  
  imageContainer.appendChild(img);
  
  return imageContainer;
}

/**
 * Remove existing grid if it exists
 */
export function removeExistingGrid() {
  const existingGrid = document.querySelector('.screenshot-grid-container');
  if (existingGrid) {
    existingGrid.remove();
  }
}
