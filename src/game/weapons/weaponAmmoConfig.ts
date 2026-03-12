import type { WeaponId } from './WeaponTypes.ts'

export type WeaponAmmoConfig = {
  ammoPerShot: number
  maxAmmo: number
  startingAmmo: number
  unlockAmmo: number
}

export const WEAPON_AMMO_CONFIG: Record<WeaponId, WeaponAmmoConfig> = {
  rifle: {
    ammoPerShot: 1,
    maxAmmo: 240,
    startingAmmo: 180,
    unlockAmmo: 0,
  },
  rocketLauncher: {
    ammoPerShot: 1,
    maxAmmo: 12,
    startingAmmo: 0,
    unlockAmmo: 6,
  },
  shotgun: {
    ammoPerShot: 1,
    maxAmmo: 32,
    startingAmmo: 0,
    unlockAmmo: 12,
  },
}
