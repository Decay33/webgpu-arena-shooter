import type {
  Weapon,
  WeaponFireContext,
  WeaponProjectileSpawn,
  WeaponShotResult,
} from './WeaponTypes.ts'
import {
  ROCKET_LAUNCHER_DEFINITION,
  ROCKET_PROJECTILE_CONFIG,
} from '../config/weaponBalance.ts'
import type { WeaponDefinition } from './WeaponTypes.ts'

export { ROCKET_LAUNCHER_DEFINITION } from '../config/weaponBalance.ts'

function createRocketProjectile(
  definition: WeaponDefinition,
  context: WeaponFireContext,
): WeaponProjectileSpawn {
  return {
    ...ROCKET_PROJECTILE_CONFIG,
    damage: definition.damage,
    direction: context.ray.direction,
    maxDistance: definition.maxDistance,
    position: context.ray.origin,
  }
}

export function createRocketLauncher(
  definition: WeaponDefinition = ROCKET_LAUNCHER_DEFINITION,
): Weapon {
  let lastFiredAt = Number.NEGATIVE_INFINITY

  const tryFire = (context: WeaponFireContext): WeaponShotResult | null => {
    if (context.now - lastFiredAt < definition.cooldownSeconds) {
      return null
    }

    lastFiredAt = context.now

    return {
      definition,
      projectiles: [createRocketProjectile(definition, context)],
      traces: [],
    }
  }

  return {
    definition,
    tryFire,
  }
}
