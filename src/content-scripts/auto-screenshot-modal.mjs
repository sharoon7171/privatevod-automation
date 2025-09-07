/**
 * PrivateVOD Automation - Auto Screenshot Modal Content Script
 * Automatically opens screenshot modal and generates missing image URLs
 */

// Check if already initialized
if (window.screenshotExtensionInitialized) {
  console.log('Screenshot extension already initialized');
} else {
  window.screenshotExtensionInitialized = true;

  // Initialize content script
  (async function initScreenshotContentScript() {
    try {
      // Bundle all dynamic imports in parallel
        const [
          { waitForPageLoad },
          { detectScreenshotPattern, getExistingImageUrls, countCarouselItems, extractTimecodeFromUrl },
          { generateMissingUrls, validateGeneratedUrl },
          { openScreenshotModal, getCarouselContainer, closeScreenshotModal },
          { createAndEmbedImageGrid, removeExistingGrid },
          { getSettings }
        ] = await Promise.all([
        import(chrome.runtime.getURL('functions/dom/page-loader.mjs')),
        import(chrome.runtime.getURL('functions/dom/screenshot-pattern-detector.mjs')),
        import(chrome.runtime.getURL('functions/dom/screenshot-url-generator.mjs')),
        import(chrome.runtime.getURL('functions/dom/screenshot-modal-handler.mjs')),
        import(chrome.runtime.getURL('functions/dom/image-grid-embedder.mjs')),
        import(chrome.runtime.getURL('services/storage/get-settings.mjs'))
      ]);

      // Wait for complete page load
      await waitForPageLoad(async () => {
        // Check if screenshot automation is enabled
        const settings = await getSettings();
        if (!settings.autoScreenshotModal) {
          console.log('Screenshot automation is disabled in settings');
          return;
        }
        
        await processScreenshotAutomation();
      }, 'Screenshot Automation');

      async function processScreenshotAutomation() {
        try {
          console.log('Starting screenshot automation...');

          // Step 1: Open screenshot modal
          const modalOpened = await openScreenshotModal();
          if (!modalOpened) {
            console.error('Failed to open screenshot modal');
            return;
          }

          // Step 2: Get carousel container
          const carouselContainer = getCarouselContainer();
          if (!carouselContainer) {
            console.error('Carousel container not found');
            await closeScreenshotModal();
            return;
          }

          // Step 3: Get existing image URLs
          const existingUrls = getExistingImageUrls(carouselContainer);
          console.log('Found existing URLs:', existingUrls);

          if (existingUrls.length < 2) {
            console.error('Need at least 2 existing URLs to detect pattern');
            await closeScreenshotModal();
            return;
          }

          // Step 4: Detect pattern from first 2 URLs
          const pattern = detectScreenshotPattern(existingUrls[0], existingUrls[1]);
          if (!pattern) {
            console.error('Failed to detect pattern from existing URLs');
            await closeScreenshotModal();
            return;
          }

          console.log('Detected pattern:', pattern);

          // Step 5: Count total carousel items
          const totalItems = countCarouselItems(carouselContainer);
          console.log('Total carousel items:', totalItems);

          // Step 6: Generate missing URLs
          const missingUrls = generateMissingUrls(pattern, totalItems, existingUrls);
          console.log('Generated missing URLs:', missingUrls.length);

          // Step 7: Close modal
          await closeScreenshotModal();

          // Step 8: Remove existing grid if present
          removeExistingGrid();

          // Step 9: Combine existing and generated URLs for grid
          const allImageData = [];
          
          // Add existing URLs first
          existingUrls.forEach((url, index) => {
            allImageData.push({
              url: url,
              index: index + 1,
              timecode: extractTimecodeFromUrl(url)
            });
          });
          
          // Add generated URLs
          missingUrls.forEach(missingUrl => {
            allImageData.push(missingUrl);
          });
          
          // Sort by timecode to maintain chronological order
          allImageData.sort((a, b) => a.timecode - b.timecode);
          
          // Step 10: Create and embed image grid with all URLs
          if (allImageData.length > 0) {
            const gridElement = createAndEmbedImageGrid(allImageData);
            if (gridElement) {
              console.log('Screenshot grid created and embedded successfully with', allImageData.length, 'images');
            } else {
              console.error('Failed to create screenshot grid');
            }
          } else {
            console.log('No images to display');
          }

        } catch (error) {
          console.error('Screenshot automation error:', error);
        }
      }

    } catch (error) {
      console.error('Screenshot content script initialization failed:', error);
    }
  })();
}
