import { useEffect, useRef, useState, type RefObject } from 'react'

import { type RapierRigidBody, useRapier } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'

import { getCameraRay, raycastWorld } from '../combat/RaycastSystem.ts'
import { applyDamageToEnemyByCollider } from '../enemies/EnemyRegistry.ts'
import { applyDamageToEnemiesInRadius } from '../enemies/EnemySystem.ts'
import { useRunStore } from '../core/state/runStore.ts'
import { usePlayerHealthStore } from '../player/health/playerHealthStore.ts'
import { useRendererStore } from '../renderer/state/rendererStore.ts'
import { createWeaponById } from './WeaponRegistry.ts'
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

export type HitMarker = {
  color: string
  createdAt: number
  glowColor: string
  id: number
  lifetimeMs: number
  normal: [number, number, number]
  position: [number, number, number]
  ringSize: number
  size: number
}

export type MuzzleFlash = {
  color: string
  createdAt: number
  direction: [number, number, number]
  glowColor: string
  id: number
  length: number
  lifetimeMs: number
  position: [number, number, number]
  size: number
}

export type Tracer = {
  color: string
  end: [number, number, number]
  glowColor: string
  glowThickness: number
  id: number
  start: [number, number, number]
  thickness: number
}

export type WeaponProjectile = WeaponProjectileSpawn & {
  distanceTraveled: number
  id: number
}

export type Explosion = {
  color: string
  createdAt: number
  glowColor: string
  id: number
  lifetimeMs: number
  position: [number, number, number]
  ringColor: string
  ringSize: number
  size: number
}

export type WeaponSystemProps = {
  bodyRef: RefObject<RapierRigidBody | null>
}

export type WeaponEffectsState = {
  explosions: Explosion[]
  hitMarkers: HitMarker[]
  muzzleFlashes: MuzzleFlash[]
  projectiles: WeaponProjectile[]
  shotSequence: number
  tracers: Tracer[]
}

type FiredShot = WeaponShotResult & {
  ray: WeaponRay
}

const HIT_MARKER_NORMAL_OFFSET = 0.08
const ROCKET_EXPLOSION_SOURCE = 'rocketLauncher:explosion'

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

