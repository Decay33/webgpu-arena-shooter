export type ArenaMaterialPresetId =
  | 'accent'
  | 'cover'
  | 'floor'
  | 'platform'
  | 'ramp'
  | 'wall'

export type ArenaPointLightTarget = [number, number, number]

export type ArenaMaterialPreset = {
  baseMetalness: number
  baseRoughness: number
  clearcoat: number
  clearcoatRoughness: number
  emissiveIntensityMultiplier: number
  ior: number
  specularIntensity: number
  thickness: number
  transmission: number
}

export type ArenaDirectionalLightShadow = {
  bias: number
  bounds: number
  far: number
  mapSize: number
  near: number
  normalBias: number
}

export type ArenaDirectionalLightConfig = {
  color: string
  intensity: number
  position: ArenaPointLightTarget
  shadow?: ArenaDirectionalLightShadow
  target: ArenaPointLightTarget
}

export const ARENA_SCENE_VISUALS = {
  backgroundColor: '#b9c8d8',
  toneMappingExposure: 1.08,
} as const

export const ARENA_BACKGROUND_COLOR = ARENA_SCENE_VISUALS.backgroundColor

export const ARENA_RENDERER_VISUALS = {
  clearColor: ARENA_BACKGROUND_COLOR,
  toneMappingExposure: ARENA_SCENE_VISUALS.toneMappingExposure,
} as const

export const ARENA_LIGHT_RIG = {
  ambient: {
    color: '#fff4e8',
    intensity: 0.16,
  },
  fill: {
    color: '#8db8ff',
    intensity: 0.62,
    position: [-26, 18, -24] as ArenaPointLightTarget,
    target: [4, 2, 4] as ArenaPointLightTarget,
  },
  hemisphere: {
    groundColor: '#27384b',
    intensity: 0.62,
    skyColor: '#dfeaf6',
  },
  key: {
    color: '#ffd6a6',
    intensity: 3.35,
    position: [24, 28, 16] as ArenaPointLightTarget,
    shadow: {
      bias: -0.00012,
      bounds: 38,
      far: 96,
      mapSize: 2048,
      near: 4,
      normalBias: 0.028,
    },
    target: [0, 2, -2] as ArenaPointLightTarget,
  },
} as const

export const ARENA_SURFACE_COLORS = {
  accentCenter: '#8fe8ff',
  accentEast: '#ff9768',
  accentNorth: '#73dfff',
  accentWest: '#ffcb72',
  cover: '#5f7f95',
  floor: '#2b4259',
  platform: '#71856c',
  ramp: '#9d7350',
  wall: '#dde5ec',
} as const

export const ARENA_MATERIAL_PRESETS: Record<
  ArenaMaterialPresetId,
  ArenaMaterialPreset
> = {
  accent: {
    baseMetalness: 0.18,
    baseRoughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    emissiveIntensityMultiplier: 1.22,
    ior: 1.46,
    specularIntensity: 0.9,
    thickness: 0.42,
    transmission: 0.16,
  },
  cover: {
    baseMetalness: 0.18,
    baseRoughness: 0.72,
    clearcoat: 0.22,
    clearcoatRoughness: 0.34,
    emissiveIntensityMultiplier: 1,
    ior: 1.41,
    specularIntensity: 0.58,
    thickness: 0,
    transmission: 0,
  },
  floor: {
    baseMetalness: 0.08,
    baseRoughness: 0.92,
    clearcoat: 0.08,
    clearcoatRoughness: 0.88,
    emissiveIntensityMultiplier: 1,
    ior: 1.37,
    specularIntensity: 0.4,
    thickness: 0,
    transmission: 0,
  },
  platform: {
    baseMetalness: 0.1,
    baseRoughness: 0.66,
    clearcoat: 0.28,
    clearcoatRoughness: 0.24,
    emissiveIntensityMultiplier: 1,
    ior: 1.43,
    specularIntensity: 0.74,
    thickness: 0,
    transmission: 0,
  },
  ramp: {
    baseMetalness: 0.09,
    baseRoughness: 0.56,
    clearcoat: 0.16,
    clearcoatRoughness: 0.3,
    emissiveIntensityMultiplier: 1,
    ior: 1.39,
    specularIntensity: 0.66,
    thickness: 0,
    transmission: 0,
  },
  wall: {
    baseMetalness: 0.05,
    baseRoughness: 0.58,
    clearcoat: 0.34,
    clearcoatRoughness: 0.2,
    emissiveIntensityMultiplier: 1,
    ior: 1.47,
    specularIntensity: 0.84,
    thickness: 0,
    transmission: 0,
  },
}
