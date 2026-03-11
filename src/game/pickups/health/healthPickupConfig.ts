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
    position: [-10, 0, 14] as [number, number, number],
  },
  {
    id: 'health-02',
    position: [16, 2, 0] as [number, number, number],
  },
  {
    id: 'health-03',
    position: [-18, 0, -8] as [number, number, number],
  },
  {
    id: 'health-04',
    position: [8, 0, -14] as [number, number, number],
  },
] as const
