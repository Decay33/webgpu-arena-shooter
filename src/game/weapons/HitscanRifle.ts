import type {
  Weapon,
  WeaponFireContext,
  WeaponShotResult,
} from './WeaponTypes.ts'
import { HITSCAN_RIFLE_DEFINITION } from '../config/weaponBalance.ts'
import type { WeaponDefinition } from './WeaponTypes.ts'

export { HITSCAN_RIFLE_DEFINITION } from '../config/weaponBalance.ts'

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
      projectiles: [],
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
