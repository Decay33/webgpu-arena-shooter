import type { Vector3Tuple } from '@react-three/rapier'

export const PLAYER_MOVEMENT_CONFIG = {
  spawnPosition: [0, 2.2, 18] as const,
  capsuleRadius: 0.35,
  capsuleHalfHeight: 0.5,
  eyeHeight: 0.45,
  walkSpeed: 5.75,
  sprintMultiplier: 1.55,
  jumpVelocity: 8.5,
  gravity: -24,
  airControl: 0.18,
  groundProbeDistance: 0.16,
  minGroundNormalY: 0.7,
  pointerSpeed: 0.7,
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
