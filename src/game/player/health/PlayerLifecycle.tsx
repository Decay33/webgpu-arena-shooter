import { useEffect, useRef, type RefObject } from 'react'

import type { RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'

import {
  PLAYER_HEALTH_CONFIG,
  usePlayerHealthStore,
} from './playerHealthStore.ts'

type PlayerLifecycleProps = {
  bodyRef: RefObject<RapierRigidBody | null>
}

function freezeBody(body: RapierRigidBody) {
  body.setLinvel({ x: 0, y: 0, z: 0 }, true)
  body.setAngvel({ x: 0, y: 0, z: 0 }, true)
  body.setEnabledTranslations(false, false, false, true)
}

function unfreezeBody(body: RapierRigidBody) {
  body.setEnabledTranslations(true, true, true, true)
}

export function PlayerLifecycle({ bodyRef }: PlayerLifecycleProps) {
  const alive = usePlayerHealthStore((state) => state.alive)
  const respawnDeadlineMs = usePlayerHealthStore(
    (state) => state.respawnDeadlineMs,
  )
  const respawnPlayer = usePlayerHealthStore((state) => state.respawnPlayer)
  const setRespawnRemainingSeconds = usePlayerHealthStore(
    (state) => state.setRespawnRemainingSeconds,
  )
  const bodyFrozenRef = useRef(false)

  useEffect(() => {
    return () => {
      setRespawnRemainingSeconds(null)
    }
  }, [setRespawnRemainingSeconds])

  useFrame(() => {
    const body = bodyRef.current

    if (!body) {
      return
    }

    if (!alive) {
      if (!bodyFrozenRef.current) {
        freezeBody(body)
        bodyFrozenRef.current = true
      }

      if (respawnDeadlineMs === null) {
        return
      }

      const remainingSeconds = Math.max(
        0,
        (respawnDeadlineMs - performance.now()) / 1000,
      )
      const roundedRemainingSeconds =
        remainingSeconds > 0 ? Number(remainingSeconds.toFixed(1)) : 0

      setRespawnRemainingSeconds(roundedRemainingSeconds)

      if (remainingSeconds > 0) {
        return
      }

      unfreezeBody(body)
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
      bodyFrozenRef.current = false
      respawnPlayer()
    }
  })

  return null
}
