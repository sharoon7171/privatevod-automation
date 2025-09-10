/**
 * PrivateVOD Automation - Video Protection Utilities
 * Prevents AbortError and handles video operations safely
 */

/**
 * Video Protection Class
 * Handles video play/pause operations safely to prevent AbortError
 */
export class VideoProtection {
  constructor() {
    this.playQueue = new Map();
    this.isPlaying = new Map();
  }

  /**
   * Safely play a video with AbortError protection
   * @param {Object} player - Video player object
   * @param {string} playerId - Unique identifier for the player
   * @returns {Promise<boolean>} - Success status
   */
  async safePlay(player, playerId = 'default') {
    try {
      // Check if player is already playing
      if (this.isPlaying.get(playerId)) {
        console.log('🎬 Video Protection: Player already playing, skipping');
        return true;
      }

      // Clear any pending play operations
      if (this.playQueue.has(playerId)) {
        clearTimeout(this.playQueue.get(playerId));
        this.playQueue.delete(playerId);
      }

      // Wait for player to be ready
      if (player.readyState !== undefined && player.readyState < 3) {
        console.log('🎬 Video Protection: Waiting for player to be ready...');
        await this.waitForPlayerReady(player);
      }

      // Mark as playing
      this.isPlaying.set(playerId, true);

      // Attempt to play with timeout protection
      const playPromise = player.play();
      
      if (playPromise !== undefined) {
        // Set a timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          console.log('🎬 Video Protection: Play timeout, attempting pause');
          this.safePause(player, playerId);
        }, 5000);

        try {
          await playPromise;
          clearTimeout(timeoutId);
          console.log('✅ Video Protection: Video started playing successfully');
          return true;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      }

      return true;
    } catch (error) {
      this.isPlaying.set(playerId, false);
      
      if (error.name === 'AbortError') {
        console.log('⚠️ Video Protection: Play was aborted (normal behavior)');
        return false;
      } else if (error.name === 'NotAllowedError') {
        console.log('⚠️ Video Protection: Autoplay blocked by browser policy');
        return false;
      } else {
        console.error('❌ Video Protection: Play error:', error);
        return false;
      }
    }
  }

  /**
   * Safely pause a video
   * @param {Object} player - Video player object
   * @param {string} playerId - Unique identifier for the player
   * @returns {Promise<boolean>} - Success status
   */
  async safePause(player, playerId = 'default') {
    try {
      // Clear any pending play operations
      if (this.playQueue.has(playerId)) {
        clearTimeout(this.playQueue.get(playerId));
        this.playQueue.delete(playerId);
      }

      // Mark as not playing
      this.isPlaying.set(playerId, false);

      // Pause the video
      player.pause();
      console.log('✅ Video Protection: Video paused successfully');
      return true;
    } catch (error) {
      console.error('❌ Video Protection: Pause error:', error);
      return false;
    }
  }

  /**
   * Wait for player to be ready
   * @param {Object} player - Video player object
   * @returns {Promise<void>}
   */
  async waitForPlayerReady(player) {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (player.readyState >= 3) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  /**
   * Queue a play operation to prevent conflicts
   * @param {Object} player - Video player object
   * @param {string} playerId - Unique identifier for the player
   * @param {number} delay - Delay in milliseconds
   * @returns {Promise<boolean>} - Success status
   */
  async queuePlay(player, playerId = 'default', delay = 100) {
    return new Promise((resolve) => {
      // Clear any existing queue
      if (this.playQueue.has(playerId)) {
        clearTimeout(this.playQueue.get(playerId));
      }

      const timeoutId = setTimeout(async () => {
        this.playQueue.delete(playerId);
        const result = await this.safePlay(player, playerId);
        resolve(result);
      }, delay);

      this.playQueue.set(playerId, timeoutId);
    });
  }

  /**
   * Reset player state
   * @param {string} playerId - Unique identifier for the player
   */
  resetPlayer(playerId = 'default') {
    if (this.playQueue.has(playerId)) {
      clearTimeout(this.playQueue.get(playerId));
      this.playQueue.delete(playerId);
    }
    this.isPlaying.set(playerId, false);
  }

  /**
   * Get player status
   * @param {string} playerId - Unique identifier for the player
   * @returns {Object} - Player status
   */
  getPlayerStatus(playerId = 'default') {
    return {
      isPlaying: this.isPlaying.get(playerId) || false,
      hasQueuedPlay: this.playQueue.has(playerId)
    };
  }
}

/**
 * Global video protection instance
 */
export const videoProtection = new VideoProtection();

/**
 * Enhanced video player wrapper with protection
 */
export class ProtectedVideoPlayer {
  constructor(player, playerId = 'default') {
    this.player = player;
    this.playerId = playerId;
    this.protection = videoProtection;
  }

  async play() {
    return await this.protection.safePlay(this.player, this.playerId);
  }

  async pause() {
    return await this.protection.safePause(this.player, this.playerId);
  }

  async queuePlay(delay = 100) {
    return await this.protection.queuePlay(this.player, this.playerId, delay);
  }

  reset() {
    this.protection.resetPlayer(this.playerId);
  }

  getStatus() {
    return this.protection.getPlayerStatus(this.playerId);
  }
}

/**
 * Utility function to create a protected player
 * @param {Object} player - Video player object
 * @param {string} playerId - Unique identifier for the player
 * @returns {ProtectedVideoPlayer} - Protected player instance
 */
export function createProtectedPlayer(player, playerId = 'default') {
  return new ProtectedVideoPlayer(player, playerId);
}

/**
 * Global error handler for video operations
 */
export function setupVideoErrorHandling() {
  // Handle unhandled video errors
  window.addEventListener('error', (event) => {
    if (event.error && event.error.name === 'AbortError') {
      console.log('🎬 Video Protection: Global AbortError caught and handled');
      event.preventDefault();
      return true;
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.name === 'AbortError') {
      console.log('🎬 Video Protection: Global AbortError promise rejection caught');
      event.preventDefault();
      return true;
    }
  });
}

/**
 * Initialize video protection system
 */
export function initVideoProtection() {
  console.log('🎬 Video Protection: Initializing...');
  setupVideoErrorHandling();
  console.log('✅ Video Protection: Initialized successfully');
}
