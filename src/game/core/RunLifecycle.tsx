import { type RefObject } from 'react'

import type { RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'

import { clearEnemies, resetEnemyRun, useEnemySystem } from '../enemies/EnemySystem.ts'
import { resetAmmoPickups } from '../pickups/ammo/AmmoPickupSystem.ts'
import { resetHealthPickups } from '../pickups/health/HealthPickupSystem.ts'
import { resetWeaponPickups } from '../pickups/weaponPads/WeaponPickupSystem.ts'
import {
  PLAYER_HEALTH_CONFIG,
  resetPlayerState,
  usePlayerHealthStore,
} from '../player/health/playerHealthStore.ts'
import { useRendererStore } from '../renderer/state/rendererStore.ts'
import { resetWeapons } from '../weapons/playerWeaponStore.ts'
import { resetScore, useScoreStore } from './state/scoreStore.ts'
import { useRunStore } from './state/runStore.ts'

type RunLifecycleProps = {
  bodyRef: RefObject<RapierRigidBody | null>
}

function resetPlayerBody(body: RapierRigidBody) {
  body.setEnabledTranslations(true, true, true, true)
  body.setTranslation(
    {
      x: PLAYER_HEALTH_CONFIG.respawnPosition[0],
      y: PLAYER_HEALTH_CONFIG.respawnPosition[1],
      z: PLAYER_HEALTH_CONFIG.respawnPosition[2],
    },
    true,
  )
  body.setLinvel({ x: 0, y: 0, z: 0 }, true)
  body.setAngvel({ x: 0, y: 0, z: 0 }, true)
  body.wakeUp()
}

function releasePointerLock() {
  if (typeof document === 'undefined' || !document.pointerLockElement) {
    return
  }

  document.exitPointerLock()
}

export function RunLifecycle({ bodyRef }: RunLifecycleProps) {
  const playerAlive = usePlayerHealthStore((state) => state.alive)
  const currentScore = useScoreStore((state) => state.currentScore)
  const { currentWave } = useEnemySystem()
  const runState = useRunStore((state) => state.runState)
  const endRun = useRunStore((state) => state.endRun)
  const startRun = useRunStore((state) => state.startRun)
  const setPointerLocked = useRendererStore((state) => state.setPointerLocked)

  useFrame(() => {
    if (!playerAlive && runState === 'running') {
      clearEnemies()
      releasePointerLock()
      setPointerLocked(false)
      endRun(currentScore, currentWave)
      return
    }

    if (runState !== 'restarting') {
      return
    }

    const body = bodyRef.current

    if (!body) {
      return
    }

    releasePointerLock()
    setPointerLocked(false)
    resetScore()
    resetEnemyRun()
    resetHealthPickups()
    resetAmmoPickups()
    resetWeaponPickups()
    resetWeapons()
    resetPlayerBody(body)
    resetPlayerState()
    startRun()
  })

  return null
}
