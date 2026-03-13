export const ARENA_POST_PROCESSING = {
  fallback: {
    bloom: {
      intensity: 0.14,
      luminanceSmoothing: 0.28,
      luminanceThreshold: 0.84,
      radius: 0.28,
    },
    tone: {
      brightness: 0.002,
      contrast: 0.045,
      saturation: 0.03,
    },
    vignette: {
      darkness: 0.44,
      offset: 0.29,
    },
  },
  webgpu: {
    bloom: {
      radius: 0.14,
      strength: 0.09,
      threshold: 0.82,
    },
    tone: {
      highlightGain: 1.026,
      highlightTint: [1.02, 1.005, 0.992] as [number, number, number],
      midpointEnd: 0.82,
      midpointStart: 0.14,
      shadowGain: 0.992,
      shadowTint: [0.992, 1, 1.018] as [number, number, number],
    },
    vignette: {
      intensity: 0.09,
      smoothness: 0.72,
    },
  },
} as const
