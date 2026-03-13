import type { WeaponId } from '../weapons/WeaponTypes.ts'

export type WeaponViewmodelAxis = 'x' | 'y' | 'z'
export type WeaponViewmodelMaterialId = 'body' | 'trim' | 'accent' | 'energy'

export type WeaponViewmodelMaterial = {
  clearcoat?: number
  clearcoatRoughness?: number
  color: string
  emissiveColor?: string
  emissiveIntensity?: number
  ior?: number
  metalness: number
  roughness: number
  sheen?: number
  sheenRoughness?: number
  specularIntensity?: number
}

type WeaponViewmodelPartBase = {
  key: string
  material: WeaponViewmodelMaterialId
  position: [number, number, number]
  rotation?: [number, number, number]
}

export type WeaponViewmodelBoxPart = WeaponViewmodelPartBase & {
  shape: 'box'
  size: [number, number, number]
}

export type WeaponViewmodelCapsulePart = WeaponViewmodelPartBase & {
  axis?: WeaponViewmodelAxis
  capSegments?: number
  length: number
  radialSegments?: number
  radius: number
  shape: 'capsule'
}

export type WeaponViewmodelCylinderPart = WeaponViewmodelPartBase & {
  axis?: WeaponViewmodelAxis
  length: number
  radialSegments?: number
  radiusBottom: number
  radiusTop: number
  shape: 'cylinder'
}

export type WeaponViewmodelConePart = WeaponViewmodelPartBase & {
  axis?: WeaponViewmodelAxis
  length: number
  radialSegments?: number
  radius: number
  shape: 'cone'
}

export type WeaponViewmodelPart =
  | WeaponViewmodelBoxPart
  | WeaponViewmodelCapsulePart
  | WeaponViewmodelCylinderPart
  | WeaponViewmodelConePart

export type WeaponViewmodelSettings = {
  materials: Record<WeaponViewmodelMaterialId, WeaponViewmodelMaterial>
  muzzleLocalPosition: [number, number, number]
  parts: WeaponViewmodelPart[]
  recoilDamping: number
  recoilImpulsePosition: [number, number, number]
  recoilImpulseRotation: [number, number, number]
  recoilJitterPosition: [number, number, number]
  recoilJitterRotation: [number, number, number]
  recoilSpring: number
  transformPosition: [number, number, number]
  transformRotation: [number, number, number]
}

