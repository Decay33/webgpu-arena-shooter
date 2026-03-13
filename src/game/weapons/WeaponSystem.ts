import {
  useEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
} from 'react'

import { type RapierRigidBody, useRapier } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import { Euler, Quaternion, Vector3 } from 'three'

import { debugGameLog } from '../../shared/constants/debug.ts'
import { getCameraRay, raycastWorld } from '../combat/RaycastSystem.ts'
import { WEAPON_VIEWMODEL_CONFIG } from '../config/weaponViewmodels.ts'
import { applyDamageToEnemyByCollider } from '../enemies/EnemyRegistry.ts'
import { applyDamageToEnemiesInRadius } from '../enemies/EnemySystem.ts'
import { useRunStore } from '../core/state/runStore.ts'
import { usePlayerHealthStore } from '../player/health/playerHealthStore.ts'
import { useRendererStore } from '../renderer/state/rendererStore.ts'
import { createWeaponById } from './WeaponRegistry.ts'
import type {
  Explosion,
  HitMarker,
  MuzzleFlash,
  Tracer,
  WeaponProjectile,
  WeaponVfxController,
} from './WeaponVfxTypes.ts'
import { usePlayerWeaponStore } from './playerWeaponStore.ts'
import { WEAPON_AMMO_CONFIG } from './weaponAmmoConfig.ts'
import type {
  Weapon,
  WeaponId,
  WeaponProjectileSpawn,
  WeaponRay,
  WeaponShotResult,
  WeaponTraceResult,
} from './WeaponTypes.ts'

export type WeaponSystemProps = {
  bodyRef: RefObject<RapierRigidBody | null>
  muzzleWorldPositionRef: MutableRefObject<[number, number, number] | null>
  vfxControllerRef: MutableRefObject<WeaponVfxController | null>
}

export type WeaponSystemResult = {
  shotSequenceRef: MutableRefObject<number>
}

type FiredShot = WeaponShotResult & {
  ray: WeaponRay
}

const HIT_MARKER_NORMAL_OFFSET = 0.08
const ROCKET_EXPLOSION_SOURCE = 'rocketLauncher:explosion'
const MUZZLE_LOCAL_ROTATION = new Euler(0, 0, 0, 'XYZ')
const MUZZLE_LOCAL_QUATERNION = new Quaternion()
const MUZZLE_LOCAL_OFFSET = new Vector3()
const MUZZLE_TRANSFORM_OFFSET = new Vector3()
const MUZZLE_WORLD_OFFSET = new Vector3()

function offsetHitMarkerPosition(
  point: [number, number, number],
  normal: [number, number, number],
): [number, number, number] {
  return [
    point[0] + normal[0] * HIT_MARKER_NORMAL_OFFSET,
    point[1] + normal[1] * HIT_MARKER_NORMAL_OFFSET,
    point[2] + normal[2] * HIT_MARKER_NORMAL_OFFSET,
  ]
}

function offsetAlongRay(
  origin: [number, number, number],
  direction: [number, number, number],
  distance: number,
): [number, number, number] {
  return [
    origin[0] + direction[0] * distance,
    origin[1] + direction[1] * distance,
    origin[2] + direction[2] * distance,
  ]
}

function getViewmodelMuzzlePosition(
  camera: {
    position: Vector3
    quaternion: Quaternion
  },
  weaponId: WeaponId,
  muzzleWorldPositionRef: MutableRefObject<[number, number, number] | null>,
): [number, number, number] {
  if (muzzleWorldPositionRef.current) {
    return muzzleWorldPositionRef.current
  }

  const config = WEAPON_VIEWMODEL_CONFIG[weaponId]

  MUZZLE_LOCAL_ROTATION.set(
    config.transformRotation[0],
    config.transformRotation[1],
    config.transformRotation[2],
  )
  MUZZLE_LOCAL_QUATERNION.setFromEuler(MUZZLE_LOCAL_ROTATION)
  MUZZLE_TRANSFORM_OFFSET.set(
    config.transformPosition[0],
    config.transformPosition[1],
    config.transformPosition[2],
  )
  MUZZLE_LOCAL_OFFSET.set(
    config.muzzleLocalPosition[0],
    config.muzzleLocalPosition[1],
    config.muzzleLocalPosition[2],
  ).applyQuaternion(MUZZLE_LOCAL_QUATERNION)

  MUZZLE_WORLD_OFFSET
    .copy(MUZZLE_TRANSFORM_OFFSET)
    .add(MUZZLE_LOCAL_OFFSET)
    .applyQuaternion(camera.quaternion)
    .add(camera.position)

  return [MUZZLE_WORLD_OFFSET.x, MUZZLE_WORLD_OFFSET.y, MUZZLE_WORLD_OFFSET.z]
}

