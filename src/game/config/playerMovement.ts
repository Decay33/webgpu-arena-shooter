import type { Vector3Tuple } from '@react-three/rapier'

import { GREYBOX_ARENA_PLAYER_SPAWN_POSITION } from '../world/map/greyboxArenaLayout.ts'

export const PLAYER_MOVEMENT_CONFIG = {
  spawnPosition: GREYBOX_ARENA_PLAYER_SPAWN_POSITION,
  capsuleRadius: 0.35,
  capsuleHalfHeight: 0.5,
  eyeHeight: 0.45,
  walkSpeed: 6.25,
  sprintMultiplier: 1.34,
  jumpVelocity: 9.15,
  gravity: -29,
  groundAcceleration: 20,
  groundDeceleration: 16,
  airAcceleration: 6.5,
  airDeceleration: 3.5,
  groundProbeDistance: 0.16,
  minGroundNormalY: 0.7,
  pointerSpeed: 0.72,
  debugSampleInterval: 0.1,
}

export const PLAYER_HALF_HEIGHT =
  PLAYER_MOVEMENT_CONFIG.capsuleHalfHeight +
  PLAYER_MOVEMENT_CONFIG.capsuleRadius

export const PLAYER_WORLD_GRAVITY: Vector3Tuple = [
  0,
  PLAYER_MOVEMENT_CONFIG.gravity,
  0,
]