export const WEAPON_VIEWMODEL_CONFIG: Record<WeaponId, WeaponViewmodelSettings> = {
  rifle: {
    materials: {
      accent: {
        clearcoat: 0.58,
        clearcoatRoughness: 0.18,
        color: '#e8edf4',
        ior: 1.46,
        metalness: 0.22,
        roughness: 0.22,
        specularIntensity: 0.86,
      },
      body: {
        clearcoat: 0.18,
        clearcoatRoughness: 0.52,
        color: '#465a6c',
        ior: 1.38,
        metalness: 0.34,
        roughness: 0.54,
        sheen: 0.05,
        sheenRoughness: 0.46,
        specularIntensity: 0.62,
      },
      energy: {
        clearcoat: 0.92,
        clearcoatRoughness: 0.08,
        color: '#8ce6ff',
        emissiveColor: '#8ce6ff',
        emissiveIntensity: 0.46,
        ior: 1.48,
        metalness: 0.08,
        roughness: 0.12,
        specularIntensity: 0.94,
      },
      trim: {
        clearcoat: 0.74,
        clearcoatRoughness: 0.2,
        color: '#93a8b8',
        ior: 1.44,
        metalness: 0.62,
        roughness: 0.28,
        sheen: 0.08,
        sheenRoughness: 0.38,
        specularIntensity: 0.82,
      },
    },
    muzzleLocalPosition: [0.066, -0.006, -1.18],
    parts: [
      {
        key: 'stock-frame',
        material: 'body',
        position: [-0.09, -0.05, 0.23],
        rotation: [0.18, 0, 0],
        shape: 'box',
        size: [0.11, 0.09, 0.31],
      },
      {
        key: 'butt-pad',
        material: 'trim',
        position: [-0.105, -0.02, 0.36],
        rotation: [0.18, 0, 0],
        shape: 'box',
        size: [0.115, 0.115, 0.08],
      },
      {
        key: 'upper-receiver',
        material: 'body',
        position: [0.03, -0.05, -0.01],
        shape: 'box',
        size: [0.145, 0.115, 0.39],
      },
      {
        key: 'lower-receiver',
        material: 'trim',
        position: [0.008, -0.115, 0.055],
        rotation: [0.14, 0, 0],
        shape: 'box',
        size: [0.082, 0.1, 0.14],
      },
      {
        key: 'grip',
        material: 'body',
        position: [-0.002, -0.19, 0.07],
        rotation: [0.38, 0, 0],
        shape: 'box',
        size: [0.055, 0.185, 0.098],
      },
      {
        axis: 'z',
        key: 'handguard-core',
        length: 0.48,
        material: 'trim',
        position: [0.056, -0.042, -0.47],
        radius: 0.05,
        radialSegments: 16,
        shape: 'capsule',
      },
      {
        key: 'handguard-spine',
        material: 'body',
        position: [0.055, 0.004, -0.46],
        shape: 'box',
        size: [0.064, 0.026, 0.42],
      },
      {
        key: 'forward-clamp',
        material: 'accent',
        position: [0.056, -0.028, -0.66],
        shape: 'box',
        size: [0.09, 0.05, 0.07],
      },
      {
        axis: 'z',
        key: 'barrel',
        length: 0.9,
        material: 'accent',
        position: [0.062, -0.006, -0.82],
        radiusBottom: 0.018,
        radiusTop: 0.016,
        radialSegments: 16,
        shape: 'cylinder',
      },
      {
        axis: 'z',
        key: 'muzzle-brake',
        length: 0.11,
        material: 'accent',
        position: [0.066, -0.006, -1.18],
        radiusBottom: 0.027,
        radiusTop: 0.023,
        radialSegments: 16,
        shape: 'cylinder',
      },
      {
        key: 'top-rail',
        material: 'accent',
        position: [0.035, 0.03, -0.16],
        shape: 'box',
        size: [0.09, 0.022, 0.5],
      },
      {
        key: 'optic-base',
        material: 'trim',
        position: [0.038, 0.06, -0.16],
        shape: 'box',
        size: [0.065, 0.03, 0.11],
      },
      {
        axis: 'z',
        key: 'optic-tube',
        length: 0.2,
        material: 'trim',
        position: [0.04, 0.08, -0.22],
        radius: 0.034,
        radialSegments: 16,
        shape: 'capsule',
      },
      {
        key: 'optic-lens',
        material: 'energy',
        position: [0.04, 0.081, -0.22],
        shape: 'box',
        size: [0.024, 0.018, 0.115],
      },
      {
        key: 'power-cell',
        material: 'energy',
        position: [0.092, -0.045, -0.16],
        shape: 'box',
        size: [0.028, 0.052, 0.13],
      },
    ],
    recoilDamping: 12.5,
    recoilImpulsePosition: [0, 0.004, 0.09],
    recoilImpulseRotation: [0.095, 0.012, 0.026],
    recoilJitterPosition: [0.002, 0.001, 0.01],
    recoilJitterRotation: [0.008, 0.01, 0.01],
    recoilSpring: 132,
    transformPosition: [0.235, -0.215, -0.38],
    transformRotation: [-0.045, -0.11, 0.022],
  },
  rocketLauncher: {
    materials: {
      accent: {
        clearcoat: 0.62,
        clearcoatRoughness: 0.18,
        color: '#efe0c6',
        ior: 1.45,
        metalness: 0.18,
        roughness: 0.2,
        specularIntensity: 0.84,
      },
      body: {
        clearcoat: 0.18,
        clearcoatRoughness: 0.48,
        color: '#5a6467',
        ior: 1.38,
        metalness: 0.28,
        roughness: 0.58,
        sheen: 0.04,
        sheenRoughness: 0.5,
        specularIntensity: 0.58,
      },
      energy: {
        clearcoat: 0.96,
        clearcoatRoughness: 0.05,
        color: '#ffb561',
        emissiveColor: '#ffb561',
        emissiveIntensity: 0.58,
        ior: 1.48,
        metalness: 0.06,
        roughness: 0.14,
        specularIntensity: 0.96,
      },
      trim: {
        clearcoat: 0.76,
        clearcoatRoughness: 0.2,
        color: '#a97858',
        ior: 1.42,
        metalness: 0.46,
        roughness: 0.34,
        specularIntensity: 0.8,
      },
    },
    muzzleLocalPosition: [0.05, -0.03, -1.01],
    parts: [
      {
        axis: 'z',
        key: 'launch-tube',
        length: 1.02,
        material: 'body',
        position: [0.042, -0.04, -0.34],
        radius: 0.092,
        radialSegments: 16,
        shape: 'capsule',
      },
      {
        key: 'tube-cradle',
        material: 'trim',
        position: [0.02, 0.005, -0.16],
        shape: 'box',
        size: [0.16, 0.08, 0.56],
      },
      {
        key: 'rear-housing',
        material: 'body',
        position: [-0.05, -0.03, 0.2],
        shape: 'box',
        size: [0.24, 0.22, 0.24],
      },
      {
        key: 'shoulder-brace',
        material: 'trim',
        position: [-0.11, -0.13, 0.24],
        rotation: [0.22, 0, 0],
        shape: 'box',
        size: [0.12, 0.08, 0.18],
      },
      {
        axis: 'z',
        key: 'front-collar',
        length: 0.08,
        material: 'accent',
        position: [0.048, -0.032, -0.83],
        radiusBottom: 0.102,
        radiusTop: 0.102,
        radialSegments: 16,
        shape: 'cylinder',
      },
      {
        axis: 'z',
        key: 'rear-collar',
        length: 0.09,
        material: 'trim',
        position: [0.042, -0.04, 0.05],
        radiusBottom: 0.108,
        radiusTop: 0.108,
        radialSegments: 16,
        shape: 'cylinder',
      },
      {
        key: 'carry-rail',
        material: 'accent',
        position: [0.03, 0.08, -0.12],
        shape: 'box',
        size: [0.09, 0.03, 0.48],
      },
      {
        key: 'front-sight-block',
        material: 'trim',
        position: [0.045, 0.11, -0.45],
        rotation: [0.4, 0, 0],
        shape: 'box',
        size: [0.08, 0.02, 0.12],
      },
      {
        key: 'forward-grip',
        material: 'trim',
        position: [0.015, -0.2, -0.08],
        shape: 'box',
        size: [0.08, 0.18, 0.12],
      },
      {
        key: 'trigger-block',
        material: 'body',
        position: [-0.01, -0.12, 0.08],
        rotation: [0.28, 0, 0],
        shape: 'box',
        size: [0.07, 0.13, 0.1],
      },
      {
        axis: 'z',
        key: 'targeting-canister',
        length: 0.22,
        material: 'accent',
        position: [0.122, 0.016, -0.18],
        radius: 0.03,
        radialSegments: 16,
        shape: 'capsule',
      },
      {
        key: 'targeting-strip',
        material: 'energy',
        position: [0.122, 0.016, -0.18],
        shape: 'box',
        size: [0.018, 0.014, 0.12],
      },
      {
        axis: 'z',
        key: 'front-emitter',
        length: 0.11,
        material: 'energy',
        position: [0.05, -0.03, -0.98],
        radius: 0.052,
        radialSegments: 16,
        rotation: [Math.PI, 0, 0],
        shape: 'cone',
      },
    ],
    recoilDamping: 10.8,
    recoilImpulsePosition: [0, 0.006, 0.14],
    recoilImpulseRotation: [0.12, -0.012, 0.038],
    recoilJitterPosition: [0.002, 0.0015, 0.018],
    recoilJitterRotation: [0.01, 0.006, 0.014],
    recoilSpring: 104,
    transformPosition: [0.275, -0.245, -0.48],
    transformRotation: [-0.055, -0.075, 0.018],
  },
  shotgun: {
    materials: {
      accent: {
        clearcoat: 0.56,
        clearcoatRoughness: 0.16,
        color: '#ebe1d3',
        ior: 1.45,
        metalness: 0.2,
        roughness: 0.22,
        specularIntensity: 0.82,
      },
      body: {
        clearcoat: 0.16,
        clearcoatRoughness: 0.54,
        color: '#5d4a42',
        ior: 1.38,
        metalness: 0.2,
        roughness: 0.62,
        sheen: 0.06,
        sheenRoughness: 0.5,
        specularIntensity: 0.54,
      },
      energy: {
        clearcoat: 0.9,
        clearcoatRoughness: 0.08,
        color: '#ffd46e',
        emissiveColor: '#ffd46e',
        emissiveIntensity: 0.34,
        ior: 1.47,
        metalness: 0.08,
        roughness: 0.16,
        specularIntensity: 0.9,
      },
      trim: {
        clearcoat: 0.72,
        clearcoatRoughness: 0.24,
        color: '#8f725e',
        ior: 1.42,
        metalness: 0.48,
        roughness: 0.34,
        specularIntensity: 0.76,
      },
    },
    muzzleLocalPosition: [0.05, -0.012, -1.12],
    parts: [
      {
        key: 'stock-body',
        material: 'body',
        position: [-0.085, -0.05, 0.21],
        rotation: [0.16, 0, 0],
        shape: 'box',
        size: [0.13, 0.11, 0.33],
      },
      {
        key: 'butt-plate',
        material: 'trim',
        position: [-0.105, -0.015, 0.35],
        rotation: [0.16, 0, 0],
        shape: 'box',
        size: [0.12, 0.11, 0.07],
      },
      {
        key: 'receiver',
        material: 'body',
        position: [0.028, -0.07, -0.02],
        shape: 'box',
        size: [0.155, 0.13, 0.36],
      },
      {
        key: 'rear-tang',
        material: 'trim',
        position: [0.025, 0.002, -0.01],
        shape: 'box',
        size: [0.07, 0.026, 0.18],
      },
      {
        key: 'grip',
        material: 'body',
        position: [-0.003, -0.18, 0.025],
        rotation: [0.35, 0, 0],
        shape: 'box',
        size: [0.055, 0.175, 0.1],
      },
      {
        axis: 'z',
        key: 'barrel',
        length: 0.92,
        material: 'accent',
        position: [0.048, -0.012, -0.7],
        radiusBottom: 0.025,
        radiusTop: 0.022,
        radialSegments: 16,
        shape: 'cylinder',
      },
      {
        axis: 'z',
        key: 'mag-tube',
        length: 0.82,
        material: 'trim',
        position: [0.048, -0.086, -0.59],
        radiusBottom: 0.03,
        radiusTop: 0.028,
        radialSegments: 16,
        shape: 'cylinder',
      },
      {
        key: 'pump-body',
        material: 'trim',
        position: [0.043, -0.086, -0.41],
        shape: 'box',
        size: [0.128, 0.104, 0.24],
      },
      {
        key: 'pump-rib',
        material: 'body',
        position: [0.043, -0.045, -0.41],
        shape: 'box',
        size: [0.08, 0.03, 0.2],
      },
      {
        key: 'front-band',
        material: 'accent',
        position: [0.048, -0.05, -0.77],
        shape: 'box',
        size: [0.09, 0.08, 0.05],
      },
      {
        key: 'vent-rib',
        material: 'accent',
        position: [0.048, 0.013, -0.56],
        shape: 'box',
        size: [0.03, 0.01, 0.66],
      },
      {
        key: 'rear-sight',
        material: 'trim',
        position: [0.04, 0.028, -0.2],
        shape: 'box',
        size: [0.035, 0.022, 0.06],
      },
      {
        key: 'front-bead',
        material: 'energy',
        position: [0.048, 0.014, -1.0],
        shape: 'box',
        size: [0.014, 0.014, 0.04],
      },
    ],
    recoilDamping: 11.4,
    recoilImpulsePosition: [0, 0.007, 0.13],
    recoilImpulseRotation: [0.13, 0.018, 0.04],
    recoilJitterPosition: [0.003, 0.002, 0.016],
    recoilJitterRotation: [0.012, 0.014, 0.018],
    recoilSpring: 112,
    transformPosition: [0.255, -0.235, -0.41],
    transformRotation: [-0.052, -0.1, 0.03],
  },
}
