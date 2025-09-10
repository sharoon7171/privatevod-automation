/**
 * PrivateVOD Automation - Service Worker
 * Minimal service worker with basic structure only
 * No background functionality as per project requirements
 */

// Service worker installation
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Service worker activation
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Handle action click - open options page
chrome.action.onClicked.addListener((tab) => {
  chrome.runtime.openOptionsPage();
});

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

    // Get settings to check if studio redirect is enabled
    const result = await chrome.storage.sync.get(["privatevod_settings"]);
    const settings = result.privatevod_settings || {};

    if (!settings.autoRedirectStudioUrls) {
      return;
    }

    const studioId = studioMatch[1];
    const redirectUrl = `https://www.privatevod.com/watch-streaming-video-by-scene.html?sort=released&studio=${studioId}`;

    // Redirect immediately - page is already marked as visited
    chrome.tabs.update(details.tabId, { url: redirectUrl });
  } catch (error) {}
});

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

    // Get settings to check if pornstar redirect is enabled
    const result = await chrome.storage.sync.get(["privatevod_settings"]);
    const settings = result.privatevod_settings || {};

    if (!settings.autoRedirectPornstarUrls) {
      return;
    }

    const castId = pornstarMatch[1];
    const redirectUrl = `https://www.privatevod.com/shop-streaming-video-by-scene.html?cast=${castId}`;

    // Redirect immediately - page is already marked as visited
    chrome.tabs.update(details.tabId, { url: redirectUrl });
  } catch (error) {}
});

// =============================================================================
// =============================================================================
// =============================================================================
//                    🎬 AUTO VIDEO LOADER FUNCTIONALITY 🎬
// =============================================================================
// =============================================================================
// =============================================================================

// Auto Video Loader functionality
function initAutoVideoLoader() {
  console.log('🎬 Auto Video Loader module initialized');
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
      // Check if page is fully loaded and matches our target
      if (changeInfo.status === 'complete' && 
          tab.url && 
          (tab.url.includes('privatevod.com') && 
           (tab.url.includes('video.html') || tab.url.includes('videos.html')))) {
        
        console.log('🎬 Auto Video Loader detected video page:', tab.url);
        
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
        
        console.log('✅ Auto Video Loader function injected successfully');
      }
    } catch (err) {
      console.log('❌ Auto Video Loader function injection failed:', err);
    }
  });
}

// =============================================================================
//                    🎬 AUTO VIDEO LOADER MAIN WORLD SCRIPT 🎬
// =============================================================================

// Auto Video Loader main world script
function autoVideoLoaderScript() {
  'use strict';
  
  console.log('🎬 Auto Video Loader script loaded on:', window.location.href);
  
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
    
    console.log('🔍 Auto Video Loader checking conditions:', conditions);
    
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

// Screenshot Gallery functionality
function initScreenshotGallery() {
  console.log('📸 Screenshot Gallery module initialized');
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
      // Check if page is fully loaded and matches our target
      if (changeInfo.status === 'complete' && 
          tab.url && 
          (tab.url.includes('privatevod.com') && 
           (tab.url.includes('video.html') || tab.url.includes('videos.html')))) {
        
        console.log('📸 Screenshot Gallery detected video page:', tab.url);
        
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
        
        console.log('✅ Screenshot Gallery function injected successfully');
      }
    } catch (err) {
      console.log('❌ Screenshot Gallery function injection failed:', err);
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
    console.log('🎬 Creating PrivateVOD Screenshot Gallery...');
    
    const scenesContainer = document.querySelector('#scenes');
    if (!scenesContainer) {
      console.log('❌ Not on a video page - scenes container not found');
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
      console.log('❌ No screenshot URLs found');
      return;
    }
    
    const uniqueUrls = [...new Set(allUrls)].sort((a, b) => {
      const timestampA = a.match(/_(\d+)_1280c\.jpg$/);
      const timestampB = b.match(/_(\d+)_1280c\.jpg$/);
      return timestampA && timestampB ? parseInt(timestampA[1]) - parseInt(timestampB[1]) : 0;
    });
    
    console.log(`Found ${uniqueUrls.length} unique screenshots`);
    
    const existingGallery = document.querySelector('#screenshotGallery');
    if (existingGallery) existingGallery.remove();
    
    const galleryHTML = `
      <div id="screenshotGallery" style="width: 100%; padding: 20px 0;">
        <h4 style="padding: 0 15px;">Screenshots (${uniqueUrls.length})</h4>
        <div class="row" style="margin: 0;">
          ${uniqueUrls.map((url, index) => `
            <div class="col-md-2 col-sm-4 col-6 mb-3" style="padding: 0 5px;">
              <img src="${url}" 
                   class="img-fluid rounded screenshot-thumbnail" 
                   style="width: 100%; height: auto; cursor: pointer; border: 1px solid #ddd; transition: transform 0.2s;" 
                   onclick="window.open('${url}', '_blank')" 
                   onerror="this.style.display='none'" 
                   loading="lazy" 
                   title="Screenshot ${index + 1}" 
                   onmouseover="this.style.transform='scale(1.05)'" 
                   onmouseout="this.style.transform='scale(1)'">
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    scenesContainer.insertAdjacentHTML('beforebegin', galleryHTML);
    console.log(`✅ Screenshot gallery created with ${uniqueUrls.length} images!`);
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

// Common Auto-Favorite functionality
function initAutoFavorite() {
  console.log('⭐ Auto-Favorite module initialized');
  
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
        
        console.log(`⭐ Auto-Favorite ${pageType} detected page:`, tab.url);
        
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
        
        console.log(`✅ Auto-Favorite ${pageType} function injected successfully`);
      }
    } catch (err) {
      console.log('❌ Auto-Favorite function injection failed:', err);
    }
  });
}

// =============================================================================
//                    ⭐ AUTO-FAVORITE MAIN WORLD SCRIPT ⭐
// =============================================================================

// Common Auto-Favorite main world script
function autoFavoriteScript(pageType, shouldAutoClose) {
  'use strict';
  
  console.log(`⭐ Auto-Favorite ${pageType} script loaded on:`, window.location.href);
  console.log('⭐ Auto-close enabled:', shouldAutoClose);
  
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
      console.log(`❌ Auto-Favorite ${pageType}: Error during auto-favorite:`, error);
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


// Basic message handling (minimal structure)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle different actions
  if (request.action === "ping") {
    sendResponse({ success: true, message: "Service worker is active" });
  } else if (request.action === "closeTab") {
    // Close the tab that sent the message (the tab where content script is running)
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
      sendResponse({ success: true, message: "Tab closed" });
    } else {
      sendResponse({ success: false, message: "No tab ID found" });
    }
  }

  return true; // Indicate async response
});
