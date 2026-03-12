import type { WeaponId } from '../../weapons/WeaponTypes.ts'
import { GREYBOX_ARENA_AMMO_PICKUP_POINTS } from '../../world/map/greyboxArenaLayout.ts'

export type AmmoPickupDefinition = {
  color: string
  id: string
  position: [number, number, number]
  restoreAmount: number
  weaponId: WeaponId
}

export const AMMO_PICKUP_CONFIG = {
  bodyHeight: 0.5,
  bodyWidth: 0.22,
  capHeight: 0.14,
  capWidth: 0.28,
  collectionRadius: 1.35,
  respawnDelaySeconds: 14,
  totalHeightOffset: 0.62,
} as const

export const AMMO_PICKUP_SPAWNS: AmmoPickupDefinition[] = [
  {
    color: '#5dade2',
    id: 'ammo-rifle-01',
    position: GREYBOX_ARENA_AMMO_PICKUP_POINTS.rifle[0],
    restoreAmount: 45,
    weaponId: 'rifle',
  },
  {
    color: '#5dade2',
    id: 'ammo-rifle-02',
    position: GREYBOX_ARENA_AMMO_PICKUP_POINTS.rifle[1],
    restoreAmount: 45,
    weaponId: 'rifle',
  },
  {
    color: '#f4a261',
    id: 'ammo-shotgun-01',
    position: GREYBOX_ARENA_AMMO_PICKUP_POINTS.shotgun[0],
    restoreAmount: 8,
    weaponId: 'shotgun',
  },
  {
    color: '#e76f51',
    id: 'ammo-rocket-01',
    position: GREYBOX_ARENA_AMMO_PICKUP_POINTS.rocketLauncher[0],
    restoreAmount: 3,
    weaponId: 'rocketLauncher',
  },
] as const
