import type { DamageEvent } from '../health/HealthTypes.ts'
import type { HealthState } from '../health/HealthTypes.ts'

export type EnemyId = string
export type EnemyBehavior = 'directPursuit'
export type EnemyKind = 'bot'

export type EnemySpawnDefinition = {
  behavior: EnemyBehavior
  id: EnemyId
  maxHealth: number
  position: [number, number, number]
  type: EnemyKind
}

export type EnemyState = EnemySpawnDefinition & HealthState

export type EnemyDamageHandler = (damageEvent: DamageEvent) => void
