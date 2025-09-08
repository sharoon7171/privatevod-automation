/**
 * Link Merger Content Script
 * Normalize all links to use the same canonical URL format
 */

class LinkMerger {
  constructor() {
    this.isEnabled = false;
    this.observer = null;
    this.processedElements = new WeakSet();
  }

  async init() {
    try {
      // Load settings
      const { getSettings } = await import(
        chrome.runtime.getURL("core/settings.mjs")
      );
      const settings = await getSettings();

      if (!settings.mergeTitleWithImageLinks) {
        return;
      }

      this.isEnabled = true;

      // Process existing content
      this.processAllGridItems();

      // Start watching for new content
      this.startObserving();
    } catch (error) {}
  }

  processAllGridItems() {
    // Find all grid items - broader selectors for all page types
    const gridItems = document.querySelectorAll(
      '.grid-item, .scene-list-view-container, [data-category="GridViewScene"], [data-category="Item Page"], article.scene-widget, .scene-widget',
    );

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
