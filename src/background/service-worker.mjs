/**
 * PrivateVOD Automation - Service Worker
 * Centralized service worker handling all background functionality
 * Includes navigation enhancements, auto-features, and content injection
 */

// =============================================================================
// =============================================================================
// =============================================================================
//                    🔧 SERVICE WORKER CORE SETUP 🔧
// =============================================================================
// =============================================================================
// =============================================================================

// Service worker installation
self.addEventListener("install", (event) => {
  console.log('🔧 Service Worker: Installing...');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener("activate", (event) => {
  console.log('🔧 Service Worker: Activating...');
  event.waitUntil(clients.claim());
});

// Handle action click - open options page
chrome.action.onClicked.addListener((tab) => {
  console.log('🔧 Service Worker: Opening options page');
  chrome.runtime.openOptionsPage();
});

// =============================================================================
// =============================================================================
// =============================================================================
//                    🧭 NAVIGATION ENHANCEMENT FEATURES 🧭
// =============================================================================
// =============================================================================
// =============================================================================

// =============================================================================
//                    🎯 STUDIO URL REDIRECTS 🎯
// =============================================================================

// Studio URL interception - redirect studio URLs to /watch-streaming-video-by-scene.html
chrome.webNavigation.onCommitted.addListener(async (details) => {
  try {
    // Only process main frame navigations (not iframes)
    if (details.frameId !== 0) return;

    // Check if this is a studio URL - matches ID/studio/ pattern
    const studioMatch = details.url.match(/(\d+)\/studio\//);
    if (!studioMatch) {
      return;
    }

    console.log('🎯 Studio Redirect: Detected studio URL:', details.url);

    // Get settings to check if studio redirect is enabled
    const result = await chrome.storage.sync.get(["privatevod_settings"]);
    const settings = result.privatevod_settings || {};

    if (!settings.autoRedirectStudioUrls) {
      console.log('🎯 Studio Redirect: Disabled in settings');
      return;
    }

    const studioId = studioMatch[1];
    const redirectUrl = `https://www.privatevod.com/watch-streaming-video-by-scene.html?sort=released&studio=${studioId}`;

    console.log('🎯 Studio Redirect: Redirecting to:', redirectUrl);
    // Redirect immediately - page is already marked as visited
    chrome.tabs.update(details.tabId, { url: redirectUrl });
  } catch (error) {
    console.error('🎯 Studio Redirect: Error:', error);
  }
});

// =============================================================================
//                    🌟 PORSTAR URL REDIRECTS 🌟
// =============================================================================

// Pornstar URL interception - redirect pornstar URLs to shop page
chrome.webNavigation.onCommitted.addListener(async (details) => {
  try {
    // Only process main frame navigations (not iframes)
    if (details.frameId !== 0) return;

    // Check if this is a pornstar URL - matches any URL containing pornstars.html
    // Examples:
    // /porn-videos/724441/eden-ivy-pornstars.html
    // /scenes/724441/eden-ivy-pornstars.html#performer
    // /724441/eden-ivy-pornstars.html#performer
    // /galleries/724441/eden-ivy-pornstars.html#performer
    // /724441/eden-ivy-pornstars.html?qs=Eden%20Ivy
    const pornstarMatch = details.url.match(/\/(\d+)\/[^\/]*pornstars\.html/);
    if (!pornstarMatch) {
      return;
    }

    console.log('🌟 Pornstar Redirect: Detected pornstar URL:', details.url);

    // Get settings to check if pornstar redirect is enabled
    const result = await chrome.storage.sync.get(["privatevod_settings"]);
    const settings = result.privatevod_settings || {};

    if (!settings.autoRedirectPornstarUrls) {
      console.log('🌟 Pornstar Redirect: Disabled in settings');
      return;
    }

    const castId = pornstarMatch[1];
    const redirectUrl = `https://www.privatevod.com/shop-streaming-video-by-scene.html?cast=${castId}`;

    console.log('🌟 Pornstar Redirect: Redirecting to:', redirectUrl);
    // Redirect immediately - page is already marked as visited
    chrome.tabs.update(details.tabId, { url: redirectUrl });
  } catch (error) {
    console.error('🌟 Pornstar Redirect: Error:', error);
  }
});

// =============================================================================
//                    🔗 LINK MERGING FUNCTIONALITY 🔗
// =============================================================================

// Link Merging functionality - inject script to merge title with image links
function initLinkMerging() {
  console.log('🔗 Link Merging: Module initialized');
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
      // Check if page is fully loaded and matches our target
      if (changeInfo.status === 'complete' && 
          tab.url && 
          tab.url.includes('privatevod.com')) {
        
        console.log('🔗 Link Merging: Detected PrivateVOD page:', tab.url);
        
        // Check if page is accessible (not error page)
        if (tab.status === 'complete' && !tab.url.includes('chrome-error://') && !tab.url.includes('chrome://')) {
          // Get settings to check if link merging is enabled
          const result = await chrome.storage.sync.get(["privatevod_settings"]);
          const settings = result.privatevod_settings || {};

          if (!settings.enabled || !settings.mergeTitleWithImageLinks) {
            console.log('🔗 Link Merging: Disabled in settings');
            return;
          }
          
          // Directly inject the link merging function into main world
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: linkMergingScript,
            world: 'MAIN'
          });
          
          console.log('✅ Link Merging: Function injected successfully');
        } else {
          console.log('🔗 Link Merging: Skipping error page or inaccessible tab');
        }
      }
    } catch (err) {
      // Only log error if it's not a frame error (which is expected when page changes/refreshes)
      if (!err.message.includes('Frame with ID 0 is showing error page') && 
          !err.message.includes('Frame with ID 0 was removed') &&
          !err.message.includes('No tab with id:')) {
        console.error('❌ Link Merging: Function injection failed:', err);
      } else {
        console.log('🔗 Link Merging: Skipped injection (page changed/refreshed)');
      }
    }
  });
}

// =============================================================================
//                    🔗 LINK MERGING MAIN WORLD SCRIPT 🔗
// =============================================================================

