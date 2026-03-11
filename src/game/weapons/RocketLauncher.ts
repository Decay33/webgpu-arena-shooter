import type {
  Weapon,
  WeaponDefinition,
  WeaponFireContext,
  WeaponProjectileSpawn,
  WeaponShotResult,
  WeaponVisualSettings,
} from './WeaponTypes.ts'

const ROCKET_LAUNCHER_VISUALS: WeaponVisualSettings = {
  muzzleFlashColor: '#ff9f1c',
  muzzleFlashDistance: 0.68,
  muzzleFlashLifetimeMs: 95,
  muzzleFlashSize: 0.18,
  tracerColor: '#ffbf69',
  tracerLifetimeMs: 0,
  tracerThickness: 0.08,
}

const ROCKET_PROJECTILE_CONFIG = {
  blastRadius: 3.9,
  explosionColor: '#ff8c42',
  explosionLifetimeMs: 140,
  explosionSize: 2.3,
  projectileColor: '#ff7b00',
  projectileSize: 0.18,
  speed: 34,
} as const

export const ROCKET_LAUNCHER_DEFINITION: WeaponDefinition = {
  cooldownSeconds: 0.78,
  damage: 90,
  displayName: 'Rocket Launcher',
  fireType: 'projectile',
  id: 'rocketLauncher',
  maxDistance: 120,
  visuals: ROCKET_LAUNCHER_VISUALS,
}

function createRocketProjectile(
  definition: WeaponDefinition,
  context: WeaponFireContext,
): WeaponProjectileSpawn {
  return {
    blastRadius: ROCKET_PROJECTILE_CONFIG.blastRadius,
    color: ROCKET_PROJECTILE_CONFIG.projectileColor,
    damage: definition.damage,
    direction: context.ray.direction,
    explosionColor: ROCKET_PROJECTILE_CONFIG.explosionColor,
    explosionLifetimeMs: ROCKET_PROJECTILE_CONFIG.explosionLifetimeMs,
    explosionSize: ROCKET_PROJECTILE_CONFIG.explosionSize,
    maxDistance: definition.maxDistance,
    position: context.ray.origin,
    size: ROCKET_PROJECTILE_CONFIG.projectileSize,
    speed: ROCKET_PROJECTILE_CONFIG.speed,
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
