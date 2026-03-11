import { create } from 'zustand'

import {
  WEAPON_PICKUP_CONFIG,
  WEAPON_PICKUP_SPAWNS,
  type WeaponPickupWeaponId,
} from './weaponPickupConfig.ts'

export type WeaponPickupId = (typeof WEAPON_PICKUP_SPAWNS)[number]['id']

export type WeaponPickupState = {
  active: boolean
  color: string
  id: WeaponPickupId
  position: [number, number, number]
  respawnDeadlineMs: number | null
  weaponId: WeaponPickupWeaponId
}

type WeaponPickupStore = {
  collectPickup: (pickupId: WeaponPickupId) => void
  pickups: WeaponPickupState[]
  refreshRespawns: (nowMs: number) => void
}

function createInitialPickupState(
  pickup: (typeof WEAPON_PICKUP_SPAWNS)[number],
): WeaponPickupState {
  return {
    active: true,
    color: pickup.color,
    id: pickup.id,
    position: pickup.position,
    respawnDeadlineMs: null,
    weaponId: pickup.weaponId,
  }
}

export const useWeaponPickupStore = create<WeaponPickupStore>((set) => ({
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
          performance.now() + WEAPON_PICKUP_CONFIG.respawnDelaySeconds * 1000,
      }

      return {
        pickups: nextPickups,
      }
    }),
  pickups: WEAPON_PICKUP_SPAWNS.map(createInitialPickupState),
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
