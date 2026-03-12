import { GREYBOX_ARENA_HEALTH_PICKUP_POINTS } from '../../world/map/greyboxArenaLayout.ts'

export const HEALTH_PICKUP_CONFIG = {
  collectionRadius: 1.35,
  healAmount: 30,
  respawnDelaySeconds: 12,
  stemHeight: 0.55,
  topHeight: 0.18,
  topWidth: 0.7,
  totalHeightOffset: 0.6,
  width: 0.28,
} as const

export const HEALTH_PICKUP_SPAWNS = [
  {
    id: 'health-01',
    position: GREYBOX_ARENA_HEALTH_PICKUP_POINTS[0],
  },
  {
    id: 'health-02',
    position: GREYBOX_ARENA_HEALTH_PICKUP_POINTS[1],
  },
  {
    id: 'health-03',
    position: GREYBOX_ARENA_HEALTH_PICKUP_POINTS[2],
  },
  {
    id: 'health-04',
    position: GREYBOX_ARENA_HEALTH_PICKUP_POINTS[3],
  },
] as const
