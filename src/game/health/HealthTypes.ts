export type DamageEvent = {
  amount: number
  source: string
}

export type HealthState = {
  alive: boolean
  currentHealth: number
  maxHealth: number
}

export type DamageResult = HealthState & {
  appliedDamage: number
  died: boolean
}
