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
      }
    } catch (err) {
      console.error('❌ Link Merging: Function injection failed:', err);
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

      // Find all links in this grid item - broader selectors
      const allLinks = gridItem.querySelectorAll(
        'a[href*="/private-vod-"], a[href*="private-vod-"], a[href*="streaming-scene-video"], a[href*="porn-videos"]',
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
      }
    } catch (err) {
      console.error('❌ Auto Video Loader: Function injection failed:', err);
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
      const waitForPlayerReady = () => {
        if (typeof player !== 'undefined' && player && player.element && typeof player.play === 'function') {
          // Check if player is actually ready (not just initialized)
          const iframe = player.element;
          if (iframe && iframe.src) {
            console.log('🎬 Auto Video Loader: Player fully ready, attempting to play');
            
            try {
              // Try to play the video
              const playPromise = player.play();
              
              if (playPromise !== undefined) {
                playPromise.then(() => {
                  console.log('✅ Auto Video Loader: Video started playing successfully');
                }).catch(error => {
                  console.log('⚠️ Auto Video Loader: Play failed (likely autoplay policy):', error.name);
                  // This is normal - browsers often block autoplay
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
            setTimeout(waitForPlayerReady, 200);
          }
        } else {
          // Player not ready yet, wait a bit more
          setTimeout(waitForPlayerReady, 200);
        }
      };
      
      // Start waiting for player to be ready
      setTimeout(waitForPlayerReady, 500);
      
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
      console.error('❌ Screenshot Gallery: Function injection failed:', err);
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
    
    const scenesContainer = document.querySelector('#scenes');
    if (!scenesContainer) {
      console.log('❌ Screenshot Gallery: Not on a video page - scenes container not found');
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
    scenesContainer.insertAdjacentElement('beforebegin', gallery);
    console.log(`✅ Screenshot Gallery: Created with ${uniqueUrls.length} images!`);
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
      console.error('❌ Auto-Favorite: Function injection failed:', err);
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
      if (favoriteButton.classList.contains('active')) {
        console.log(`⭐ Auto-Favorite ${pageType}: Already favorited, skipping`);
        return;
      }
      
      // Click the button using simple click method
      favoriteButton.click();
      console.log(`✅ Auto-Favorite ${pageType}: Button clicked successfully`);
      
      // Handle auto-close if enabled
      if (shouldAutoClose) {
        console.log(`⭐ Auto-Favorite ${pageType}: Auto-close enabled, closing tab immediately`);
        window.close();
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
//                    💬 MESSAGE HANDLING SYSTEM 💬
// =============================================================================
// =============================================================================
// =============================================================================

// =============================================================================
//                    💬 RUNTIME MESSAGE HANDLER 💬
// =============================================================================

// Basic message handling (minimal structure)
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
  } else {
    console.log('💬 Message Handler: Unknown action:', request.action);
    sendResponse({ success: false, message: "Unknown action" });
  }

  return true; // Indicate async response
});
