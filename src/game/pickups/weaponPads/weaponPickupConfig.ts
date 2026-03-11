import type { WeaponId } from '../../weapons/WeaponTypes.ts'

export type WeaponPickupWeaponId = Exclude<WeaponId, 'rifle'>

export const WEAPON_PICKUP_CONFIG = {
  baseHeight: 0.24,
  baseSize: 1.1,
  collectionRadius: 1.45,
  iconHeight: 0.3,
  iconWidth: 0.82,
  padOffsetY: 0.2,
  respawnDelaySeconds: 18,
  totalHeightOffset: 0.92,
} as const

export const WEAPON_PICKUP_SPAWNS = [
  {
    color: '#f4a261',
    id: 'weapon-shotgun',
    position: [18, 2, 0] as [number, number, number],
    weaponId: 'shotgun' as WeaponPickupWeaponId,
  },
  {
    color: '#e76f51',
    id: 'weapon-rocket',
    position: [-22, 0, 16] as [number, number, number],
    weaponId: 'rocketLauncher' as WeaponPickupWeaponId,
  },
] as const
