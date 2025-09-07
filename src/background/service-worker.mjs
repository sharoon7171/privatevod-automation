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
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  try {
    // Only process main frame navigations (not iframes)
    if (details.frameId !== 0) return;
    
    // Check if this is a studio URL - matches ID/studio/ pattern
    const studioMatch = details.url.match(/(\d+)\/studio\//);
    if (!studioMatch) return;
    
    // Get settings to check if studio redirect is enabled
    const result = await chrome.storage.sync.get(['privatevod_settings']);
    const settings = result.privatevod_settings || {};
    
    if (!settings.autoRedirectStudioUrls) return;
    
    const studioId = studioMatch[1];
    const redirectUrl = `https://www.privatevod.com/watch-streaming-video-by-scene.html?sort=released&studio=${studioId}`;
    
    console.log(`Studio Redirect: Redirecting from ${details.url} to ${redirectUrl}`);
    
    // Cancel the current navigation and redirect to the new URL
    chrome.tabs.update(details.tabId, { url: redirectUrl });
    
  } catch (error) {
    console.error('Studio Redirect: Error in service worker:', error);
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
