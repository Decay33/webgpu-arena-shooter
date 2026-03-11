import { create } from 'zustand'

import { PLAYER_MOVEMENT_CONFIG } from '../../config/playerMovement.ts'
import { applyDamage, createHealthState } from '../../health/DamageSystem.ts'
import type { DamageEvent, HealthState } from '../../health/HealthTypes.ts'

type PlayerHealthStore = HealthState & {
  applyDamage: (damageEvent: DamageEvent) => void
  restoreHealth: (healthAmount: number, source: string) => number
  respawnDeadlineMs: number | null
  respawnDelaySeconds: number
  respawnPlayer: () => void
  respawnRemainingSeconds: number | null
  setRespawnRemainingSeconds: (respawnRemainingSeconds: number | null) => void
}

export const PLAYER_HEALTH_CONFIG = {
  maxHealth: 100,
  respawnDelaySeconds: 2.5,
  respawnPosition: PLAYER_MOVEMENT_CONFIG.spawnPosition,
}

function createInitialPlayerHealthState() {
  return {
    ...createHealthState(PLAYER_HEALTH_CONFIG.maxHealth),
    respawnDeadlineMs: null,
    respawnDelaySeconds: PLAYER_HEALTH_CONFIG.respawnDelaySeconds,
    respawnRemainingSeconds: null as number | null,
  }
}

export const usePlayerHealthStore = create<PlayerHealthStore>((set) => ({
  ...createInitialPlayerHealthState(),
  applyDamage: (damageEvent) =>
    set((state) => {
      if (!state.alive) {
        return state
      }

      const damageResult = applyDamage(state, damageEvent)

      if (damageResult.appliedDamage <= 0) {
        return state
      }

      console.log(
        `Player took ${damageResult.appliedDamage} damage from ${damageEvent.source}. ${damageResult.currentHealth}/${damageResult.maxHealth} health remaining.`,
      )

      if (!damageResult.died) {
        return {
          currentHealth: damageResult.currentHealth,
        }
      }

      console.log('Player died.')

      return {
        alive: false,
        currentHealth: 0,
        respawnDeadlineMs:
          performance.now() + state.respawnDelaySeconds * 1000,
        respawnRemainingSeconds: state.respawnDelaySeconds,
      }
    }),
  restoreHealth: (healthAmount, source) => {
    let restoredHealth = 0

    set((state) => {
      if (!state.alive || healthAmount <= 0 || state.currentHealth >= state.maxHealth) {
        return state
      }

      const nextHealth = Math.min(state.maxHealth, state.currentHealth + healthAmount)
      restoredHealth = nextHealth - state.currentHealth

      if (restoredHealth <= 0) {
        return state
      }

      console.log(
        `Player restored ${restoredHealth} health from ${source}. ${nextHealth}/${state.maxHealth} health.`,
      )

      return {
        currentHealth: nextHealth,
      }
    })

    return restoredHealth
  },
  respawnPlayer: () =>
    set((state) => {
      console.log('Player respawned.')

      return {
        ...createHealthState(state.maxHealth),
        respawnDeadlineMs: null,
        respawnRemainingSeconds: null,
      }
    }),
  setRespawnRemainingSeconds: (respawnRemainingSeconds) =>
    set((state) => {
      if (state.respawnRemainingSeconds === respawnRemainingSeconds) {
        return state
      }

      return {
        respawnRemainingSeconds,
      }
    }),
}))

export function damagePlayer(damageEvent: DamageEvent) {
  usePlayerHealthStore.getState().applyDamage(damageEvent)
}

export function getPlayerHealthSnapshot() {
  return usePlayerHealthStore.getState()
}

export function restorePlayerHealth(healthAmount: number, source: string) {
  return usePlayerHealthStore.getState().restoreHealth(healthAmount, source)
}
