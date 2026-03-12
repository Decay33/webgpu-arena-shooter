import { Vector3 } from 'three'

import {
  HITSCAN_SHOTGUN_DEFINITION,
  HITSCAN_SHOTGUN_PELLET_DAMAGE,
  HITSCAN_SHOTGUN_SPREAD_ANGLE_DEGREES,
  SHOTGUN_PELLET_PATTERN,
} from '../config/weaponBalance.ts'
import type {
  Weapon,
  WeaponFireContext,
  WeaponShotResult,
} from './WeaponTypes.ts'
import type { WeaponDefinition } from './WeaponTypes.ts'

export { HITSCAN_SHOTGUN_DEFINITION } from '../config/weaponBalance.ts'

const WORLD_UP = new Vector3(0, 1, 0)
const WORLD_RIGHT = new Vector3(1, 0, 0)
const BASE_DIRECTION = new Vector3()
const RIGHT_VECTOR = new Vector3()
const UP_VECTOR = new Vector3()
const SPREAD_DIRECTION = new Vector3()

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
    (HITSCAN_SHOTGUN_SPREAD_ANGLE_DEGREES * Math.PI) / 180,
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
      projectiles: [],
      traces: SHOTGUN_PELLET_PATTERN.map(([horizontalOffset, verticalOffset]) => {
        const direction = getSpreadDirection(
          context.ray.direction,
          horizontalOffset,
          verticalOffset,
        )

        return {
          damage: HITSCAN_SHOTGUN_PELLET_DAMAGE,
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
