import type {
  Weapon,
  WeaponDefinition,
  WeaponFireContext,
  WeaponShotResult,
  WeaponVisualSettings,
} from './WeaponTypes.ts'

const HITSCAN_RIFLE_VISUALS: WeaponVisualSettings = {
  muzzleFlashColor: '#ffd166',
  muzzleFlashDistance: 0.55,
  muzzleFlashLifetimeMs: 55,
  muzzleFlashSize: 0.11,
  tracerColor: '#ffe29a',
  tracerLifetimeMs: 70,
  tracerThickness: 0.035,
}

export const HITSCAN_RIFLE_DEFINITION: WeaponDefinition = {
  cooldownSeconds: 0.15,
  damage: 34,
  displayName: 'Rifle',
  fireType: 'hitscan',
  id: 'rifle',
  maxDistance: 160,
  visuals: HITSCAN_RIFLE_VISUALS,
}

export function createHitscanRifle(
  definition: WeaponDefinition = HITSCAN_RIFLE_DEFINITION,
): Weapon {
  let lastFiredAt = Number.NEGATIVE_INFINITY

  const tryFire = (context: WeaponFireContext): WeaponShotResult | null => {
    if (context.now - lastFiredAt < definition.cooldownSeconds) {
      return null
    }

    lastFiredAt = context.now

    return {
      definition,
      traces: [
        {
          damage: definition.damage,
          direction: context.ray.direction,
          hit: context.raycast({
            direction: context.ray.direction,
            maxDistance: definition.maxDistance,
            origin: context.ray.origin,
          }),
        },
      ],
    }
  }

  return {
    definition,
    tryFire,
  }
}
