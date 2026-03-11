import { createHitscanRifle, HITSCAN_RIFLE_DEFINITION } from './HitscanRifle.ts'
import {
  createHitscanShotgun,
  HITSCAN_SHOTGUN_DEFINITION,
} from './HitscanShotgun.ts'
import {
  createRocketLauncher,
  ROCKET_LAUNCHER_DEFINITION,
} from './RocketLauncher.ts'
import type { Weapon, WeaponDefinition, WeaponId } from './WeaponTypes.ts'

export const WEAPON_DEFINITIONS: Record<WeaponId, WeaponDefinition> = {
  rifle: HITSCAN_RIFLE_DEFINITION,
  rocketLauncher: ROCKET_LAUNCHER_DEFINITION,
  shotgun: HITSCAN_SHOTGUN_DEFINITION,
}

export const WEAPON_SLOT_ORDER: WeaponId[] = [
  'rifle',
  'shotgun',
  'rocketLauncher',
]

export const INITIAL_UNLOCKED_WEAPON_IDS: WeaponId[] = ['rifle']

export function getWeaponDefinition(weaponId: WeaponId): WeaponDefinition {
  return WEAPON_DEFINITIONS[weaponId]
}

export function createWeaponById(weaponId: WeaponId): Weapon | null {
  switch (weaponId) {
    case 'rifle':
      return createHitscanRifle()
    case 'shotgun':
      return createHitscanShotgun()
    case 'rocketLauncher':
      return createRocketLauncher()
  }
}
