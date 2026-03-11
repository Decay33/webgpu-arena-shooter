import { useEffect, type RefObject } from 'react'

import { PointerLockControls } from '@react-three/drei'
import type { RapierRigidBody } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'

import { PLAYER_MOVEMENT_CONFIG } from '../../config/playerMovement.ts'
import { useRendererStore } from '../../renderer/state/rendererStore.ts'

type FirstPersonCameraProps = {
  bodyRef: RefObject<RapierRigidBody | null>
}

export function FirstPersonCamera({ bodyRef }: FirstPersonCameraProps) {
  const camera = useThree((state) => state.camera)
  const setPointerLocked = useRendererStore((state) => state.setPointerLocked)

  useEffect(() => {
    setPointerLocked(false)

    return () => {
      setPointerLocked(false)
    }
  }, [setPointerLocked])

  useFrame(() => {
    const rigidBody = bodyRef.current

    if (!rigidBody) {
      return
    }

    const translation = rigidBody.translation()

    camera.position.set(
      translation.x,
      translation.y + PLAYER_MOVEMENT_CONFIG.eyeHeight,
      translation.z,
    )
  })

  return (
    <PointerLockControls
      makeDefault
      onLock={() => setPointerLocked(true)}
      onUnlock={() => setPointerLocked(false)}
      pointerSpeed={PLAYER_MOVEMENT_CONFIG.pointerSpeed}
      selector=".arena-canvas"
    />
  )
}
