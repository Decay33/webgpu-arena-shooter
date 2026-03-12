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
  contactDamageIntervalSeconds: 0.72,
  contactVerticalTolerance: 2.8,
} as const

export const ENEMY_SHARED_MOVEMENT_CONFIG = {
  airAcceleration: 5.25,
  airDeceleration: 3.25,
  groundProbeDistance: 0.18,
  groundAcceleration: 11,
  groundDeceleration: 8.5,
  linearDamping: 5,
  minGroundNormalY: 0.7,
  snapshotInterval: 0.08,
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
    contactDamage: 9,
    contactDamageRadius: 2.05,
    headColor: '#b8e0cf',
    headOffsetY: 1.44,
    headSize: 0.36,
    maxHealth: 52,
    moveSpeed: 5,
    scoreValue: 75,
    stopDistance: 0.95,
  },
  standard: {
    bodyColor: '#7f8a99',
    bodyOffsetY: 1,
    bodyRadius: 0.45,
    bodySegmentHeight: 1.1,
    colliderHalfHeight: 0.55,
    colliderOffsetY: 1,
    colliderRadius: 0.45,
    contactDamage: 14,
    contactDamageRadius: 2.2,
    headColor: '#b4beca',
    headOffsetY: 1.85,
    headSize: 0.5,
    maxHealth: 110,
    moveSpeed: 2.9,
    scoreValue: 100,
    stopDistance: 1.85,
  },
  tank: {
    bodyColor: '#8a7666',
    bodyOffsetY: 1.4,
    bodyRadius: 0.76,
    bodySegmentHeight: 1.58,
    colliderHalfHeight: 0.84,
    colliderOffsetY: 1.4,
    colliderRadius: 0.72,
    contactDamage: 26,
    contactDamageRadius: 2.95,
    headColor: '#d2c1b5',
    headOffsetY: 2.5,
    headSize: 0.74,
    maxHealth: 320,
    moveSpeed: 1.9,
    scoreValue: 250,
    stopDistance: 2.45,
  },
}

export function getEnemyTypeDefinition(enemyType: EnemyKind): EnemyTypeDefinition {
  return ENEMY_TYPE_DEFINITIONS[enemyType]
}
