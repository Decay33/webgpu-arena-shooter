import type { EnemyKind } from './EnemyTypes.ts'

export type EnemyTypeDefinition = {
  bodyColor: string
  bodyOffsetY: number
  bodyRadius: number
  bodySegmentHeight: number
  colliderHalfHeight: number
  colliderOffsetY: number
  colliderRadius: number
  contactDamage: number
  contactDamageRadius: number
  headColor: string
  headOffsetY: number
  headSize: number
  maxHealth: number
  moveSpeed: number
  scoreValue: number
  stopDistance: number
}

export const ENEMY_SHARED_COMBAT_CONFIG = {
  contactDamageIntervalSeconds: 0.85,
  contactVerticalTolerance: 2.8,
} as const

export const ENEMY_SHARED_MOVEMENT_CONFIG = {
  airControl: 0.16,
  groundProbeDistance: 0.18,
  linearDamping: 5,
  minGroundNormalY: 0.7,
  snapshotInterval: 0.15,
} as const

export const ENEMY_TYPE_DEFINITIONS: Record<EnemyKind, EnemyTypeDefinition> = {
  fast: {
    bodyColor: '#5e9b84',
    bodyOffsetY: 0.82,
    bodyRadius: 0.34,
    bodySegmentHeight: 0.8,
    colliderHalfHeight: 0.36,
    colliderOffsetY: 0.82,
    colliderRadius: 0.34,
    contactDamage: 8,
    contactDamageRadius: 1.95,
    headColor: '#b8e0cf',
    headOffsetY: 1.44,
    headSize: 0.36,
    maxHealth: 60,
    moveSpeed: 4.25,
    scoreValue: 75,
    stopDistance: 1.45,
  },
  standard: {
    bodyColor: '#7f8a99',
    bodyOffsetY: 1,
    bodyRadius: 0.45,
    bodySegmentHeight: 1.1,
    colliderHalfHeight: 0.55,
    colliderOffsetY: 1,
    colliderRadius: 0.45,
    contactDamage: 12,
    contactDamageRadius: 2.35,
    headColor: '#b4beca',
    headOffsetY: 1.85,
    headSize: 0.5,
    maxHealth: 100,
    moveSpeed: 2.6,
    scoreValue: 100,
    stopDistance: 2.2,
  },
  tank: {
    bodyColor: '#8a7666',
    bodyOffsetY: 1.35,
    bodyRadius: 0.72,
    bodySegmentHeight: 1.5,
    colliderHalfHeight: 0.78,
    colliderOffsetY: 1.35,
    colliderRadius: 0.68,
    contactDamage: 22,
    contactDamageRadius: 2.8,
    headColor: '#d2c1b5',
    headOffsetY: 2.42,
    headSize: 0.7,
    maxHealth: 240,
    moveSpeed: 1.7,
    scoreValue: 250,
    stopDistance: 2.9,
  },
}

export function getEnemyTypeDefinition(enemyType: EnemyKind): EnemyTypeDefinition {
  return ENEMY_TYPE_DEFINITIONS[enemyType]
}
