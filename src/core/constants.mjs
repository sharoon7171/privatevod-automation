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
  enabled: true,
  autoFavoriteVideo: false,
  autoCloseAfterFavoriteVideo: false,
  autoFavoriteStar: false,
  autoCloseAfterFavoriteStar: false,
  autoScreenshotModal: false,
};

/**
 * CSS selectors used across content scripts
 */
export const SELECTORS = {
  FAVORITE_BUTTON: 'a[onclick*="ToggleProductFavorite"]',
};

/**
 * Extension configuration constants
 */
export const EXTENSION_CONFIG = {
  NAME: "PrivateVOD Automation",
  VERSION: "1.0.0",
  AUTHOR: "SQ Tech",
  WEBSITE: "https://sqtech.dev",
};

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  SETTINGS: "privatevod_settings",
};