function getOrCreateWeaponInstance(
  weaponInstances: Partial<Record<WeaponId, Weapon>>,
  weaponId: WeaponId,
): Weapon | null {
  const existingWeapon = weaponInstances[weaponId]

  if (existingWeapon) {
    return existingWeapon
  }

  const nextWeapon = createWeaponById(weaponId)

  if (!nextWeapon) {
    return null
  }

  weaponInstances[weaponId] = nextWeapon
  return nextWeapon
}

function createHitMarker(
  effectId: number,
  shotResult: FiredShot,
  point: [number, number, number],
  normal: [number, number, number],
  createdAt: number,
): HitMarker | null {
  if (shotResult.definition.visuals.impactLifetimeMs <= 0) {
    return null
  }

  return {
    accentColor: shotResult.definition.visuals.impactAccentColor,
    color: shotResult.definition.visuals.impactColor,
    createdAt,
    glowColor: shotResult.definition.visuals.impactGlowColor,
    id: effectId,
    lifetimeMs: shotResult.definition.visuals.impactLifetimeMs,
    normal,
    position: offsetHitMarkerPosition(point, normal),
    ringSize: shotResult.definition.visuals.impactRingSize,
    sparkLength: shotResult.definition.visuals.impactSparkLength,
    sparkWidth: shotResult.definition.visuals.impactSparkWidth,
    size: shotResult.definition.visuals.impactSize,
  }
}

function createMuzzleFlash(
  effectId: number,
  camera: {
    position: Vector3
    quaternion: Quaternion
  },
  muzzleWorldPositionRef: MutableRefObject<[number, number, number] | null>,
  shotResult: FiredShot,
  createdAt: number,
): MuzzleFlash | null {
  if (shotResult.definition.visuals.muzzleFlashLifetimeMs <= 0) {
    return null
  }

  const muzzlePosition = getViewmodelMuzzlePosition(
    camera,
    shotResult.definition.id,
    muzzleWorldPositionRef,
  )

  return {
    color: shotResult.definition.visuals.muzzleFlashColor,
    createdAt,
    direction: shotResult.ray.direction,
    glowColor: shotResult.definition.visuals.muzzleFlashGlowColor,
    id: effectId,
    length: shotResult.definition.visuals.muzzleFlashLength,
    lifetimeMs: shotResult.definition.visuals.muzzleFlashLifetimeMs,
    lightDistance: shotResult.definition.visuals.muzzleFlashLightDistance,
    lightIntensity: shotResult.definition.visuals.muzzleFlashLightIntensity,
    position: offsetAlongRay(
      muzzlePosition,
      shotResult.ray.direction,
      shotResult.definition.visuals.muzzleFlashDistance,
    ),
    secondaryColor: shotResult.definition.visuals.muzzleFlashSecondaryColor,
    size: shotResult.definition.visuals.muzzleFlashSize,
    sparkColor: shotResult.definition.visuals.muzzleFlashSparkColor,
  }
}

function createProjectile(
  effectId: number,
  projectile: WeaponProjectileSpawn,
): WeaponProjectile {
  return {
    ...projectile,
    distanceTraveled: 0,
    id: effectId,
    position: offsetAlongRay(
      projectile.position,
      projectile.direction,
      projectile.size + 0.75,
    ),
  }
}

function createTracer(
  effectId: number,
  camera: {
    position: Vector3
    quaternion: Quaternion
  },
  muzzleWorldPositionRef: MutableRefObject<[number, number, number] | null>,
  shotResult: FiredShot,
  trace: WeaponTraceResult,
  createdAt: number,
): Tracer | null {
  if (shotResult.definition.visuals.tracerLifetimeMs <= 0) {
    return null
  }

  return {
    color: shotResult.definition.visuals.tracerColor,
    createdAt,
    end:
      trace.hit?.point ??
      offsetAlongRay(
        shotResult.ray.origin,
        trace.direction,
        shotResult.definition.maxDistance,
      ),
    glowColor: shotResult.definition.visuals.tracerGlowColor,
    glowThickness: shotResult.definition.visuals.tracerGlowThickness,
    id: effectId,
    lifetimeMs: shotResult.definition.visuals.tracerLifetimeMs,
    start: offsetAlongRay(
      getViewmodelMuzzlePosition(
        camera,
        shotResult.definition.id,
        muzzleWorldPositionRef,
      ),
      trace.direction,
      shotResult.definition.visuals.muzzleFlashDistance * 0.5,
    ),
    thickness: shotResult.definition.visuals.tracerThickness,
    tipColor: shotResult.definition.visuals.tracerTipColor,
    tipSize: shotResult.definition.visuals.tracerTipSize,
  }
}

