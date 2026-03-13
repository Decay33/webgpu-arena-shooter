import { GREYBOX_ARENA_HEALTH_PICKUP_POINTS } from '../../world/map/greyboxArenaLayout.ts'

export const HEALTH_PICKUP_CONFIG = {
  auraGlowColor: '#b9ffd5',
  auraRadius: 0.34,
  auraRingColor: '#67f1a1',
  auraThickness: 0.04,
  collectionRadius: 1.35,
  crossColor: '#a8f0be',
  healAmount: 30,
  hoverAmplitude: 0.08,
  hoverSpeed: 1.8,
  respawnDelaySeconds: 12,
  rotationSpeed: 0.8,
  stemHeight: 0.55,
  stemColor: '#44b96a',
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