// Link Merging main world script
function linkMergingScript() {
  'use strict';
  
  console.log('🔗 Link Merging: Script loaded on:', window.location.href);
  
  class LinkMerger {
    constructor() {
      this.isEnabled = false;
      this.observer = null;
      this.processedElements = new WeakSet();
    }

    async init() {
      try {
        this.isEnabled = true;
        console.log('🔗 Link Merging: Initializing...');

        // Process existing content
        this.processAllGridItems();

        // Start watching for new content
        this.startObserving();
        
        console.log('✅ Link Merging: Initialized successfully');
      } catch (error) {
        console.error('❌ Link Merging: Initialization failed:', error);
      }
    }

    processAllGridItems() {
      // Find all grid items - broader selectors for all page types
      const gridItems = document.querySelectorAll(
        '.grid-item, .scene-list-view-container, [data-category="GridViewScene"], [data-category="Item Page"], article.scene-widget, .scene-widget',
      );

      console.log(`🔗 Link Merging: Found ${gridItems.length} grid items to process`);

      gridItems.forEach((gridItem, index) => {
        this.processGridItem(gridItem, index);
      });
    }

    processGridItem(gridItem, index) {
      if (this.processedElements.has(gridItem)) {
        return;
      }

      // Find all links in this grid item - only scene-related links (exclude pornstar profile links)
      const allLinks = gridItem.querySelectorAll(
        'a[href*="/private-vod-"], a[href*="private-vod-"], a[href*="streaming-scene-video"]',
      );

      if (allLinks.length === 0) {
        this.processedElements.add(gridItem);
        return;
      }

      // Check if all links are the same
      const uniqueUrls = [
        ...new Set(Array.from(allLinks).map((link) => link.href)),
      ];
      if (uniqueUrls.length === 1) {
        this.processedElements.add(gridItem);
        return;
      }

      // Find the canonical URL (relative format, no AMP encoding)
      let canonicalUrl = null;

      for (const link of allLinks) {
        const href = link.href;
        // Prefer relative URLs over full URLs
        if (href.startsWith("/") && !href.includes("&amp;")) {
          canonicalUrl = href;
          break;
        }
      }

      // If no relative URL found, normalize the first URL
      if (!canonicalUrl) {
        const firstLink = allLinks[0];
        canonicalUrl = firstLink.href
          .replace("https://www.privatevod.com", "")
          .replace("https://privatevod.com", "")
          .replace(/&amp;/g, "&");
      }

      // Update all links to use canonical URL
      let updatedCount = 0;
      allLinks.forEach((link) => {
        if (link.href !== canonicalUrl) {
          link.href = canonicalUrl;
          updatedCount++;
        }
      });

      if (updatedCount > 0) {
        console.log(`🔗 Link Merging: Updated ${updatedCount} links in grid item ${index}`);
      }

      this.processedElements.add(gridItem);
    }

    startObserving() {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if this is a grid item
                if (
                  node.matches &&
                  node.matches(
                    '.grid-item, .scene-list-view-container, [data-category="GridViewScene"], [data-category="Item Page"], article.scene-widget, .scene-widget',
                  )
                ) {
                  this.processGridItem(node, "new");
                }
                // Check for grid items within the added node
                const gridItems =
                  node.querySelectorAll &&
                  node.querySelectorAll(
                    '.grid-item, .scene-list-view-container, [data-category="GridViewScene"], [data-category="Item Page"], article.scene-widget, .scene-widget',
                  );
                if (gridItems) {
                  gridItems.forEach((gridItem, index) => {
                    this.processGridItem(gridItem, `new-${index}`);
                  });
                }
              }
            });
          }
        });
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Initialize when DOM is ready
  (async function initLinkMerger() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        const linkMerger = new LinkMerger();
        linkMerger.init();
      });
    } else {
      const linkMerger = new LinkMerger();
      linkMerger.init();
    }
  })();
}

// =============================================================================
//                    🔗 INITIALIZE LINK MERGING 🔗
// =============================================================================

// Initialize Link Merging
initLinkMerging();

// =============================================================================
// =============================================================================
// =============================================================================
//                    🎬 AUTO VIDEO LOADER FUNCTIONALITY 🎬
// =============================================================================
// =============================================================================
// =============================================================================

// =============================================================================
//                    🎬 AUTO VIDEO LOADER INITIALIZATION 🎬
// =============================================================================

// Auto Video Loader functionality
function initAutoVideoLoader() {
  console.log('🎬 Auto Video Loader: Module initialized');
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
      // Check if page is fully loaded and matches our target
      if (changeInfo.status === 'complete' && 
          tab.url && 
          (tab.url.includes('privatevod.com') && 
           (tab.url.includes('video.html') || tab.url.includes('videos.html')))) {
        
        console.log('🎬 Auto Video Loader: Detected video page:', tab.url);
        
        // Check if page is accessible (not error page)
        if (tab.status === 'complete' && !tab.url.includes('chrome-error://') && !tab.url.includes('chrome://')) {
          // Get settings to check if autoplay is enabled
          const result = await chrome.storage.sync.get(["privatevod_settings"]);
          const settings = result.privatevod_settings || {};

          if (!settings.enabled || !settings.autoplay) {
            console.log('🎬 Auto Video Loader: Autoplay disabled in settings');
            return;
          }
          
          // Directly inject the main function into main world
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: autoVideoLoaderScript,
            world: 'MAIN'
          });
          
          console.log('✅ Auto Video Loader: Function injected successfully');
        } else {
          console.log('🎬 Auto Video Loader: Skipping error page or inaccessible tab');
        }
      }
    } catch (err) {
      // Only log error if it's not a frame error (which is expected on error pages)
      if (!err.message.includes('Frame with ID 0 is showing error page')) {
        console.error('❌ Auto Video Loader: Function injection failed:', err);
      } else {
        console.log('🎬 Auto Video Loader: Skipped injection on error page');
      }
    }
  });
}

// =============================================================================
//                    🎬 AUTO VIDEO LOADER MAIN WORLD SCRIPT 🎬
// =============================================================================