function createExplosion(
  effectId: number,
  projectile: WeaponProjectile,
  position: [number, number, number],
  createdAt: number,
): Explosion | null {
  if (projectile.explosionLifetimeMs <= 0) {
    return null
  }

  return {
    accentColor: projectile.explosionAccentColor,
    color: projectile.explosionColor,
    createdAt,
    glowColor: projectile.explosionGlowColor,
    id: effectId,
    lifetimeMs: projectile.explosionLifetimeMs,
    lightDistance: projectile.explosionLightDistance,
    lightIntensity: projectile.explosionLightIntensity,
    position,
    ringColor: projectile.explosionRingColor,
    ringSize: projectile.explosionRingSize,
    sparkColor: projectile.explosionSparkColor,
    size: projectile.explosionSize,
  }
}

export function useWeaponSystem({
  bodyRef,
  muzzleWorldPositionRef,
  vfxControllerRef,
}: WeaponSystemProps): WeaponSystemResult {
  const camera = useThree((state) => state.camera)
  const currentWeaponId = usePlayerWeaponStore((state) => state.currentWeaponId)
  const playerAlive = usePlayerHealthStore((state) => state.alive)
  const pointerLocked = useRendererStore((state) => state.pointerLocked)
  const runState = useRunStore((state) => state.runState)
  const { rapier, world } = useRapier()
  const weaponInstancesRef = useRef<Partial<Record<WeaponId, Weapon>>>({})
  const projectilesRef = useRef<WeaponProjectile[]>([])
  const shotSequenceRef = useRef(0)
  const effectIdRef = useRef(0)
  const effectsClearedRef = useRef(false)

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        !pointerLocked ||
        !playerAlive ||
        runState !== 'running'
      ) {
        return
      }

      const equippedWeapon = getOrCreateWeaponInstance(
        weaponInstancesRef.current,
        currentWeaponId,
      )

      if (!equippedWeapon) {
        return
      }

      const { ammoByWeapon, consumeAmmo } = usePlayerWeaponStore.getState()
      const ammoConfig = WEAPON_AMMO_CONFIG[currentWeaponId]
      const currentAmmo = ammoByWeapon[currentWeaponId].currentAmmo

      if (currentAmmo < ammoConfig.ammoPerShot) {
        return
      }

      const shotNowMs = performance.now()
      const shotRay = getCameraRay(camera)
      const shotResult = equippedWeapon.tryFire({
        now: shotNowMs / 1000,
        ray: shotRay,
        raycast: ({ direction, maxDistance, origin }) =>
          raycastWorld({
            direction,
            excludeRigidBody: bodyRef.current,
            maxDistance,
            origin,
            rapier,
            world,
          }),
      })

      if (!shotResult) {
        return
      }

      if (!consumeAmmo(currentWeaponId, ammoConfig.ammoPerShot)) {
        return
      }

      const vfxController = vfxControllerRef.current
      const firedShot: FiredShot = {
        ...shotResult,
        ray: shotRay,
      }
      const pendingEnemyDamage = new Map<number, number>()
      const hitPoints: [number, number, number][] = []
      const spawnedProjectiles: WeaponProjectile[] = []

      shotSequenceRef.current += 1

      const muzzleFlash = createMuzzleFlash(
        effectIdRef.current++,
        camera,
        muzzleWorldPositionRef,
        firedShot,
        shotNowMs,
      )

      if (muzzleFlash) {
        vfxController?.spawnMuzzleFlash(muzzleFlash)
      }

      shotResult.projectiles.forEach((projectile) => {
        spawnedProjectiles.push(createProjectile(effectIdRef.current++, projectile))
      })

      if (spawnedProjectiles.length > 0) {
        const activeProjectiles = projectilesRef.current

        spawnedProjectiles.forEach((projectile) => {
          activeProjectiles.push(projectile)
        })

        vfxController?.setProjectiles(activeProjectiles)
      }

      shotResult.traces.forEach((trace) => {
        const tracer = createTracer(
          effectIdRef.current++,
          camera,
          muzzleWorldPositionRef,
          firedShot,
          trace,
          shotNowMs,
        )

        if (tracer) {
          vfxController?.spawnTracer(tracer)
        }

        if (!trace.hit) {
          return
        }

        hitPoints.push(trace.hit.point)

        if (trace.hit.targetType === 'enemy') {
          pendingEnemyDamage.set(
            trace.hit.colliderHandle,
            (pendingEnemyDamage.get(trace.hit.colliderHandle) ?? 0) +
              trace.damage,
          )
        }

        const hitMarker = createHitMarker(
          effectIdRef.current++,
          firedShot,
          trace.hit.point,
          trace.hit.normal,
          shotNowMs,
        )

        if (hitMarker) {
          vfxController?.spawnHitMarker(hitMarker)
        }
      })

      pendingEnemyDamage.forEach((totalDamage, colliderHandle) => {
        applyDamageToEnemyByCollider(colliderHandle, {
          amount: totalDamage,
          source: shotResult.definition.id,
        })
      })

      if (hitPoints.length > 0) {
        debugGameLog(`${shotResult.definition.displayName} hit`, hitPoints)
      }
    }

    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [
    bodyRef,
    camera,
    currentWeaponId,
    muzzleWorldPositionRef,
    playerAlive,
    pointerLocked,
    rapier,
    runState,
    vfxControllerRef,
    world,
  ])

  useFrame((_, delta) => {
    if (useRunStore.getState().runState !== 'running') {
      if (effectsClearedRef.current) {
        return
      }

      projectilesRef.current = []
      vfxControllerRef.current?.clear()
      effectsClearedRef.current = true
      return
    }

    effectsClearedRef.current = false

    const activeProjectiles = projectilesRef.current

    if (activeProjectiles.length === 0) {
      return
    }

    const nowMs = performance.now()
    let writeIndex = 0
    let projectileCountChanged = false

    activeProjectiles.forEach((projectile, readIndex) => {
      const stepDistance = projectile.speed * delta
      const hit = raycastWorld({
        direction: projectile.direction,
        excludeRigidBody: bodyRef.current,
        maxDistance: stepDistance,
        origin: projectile.position,
        rapier,
        world,
      })

      if (hit) {
        const damagedEnemies = applyDamageToEnemiesInRadius(
          hit.point,
          projectile.blastRadius,
          {
            amount: projectile.damage,
            source: ROCKET_EXPLOSION_SOURCE,
          },
        )

        debugGameLog(
          'Rocket exploded',
          hit.point,
          `${damagedEnemies} enemies hit`,
        )

        const explosion = createExplosion(
          effectIdRef.current++,
          projectile,
          hit.point,
          nowMs,
        )

        if (explosion) {
          vfxControllerRef.current?.spawnExplosion(explosion)
        }

        projectileCountChanged = true
        return
      }

      const nextDistanceTraveled = projectile.distanceTraveled + stepDistance
      const nextPosition = offsetAlongRay(
        projectile.position,
        projectile.direction,
        stepDistance,
      )

      if (nextDistanceTraveled >= projectile.maxDistance) {
        const damagedEnemies = applyDamageToEnemiesInRadius(
          nextPosition,
          projectile.blastRadius,
          {
            amount: projectile.damage,
            source: ROCKET_EXPLOSION_SOURCE,
          },
        )

        debugGameLog(
          'Rocket exploded',
          nextPosition,
          `${damagedEnemies} enemies hit`,
        )

        const explosion = createExplosion(
          effectIdRef.current++,
          projectile,
          nextPosition,
          nowMs,
        )

        if (explosion) {
          vfxControllerRef.current?.spawnExplosion(explosion)
        }

        projectileCountChanged = true
        return
      }

      projectile.distanceTraveled = nextDistanceTraveled
      projectile.position[0] = nextPosition[0]
      projectile.position[1] = nextPosition[1]
      projectile.position[2] = nextPosition[2]

      activeProjectiles[writeIndex] = projectile
      projectileCountChanged ||= writeIndex !== readIndex
      writeIndex += 1
    })

    if (writeIndex !== activeProjectiles.length) {
      activeProjectiles.length = writeIndex
      projectileCountChanged = true
    }

    if (projectileCountChanged) {
      vfxControllerRef.current?.setProjectiles(activeProjectiles)
    }
  })

  return {
    shotSequenceRef,
  }
}
