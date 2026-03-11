import { create } from 'zustand'

import {
  INITIAL_UNLOCKED_WEAPON_IDS,
  WEAPON_SLOT_ORDER,
} from './WeaponRegistry.ts'
import type { WeaponId } from './WeaponTypes.ts'

type WeaponUnlockState = Record<WeaponId, boolean>

type PlayerWeaponState = {
  currentWeaponId: WeaponId
  switchWeapon: (weaponId: WeaponId) => void
  unlockWeapon: (weaponId: WeaponId) => void
  unlockedWeapons: WeaponUnlockState
}

function createInitialUnlockState(): WeaponUnlockState {
  return {
    rifle: INITIAL_UNLOCKED_WEAPON_IDS.includes('rifle'),
    rocketLauncher: INITIAL_UNLOCKED_WEAPON_IDS.includes('rocketLauncher'),
    shotgun: INITIAL_UNLOCKED_WEAPON_IDS.includes('shotgun'),
  }
}

const INITIAL_UNLOCK_STATE = createInitialUnlockState()

export const usePlayerWeaponStore = create<PlayerWeaponState>((set) => ({
  currentWeaponId: WEAPON_SLOT_ORDER[0],
  switchWeapon: (weaponId) =>
    set((state) => {
      if (!state.unlockedWeapons[weaponId] || state.currentWeaponId === weaponId) {
        return state
      }

      return {
        currentWeaponId: weaponId,
      }
    }),
  unlockWeapon: (weaponId) =>
    set((state) => {
      if (state.unlockedWeapons[weaponId]) {
        return state
      }

      return {
        unlockedWeapons: {
          ...state.unlockedWeapons,
          [weaponId]: true,
        },
      }
    }),
  unlockedWeapons: INITIAL_UNLOCK_STATE,
}))