// Auto Video Loader main world script
function autoVideoLoaderScript() {
  'use strict';
  
  console.log('🎬 Auto Video Loader: Script loaded on:', window.location.href);
  
  // Initialize video protection
  (async function initVideoProtection() {
    try {
      // Video protection is already initialized by content script
      console.log('🎬 Auto Video Loader: Video protection handled by content script');
    } catch (error) {
      console.log('⚠️ Auto Video Loader: Video protection initialization failed:', error);
    }
  })();
  
  function waitForConditions() {
    const conditions = {
      AEVideoPlayer: (() => {
        try {
          return typeof AEVideoPlayer === 'function';
        } catch (e) {
          return false;
        }
      })(),
      jQuery: typeof $ !== 'undefined',
      loadPlayer: typeof window.loadPlayer === 'function'
    };
    
    console.log('🔍 Auto Video Loader: Checking conditions:', conditions);
    
    if (conditions.AEVideoPlayer && conditions.jQuery && conditions.loadPlayer) {
      console.log('✅ Auto Video Loader: All conditions met - calling loadPlayer()');
      
      // Check if player is already initialized to avoid multiple calls
      if (typeof player !== 'undefined' && player && player.element) {
        console.log('🎬 Auto Video Loader: Player already exists, skipping loadPlayer()');
        return;
      }
      
      // Call loadPlayer() to initialize the player
      window.loadPlayer();
      
      // Wait for player to be fully initialized
      const waitForPlayerReady = async () => {
        if (typeof player !== 'undefined' && player && player.element && typeof player.play === 'function') {
          // Check if player is actually ready (not just initialized)
          const iframe = player.element;
          if (iframe && iframe.src) {
            console.log('🎬 Auto Video Loader: Player fully ready, attempting to play');
            
            try {
              // Use safe play with AbortError protection
              const playPromise = player.play();
              
              if (playPromise !== undefined) {
                playPromise.then(() => {
                  console.log('✅ Auto Video Loader: Video started playing successfully');
                }).catch(error => {
                  if (error.name === 'AbortError') {
                    console.log('⚠️ Auto Video Loader: Play was aborted (normal behavior)');
                  } else if (error.name === 'NotAllowedError') {
                    console.log('⚠️ Auto Video Loader: Autoplay blocked by browser policy');
                  } else {
                    console.log('⚠️ Auto Video Loader: Play failed:', error.name);
                  }
                });
              }
            } catch (error) {
              console.log('⚠️ Auto Video Loader: Error calling play():', error);
            }
            
            // Handle iframe autoplay if needed
            if (iframe.src && iframe.src.includes('autoplay=true')) {
              iframe.src = iframe.src.replace('&autoplay=true', '&autoplay=false');
              console.log('✅ Auto Video Loader: Autoplay disabled in iframe URL');
            }
          } else {
            // Player not fully ready yet, wait a bit more
            setTimeout(() => waitForPlayerReady(), 200);
          }
        } else {
          // Player not ready yet, wait a bit more
          setTimeout(() => waitForPlayerReady(), 200);
        }
      };
      
      // Start waiting for player to be ready
      setTimeout(() => waitForPlayerReady(), 500);
      
    } else {
      setTimeout(waitForConditions, 50);
    }
  }
  
  waitForConditions();
}

// =============================================================================
//                    🎬 INITIALIZE AUTO VIDEO LOADER 🎬
// =============================================================================

// Initialize Auto Video Loader
initAutoVideoLoader();

// =============================================================================
// =============================================================================
// =============================================================================
//                    📸 SCREENSHOT GALLERY FUNCTIONALITY 📸
// =============================================================================
// =============================================================================
// =============================================================================

// =============================================================================
//                    📸 SCREENSHOT GALLERY INITIALIZATION 📸
// =============================================================================

// Screenshot Gallery functionality
function initScreenshotGallery() {
  console.log('📸 Screenshot Gallery: Module initialized');
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
      // Check if page is fully loaded and matches our target
      if (changeInfo.status === 'complete' && 
          tab.url && 
          (tab.url.includes('privatevod.com') && 
           (tab.url.includes('video.html') || tab.url.includes('videos.html')))) {
        
        console.log('📸 Screenshot Gallery: Detected video page:', tab.url);
        
        // Get settings to check if screenshot automation is enabled
        const result = await chrome.storage.sync.get(["privatevod_settings"]);
        const settings = result.privatevod_settings || {};

        if (!settings.enabled || !settings.autoScreenshotModal) {
          console.log('📸 Screenshot Gallery: Screenshot automation disabled in settings');
          return;
        }
        
        // Directly inject the screenshot gallery function into main world
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: screenshotGalleryScript,
          world: 'MAIN'
        });
        
        console.log('✅ Screenshot Gallery: Function injected successfully');
      }
    } catch (err) {
      // Only log error if it's not a frame error (which is expected when page changes/refreshes)
      if (!err.message.includes('Frame with ID 0 is showing error page') && 
          !err.message.includes('Frame with ID 0 was removed') &&
          !err.message.includes('No tab with id:')) {
        console.error('❌ Screenshot Gallery: Function injection failed:', err);
      } else {
        console.log('📸 Screenshot Gallery: Skipped injection (page changed/refreshed)');
      }
    }
  });
}

// =============================================================================
//                    📸 SCREENSHOT GALLERY MAIN WORLD SCRIPT 📸
// =============================================================================

