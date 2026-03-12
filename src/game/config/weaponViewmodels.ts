import type { WeaponId } from '../weapons/WeaponTypes.ts'

export type WeaponViewmodelSettings = {
  accentColor: string
  primaryColor: string
  recoilPosition: [number, number, number]
  recoilRecoverySpeed: number
  recoilRotation: [number, number, number]
  secondaryColor: string
  transformPosition: [number, number, number]
  transformRotation: [number, number, number]
}

export const WEAPON_VIEWMODEL_CONFIG: Record<WeaponId, WeaponViewmodelSettings> = {
  rifle: {
    accentColor: '#dce6f2',
    primaryColor: '#4f677e',
    recoilPosition: [0, 0.016, 0.08],
    recoilRecoverySpeed: 18,
    recoilRotation: [0.12, 0.02, 0.03],
    secondaryColor: '#7f95aa',
    transformPosition: [0.24, -0.2, -0.44],
    transformRotation: [-0.04, -0.12, 0.02],
  },
  rocketLauncher: {
    accentColor: '#ffe0b2',
    primaryColor: '#7b6557',
    recoilPosition: [0, 0.018, 0.105],
    recoilRecoverySpeed: 12,
    recoilRotation: [0.11, -0.018, 0.045],
    secondaryColor: '#b38d73',
    transformPosition: [0.26, -0.25, -0.5],
    transformRotation: [-0.05, -0.08, 0.015],
  },
  shotgun: {
    accentColor: '#f6e7b4',
    primaryColor: '#715d4f',
    recoilPosition: [0, 0.02, 0.12],
    recoilRecoverySpeed: 14,
    recoilRotation: [0.15, 0.025, 0.05],
    secondaryColor: '#9a8168',
    transformPosition: [0.25, -0.23, -0.46],
    transformRotation: [-0.05, -0.11, 0.03],
  },
}
