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
    maxAmmo: 260,
    startingAmmo: 200,
    unlockAmmo: 0,
  },
  rocketLauncher: {
    ammoPerShot: 1,
    maxAmmo: 14,
    startingAmmo: 0,
    unlockAmmo: 5,
  },
  shotgun: {
    ammoPerShot: 1,
    maxAmmo: 36,
    startingAmmo: 0,
    unlockAmmo: 14,
  },
}
