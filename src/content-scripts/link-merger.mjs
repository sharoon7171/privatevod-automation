/**
 * Link Merger Content Script
 * Normalize all links to use the same canonical URL format
 */

console.log('🔗 Link Merger: Script loaded!');

class LinkMerger {
  constructor() {
    this.isEnabled = false;
    this.observer = null;
    this.processedElements = new WeakSet();
  }

  async init() {
    try {
      console.log('🔗 Link Merger: Starting...');
      
      // Load settings
      const { getSettings } = await import(chrome.runtime.getURL('core/settings.mjs'));
      const settings = await getSettings();
      
      console.log('🔗 Link Merger: Settings loaded:', settings.mergeTitleWithImageLinks);
      
      if (!settings.mergeTitleWithImageLinks) {
        console.log('🔗 Link Merger: Feature disabled, exiting');
        return;
      }

      this.isEnabled = true;
      
      // Process existing content
      this.processAllGridItems();
      
      // Start watching for new content
      this.startObserving();
      
    } catch (error) {
      console.error('🔗 Link Merger error:', error);
    }
  }

  processAllGridItems() {
    // Find all grid items - broader selectors for all page types
    const gridItems = document.querySelectorAll('.grid-item, .scene-list-view-container, [data-category="GridViewScene"], [data-category="Item Page"], article.scene-widget, .scene-widget');
    console.log('🔗 Link Merger: Found grid items:', gridItems.length);
    
    gridItems.forEach((gridItem, index) => {
      this.processGridItem(gridItem, index);
    });
  }

  processGridItem(gridItem, index) {
    if (this.processedElements.has(gridItem)) {
      return;
    }

    // Find all links in this grid item - broader selectors
    const allLinks = gridItem.querySelectorAll('a[href*="/private-vod-"], a[href*="private-vod-"], a[href*="streaming-scene-video"], a[href*="porn-videos"]');
    
    if (allLinks.length === 0) {
      console.log(`🔗 Link Merger: No links found in grid item ${index}`);
      this.processedElements.add(gridItem);
      return;
    }
    
    console.log(`🔗 Link Merger: Grid item ${index} has ${allLinks.length} links:`, 
      Array.from(allLinks).map(link => link.href));
    
    // Check if all links are the same
    const uniqueUrls = [...new Set(Array.from(allLinks).map(link => link.href))];
    if (uniqueUrls.length === 1) {
      console.log(`🔗 Link Merger: All links already match: ${uniqueUrls[0]}`);
    } else {
      console.log(`🔗 Link Merger: Found ${uniqueUrls.length} different URLs:`, uniqueUrls);
    }
    
    // Find the canonical URL (relative format, no AMP encoding)
    let canonicalUrl = null;
    
    for (const link of allLinks) {
      const href = link.href;
      // Prefer relative URLs over full URLs
      if (href.startsWith('/') && !href.includes('&amp;')) {
        canonicalUrl = href;
        console.log(`🔗 Link Merger: Found canonical URL: ${canonicalUrl}`);
        break;
      }
    }
    
    // If no relative URL found, normalize the first URL
    if (!canonicalUrl) {
      const firstLink = allLinks[0];
      canonicalUrl = firstLink.href
        .replace('https://www.privatevod.com', '')
        .replace('https://privatevod.com', '')
        .replace(/&amp;/g, '&');
      console.log(`🔗 Link Merger: Normalized canonical URL: ${canonicalUrl}`);
    }
    
    // Update all links to use canonical URL
    let updatedCount = 0;
    allLinks.forEach(link => {
      if (link.href !== canonicalUrl) {
        console.log(`🔗 Link Merger: Updating ${link.href} → ${canonicalUrl}`);
        link.href = canonicalUrl;
        updatedCount++;
      }
    });
    
    console.log(`🔗 Link Merger: Updated ${updatedCount} links in grid item ${index}`);
    this.processedElements.add(gridItem);
  }

  startObserving() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if this is a grid item
              if (node.matches && node.matches('.grid-item, .scene-list-view-container, [data-category="GridViewScene"], [data-category="Item Page"], article.scene-widget, .scene-widget')) {
                console.log('🔗 Link Merger: New grid item detected, processing...');
                this.processGridItem(node, 'new');
              }
              // Check for grid items within the added node
              const gridItems = node.querySelectorAll && node.querySelectorAll('.grid-item, .scene-list-view-container, [data-category="GridViewScene"], [data-category="Item Page"], article.scene-widget, .scene-widget');
              if (gridItems) {
                gridItems.forEach((gridItem, index) => {
                  console.log('🔗 Link Merger: New grid item within added node detected, processing...');
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
      subtree: true
    });

    console.log('🔗 Link Merger: Started observing for new content');
  }
}

// Initialize when DOM is ready
(async function initLinkMerger() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const linkMerger = new LinkMerger();
      linkMerger.init();
    });
  } else {
    const linkMerger = new LinkMerger();
    linkMerger.init();
  }
})();
