/**
 * PrivateVOD Automation - Service Worker
 * Minimal service worker with basic structure only
 * No background functionality as per project requirements
 */

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('PrivateVOD Automation service worker installing...');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('PrivateVOD Automation service worker activating...');
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
    
    console.log('Studio Redirect: Checking URL:', details.url);
    
    // Check if this is a studio URL - matches ID/studio/ pattern
    const studioMatch = details.url.match(/(\d+)\/studio\//);
    if (!studioMatch) {
      console.log('Studio Redirect: No match for URL:', details.url);
      return;
    }
    
    console.log('Studio Redirect: Matched URL pattern, studio ID:', studioMatch[1]);
    
    // Get settings to check if studio redirect is enabled
    const result = await chrome.storage.sync.get(['privatevod_settings']);
    const settings = result.privatevod_settings || {};
    
    console.log('Studio Redirect: Settings loaded:', settings);
    console.log('Studio Redirect: autoRedirectStudioUrls enabled:', settings.autoRedirectStudioUrls);
    
    if (!settings.autoRedirectStudioUrls) {
      console.log('Studio Redirect: Feature disabled, skipping redirect');
      return;
    }
    
    const studioId = studioMatch[1];
    const redirectUrl = `https://www.privatevod.com/watch-streaming-video-by-scene.html?sort=released&studio=${studioId}`;
    
    console.log(`Studio Redirect: Navigation committed, redirecting from ${details.url} to ${redirectUrl}`);
    
    // Redirect immediately - page is already marked as visited
    chrome.tabs.update(details.tabId, { url: redirectUrl });
    
  } catch (error) {
    console.error('Studio Redirect: Error in service worker:', error);
  }
});

// Pornstar URL interception - redirect pornstar URLs to shop page
chrome.webNavigation.onCommitted.addListener(async (details) => {
  try {
    // Only process main frame navigations (not iframes)
    if (details.frameId !== 0) return;
    
    console.log('Pornstar Redirect: Checking URL:', details.url);
    
    // Check if this is a pornstar URL - matches any URL containing pornstars.html
    // Examples:
    // /porn-videos/724441/eden-ivy-pornstars.html
    // /scenes/724441/eden-ivy-pornstars.html#performer
    // /724441/eden-ivy-pornstars.html#performer
    // /galleries/724441/eden-ivy-pornstars.html#performer
    // /724441/eden-ivy-pornstars.html?qs=Eden%20Ivy
    const pornstarMatch = details.url.match(/\/(\d+)\/[^\/]*pornstars\.html/);
    if (!pornstarMatch) {
      console.log('Pornstar Redirect: No match for URL:', details.url);
      return;
    }
    
    console.log('Pornstar Redirect: Matched URL pattern, cast ID:', pornstarMatch[1]);
    
    // Get settings to check if pornstar redirect is enabled
    const result = await chrome.storage.sync.get(['privatevod_settings']);
    const settings = result.privatevod_settings || {};
    
    console.log('Pornstar Redirect: Settings loaded:', settings);
    console.log('Pornstar Redirect: autoRedirectPornstarUrls enabled:', settings.autoRedirectPornstarUrls);
    
    if (!settings.autoRedirectPornstarUrls) {
      console.log('Pornstar Redirect: Feature disabled, skipping redirect');
      return;
    }
    
    const castId = pornstarMatch[1];
    const redirectUrl = `https://www.privatevod.com/shop-streaming-video-by-scene.html?cast=${castId}`;
    
    console.log(`Pornstar Redirect: Navigation committed, redirecting from ${details.url} to ${redirectUrl}`);
    
    // Redirect immediately - page is already marked as visited
    chrome.tabs.update(details.tabId, { url: redirectUrl });
    
  } catch (error) {
    console.error('Pornstar Redirect: Error in service worker:', error);
  }
});


// Basic message handling (minimal structure)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Service worker received message:', request);
  
  // Handle different actions
  if (request.action === 'ping') {
    sendResponse({ success: true, message: 'Service worker is active' });
  } else if (request.action === 'closeTab') {
    // Close the tab that sent the message (the tab where content script is running)
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
      sendResponse({ success: true, message: 'Tab closed' });
    } else {
      sendResponse({ success: false, message: 'No tab ID found' });
    }
  }
  
  return true; // Indicate async response
});

console.log('PrivateVOD Automation service worker loaded');
console.log('Service worker debugging enabled - check console for redirect logs');
