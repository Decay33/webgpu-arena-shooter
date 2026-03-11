import { create } from 'zustand'

import {
  HEALTH_PICKUP_CONFIG,
  HEALTH_PICKUP_SPAWNS,
} from './healthPickupConfig.ts'

export type HealthPickupId = (typeof HEALTH_PICKUP_SPAWNS)[number]['id']

export type HealthPickupState = {
  active: boolean
  id: HealthPickupId
  position: [number, number, number]
  respawnDeadlineMs: number | null
  restoreAmount: number
}

type HealthPickupStore = {
  collectPickup: (pickupId: HealthPickupId) => void
  pickups: HealthPickupState[]
  refreshRespawns: (nowMs: number) => void
}

function createInitialPickupState(
  pickup: (typeof HEALTH_PICKUP_SPAWNS)[number],
): HealthPickupState {
  return {
    active: true,
    id: pickup.id,
    position: pickup.position,
    respawnDeadlineMs: null,
    restoreAmount: HEALTH_PICKUP_CONFIG.healAmount,
  }
}

export const useHealthPickupStore = create<HealthPickupStore>((set) => ({
  collectPickup: (pickupId) =>
    set((state) => {
      const pickupIndex = state.pickups.findIndex((pickup) => pickup.id === pickupId)

      if (pickupIndex < 0) {
        return state
      }

      const pickup = state.pickups[pickupIndex]

      if (!pickup.active) {
        return state
      }

      console.log(`Collected ${pickup.id}.`)

      const nextPickups = [...state.pickups]
      nextPickups[pickupIndex] = {
        ...pickup,
        active: false,
        respawnDeadlineMs:
          performance.now() + HEALTH_PICKUP_CONFIG.respawnDelaySeconds * 1000,
      }

      return {
        pickups: nextPickups,
      }
    }),
  pickups: HEALTH_PICKUP_SPAWNS.map(createInitialPickupState),
  refreshRespawns: (nowMs) =>
    set((state) => {
      let didChange = false

      const nextPickups = state.pickups.map((pickup) => {
        if (pickup.active || pickup.respawnDeadlineMs === null) {
          return pickup
        }

        if (pickup.respawnDeadlineMs > nowMs) {
          return pickup
        }

        didChange = true
        console.log(`${pickup.id} respawned.`)

        return {
          ...pickup,
          active: true,
          respawnDeadlineMs: null,
        }
      })

      if (!didChange) {
        return state
      }

      return {
        pickups: nextPickups,
      }
    }),
}))
