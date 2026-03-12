import { create } from 'zustand'

import {
  AMMO_PICKUP_CONFIG,
  AMMO_PICKUP_SPAWNS,
  type AmmoPickupDefinition,
} from './ammoPickupConfig.ts'

export type AmmoPickupId = (typeof AMMO_PICKUP_SPAWNS)[number]['id']

export type AmmoPickupState = AmmoPickupDefinition & {
  active: boolean
  respawnDeadlineMs: number | null
}

type AmmoPickupStore = {
  collectPickup: (pickupId: AmmoPickupId) => void
  pickups: AmmoPickupState[]
  refreshRespawns: (nowMs: number) => void
  resetPickups: () => void
}

function createInitialPickupState(
  pickup: AmmoPickupDefinition,
): AmmoPickupState {
  return {
    ...pickup,
    active: true,
    respawnDeadlineMs: null,
  }
}

export const useAmmoPickupStore = create<AmmoPickupStore>((set) => ({
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
          performance.now() + AMMO_PICKUP_CONFIG.respawnDelaySeconds * 1000,
      }

      return {
        pickups: nextPickups,
      }
    }),
  pickups: AMMO_PICKUP_SPAWNS.map(createInitialPickupState),
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
  resetPickups: () =>
    set({
      pickups: AMMO_PICKUP_SPAWNS.map(createInitialPickupState),
    }),
}))

export function resetAmmoPickups() {
  useAmmoPickupStore.getState().resetPickups()
}
