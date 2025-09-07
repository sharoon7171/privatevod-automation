/**
 * Shared Constants for PrivateVOD Automation Extension
 * Centralized constants and default values
 */

/**
 * Default settings for all features
 * Used by content scripts and UI pages
 */
export const DEFAULT_SETTINGS = {
  autoplay: false,
  timer: 0,
  enabled: true,
  autoFavoriteVideo: false,
  autoFavoriteVideoTimer: 0,
  autoCloseAfterFavoriteVideo: false,
  autoFavoriteStar: false,
  autoFavoriteStarTimer: 0,
  autoCloseAfterFavoriteStar: false
};

/**
 * CSS selectors used across content scripts
 */
export const SELECTORS = {
  TARGET_BUTTON: '#ppmWatchNow',
  FAVORITE_BUTTON: 'a[onclick*="ToggleProductFavorite"]'
};

/**
 * Extension configuration constants
 */
export const EXTENSION_CONFIG = {
  NAME: 'PrivateVOD Automation',
  VERSION: '1.0.0',
  AUTHOR: 'SQ Tech',
  WEBSITE: 'https://sqtech.dev'
};

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  SETTINGS: 'privatevod_settings'
};

/**
 * Timer limits
 */
export const TIMER_LIMITS = {
  MIN: 0,
  MAX: 10
};