export function useWeaponSystem({
  bodyRef,
}: WeaponSystemProps): WeaponEffectsState {
  const camera = useThree((state) => state.camera)
  const currentWeaponId = usePlayerWeaponStore((state) => state.currentWeaponId)
  const playerAlive = usePlayerHealthStore((state) => state.alive)
  const pointerLocked = useRendererStore((state) => state.pointerLocked)
  const runState = useRunStore((state) => state.runState)
  const { rapier, world } = useRapier()
  const [explosions, setExplosions] = useState<Explosion[]>([])
  const [hitMarkers, setHitMarkers] = useState<HitMarker[]>([])
  const [muzzleFlashes, setMuzzleFlashes] = useState<MuzzleFlash[]>([])
  const [projectiles, setProjectiles] = useState<WeaponProjectile[]>([])
  const [shotSequence, setShotSequence] = useState(0)
  const [tracers, setTracers] = useState<Tracer[]>([])
  const weaponInstancesRef = useRef<Partial<Record<WeaponId, Weapon>>>({})
  const projectilesRef = useRef<WeaponProjectile[]>([])
  const effectIdRef = useRef(0)
  const effectTimeoutsRef = useRef<number[]>([])
  const effectsClearedRef = useRef(false)

  useEffect(() => {
    projectilesRef.current = projectiles
  }, [projectiles])

  useEffect(() => {
    return () => {
      effectTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      )
    }
  }, [])

  useEffect(() => {
    const spawnHitMarker = (
      shotResult: FiredShot,
      point: [number, number, number],
      normal: [number, number, number],
    ) => {
      if (shotResult.definition.visuals.impactLifetimeMs <= 0) {
        return
      }

      const id = effectIdRef.current++
      const position = offsetHitMarkerPosition(point, normal)
      const createdAt = performance.now()

      setHitMarkers((currentMarkers) => [
        ...currentMarkers,
        {
          color: shotResult.definition.visuals.impactColor,
          createdAt,
          glowColor: shotResult.definition.visuals.impactGlowColor,
          id,
          lifetimeMs: shotResult.definition.visuals.impactLifetimeMs,
          normal,
          position,
          ringSize: shotResult.definition.visuals.impactRingSize,
          size: shotResult.definition.visuals.impactSize,
        },
      ])

      const timeoutId = window.setTimeout(() => {
        setHitMarkers((currentMarkers) =>
          currentMarkers.filter((marker) => marker.id !== id),
        )
        effectTimeoutsRef.current = effectTimeoutsRef.current.filter(
          (trackedTimeoutId) => trackedTimeoutId !== timeoutId,
        )
      }, shotResult.definition.visuals.impactLifetimeMs)

      effectTimeoutsRef.current.push(timeoutId)
    }

    const spawnMuzzleFlash = (shotResult: FiredShot) => {
      const id = effectIdRef.current++
      const position = offsetAlongRay(
        shotResult.ray.origin,
        shotResult.ray.direction,
        shotResult.definition.visuals.muzzleFlashDistance,
      )
      const createdAt = performance.now()

      setMuzzleFlashes((currentFlashes) => [
        ...currentFlashes,
        {
          color: shotResult.definition.visuals.muzzleFlashColor,
          createdAt,
          direction: shotResult.ray.direction,
          glowColor: shotResult.definition.visuals.muzzleFlashGlowColor,
          id,
          length: shotResult.definition.visuals.muzzleFlashLength,
          lifetimeMs: shotResult.definition.visuals.muzzleFlashLifetimeMs,
          position,
          size: shotResult.definition.visuals.muzzleFlashSize,
        },
      ])

      const timeoutId = window.setTimeout(() => {
        setMuzzleFlashes((currentFlashes) =>
          currentFlashes.filter((flash) => flash.id !== id),
        )
        effectTimeoutsRef.current = effectTimeoutsRef.current.filter(
          (trackedTimeoutId) => trackedTimeoutId !== timeoutId,
        )
      }, shotResult.definition.visuals.muzzleFlashLifetimeMs)

      effectTimeoutsRef.current.push(timeoutId)
    }

    const spawnProjectile = (projectile: WeaponProjectileSpawn) => {
      const id = effectIdRef.current++
      const nextProjectile: WeaponProjectile = {
        ...projectile,
        distanceTraveled: 0,
        id,
        position: offsetAlongRay(
          projectile.position,
          projectile.direction,
          projectile.size + 0.75,
        ),
      }

      setProjectiles((currentProjectiles) => {
        const nextProjectiles = [...currentProjectiles, nextProjectile]
        projectilesRef.current = nextProjectiles
        return nextProjectiles
      })
    }

    const spawnTracer = (shotResult: FiredShot, trace: WeaponTraceResult) => {
      const id = effectIdRef.current++
      const start = offsetAlongRay(
        shotResult.ray.origin,
        trace.direction,
        shotResult.definition.visuals.muzzleFlashDistance,
      )
      const end =
        trace.hit?.point ??
        offsetAlongRay(
          shotResult.ray.origin,
          trace.direction,
          shotResult.definition.maxDistance,
        )

      setTracers((currentTracers) => [
        ...currentTracers,
        {
          color: shotResult.definition.visuals.tracerColor,
          end,
          glowColor: shotResult.definition.visuals.tracerGlowColor,
          glowThickness: shotResult.definition.visuals.tracerGlowThickness,
          id,
          start,
          thickness: shotResult.definition.visuals.tracerThickness,
        },
      ])

      const timeoutId = window.setTimeout(() => {
        setTracers((currentTracers) =>
          currentTracers.filter((tracer) => tracer.id !== id),
        )
        effectTimeoutsRef.current = effectTimeoutsRef.current.filter(
          (trackedTimeoutId) => trackedTimeoutId !== timeoutId,
        )
      }, shotResult.definition.visuals.tracerLifetimeMs)

      effectTimeoutsRef.current.push(timeoutId)
    }

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

      const shotRay = getCameraRay(camera)
      const shotResult = equippedWeapon.tryFire({
        now: performance.now() / 1000,
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

      const firedShot: FiredShot = {
        ...shotResult,
        ray: shotRay,
      }

      setShotSequence((currentShotSequence) => currentShotSequence + 1)
      spawnMuzzleFlash(firedShot)
      shotResult.projectiles.forEach((projectile) => {
        spawnProjectile(projectile)
      })

      const hitPoints: [number, number, number][] = []

      shotResult.traces.forEach((trace) => {
        spawnTracer(firedShot, trace)

        if (!trace.hit) {
          return
        }

        hitPoints.push(trace.hit.point)

        if (trace.hit.targetType === 'enemy') {
          applyDamageToEnemyByCollider(trace.hit.colliderHandle, {
            amount: trace.damage,
            source: shotResult.definition.id,
          })
        }

        spawnHitMarker(firedShot, trace.hit.point, trace.hit.normal)
      })

      if (hitPoints.length > 0) {
        console.log(`${shotResult.definition.displayName} hit`, hitPoints)
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
    playerAlive,
    pointerLocked,
    rapier,
    runState,
    world,
  ])

  useFrame((_, delta) => {
    if (useRunStore.getState().runState !== 'running') {
      if (effectsClearedRef.current) {
        return
      }

      effectTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      effectTimeoutsRef.current = []
      projectilesRef.current = []
      setExplosions([])
      setHitMarkers([])
      setMuzzleFlashes([])
      setProjectiles([])
      setShotSequence(0)
      setTracers([])
      effectsClearedRef.current = true
      return
    }

    effectsClearedRef.current = false

    const activeProjectiles = projectilesRef.current

    if (activeProjectiles.length === 0) {
      return
    }

    const spawnExplosion = (
      projectile: WeaponProjectile,
      position: [number, number, number],
    ) => {
      const id = effectIdRef.current++
      const createdAt = performance.now()

      setExplosions((currentExplosions) => [
        ...currentExplosions,
        {
          color: projectile.explosionColor,
          createdAt,
          glowColor: projectile.explosionGlowColor,
          id,
          lifetimeMs: projectile.explosionLifetimeMs,
          position,
          ringColor: projectile.explosionRingColor,
          ringSize: projectile.explosionRingSize,
          size: projectile.explosionSize,
        },
      ])

      const timeoutId = window.setTimeout(() => {
        setExplosions((currentExplosions) =>
          currentExplosions.filter((explosion) => explosion.id !== id),
        )
        effectTimeoutsRef.current = effectTimeoutsRef.current.filter(
          (trackedTimeoutId) => trackedTimeoutId !== timeoutId,
        )
      }, projectile.explosionLifetimeMs)

      effectTimeoutsRef.current.push(timeoutId)
    }

    const nextProjectiles: WeaponProjectile[] = []

    activeProjectiles.forEach((projectile) => {
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

        console.log('Rocket exploded', hit.point, `${damagedEnemies} enemies hit`)
        spawnExplosion(projectile, hit.point)
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

        console.log(
          'Rocket exploded',
          nextPosition,
          `${damagedEnemies} enemies hit`,
        )
        spawnExplosion(projectile, nextPosition)
        return
      }

      nextProjectiles.push({
        ...projectile,
        distanceTraveled: nextDistanceTraveled,
        position: nextPosition,
      })
    })

    projectilesRef.current = nextProjectiles
    setProjectiles(nextProjectiles)
  })

  return {
    explosions,
    hitMarkers,
    muzzleFlashes,
    projectiles,
    shotSequence,
    tracers,
  }
}
