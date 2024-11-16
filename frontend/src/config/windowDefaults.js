// src/config/windowDefaults.js
export const DEFAULT_WINDOW_STATE = {
  x: 20,  // Start with fixed offset instead of random
  y: 20,
  width: 589,  // Matches cascade window width
  height: 442, // Matches cascade window height
  isMaximized: false,
  zIndex: 1000
};

export const createWindowState = (options = {}) => {
  const { existingZIndices = [], offsetIndex = 0, containerSize } = options;
  const maxZ = existingZIndices.length > 0 ? Math.max(...existingZIndices) : 999;
  
  // Calculate window position relative to container size
  const offsetX = Math.min(20 + (offsetIndex * 30), 200); // Cap at 200px
  const offsetY = Math.min(20 + (offsetIndex * 30), 200); // Cap at 200px

  // If container size is available, use 58.9% of it, otherwise use default values
  const width = containerSize ? Math.min(589, containerSize.width * 0.589) : 589;
  const height = containerSize ? Math.min(442, containerSize.height * 0.589) : 442;
  
  return {
    ...DEFAULT_WINDOW_STATE,
    x: offsetX,
    y: offsetY,
    width,
    height,
    zIndex: maxZ + 1
  };
};