// Screenshot Gallery main world script
function screenshotGalleryScript() {
  'use strict';

  function createScreenshotGallery() {
    console.log('📸 Screenshot Gallery: Creating PrivateVOD Screenshot Gallery...');
    
    // Look for recommendations section first, then fallback to scenes container
    let targetContainer = document.querySelector('#recommendations');
    if (!targetContainer) {
      targetContainer = document.querySelector('#scenes');
    }
    
    if (!targetContainer) {
      console.log('❌ Screenshot Gallery: Not on a video page - neither recommendations nor scenes container found');
      return;
    }
    
    const scripts = document.querySelectorAll('script');
    let allUrls = [];
    
    scripts.forEach(script => {
      const content = script.textContent || script.innerHTML;
      if (content.includes('carouselActive')) {
        const urls = content.match(/https:\/\/[^"'\s]+\.jpg/g);
        if (urls) allUrls.push(...urls);
      }
    });
    
    if (allUrls.length === 0) {
      console.log('❌ Screenshot Gallery: No screenshot URLs found');
      return;
    }
    
    const uniqueUrls = [...new Set(allUrls)].sort((a, b) => {
      const timestampA = a.match(/_(\d+)_1280c\.jpg$/);
      const timestampB = b.match(/_(\d+)_1280c\.jpg$/);
      return timestampA && timestampB ? parseInt(timestampA[1]) - parseInt(timestampB[1]) : 0;
    });
    
    console.log(`📸 Screenshot Gallery: Found ${uniqueUrls.length} unique screenshots`);
    
    const existingGallery = document.querySelector('#screenshotGallery');
    if (existingGallery) existingGallery.remove();
    
    // Create gallery structure safely
    const gallery = document.createElement('div');
    gallery.id = 'screenshotGallery';
    gallery.style.cssText = 'width: 100%; padding: 20px 0;';
    
    const title = document.createElement('h4');
    title.style.cssText = 'padding: 0 15px;';
    title.textContent = `Screenshots (${uniqueUrls.length})`;
    gallery.appendChild(title);
    
    const row = document.createElement('div');
    row.className = 'row';
    row.style.cssText = 'margin: 0;';
    
    uniqueUrls.forEach((url, index) => {
      // Validate URL for security
      try {
        const urlObj = new URL(url);
        if (!urlObj.protocol.startsWith('http')) {
          console.warn('📸 Screenshot Gallery: Skipping invalid URL:', url);
          return;
        }
      } catch (e) {
        console.warn('📸 Screenshot Gallery: Skipping malformed URL:', url);
        return;
      }
      
      const col = document.createElement('div');
      col.className = 'col-md-2 col-sm-4 col-6 mb-3';
      col.style.cssText = 'padding: 0 5px;';
      
      const img = document.createElement('img');
      img.src = url;
      img.className = 'img-fluid rounded screenshot-thumbnail';
      img.style.cssText = 'width: 100%; height: auto; cursor: pointer; border: 1px solid #ddd; transition: transform 0.2s;';
      img.loading = 'lazy';
      img.title = `Screenshot ${index + 1}`;
      
      // Add safe event listeners instead of inline handlers
      img.addEventListener('click', () => window.open(url, '_blank'));
      img.addEventListener('error', () => img.style.display = 'none');
      img.addEventListener('mouseover', () => img.style.transform = 'scale(1.05)');
      img.addEventListener('mouseout', () => img.style.transform = 'scale(1)');
      
      col.appendChild(img);
      row.appendChild(col);
    });
    
    gallery.appendChild(row);
    targetContainer.insertAdjacentElement('beforebegin', gallery);
    console.log(`✅ Screenshot Gallery: Created with ${uniqueUrls.length} images above ${targetContainer.id}!`);
  }

  createScreenshotGallery();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createScreenshotGallery);
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      createScreenshotGallery();
    }
  }).observe(document, { subtree: true, childList: true });
}

// =============================================================================
//                    📸 INITIALIZE SCREENSHOT GALLERY 📸
// =============================================================================

// Initialize Screenshot Gallery
initScreenshotGallery();

// =============================================================================
// =============================================================================
// =============================================================================
//                    ⭐ AUTO-FAVORITE FUNCTIONALITY ⭐
// =============================================================================
// =============================================================================
// =============================================================================

// =============================================================================
//                    ⭐ AUTO-FAVORITE INITIALIZATION ⭐
// =============================================================================

// Common Auto-Favorite functionality
function initAutoFavorite() {
  console.log('⭐ Auto-Favorite: Module initialized');
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
      // Check if page is fully loaded and matches our target
      if (changeInfo.status === 'complete' && 
          tab.url && 
          tab.url.includes('privatevod.com')) {
        
        // Determine page type and settings
        let pageType = '';
        let settingName = '';
        let closeSettingName = '';
        
        if (tab.url.includes('video.html') || tab.url.includes('videos.html')) {
          pageType = 'Video';
          settingName = 'autoFavoriteVideo';
          closeSettingName = 'autoCloseAfterFavoriteVideo';
        } else if (tab.url.includes('pornstars.html')) {
          pageType = 'Star';
          settingName = 'autoFavoriteStar';
          closeSettingName = 'autoCloseAfterFavoriteStar';
        } else {
          return; // Not a target page
        }
        
        console.log(`⭐ Auto-Favorite ${pageType}: Detected page:`, tab.url);
        
        // Get settings to check if auto-favorite is enabled
        const result = await chrome.storage.sync.get(["privatevod_settings"]);
        const settings = result.privatevod_settings || {};

        if (!settings.enabled || !settings[settingName]) {
          console.log(`⭐ Auto-Favorite ${pageType}: Auto-favorite disabled in settings`);
          return;
        }
        
        // Pass settings to the injected script
        const shouldAutoClose = settings[closeSettingName];
        
        // Directly inject the auto-favorite function into main world
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: autoFavoriteScript,
          args: [pageType, shouldAutoClose],
          world: 'MAIN'
        });
        
        console.log(`✅ Auto-Favorite ${pageType}: Function injected successfully`);
      }
    } catch (err) {
      // Only log error if it's not a frame error (which is expected when page changes/refreshes)
      if (!err.message.includes('Frame with ID 0 is showing error page') && 
          !err.message.includes('Frame with ID 0 was removed') &&
          !err.message.includes('No tab with id:')) {
        console.error('❌ Auto-Favorite: Function injection failed:', err);
      } else {
        console.log('⭐ Auto-Favorite: Skipped injection (page changed/refreshed)');
      }
    }
  });
}

// =============================================================================
//                    ⭐ AUTO-FAVORITE MAIN WORLD SCRIPT ⭐
// =============================================================================

