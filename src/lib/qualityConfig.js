export const LEVELS = ['potato', 'low', 'medium', 'high', 'ultra']

export const QUALITY_CONFIG = {
  potato: {
    label: 'Potato',
    resolutionScale: 0.5,
    starCount: 100,
    starSize: 0.25,
    starRangeY: 100,
    starRangeZ: 150,
    nebulaCount: 5,
    particleCount: 50,
    shootingStarCount: 2,
    bloomEnabled: false,
    bloomIntensity: 0,
    bloomBlur: 0,
    demonRingSegments: 8,
    demonLabels: false,
    demonGlow: false,
  },
  low: {
    label: 'Low',
    resolutionScale: 0.75,
    starCount: 400,
    starSize: 0.30,
    starRangeY: 200,
    starRangeZ: 250,
    nebulaCount: 15,
    particleCount: 100,
    shootingStarCount: 4,
    bloomEnabled: false,
    bloomIntensity: 0,
    bloomBlur: 0,
    demonRingSegments: 12,
    demonLabels: true,
    demonGlow: true,
  },
  medium: {
    label: 'Medium',
    resolutionScale: 1,
    starCount: 800,
    starSize: 0.35,
    starRangeY: 300,
    starRangeZ: 400,
    nebulaCount: 25,
    particleCount: 200,
    shootingStarCount: 6,
    bloomEnabled: true,
    bloomIntensity: 0.3,
    bloomBlur: 3,
    demonRingSegments: 24,
    demonLabels: true,
    demonGlow: true,
  },
  high: {
    label: 'High',
    resolutionScale: 1,
    starCount: 1200,
    starSize: 0.40,
    starRangeY: 400,
    starRangeZ: 600,
    nebulaCount: 35,
    particleCount: 300,
    shootingStarCount: 6,
    bloomEnabled: true,
    bloomIntensity: 0.5,
    bloomBlur: 4,
    demonRingSegments: 32,
    demonLabels: true,
    demonGlow: true,
  },
  ultra: {
    label: 'Ultra',
    resolutionScale: 1.5,
    starCount: 2000,
    starSize: 0.50,
    starRangeY: 500,
    starRangeZ: 800,
    nebulaCount: 60,
    particleCount: 500,
    shootingStarCount: 8,
    bloomEnabled: true,
    bloomIntensity: 0.6,
    bloomBlur: 6,
    demonRingSegments: 48,
    demonLabels: true,
    demonGlow: true,
  },
}

export function getLevelConfig(level) {
  return QUALITY_CONFIG[level] || QUALITY_CONFIG.medium
}

export function getLevelIndex(level) {
  return LEVELS.indexOf(level)
}

export function getLevelAtIndex(idx) {
  return QUALITY_CONFIG[LEVELS[Math.max(0, Math.min(idx, LEVELS.length - 1))]]
}
