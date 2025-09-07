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
