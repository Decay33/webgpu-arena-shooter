import type { DamageEvent, DamageResult, HealthState } from './HealthTypes.ts'

export function createHealthState(maxHealth: number): HealthState {
  return {
    alive: true,
    currentHealth: maxHealth,
    maxHealth,
  }
}

export function applyDamage(
  healthState: HealthState,
  damageEvent: DamageEvent,
): DamageResult {
  if (!healthState.alive || damageEvent.amount <= 0) {
    return {
      ...healthState,
      appliedDamage: 0,
      died: false,
    }
  }

  const nextHealth = Math.max(0, healthState.currentHealth - damageEvent.amount)
  const appliedDamage = healthState.currentHealth - nextHealth
  const alive = nextHealth > 0

  return {
    alive,
    appliedDamage,
    currentHealth: nextHealth,
    died: healthState.alive && !alive,
    maxHealth: healthState.maxHealth,
  }
}
