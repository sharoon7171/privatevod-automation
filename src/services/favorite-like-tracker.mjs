/**
 * Favorite and Like Tracker Service
 * Main service for tracking and managing favorite/like status
 */

import { extractSceneId, isVideoPage } from '../functions/dom/scene-id-extractor.mjs';
import { getButtonStatus, getBothButtonStatus, getButtonType, getSceneIdFromButton, isButtonActive } from '../functions/dom/button-status-tracker.mjs';
import { 
  addFavorite, 
  removeFavorite, 
  addLike, 
  removeLike, 
  isFavorited, 
  isLiked,
  getStorageStats
} from './storage/favorite-like-storage.mjs';

/**
 * Main tracker class
 */
export class FavoriteLikeTracker {
  constructor() {
    this.isTracking = false;
    this.observer = null;
    this.currentSceneId = null;
    this.storageChangeListeners = [];
  }

  /**
   * Start tracking favorite and like status
   */
  async startTracking() {
    if (this.isTracking) {
      console.log('Favorite/Like Tracker: Already tracking');
      return;
    }

    if (!isVideoPage()) {
      console.log('Favorite/Like Tracker: Not a video page, skipping');
      return;
    }

    this.currentSceneId = extractSceneId();
    if (!this.currentSceneId) {
      console.log('Favorite/Like Tracker: No scene ID found, skipping');
      return;
    }

    console.log(`Favorite/Like Tracker: Starting tracking for scene ${this.currentSceneId}`);
    this.isTracking = true;

    // Initial status check and sync
    await this.syncCurrentStatus();

    // Start monitoring for changes
    this.startStatusMonitoring();
  }

  /**
   * Stop tracking
   */
  stopTracking() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isTracking = false;
    console.log('Favorite/Like Tracker: Stopped tracking');
  }

  /**
   * Sync current button status with storage
   */
  async syncCurrentStatus() {
    try {
      const status = getBothButtonStatus();
      
      // Sync favorite status - only update if status actually changed
      if (status.favorite.sceneId === this.currentSceneId) {
        const isCurrentlyFavorited = await isFavorited(this.currentSceneId);
        if (status.favorite.isActive && !isCurrentlyFavorited) {
          await addFavorite(this.currentSceneId);
          console.log(`Favorite/Like Tracker: Scene ${this.currentSceneId} is favorited - added to storage`);
          this.notifyStorageChange(this.currentSceneId, 'favorite', true);
        } else if (!status.favorite.isActive && isCurrentlyFavorited) {
          await removeFavorite(this.currentSceneId);
          console.log(`Favorite/Like Tracker: Scene ${this.currentSceneId} is not favorited - removed from storage`);
          this.notifyStorageChange(this.currentSceneId, 'favorite', false);
        }
      }

      // Sync like status - only update if status actually changed
      if (status.like.sceneId === this.currentSceneId) {
        const isCurrentlyLiked = await isLiked(this.currentSceneId);
        if (status.like.isActive && !isCurrentlyLiked) {
          await addLike(this.currentSceneId);
          console.log(`Favorite/Like Tracker: Scene ${this.currentSceneId} is liked - added to storage`);
          this.notifyStorageChange(this.currentSceneId, 'like', true);
        } else if (!status.like.isActive && isCurrentlyLiked) {
          await removeLike(this.currentSceneId);
          console.log(`Favorite/Like Tracker: Scene ${this.currentSceneId} is not liked - removed from storage`);
          this.notifyStorageChange(this.currentSceneId, 'like', false);
        }
      }

      console.log('Favorite/Like Tracker: Status synced');
    } catch (error) {
      console.error('Favorite/Like Tracker: Error syncing status:', error);
    }
  }

  /**
   * Start monitoring for button status changes
   */
  startStatusMonitoring() {
    // Monitor for class changes on buttons
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.classList.contains('btn') && target.classList.contains('btn-secondary')) {
            this.handleButtonChange(target);
          }
        }
      });
    });

    // Observe all buttons
    const buttons = document.querySelectorAll('.btn.btn-secondary');
    buttons.forEach(button => {
      this.observer.observe(button, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
    });

    console.log('Favorite/Like Tracker: Status monitoring started');
  }

  /**
   * Handle button status change
   * @param {Element} button - Changed button element
   */
  async handleButtonChange(button) {
    try {
      const buttonType = getButtonType(button);
      const sceneId = getSceneIdFromButton(button);
      const isActive = isButtonActive(button);
      
      // Only process if this is for the current scene
      if (sceneId !== this.currentSceneId) {
        return;
      }
      
      if (buttonType === 'favorite') {
        const isCurrentlyFavorited = await isFavorited(this.currentSceneId);
        if (isActive && !isCurrentlyFavorited) {
          await addFavorite(this.currentSceneId);
          console.log(`Favorite/Like Tracker: Scene ${this.currentSceneId} favorited - added to storage`);
          this.notifyStorageChange(this.currentSceneId, 'favorite', true);
        } else if (!isActive && isCurrentlyFavorited) {
          await removeFavorite(this.currentSceneId);
          console.log(`Favorite/Like Tracker: Scene ${this.currentSceneId} unfavorited - removed from storage`);
          this.notifyStorageChange(this.currentSceneId, 'favorite', false);
        }
      } else if (buttonType === 'like') {
        const isCurrentlyLiked = await isLiked(this.currentSceneId);
        if (isActive && !isCurrentlyLiked) {
          await addLike(this.currentSceneId);
          console.log(`Favorite/Like Tracker: Scene ${this.currentSceneId} liked - added to storage`);
          this.notifyStorageChange(this.currentSceneId, 'like', true);
        } else if (!isActive && isCurrentlyLiked) {
          await removeLike(this.currentSceneId);
          console.log(`Favorite/Like Tracker: Scene ${this.currentSceneId} unliked - removed from storage`);
          this.notifyStorageChange(this.currentSceneId, 'like', false);
        }
      }
    } catch (error) {
      console.error('Favorite/Like Tracker: Error handling button change:', error);
    }
  }

  /**
   * Get current tracking status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      isTracking: this.isTracking,
      currentSceneId: this.currentSceneId,
      isVideoPage: isVideoPage()
    };
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage stats
   */
  async getStats() {
    return await getStorageStats();
  }

  /**
   * Add a storage change listener
   * @param {Function} listener - Listener function
   */
  addStorageChangeListener(listener) {
    this.storageChangeListeners.push(listener);
  }

  /**
   * Remove a storage change listener
   * @param {Function} listener - Listener function to remove
   */
  removeStorageChangeListener(listener) {
    const index = this.storageChangeListeners.indexOf(listener);
    if (index > -1) {
      this.storageChangeListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of storage changes
   * @param {string} sceneId - Scene ID that changed
   * @param {string} type - 'favorite' or 'like'
   * @param {boolean} isAdded - Whether the scene ID was added or removed
   */
  notifyStorageChange(sceneId, type, isAdded) {
    this.storageChangeListeners.forEach(listener => {
      try {
        listener(sceneId, type, isAdded);
      } catch (error) {
        console.error('Favorite/Like Tracker: Error notifying listener:', error);
      }
    });
  }
}

// Export singleton instance
export const favoriteLikeTracker = new FavoriteLikeTracker();
