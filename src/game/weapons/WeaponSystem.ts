import { useEffect, useRef, useState, type RefObject } from 'react'

import { type RapierRigidBody, useRapier } from '@react-three/rapier'
import { useThree } from '@react-three/fiber'

import { getCameraRay, raycastWorld } from '../combat/RaycastSystem.ts'
import { applyDamageToEnemyByCollider } from '../enemies/EnemyRegistry.ts'
import { usePlayerHealthStore } from '../player/health/playerHealthStore.ts'
import { useRendererStore } from '../renderer/state/rendererStore.ts'
import { createHitscanRifle } from './HitscanRifle.ts'
import type { Weapon, WeaponRay, WeaponShotResult } from './WeaponTypes.ts'

export type HitMarker = {
  id: number
  position: [number, number, number]
}

export type MuzzleFlash = {
  color: string
  id: number
  position: [number, number, number]
  size: number
}

export type Tracer = {
  color: string
  end: [number, number, number]
  id: number
  start: [number, number, number]
  thickness: number
}

export type WeaponSystemProps = {
  bodyRef: RefObject<RapierRigidBody | null>
}

export type WeaponEffectsState = {
  hitMarkers: HitMarker[]
  muzzleFlashes: MuzzleFlash[]
  tracers: Tracer[]
}

type FiredShot = WeaponShotResult & {
  ray: WeaponRay
}

const HIT_MARKER_LIFETIME_MS = 180
const HIT_MARKER_NORMAL_OFFSET = 0.08

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

export function useWeaponSystem({
  bodyRef,
}: WeaponSystemProps): WeaponEffectsState {
  const camera = useThree((state) => state.camera)
  const playerAlive = usePlayerHealthStore((state) => state.alive)
  const pointerLocked = useRendererStore((state) => state.pointerLocked)
  const { rapier, world } = useRapier()
  const [hitMarkers, setHitMarkers] = useState<HitMarker[]>([])
  const [muzzleFlashes, setMuzzleFlashes] = useState<MuzzleFlash[]>([])
  const [tracers, setTracers] = useState<Tracer[]>([])
  const equippedWeaponRef = useRef<Weapon>(createHitscanRifle())
  const effectIdRef = useRef(0)
  const effectTimeoutsRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      effectTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      )
    }
  }, [])

  useEffect(() => {
    const spawnHitMarker = (
      point: [number, number, number],
      normal: [number, number, number],
    ) => {
      const id = effectIdRef.current++
      const position = offsetHitMarkerPosition(point, normal)

      setHitMarkers((currentMarkers) => [...currentMarkers, { id, position }])

      const timeoutId = window.setTimeout(() => {
        setHitMarkers((currentMarkers) =>
          currentMarkers.filter((marker) => marker.id !== id),
        )
        effectTimeoutsRef.current = effectTimeoutsRef.current.filter(
          (trackedTimeoutId) => trackedTimeoutId !== timeoutId,
        )
      }, HIT_MARKER_LIFETIME_MS)

      effectTimeoutsRef.current.push(timeoutId)
    }

    const spawnMuzzleFlash = (shotResult: FiredShot) => {
      const id = effectIdRef.current++
      const position = offsetAlongRay(
        shotResult.ray.origin,
        shotResult.ray.direction,
        shotResult.visuals.muzzleFlashDistance,
      )

      setMuzzleFlashes((currentFlashes) => [
        ...currentFlashes,
        {
          color: shotResult.visuals.muzzleFlashColor,
          id,
          position,
          size: shotResult.visuals.muzzleFlashSize,
        },
      ])

      const timeoutId = window.setTimeout(() => {
        setMuzzleFlashes((currentFlashes) =>
          currentFlashes.filter((flash) => flash.id !== id),
        )
        effectTimeoutsRef.current = effectTimeoutsRef.current.filter(
          (trackedTimeoutId) => trackedTimeoutId !== timeoutId,
        )
      }, shotResult.visuals.muzzleFlashLifetimeMs)

      effectTimeoutsRef.current.push(timeoutId)
    }

    const spawnTracer = (shotResult: FiredShot) => {
      const id = effectIdRef.current++
      const start = offsetAlongRay(
        shotResult.ray.origin,
        shotResult.ray.direction,
        shotResult.visuals.muzzleFlashDistance,
      )
      const end =
        shotResult.hit?.point ??
        offsetAlongRay(
          shotResult.ray.origin,
          shotResult.ray.direction,
          shotResult.maxDistance,
        )

      setTracers((currentTracers) => [
        ...currentTracers,
        {
          color: shotResult.visuals.tracerColor,
          end,
          id,
          start,
          thickness: shotResult.visuals.tracerThickness,
        },
      ])

      const timeoutId = window.setTimeout(() => {
        setTracers((currentTracers) =>
          currentTracers.filter((tracer) => tracer.id !== id),
        )
        effectTimeoutsRef.current = effectTimeoutsRef.current.filter(
          (trackedTimeoutId) => trackedTimeoutId !== timeoutId,
        )
      }, shotResult.visuals.tracerLifetimeMs)

      effectTimeoutsRef.current.push(timeoutId)
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0 || !pointerLocked || !playerAlive) {
        return
      }

      const shotRay = getCameraRay(camera)
      const shotResult = equippedWeaponRef.current.tryFire({
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

      const firedShot: FiredShot = {
        ...shotResult,
        ray: shotRay,
      }

      spawnMuzzleFlash(firedShot)
      spawnTracer(firedShot)

      if (!shotResult.hit) {
        return
      }

      console.log('Hitscan rifle hit', shotResult.hit.point)

      if (shotResult.hit.targetType === 'enemy') {
        applyDamageToEnemyByCollider(shotResult.hit.colliderHandle, {
          amount: shotResult.damage,
          source: shotResult.weaponType,
        })
      }

      spawnHitMarker(shotResult.hit.point, shotResult.hit.normal)
    }

    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [bodyRef, camera, playerAlive, pointerLocked, rapier, world])

  return {
    hitMarkers,
    muzzleFlashes,
    tracers,
  }
}
