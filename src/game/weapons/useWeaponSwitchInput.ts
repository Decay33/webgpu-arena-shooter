import { useEffect } from 'react'

import { useRunStore } from '../core/state/runStore.ts'
import { usePlayerWeaponStore } from './playerWeaponStore.ts'
import type { WeaponId } from './WeaponTypes.ts'

const WEAPON_KEY_BINDINGS: Record<string, WeaponId> = {
  Digit1: 'rifle',
  Digit2: 'shotgun',
  Digit3: 'rocketLauncher',
}

export function useWeaponSwitchInput() {
  const switchWeapon = usePlayerWeaponStore((state) => state.switchWeapon)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (useRunStore.getState().runState !== 'running') {
        return
      }

      const nextWeaponId = WEAPON_KEY_BINDINGS[event.code]

      if (!nextWeaponId) {
        return
      }

      event.preventDefault()
      switchWeapon(nextWeaponId)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [switchWeapon])
}
