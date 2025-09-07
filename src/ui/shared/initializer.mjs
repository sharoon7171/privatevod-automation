/**
 * Shared Initialization Logic for UI Pages
 * Page initialization utilities
 */

import { getSettings, onSettingsChange } from '../../shared/settings.mjs';
import { getAllUIElements, validateElements } from './dom-manager.mjs';
import { setupEventListeners } from './event-handlers.mjs';
import { createUIUpdater } from './ui-updater.mjs';

/**
 * Initialize UI page with shared logic
 * @param {string} pageName - Name of the page (for logging)
 * @returns {Promise<Object>} Initialization result with elements and updateUI function
 */
export async function initializePage(pageName = "UI Page") {
  try {
    // Get all UI elements
    const elements = getAllUIElements();
    
    // Validate that all required elements are present
    if (!validateElements(elements)) {
      throw new Error('Missing required DOM elements');
    }
    
    // Load current settings
    const settings = await getSettings();
    
    // Create UI updater function
    const updateUI = createUIUpdater(elements);
    
    // Update UI with current settings
    updateUI(settings);
    
    // Setup event listeners
    setupEventListeners(elements, updateUI);
    
    // Listen for settings changes from other pages
    onSettingsChange(updateUI);
    
    return {
      elements,
      updateUI,
      settings
    };
    
  } catch (error) {
    console.error(`Error initializing ${pageName}:`, error);
    throw error;
  }
}

/**
 * Initialize UI page with DOMContentLoaded event (simplified version)
 * @param {string} pageName - Name of the page
 */
export function initializeUIPage(pageName = "UI Page") {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await initializePage(pageName);
    } catch (error) {
      console.error(`Failed to initialize ${pageName}:`, error);
    }
  });
}