// Common Auto-Favorite main world script
function autoFavoriteScript(pageType, shouldAutoClose) {
  'use strict';
  
  console.log(`⭐ Auto-Favorite ${pageType}: Script loaded on:`, window.location.href);
  console.log('⭐ Auto-Favorite: Auto-close enabled:', shouldAutoClose);
  
  async function performAutoFavorite() {
    try {
      // Look for favorite button with ToggleProductFavorite onclick
      const favoriteButton = document.querySelector('a[onclick*="ToggleProductFavorite"]');
      
      if (!favoriteButton) {
        console.log(`⭐ Auto-Favorite ${pageType}: No favorite button found`);
        return;
      }
      
      // Check if already favorited (has 'active' class)
      const alreadyFavorited = favoriteButton.classList.contains('active');
      
      if (alreadyFavorited) {
        console.log(`⭐ Auto-Favorite ${pageType}: Already favorited`);
      } else {
        // Click the button using simple click method
        favoriteButton.click();
        console.log(`✅ Auto-Favorite ${pageType}: Button clicked successfully`);
      }
      
      // Handle auto-close if enabled
      if (shouldAutoClose) {
        if (alreadyFavorited) {
          console.log(`⭐ Auto-Favorite ${pageType}: Auto-close enabled, closing tab immediately (already favorited)`);
          window.close();
        } else {
          console.log(`⭐ Auto-Favorite ${pageType}: Auto-close enabled, waiting for favorite to complete`);
          
          // Wait for the favorite action to complete by checking for the 'active' class
          const checkFavoriteComplete = () => {
            return new Promise((resolve) => {
              const maxAttempts = 10; // Maximum 5 seconds (10 * 500ms)
              let attempts = 0;
              
              const checkInterval = setInterval(() => {
                attempts++;
                
                // Check if the button now has the 'active' class (favorited)
                if (favoriteButton.classList.contains('active')) {
                  console.log(`✅ Auto-Favorite ${pageType}: Favorite completed successfully`);
                  clearInterval(checkInterval);
                  resolve(true);
                } else if (attempts >= maxAttempts) {
                  console.log(`⚠️ Auto-Favorite ${pageType}: Timeout waiting for favorite to complete`);
                  clearInterval(checkInterval);
                  resolve(false);
                }
              }, 500); // Check every 500ms
            });
          };
          
          // Wait for favorite to complete, then close tab
          checkFavoriteComplete().then((success) => {
            if (success) {
              console.log(`⭐ Auto-Favorite ${pageType}: Closing tab after successful favorite`);
            } else {
              console.log(`⭐ Auto-Favorite ${pageType}: Closing tab despite favorite timeout`);
            }
            window.close();
          });
        }
      }
      
    } catch (error) {
      console.error(`❌ Auto-Favorite ${pageType}: Error during auto-favorite:`, error);
    }
  }
  
  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', performAutoFavorite);
  } else {
    performAutoFavorite();
  }
}

// =============================================================================
//                    ⭐ INITIALIZE AUTO-FAVORITE ⭐
// =============================================================================

// Initialize Auto-Favorite
initAutoFavorite();

// =============================================================================
// =============================================================================
// =============================================================================
// =============================================================================
// =============================================================================
//                    🎬 VIDEO HIDING FUNCTIONALITY 🎬
// =============================================================================
// =============================================================================
// =============================================================================

// =============================================================================
//                    🎬 VIDEO HIDING INITIALIZATION 🎬
// =============================================================================

// Video Hiding functionality
function initVideoHiding() {
  console.log('🎬 Video Hiding: Module initialized');
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
      // Check if page is fully loaded and matches our target
      if (changeInfo.status === 'complete' && 
          tab.url && 
          tab.url.includes('privatevod.com')) {
        
        console.log('🎬 Video Hiding: Detected PrivateVOD page:', tab.url);
        
        // Get settings to check if video hiding is enabled
        const result = await chrome.storage.sync.get(["privatevod_settings"]);
        const settings = result.privatevod_settings || {};

        if (!settings.enabled || (!settings.hideLikedVideos && !settings.hideFavoritedVideos)) {
          console.log('🎬 Video Hiding: Video hiding disabled in settings');
          return;
        }

        // Get favorites and likes data from IndexedDB to pass to the injected script
        const [favorites, likes] = await Promise.all([
          dbManager.getFavorites(),
          dbManager.getLikes()
        ]);

        const favoritesArray = Array.from(favorites);
        const likesArray = Array.from(likes);
        
        // Directly inject the video hiding function into main world with data
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: videoHidingScript,
          args: [settings, favoritesArray, likesArray],
          world: 'MAIN'
        });
        
        console.log('✅ Video Hiding: Function injected successfully');
      }
    } catch (err) {
      // Only log error if it's not a frame error (which is expected when page changes/refreshes)
      if (!err.message.includes('Frame with ID 0 is showing error page') && 
          !err.message.includes('Frame with ID 0 was removed') &&
          !err.message.includes('No tab with id:')) {
        console.error('❌ Video Hiding: Function injection failed:', err);
      } else {
        console.log('🎬 Video Hiding: Skipped injection (page changed/refreshed)');
      }
    }
  });
}

// =============================================================================
//                    🎬 VIDEO HIDING MAIN WORLD SCRIPT 🎬
// =============================================================================

