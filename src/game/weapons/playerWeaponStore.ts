import { create } from 'zustand'

import {
  INITIAL_UNLOCKED_WEAPON_IDS,
  WEAPON_SLOT_ORDER,
} from './WeaponRegistry.ts'
import type { WeaponId } from './WeaponTypes.ts'
import { WEAPON_AMMO_CONFIG } from './weaponAmmoConfig.ts'

export type WeaponAmmoState = {
  currentAmmo: number
  maxAmmo: number
}

type WeaponAmmoInventory = Record<WeaponId, WeaponAmmoState>
type WeaponUnlockState = Record<WeaponId, boolean>

type PlayerWeaponState = {
  ammoByWeapon: WeaponAmmoInventory
  consumeAmmo: (weaponId: WeaponId, amount: number) => boolean
  currentWeaponId: WeaponId
  grantAmmo: (weaponId: WeaponId, amount: number) => number
  resetWeapons: () => void
  switchWeapon: (weaponId: WeaponId) => void
  unlockWeapon: (weaponId: WeaponId) => void
  unlockedWeapons: WeaponUnlockState
}

function createInitialAmmoState(): WeaponAmmoInventory {
  return {
    rifle: {
      currentAmmo: INITIAL_UNLOCKED_WEAPON_IDS.includes('rifle')
        ? WEAPON_AMMO_CONFIG.rifle.startingAmmo
        : 0,
      maxAmmo: WEAPON_AMMO_CONFIG.rifle.maxAmmo,
    },
    rocketLauncher: {
      currentAmmo: INITIAL_UNLOCKED_WEAPON_IDS.includes('rocketLauncher')
        ? WEAPON_AMMO_CONFIG.rocketLauncher.startingAmmo
        : 0,
      maxAmmo: WEAPON_AMMO_CONFIG.rocketLauncher.maxAmmo,
    },
    shotgun: {
      currentAmmo: INITIAL_UNLOCKED_WEAPON_IDS.includes('shotgun')
        ? WEAPON_AMMO_CONFIG.shotgun.startingAmmo
        : 0,
      maxAmmo: WEAPON_AMMO_CONFIG.shotgun.maxAmmo,
    },
  }
}

function createInitialUnlockState(): WeaponUnlockState {
  return {
    rifle: INITIAL_UNLOCKED_WEAPON_IDS.includes('rifle'),
    rocketLauncher: INITIAL_UNLOCKED_WEAPON_IDS.includes('rocketLauncher'),
    shotgun: INITIAL_UNLOCKED_WEAPON_IDS.includes('shotgun'),
  }
}

const INITIAL_AMMO_STATE = createInitialAmmoState()
const INITIAL_UNLOCK_STATE = createInitialUnlockState()

export const usePlayerWeaponStore = create<PlayerWeaponState>((set) => ({
  ammoByWeapon: INITIAL_AMMO_STATE,
  consumeAmmo: (weaponId, amount) => {
    if (amount <= 0) {
      return false
    }

    let didConsumeAmmo = false

    set((state) => {
      const ammoState = state.ammoByWeapon[weaponId]

      if (ammoState.currentAmmo < amount) {
        return state
      }

      didConsumeAmmo = true

      return {
        ammoByWeapon: {
          ...state.ammoByWeapon,
          [weaponId]: {
            ...ammoState,
            currentAmmo: ammoState.currentAmmo - amount,
          },
        },
      }
    })

    return didConsumeAmmo
  },
  currentWeaponId: WEAPON_SLOT_ORDER[0],
  grantAmmo: (weaponId, amount) => {
    if (amount <= 0) {
      return 0
    }

    let grantedAmmo = 0

    set((state) => {
      const ammoState = state.ammoByWeapon[weaponId]
      const nextAmmo = Math.min(ammoState.maxAmmo, ammoState.currentAmmo + amount)
      grantedAmmo = nextAmmo - ammoState.currentAmmo

      if (grantedAmmo <= 0) {
        return state
      }

      return {
        ammoByWeapon: {
          ...state.ammoByWeapon,
          [weaponId]: {
            ...ammoState,
            currentAmmo: nextAmmo,
          },
        },
      }
    })

    return grantedAmmo
  },
  resetWeapons: () =>
    set({
      ammoByWeapon: createInitialAmmoState(),
      currentWeaponId: WEAPON_SLOT_ORDER[0],
      unlockedWeapons: createInitialUnlockState(),
    }),
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

      const ammoConfig = WEAPON_AMMO_CONFIG[weaponId]
      const ammoState = state.ammoByWeapon[weaponId]
      const nextAmmo = Math.min(
        ammoState.maxAmmo,
        ammoState.currentAmmo + ammoConfig.unlockAmmo,
      )

      return {
        ammoByWeapon: {
          ...state.ammoByWeapon,
          [weaponId]: {
            ...ammoState,
            currentAmmo: nextAmmo,
          },
        },
        unlockedWeapons: {
          ...state.unlockedWeapons,
          [weaponId]: true,
        },
      }
    }),
  unlockedWeapons: INITIAL_UNLOCK_STATE,
}))

export function resetWeapons() {
  usePlayerWeaponStore.getState().resetWeapons()
}
