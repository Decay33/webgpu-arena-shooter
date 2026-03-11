import type { RapierRigidBody } from '@react-three/rapier'
import type { World } from '@dimforge/rapier3d-compat'
import type { Camera } from 'three'
import { Vector3 } from 'three'

import { getEnemyIdByColliderHandle } from '../enemies/EnemyRegistry.ts'
import type { HitResult } from './HitResult.ts'

type RapierModule = Pick<typeof import('@dimforge/rapier3d-compat'), 'Ray'>

type CameraRay = {
  direction: [number, number, number]
  origin: [number, number, number]
}

type RaycastRequest = {
  direction: [number, number, number]
  excludeRigidBody?: RapierRigidBody | null
  maxDistance: number
  origin: [number, number, number]
  rapier: RapierModule
  world: World
}

const CAMERA_ORIGIN = new Vector3()
const CAMERA_DIRECTION = new Vector3()
const HIT_POINT = new Vector3()
const HIT_DIRECTION = new Vector3()

export function getCameraRay(camera: Camera): CameraRay {
  camera.getWorldPosition(CAMERA_ORIGIN)
  camera.getWorldDirection(CAMERA_DIRECTION).normalize()

  return {
    direction: [CAMERA_DIRECTION.x, CAMERA_DIRECTION.y, CAMERA_DIRECTION.z],
    origin: [CAMERA_ORIGIN.x, CAMERA_ORIGIN.y, CAMERA_ORIGIN.z],
  }
}

export function raycastWorld({
  direction,
  excludeRigidBody = null,
  maxDistance,
  origin,
  rapier,
  world,
}: RaycastRequest): HitResult | null {
  const ray = new rapier.Ray(
    { x: origin[0], y: origin[1], z: origin[2] },
    { x: direction[0], y: direction[1], z: direction[2] },
  )
  const hit = world.castRayAndGetNormal(
    ray,
    maxDistance,
    true,
    undefined,
    undefined,
    undefined,
    excludeRigidBody ?? undefined,
  )

  if (!hit) {
    return null
  }

  const enemyId = getEnemyIdByColliderHandle(hit.collider.handle)

  HIT_POINT.set(origin[0], origin[1], origin[2]).addScaledVector(
    HIT_DIRECTION.set(direction[0], direction[1], direction[2]),
    hit.timeOfImpact,
  )

  return {
    colliderHandle: hit.collider.handle,
    distance: hit.timeOfImpact,
    enemyId: enemyId ?? undefined,
    normal: [hit.normal.x, hit.normal.y, hit.normal.z],
    point: [HIT_POINT.x, HIT_POINT.y, HIT_POINT.z],
    targetType: enemyId ? 'enemy' : 'world',
  }
}
