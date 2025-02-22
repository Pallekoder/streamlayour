// Monitor dimensions (fixed reference size)
export const MONITOR_WIDTH = 1920;
export const MONITOR_HEIGHT = 1080;

// Grid settings
export const GRID_COLS = 24; // Fixed number of columns
export const GRID_ROW_HEIGHT = 30; // Fixed row height

// Editor scaling (for display purposes only)
export const SCALE_FACTOR = 0.4; // 40% of original size for editor view

// Default window sizes (in grid units)
export const DEFAULT_SIZES = {
  browser: {
    w: 12, // Half width
    h: 18, // Full height
  },
  chat: {
    w: 6, // Quarter width
    h: 18, // Full height
  },
  camera: {
    w: 6, // Quarter width
    h: 6, // Square
  },
  ad: {
    w: 6,
    h: 6,
  },
} as const;

// Window settings
export const WINDOW_SETTINGS = {
  minW: 4,
  minH: 3,
  maxW: 24, // Full width
  maxH: 36, // Full height
} as const; 