/**
 * Video Hiding Service
 * Manages hiding/showing videos based on settings and storage
 */

import {
  hideVideo,
  showVideo,
  hideVideos,
  showVideos,
  getAllSceneIdsOnPage,
} from "../functions/dom/video-hider.mjs";
import { getFavorites, getLikes } from "./storage/favorite-like-storage.mjs";
import { getSettings } from "../core/settings.mjs";

/**
 * Main video hiding service class
 */
export class VideoHidingService {
  constructor() {
    this.isActive = false;
    this.observer = null;
    this.currentSettings = null;
  }

  /**
   * Start the video hiding service
   */
  async start() {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.currentSettings = await getSettings();

    // Process current page immediately
    await this.processCurrentPage();

    // Start monitoring for new videos
    this.startVideoMonitoring();
  }

  /**
   * Stop the video hiding service
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isActive = false;
  }

  /**
   * Process current page for video hiding
   */
  async processCurrentPage() {
    try {
      // Skip video hiding on favorites page - user wants to see their own favorites
      if (window.location.pathname.includes("/account/scenes/favorites")) {
        return;
      }

      const settings = await getSettings();
      this.currentSettings = settings;

      if (!settings.hideLikedVideos && !settings.hideFavoritedVideos) {
        // If both options are disabled, show all videos
        const sceneIdsOnPage = getAllSceneIdsOnPage();
        if (sceneIdsOnPage.length > 0) {
          showVideos(sceneIdsOnPage);
        }
        return;
      }

      const sceneIdsOnPage = getAllSceneIdsOnPage();

      if (sceneIdsOnPage.length === 0) {
        return;
      }

      const [favorites, likes] = await Promise.all([
        getFavorites(), // Always load favorites to check if video is favorited
        settings.hideLikedVideos ? getLikes() : new Set(),
      ]);

      const videosToHide = new Set();

      // Add favorited videos to hide list (highest priority)
      if (settings.hideFavoritedVideos) {
        sceneIdsOnPage.forEach((sceneId) => {
          if (favorites.has(sceneId)) {
            videosToHide.add(sceneId);
          }
        });
      }

      // Add liked videos to hide list (only if NOT favorited)
      if (settings.hideLikedVideos) {
        sceneIdsOnPage.forEach((sceneId) => {
          // Only hide if liked AND not favorited (manually liked only)
          if (likes.has(sceneId) && !favorites.has(sceneId)) {
            videosToHide.add(sceneId);
          }
        });
      }

      // Hide videos that should be hidden
      if (videosToHide.size > 0) {
        hideVideos(Array.from(videosToHide));
      }

      // Show videos that should be visible (not in hide list)
      const videosToShow = sceneIdsOnPage.filter(
        (sceneId) => !videosToHide.has(sceneId),
      );
      if (videosToShow.length > 0) {
        showVideos(videosToShow);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Start monitoring for new videos being added to the page
   */
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

  /**
   * Check if an element is a video element (any format)
   * @param {Element} element - Element to check
   * @returns {boolean} Whether the element is a video element
   */
  isVideoElement(element) {
    if (!element || !element.classList) return false;
    
    // Check if it's a grid-item with video content
    if (element.classList.contains('grid-item')) {
      // Check for ascene_ format
      if (element.id && element.id.startsWith('ascene_')) {
        return true;
      }
      
      // Check for data-scene-id format
      if (element.querySelector('[data-scene-id]')) {
        return true;
      }
      
      // Check for href format (links with scene ID pattern)
      const links = element.querySelectorAll('a[href*="/"][href*="-video.html"]');
      if (links.length > 0) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Process a newly added video element
   * @param {Element} videoElement - New video element
   */
  async processNewVideo(videoElement) {
    try {
      // Import the getSceneIdFromVideoElement function
      const { getSceneIdFromVideoElement } = await import('../functions/dom/video-hider.mjs');
      
      const sceneId = getSceneIdFromVideoElement(videoElement);
      if (!sceneId || !this.currentSettings) return;

      const shouldHide = await this.shouldHideVideo(
        sceneId,
        this.currentSettings,
      );
      if (shouldHide) {
        hideVideo(sceneId);
      }
    } catch (error) {}
  }

  /**
   * Check if a video should be hidden based on current settings
   * @param {string} sceneId - Scene ID to check
   * @param {Object} settings - Current settings
   * @returns {boolean} Whether the video should be hidden
   */
  async shouldHideVideo(sceneId, settings) {
    if (!settings.hideLikedVideos && !settings.hideFavoritedVideos) {
      return false;
    }

    const [favorites, likes] = await Promise.all([
      getFavorites(), // Always load favorites to check if video is favorited
      settings.hideLikedVideos ? getLikes() : new Set(),
    ]);

    // Hide if favorited and hide favorited videos is enabled (highest priority)
    if (settings.hideFavoritedVideos && favorites.has(sceneId)) {
      return true;
    }

    // Hide if liked BUT NOT favorited and hide liked videos is enabled (manually liked only)
    if (
      settings.hideLikedVideos &&
      likes.has(sceneId) &&
      !favorites.has(sceneId)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Refresh hiding for all videos on current page
   */
  async refreshHiding() {
    await this.processCurrentPage();
  }
}

// Export singleton instance
export const videoHidingService = new VideoHidingService();
