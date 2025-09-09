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
      
      // Call loadPlayer() to initialize the player
      window.loadPlayer();
      
      // Wait a bit for the player to initialize, then handle autoplay
      setTimeout(() => {
        try {
          // Check if player object exists and has play method
          if (typeof player !== 'undefined' && player && typeof player.play === 'function') {
            console.log('🎬 Auto Video Loader: Player ready, attempting to play');
            
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
          }
          
          // Also handle iframe autoplay if needed
          const iframe = document.querySelector('#player iframe');
          if (iframe && iframe.src && iframe.src.includes('autoplay=true')) {
            iframe.src = iframe.src.replace('&autoplay=true', '&autoplay=false');
            console.log('✅ Auto Video Loader: Autoplay disabled in iframe URL');
          }
        } catch (error) {
          console.log('⚠️ Auto Video Loader: Error in post-loadPlayer handling:', error);
        }
      }, 1000); // Increased delay to let player fully initialize
      
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
