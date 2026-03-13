export const WEAPON_VFX_POOL_CONFIG = {
  explosions: 6,
  hitMarkers: 24,
  muzzleFlashes: 6,
  projectiles: 6,
  tracers: 24,
} as const

export const WEAPON_VFX_RENDER_CONFIG = {
  beamRadialSegments: 6,
  bloomFriendlyFlashOpacityScale: 0.92,
  bloomFriendlyGlowOpacityScale: 0.82,
  explosionLightPulseIntensityScale: 0.58,
  explosionLightPulseWindow: 0.24,
  explosionSparkAngles: [
    0,
    Math.PI / 2,
    Math.PI / 4,
    (Math.PI * 3) / 4,
  ] as const,
  impactSparkAngles: [0, Math.PI / 2] as const,
  muzzleFlashFlareAngles: [0, Math.PI / 2] as const,
  muzzleFlashPointLightMinIntensity: 3,
  ringSegments: 16,
  sparkPlaneHeightScale: 0.72,
  torusSegments: 16,
} as const
