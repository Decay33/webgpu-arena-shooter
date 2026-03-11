import { createHitscanRifle, HITSCAN_RIFLE_DEFINITION } from './HitscanRifle.ts'
import {
  createHitscanShotgun,
  HITSCAN_SHOTGUN_DEFINITION,
} from './HitscanShotgun.ts'
import type { Weapon, WeaponDefinition, WeaponId, WeaponVisualSettings } from './WeaponTypes.ts'

const ROCKET_LAUNCHER_VISUALS: WeaponVisualSettings = {
  muzzleFlashColor: '#ffb36b',
  muzzleFlashDistance: 0.62,
  muzzleFlashLifetimeMs: 80,
  muzzleFlashSize: 0.15,
  tracerColor: '#ff9f1c',
  tracerLifetimeMs: 90,
  tracerThickness: 0.06,
}

const ROCKET_LAUNCHER_DEFINITION: WeaponDefinition = {
  cooldownSeconds: 0.95,
  damage: 100,
  displayName: 'Rocket Launcher',
  fireType: 'projectile',
  id: 'rocketLauncher',
  maxDistance: 120,
  visuals: ROCKET_LAUNCHER_VISUALS,
}

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

export const INITIAL_UNLOCKED_WEAPON_IDS: WeaponId[] = ['rifle', 'shotgun']

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
      return null
  }
}