// Video Hiding main world script
function videoHidingScript(settings, favorites, likes) {
  'use strict';
  
  console.log('🎬 Video Hiding: Script loaded on:', window.location.href);
  console.log('🎬 Video Hiding: Settings:', settings);
  console.log('🎬 Video Hiding: Favorites count:', favorites.length);
  console.log('🎬 Video Hiding: Likes count:', likes.length);
  
  // Define VideoHider class first
  class VideoHider {
    constructor(settings, favorites, likes) {
      this.settings = settings;
      this.favorites = new Set(favorites);
      this.likes = new Set(likes);
      this.observer = null;
      this.isActive = false;
    }

    async init() {
      try {
        this.isActive = true;
        console.log('🎬 Video Hiding: Initializing...');

        // Skip video hiding on favorites page - user wants to see their own favorites
        if (window.location.pathname.includes("/account/scenes/favorites")) {
          console.log('🎬 Video Hiding: Skipping favorites page');
          return;
        }

        // Process existing videos
        await this.processCurrentPage();

        // Start monitoring for new videos
        this.startVideoMonitoring();
        
        console.log('✅ Video Hiding: Initialized successfully');
      } catch (error) {
        console.error('❌ Video Hiding: Initialization failed:', error);
      }
    }

    async processCurrentPage() {
      try {
        const sceneIdsOnPage = this.getAllSceneIdsOnPage();

        if (sceneIdsOnPage.length === 0) {
          console.log('🎬 Video Hiding: No videos found on page');
          return;
        }

        console.log(`🎬 Video Hiding: Found ${sceneIdsOnPage.length} videos on page`);

        // Use the data passed from background script
        const favorites = this.favorites;
        const likes = this.settings.hideLikedVideos ? this.likes : new Set();

        const videosToHide = new Set();

        // Add favorited videos to hide list (highest priority)
        if (this.settings.hideFavoritedVideos) {
          sceneIdsOnPage.forEach((sceneId) => {
            if (favorites.has(sceneId)) {
              videosToHide.add(sceneId);
            }
          });
        }

        // Add liked videos to hide list (only if NOT favorited)
        if (this.settings.hideLikedVideos) {
          sceneIdsOnPage.forEach((sceneId) => {
            // Only hide if liked AND not favorited (manually liked only)
            if (likes.has(sceneId) && !favorites.has(sceneId)) {
              videosToHide.add(sceneId);
            }
          });
        }

        // Hide videos that should be hidden
        if (videosToHide.size > 0) {
          this.hideVideos(Array.from(videosToHide));
          console.log(`🎬 Video Hiding: Hidden ${videosToHide.size} videos`);
        }

        // Show videos that should be visible (not in hide list)
        const videosToShow = sceneIdsOnPage.filter(
          (sceneId) => !videosToHide.has(sceneId),
        );
        if (videosToShow.length > 0) {
          this.showVideos(videosToShow);
          console.log(`🎬 Video Hiding: Showed ${videosToShow.length} videos`);
        }
      } catch (error) {
        console.error('❌ Video Hiding: Error processing page:', error);
      }
    }

    getAllVideos() {
      // Get all grid items that contain video links with scene ID in href
      const allGridItems = Array.from(document.querySelectorAll('.grid-item'));
      return allGridItems.filter(item => {
        // Check if it has a link with scene ID pattern in href
        const links = item.querySelectorAll('a[href*="/"][href*="-video.html"]');
        return links.length > 0;
      });
    }

    getSceneIdFromVideoElement(videoElement) {
      // Extract scene ID from href - all videos have scene ID in href
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

    getAllSceneIdsOnPage() {
      const videos = this.getAllVideos();
      return videos.map(video => this.getSceneIdFromVideoElement(video)).filter(id => id !== null);
    }

    hideVideo(sceneId) {
      // Find ALL video elements by scene ID in href (handle duplicates)
      const allVideos = this.getAllVideos();
      const videoElements = allVideos.filter(video => this.getSceneIdFromVideoElement(video) === sceneId);
      
      videoElements.forEach(videoElement => {
        videoElement.style.display = 'none';
        videoElement.setAttribute('data-hidden-by-extension', 'true');
      });
      
      if (videoElements.length > 0) {
        console.log(`🎬 Video Hiding: Hidden ${videoElements.length} video(s) with scene ID ${sceneId}`);
      }
    }

    showVideo(sceneId) {
      // Find ALL video elements by scene ID in href (handle duplicates)
      const allVideos = this.getAllVideos();
      const videoElements = allVideos.filter(video => this.getSceneIdFromVideoElement(video) === sceneId);
      
      videoElements.forEach(videoElement => {
        videoElement.style.display = '';
        videoElement.removeAttribute('data-hidden-by-extension');
      });
      
      if (videoElements.length > 0) {
        console.log(`🎬 Video Hiding: Showed ${videoElements.length} video(s) with scene ID ${sceneId}`);
      }
    }

    hideVideos(sceneIds) {
      sceneIds.forEach(sceneId => this.hideVideo(sceneId));
    }

    showVideos(sceneIds) {
      sceneIds.forEach(sceneId => this.showVideo(sceneId));
    }

    startVideoMonitoring() {
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if the added node is a video element (any format)
                if (this.isVideoElement(node)) {
                  this.processNewVideo(node);
                }
                // Check if the added node contains video elements
                const videoElements = node.querySelectorAll && node.querySelectorAll('.grid-item');
                if (videoElements) {
                  videoElements.forEach((video) => {
                    if (this.isVideoElement(video)) {
                      this.processNewVideo(video);
                    }
                  });
                }
              }
            });
          }
        });
      });

      // Wait for document body to be available before observing
      if (document.body) {
        this.observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      } else {
        // If document.body is not available, wait for DOMContentLoaded
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => {
            if (document.body) {
              this.observer.observe(document.body, {
                childList: true,
                subtree: true,
              });
            }
          });
        } else {
          // Document is already loaded but body is not available, try again later
          setTimeout(() => {
            if (document.body) {
              this.observer.observe(document.body, {
                childList: true,
                subtree: true,
              });
            }
          }, 100);
        }
      }
    }

    isVideoElement(element) {
      if (!element || !element.classList) return false;
      
      // Check if it's a grid-item with video content (href format only)
      if (element.classList.contains('grid-item')) {
        // Check for href format (links with scene ID in href)
        const links = element.querySelectorAll('a[href*="/"][href*="-video.html"]');
        return links.length > 0;
      }
      
      return false;
    }

    async processNewVideo(videoElement) {
      try {
        const sceneId = this.getSceneIdFromVideoElement(videoElement);
        if (!sceneId) return;

        const shouldHide = await this.shouldHideVideo(sceneId);
        if (shouldHide) {
          this.hideVideo(sceneId);
          console.log(`🎬 Video Hiding: Hidden new video ${sceneId}`);
        }
      } catch (error) {
        console.error('❌ Video Hiding: Error processing new video:', error);
      }
    }

    async shouldHideVideo(sceneId) {
      if (!this.settings.hideLikedVideos && !this.settings.hideFavoritedVideos) {
        return false;
      }

      // Use the data passed from background script
      const favorites = this.favorites;
      const likes = this.settings.hideLikedVideos ? this.likes : new Set();

      // Hide if favorited and hide favorited videos is enabled (highest priority)
      if (this.settings.hideFavoritedVideos && favorites.has(sceneId)) {
        return true;
      }

      // Hide if liked BUT NOT favorited and hide liked videos is enabled (manually liked only)
      if (
        this.settings.hideLikedVideos &&
        likes.has(sceneId) &&
        !favorites.has(sceneId)
      ) {
        return true;
      }

      return false;
    }


    stop() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.isActive = false;
    }
  }

  // Make VideoHider globally available
  window.VideoHider = VideoHider;

  // Initialize when DOM is ready
  (async function initVideoHider() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        const videoHider = new VideoHider(settings, favorites, likes);
        videoHider.init();
        // Store instance globally for refresh capability
        window.videoHiderInstance = videoHider;
      });
    } else {
      const videoHider = new VideoHider(settings, favorites, likes);
      videoHider.init();
      // Store instance globally for refresh capability
      window.videoHiderInstance = videoHider;
    }
  })();
}

// =============================================================================
//                    🎬 INITIALIZE VIDEO HIDING 🎬
// =============================================================================

// Initialize Video Hiding
initVideoHiding();

// =============================================================================
//                    🎬 VIDEO HIDING STORAGE MONITORING 🎬
// =============================================================================

