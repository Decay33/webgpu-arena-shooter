import { Vector3 } from 'three'

import type {
  Weapon,
  WeaponDefinition,
  WeaponFireContext,
  WeaponShotResult,
  WeaponVisualSettings,
} from './WeaponTypes.ts'

const WORLD_UP = new Vector3(0, 1, 0)
const WORLD_RIGHT = new Vector3(1, 0, 0)
const BASE_DIRECTION = new Vector3()
const RIGHT_VECTOR = new Vector3()
const UP_VECTOR = new Vector3()
const SPREAD_DIRECTION = new Vector3()

const SHOTGUN_PELLET_PATTERN: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [-0.72, 0.14],
  [0.72, 0.14],
  [-0.2, -0.62],
  [0.2, -0.62],
  [-0.95, -0.32],
  [0.95, -0.32],
  [0, 0.88],
]

const SHOTGUN_PELLET_DAMAGE = 12
const SHOTGUN_SPREAD_ANGLE_DEGREES = 5.5
const SHOTGUN_VISUALS: WeaponVisualSettings = {
  muzzleFlashColor: '#ffb703',
  muzzleFlashDistance: 0.58,
  muzzleFlashLifetimeMs: 75,
  muzzleFlashSize: 0.16,
  tracerColor: '#ffcf6e',
  tracerLifetimeMs: 95,
  tracerThickness: 0.05,
}

export const HITSCAN_SHOTGUN_DEFINITION: WeaponDefinition = {
  cooldownSeconds: 0.62,
  damage: SHOTGUN_PELLET_DAMAGE * SHOTGUN_PELLET_PATTERN.length,
  displayName: 'Shotgun',
  fireType: 'hitscan',
  id: 'shotgun',
  maxDistance: 34,
  visuals: SHOTGUN_VISUALS,
}

function getSpreadDirection(
  baseDirection: [number, number, number],
  horizontalOffset: number,
  verticalOffset: number,
): [number, number, number] {
  BASE_DIRECTION
    .set(baseDirection[0], baseDirection[1], baseDirection[2])
    .normalize()

  const referenceUp =
    Math.abs(BASE_DIRECTION.dot(WORLD_UP)) > 0.98 ? WORLD_RIGHT : WORLD_UP

  RIGHT_VECTOR.crossVectors(BASE_DIRECTION, referenceUp).normalize()
  UP_VECTOR.crossVectors(RIGHT_VECTOR, BASE_DIRECTION).normalize()

  const spreadScale = Math.tan(
    (SHOTGUN_SPREAD_ANGLE_DEGREES * Math.PI) / 180,
  )

  SPREAD_DIRECTION.copy(BASE_DIRECTION)
    .addScaledVector(RIGHT_VECTOR, horizontalOffset * spreadScale)
    .addScaledVector(UP_VECTOR, verticalOffset * spreadScale)
    .normalize()

  return [
    SPREAD_DIRECTION.x,
    SPREAD_DIRECTION.y,
    SPREAD_DIRECTION.z,
  ]
}

export function createHitscanShotgun(
  definition: WeaponDefinition = HITSCAN_SHOTGUN_DEFINITION,
): Weapon {
  let lastFiredAt = Number.NEGATIVE_INFINITY

  const tryFire = (context: WeaponFireContext): WeaponShotResult | null => {
    if (context.now - lastFiredAt < definition.cooldownSeconds) {
      return null
    }

    lastFiredAt = context.now

    return {
      definition,
      traces: SHOTGUN_PELLET_PATTERN.map(([horizontalOffset, verticalOffset]) => {
        const direction = getSpreadDirection(
          context.ray.direction,
          horizontalOffset,
          verticalOffset,
        )

        return {
          damage: SHOTGUN_PELLET_DAMAGE,
          direction,
          hit: context.raycast({
            direction,
            maxDistance: definition.maxDistance,
            origin: context.ray.origin,
          }),
        }
      }),
    }
  }

  return {
    definition,
    tryFire,
  }
}
