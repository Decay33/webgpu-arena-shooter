import type { WeaponId } from '../../weapons/WeaponTypes.ts'
import { GREYBOX_ARENA_WEAPON_PICKUP_POINTS } from '../../world/map/greyboxArenaLayout.ts'

export type WeaponPickupWeaponId = Exclude<WeaponId, 'rifle'>

export const WEAPON_PICKUP_CONFIG = {
  auraRadius: 0.48,
  auraThickness: 0.05,
  baseHeight: 0.24,
  baseSize: 1.1,
  baseColor: '#2a3647',
  coreColor: '#8fa3bb',
  collectionRadius: 1.45,
  hoverAmplitude: 0.07,
  hoverSpeed: 1.55,
  iconHeight: 0.3,
  iconWidth: 0.82,
  padOffsetY: 0.2,
  respawnDelaySeconds: 18,
  rotationSpeed: 0.6,
  totalHeightOffset: 0.92,
} as const

export const WEAPON_PICKUP_SPAWNS = [
  {
    color: '#f4a261',
    glowColor: '#ffe0b6',
    id: 'weapon-shotgun',
    position: GREYBOX_ARENA_WEAPON_PICKUP_POINTS.shotgun,
    weaponId: 'shotgun' as WeaponPickupWeaponId,
  },
  {
    color: '#e76f51',
    glowColor: '#ffc5b8',
    id: 'weapon-rocket',
    position: GREYBOX_ARENA_WEAPON_PICKUP_POINTS.rocketLauncher,
    weaponId: 'rocketLauncher' as WeaponPickupWeaponId,
  },
] as const