// Monitor storage changes for video hiding updates
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  try {
    // Check if settings changed
    if (namespace === "sync" && changes.privatevod_settings) {
      const newSettings = changes.privatevod_settings.newValue;
      const oldSettings = changes.privatevod_settings.oldValue;

      // Check if hiding settings changed
      if (
        newSettings.hideLikedVideos !== oldSettings.hideLikedVideos ||
        newSettings.hideFavoritedVideos !== oldSettings.hideFavoritedVideos
      ) {
        console.log('🎬 Video Hiding: Settings changed, updating all PrivateVOD tabs');
        await updateVideoHidingOnAllTabs(newSettings);
      }
    }

    // Note: IndexedDB changes are handled via message passing, not storage events
    // The video hiding will be updated when content scripts send messages about changes
  } catch (error) {
    console.error('❌ Video Hiding: Error handling storage changes:', error);
  }
});

// Update video hiding on all PrivateVOD tabs
async function updateVideoHidingOnAllTabs(settings = null) {
  try {
    // Get all tabs
    const tabs = await chrome.tabs.query({ url: "*://*.privatevod.com/*" });
    
    if (tabs.length === 0) {
      console.log('🎬 Video Hiding: No PrivateVOD tabs found');
      return;
    }

    // Get current settings if not provided
    if (!settings) {
      const result = await chrome.storage.sync.get(["privatevod_settings"]);
      settings = result.privatevod_settings || {};
    }

    // Get favorites and likes data from IndexedDB
    const [favorites, likes] = await Promise.all([
      dbManager.getFavorites(),
      dbManager.getLikes()
    ]);

    const favoritesArray = Array.from(favorites);
    const likesArray = Array.from(likes);

    // Update each tab
    for (const tab of tabs) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: refreshVideoHidingScript,
          args: [settings, favoritesArray, likesArray],
          world: 'MAIN'
        });
        console.log(`✅ Video Hiding: Updated tab ${tab.id}`);
      } catch (error) {
        console.error(`❌ Video Hiding: Failed to update tab ${tab.id}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Video Hiding: Error updating tabs:', error);
  }
}

// Script to refresh video hiding on a page
function refreshVideoHidingScript(settings, favorites, likes) {
  'use strict';
  
  console.log('🎬 Video Hiding: Refreshing video hiding with new settings');
  
  // Check if VideoHider class is available
  if (typeof window.VideoHider === 'undefined') {
    console.error('❌ Video Hiding: VideoHider class not available, cannot refresh');
    return;
  }
  
  // Find existing video hider instance and refresh it
  if (window.videoHiderInstance) {
    window.videoHiderInstance.settings = settings;
    window.videoHiderInstance.favorites = new Set(favorites);
    window.videoHiderInstance.likes = new Set(likes);
    window.videoHiderInstance.processCurrentPage();
  } else {
    // If no instance exists, create a new one
    const videoHider = new window.VideoHider(settings, favorites, likes);
    videoHider.init();
    window.videoHiderInstance = videoHider;
  }
}

// =============================================================================
// =============================================================================
// =============================================================================
//                    🗄️ INDEXEDDB STORAGE SYSTEM 🗄️
// =============================================================================
// =============================================================================
// =============================================================================

// =============================================================================
//                    🗄️ INDEXEDDB DATABASE MANAGER 🗄️
// =============================================================================

// IndexedDB Database Manager - Complete replacement for chrome.storage.local
class IndexedDBManager {
  constructor() {
    this.dbName = 'PrivateVODExtensionDB';
    this.dbVersion = 1;
    this.db = null;
    this.isInitialized = false;
  }

  // Initialize IndexedDB database
  async init() {
    if (this.isInitialized) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('🗄️ IndexedDB: Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('✅ IndexedDB: Database initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('🗄️ IndexedDB: Upgrading database to version', this.dbVersion);

        // Create object stores
        if (!db.objectStoreNames.contains('favorites')) {
          const favoritesStore = db.createObjectStore('favorites', { keyPath: 'sceneId' });
          favoritesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('likes')) {
          const likesStore = db.createObjectStore('likes', { keyPath: 'sceneId' });
          likesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        console.log('✅ IndexedDB: Database schema created successfully');
      };
    });
  }

  // Get database instance (initialize if needed)
  async getDB() {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.db;
  }

  // Generic method to perform database operations
  async performOperation(storeName, operation, data = null) {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      return new Promise((resolve, reject) => {
        let request;

        switch (operation) {
          case 'get':
            request = store.get(data);
            break;
          case 'getAll':
            request = store.getAll();
            break;
          case 'add':
            request = store.add(data);
            break;
          case 'put':
            request = store.put(data);
            break;
          case 'delete':
            request = store.delete(data);
            break;
          case 'clear':
            request = store.clear();
            break;
          case 'count':
            request = store.count();
            break;
          default:
            reject(new Error(`Unknown operation: ${operation}`));
            return;
        }

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`🗄️ IndexedDB: Error performing ${operation} on ${storeName}:`, error);
      throw error;
    }
  }

  // =============================================================================
  //                    ⭐ FAVORITES MANAGEMENT ⭐
  // =============================================================================

  // Get all favorites
  async getFavorites() {
    try {
      const favorites = await this.performOperation('favorites', 'getAll');
      return new Set(favorites.map(item => item.sceneId));
    } catch (error) {
      console.error('🗄️ IndexedDB: Error getting favorites:', error);
      return new Set();
    }
  }

  // Add favorite
  async addFavorite(sceneId) {
    try {
      const favoriteData = {
        sceneId: sceneId,
        timestamp: Date.now()
      };
      await this.performOperation('favorites', 'put', favoriteData);
      console.log(`✅ IndexedDB: Added favorite ${sceneId}`);
      return true;
    } catch (error) {
      console.error('🗄️ IndexedDB: Error adding favorite:', error);
      return false;
    }
  }

  // Remove favorite
  async removeFavorite(sceneId) {
    try {
      await this.performOperation('favorites', 'delete', sceneId);
      console.log(`✅ IndexedDB: Removed favorite ${sceneId}`);
      return true;
    } catch (error) {
      console.error('🗄️ IndexedDB: Error removing favorite:', error);
      return false;
    }
  }

  // Check if scene is favorited
  async isFavorited(sceneId) {
    try {
      const favorite = await this.performOperation('favorites', 'get', sceneId);
      return favorite !== undefined;
    } catch (error) {
      console.error('🗄️ IndexedDB: Error checking if favorited:', error);
      return false;
    }
  }

  // Clear all favorites
  async clearAllFavorites() {
    try {
      await this.performOperation('favorites', 'clear');
      console.log('✅ IndexedDB: Cleared all favorites');
      return true;
    } catch (error) {
      console.error('🗄️ IndexedDB: Error clearing favorites:', error);
      return false;
    }
  }

  // =============================================================================
  //                    ❤️ LIKES MANAGEMENT ❤️
  // =============================================================================

  // Get all likes
  async getLikes() {
    try {
      const likes = await this.performOperation('likes', 'getAll');
      return new Set(likes.map(item => item.sceneId));
    } catch (error) {
      console.error('🗄️ IndexedDB: Error getting likes:', error);
      return new Set();
    }
  }

  // Add like
  async addLike(sceneId) {
    try {
      const likeData = {
        sceneId: sceneId,
        timestamp: Date.now()
      };
      await this.performOperation('likes', 'put', likeData);
      console.log(`✅ IndexedDB: Added like ${sceneId}`);
      return true;
    } catch (error) {
      console.error('🗄️ IndexedDB: Error adding like:', error);
      return false;
    }
  }

  // Remove like
  async removeLike(sceneId) {
    try {
      await this.performOperation('likes', 'delete', sceneId);
      console.log(`✅ IndexedDB: Removed like ${sceneId}`);
      return true;
    } catch (error) {
      console.error('🗄️ IndexedDB: Error removing like:', error);
      return false;
    }
  }

  // Check if scene is liked
  async isLiked(sceneId) {
    try {
      const like = await this.performOperation('likes', 'get', sceneId);
      return like !== undefined;
    } catch (error) {
      console.error('🗄️ IndexedDB: Error checking if liked:', error);
      return false;
    }
  }

  // Clear all likes
  async clearAllLikes() {
    try {
      await this.performOperation('likes', 'clear');
      console.log('✅ IndexedDB: Cleared all likes');
      return true;
    } catch (error) {
      console.error('🗄️ IndexedDB: Error clearing likes:', error);
      return false;
    }
  }

  // =============================================================================
  //                    📊 STORAGE STATISTICS 📊
  // =============================================================================

  // Get storage statistics
  async getStorageStats() {
    try {
      const [favorites, likes] = await Promise.all([
        this.getFavorites(),
        this.getLikes()
      ]);

      return {
        favoritesCount: favorites.size,
        likesCount: likes.size,
        favorites: Array.from(favorites),
        likes: Array.from(likes)
      };
    } catch (error) {
      console.error('🗄️ IndexedDB: Error getting storage stats:', error);
      return {
        favoritesCount: 0,
        likesCount: 0,
        favorites: [],
        likes: []
      };
    }
  }

}

// =============================================================================
//                    🗄️ GLOBAL INDEXEDDB INSTANCE 🗄️
// =============================================================================

// Create global IndexedDB manager instance
const dbManager = new IndexedDBManager();

// Initialize IndexedDB on service worker startup
(async function initIndexedDB() {
  try {
    await dbManager.init();
    console.log('✅ IndexedDB: Initialized successfully');
  } catch (error) {
    console.error('❌ IndexedDB: Initialization failed:', error);
  }
})();

// =============================================================================
// =============================================================================
// =============================================================================
//                    💬 MESSAGE HANDLING SYSTEM 💬
// =============================================================================
// =============================================================================
// =============================================================================

// =============================================================================
//                    💬 RUNTIME MESSAGE HANDLER 💬
// =============================================================================

// Enhanced message handling with IndexedDB support
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('💬 Message Handler: Received message:', request.action);
  
  // Handle different actions
  if (request.action === "ping") {
    console.log('💬 Message Handler: Responding to ping');
    sendResponse({ success: true, message: "Service worker is active" });
  } else if (request.action === "closeTab") {
    console.log('💬 Message Handler: Closing tab');
    // Close the tab that sent the message (the tab where content script is running)
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
      sendResponse({ success: true, message: "Tab closed" });
    } else {
      sendResponse({ success: false, message: "No tab ID found" });
    }
  } else if (request.action === "getFavorites") {
    // Get all favorites from IndexedDB
    dbManager.getFavorites().then(favorites => {
      sendResponse({ success: true, data: Array.from(favorites) });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "getLikes") {
    // Get all likes from IndexedDB
    dbManager.getLikes().then(likes => {
      sendResponse({ success: true, data: Array.from(likes) });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "addFavorite") {
    // Add favorite to IndexedDB
    dbManager.addFavorite(request.sceneId).then(success => {
      sendResponse({ success: success });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "removeFavorite") {
    // Remove favorite from IndexedDB
    dbManager.removeFavorite(request.sceneId).then(success => {
      sendResponse({ success: success });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "addLike") {
    // Add like to IndexedDB
    dbManager.addLike(request.sceneId).then(success => {
      sendResponse({ success: success });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "removeLike") {
    // Remove like from IndexedDB
    dbManager.removeLike(request.sceneId).then(success => {
      sendResponse({ success: success });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "isFavorited") {
    // Check if scene is favorited
    dbManager.isFavorited(request.sceneId).then(isFavorited => {
      sendResponse({ success: true, data: isFavorited });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "isLiked") {
    // Check if scene is liked
    dbManager.isLiked(request.sceneId).then(isLiked => {
      sendResponse({ success: true, data: isLiked });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "getStorageStats") {
    // Get storage statistics
    dbManager.getStorageStats().then(stats => {
      sendResponse({ success: true, data: stats });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "clearAllFavorites") {
    // Clear all favorites
    dbManager.clearAllFavorites().then(success => {
      sendResponse({ success: success });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "clearAllLikes") {
    // Clear all likes
    dbManager.clearAllLikes().then(success => {
      sendResponse({ success: success });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else if (request.action === "refreshVideoHiding") {
    // Refresh video hiding on all tabs when favorites/likes change
    updateVideoHidingOnAllTabs().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate async response
  } else {
    console.log('💬 Message Handler: Unknown action:', request.action);
    sendResponse({ success: false, message: "Unknown action" });
  }

  return true; // Indicate async response
});
