import type { WeaponId } from '../../weapons/WeaponTypes.ts'
import { GREYBOX_ARENA_AMMO_PICKUP_POINTS } from '../../world/map/greyboxArenaLayout.ts'

export type AmmoPickupDefinition = {
  glowColor: string
  color: string
  id: string
  position: [number, number, number]
  restoreAmount: number
  weaponId: WeaponId
}

export const AMMO_PICKUP_CONFIG = {
  auraRadius: 0.36,
  auraThickness: 0.045,
  bodyHeight: 0.5,
  bodyWidth: 0.22,
  baseColor: '#223044',
  capHeight: 0.14,
  capWidth: 0.28,
  collectionRadius: 1.35,
  hoverAmplitude: 0.07,
  hoverSpeed: 1.6,
  respawnDelaySeconds: 14,
  rotationSpeed: 0.7,
  totalHeightOffset: 0.62,
} as const

export const AMMO_PICKUP_SPAWNS: AmmoPickupDefinition[] = [
  {
    color: '#5dade2',
    glowColor: '#bfe4ff',
    id: 'ammo-rifle-01',
    position: GREYBOX_ARENA_AMMO_PICKUP_POINTS.rifle[0],
    restoreAmount: 45,
    weaponId: 'rifle',
  },
  {
    color: '#5dade2',
    glowColor: '#bfe4ff',
    id: 'ammo-rifle-02',
    position: GREYBOX_ARENA_AMMO_PICKUP_POINTS.rifle[1],
    restoreAmount: 45,
    weaponId: 'rifle',
  },
  {
    color: '#f4a261',
    glowColor: '#ffe0b6',
    id: 'ammo-shotgun-01',
    position: GREYBOX_ARENA_AMMO_PICKUP_POINTS.shotgun[0],
    restoreAmount: 8,
    weaponId: 'shotgun',
  },
  {
    color: '#e76f51',
    glowColor: '#ffc5b8',
    id: 'ammo-rocket-01',
    position: GREYBOX_ARENA_AMMO_PICKUP_POINTS.rocketLauncher[0],
    restoreAmount: 3,
    weaponId: 'rocketLauncher',
  },
] as const
