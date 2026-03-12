import { useEffect, useRef, type RefObject } from 'react'

import type { RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'

import { usePlayerHealthStore } from './playerHealthStore.ts'

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
      return
    }

    if (bodyFrozenRef.current) {
      unfreezeBody(body)
      bodyFrozenRef.current = false
    }
  })

  return null
}
