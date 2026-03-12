import type { DamageEvent } from '../health/HealthTypes.ts'
import type { HealthState } from '../health/HealthTypes.ts'

export type EnemyId = string
export type EnemyBehavior = 'directPursuit'
export type EnemyKind = 'fast' | 'standard' | 'tank'
export type EnemyWaveState = 'active' | 'intermission'

export type EnemySpawnDefinition = {
  behavior: EnemyBehavior
  id: EnemyId
  position: [number, number, number]
  type: EnemyKind
}

export type EnemyState = EnemySpawnDefinition & HealthState

export type EnemyDamageHandler = (damageEvent: DamageEvent) => void
