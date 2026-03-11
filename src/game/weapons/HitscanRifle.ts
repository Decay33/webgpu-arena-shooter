import type {
  Weapon,
  WeaponFireContext,
  WeaponShotResult,
  WeaponShotVisuals,
} from './WeaponTypes.ts'

const HITSCAN_RIFLE_COOLDOWN_SECONDS = 0.15
const HITSCAN_RIFLE_DAMAGE = 34
const HITSCAN_RIFLE_MAX_DISTANCE = 160
const HITSCAN_RIFLE_TYPE = 'hitscanRifle'
const HITSCAN_RIFLE_VISUALS: WeaponShotVisuals = {
  muzzleFlashColor: '#ffd166',
  muzzleFlashDistance: 0.55,
  muzzleFlashLifetimeMs: 55,
  muzzleFlashSize: 0.11,
  tracerColor: '#ffe29a',
  tracerLifetimeMs: 70,
  tracerThickness: 0.035,
}

export function createHitscanRifle(): Weapon {
  let lastFiredAt = Number.NEGATIVE_INFINITY

  const tryFire = (context: WeaponFireContext): WeaponShotResult | null => {
    if (context.now - lastFiredAt < HITSCAN_RIFLE_COOLDOWN_SECONDS) {
      return null
    }

    lastFiredAt = context.now

    return {
      damage: HITSCAN_RIFLE_DAMAGE,
      hit: context.raycast({
        direction: context.ray.direction,
        maxDistance: HITSCAN_RIFLE_MAX_DISTANCE,
        origin: context.ray.origin,
      }),
      maxDistance: HITSCAN_RIFLE_MAX_DISTANCE,
      visuals: HITSCAN_RIFLE_VISUALS,
      weaponType: HITSCAN_RIFLE_TYPE,
    }
  }

  return {
    cooldownSeconds: HITSCAN_RIFLE_COOLDOWN_SECONDS,
    tryFire,
    type: HITSCAN_RIFLE_TYPE,
  }
}
