import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

import type { RapierRigidBody } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import { Euler, type Camera } from 'three'

import { PLAYER_MOVEMENT_CONFIG } from '../../config/playerMovement.ts'
import { useRendererStore } from '../../renderer/state/rendererStore.ts'

type FirstPersonCameraProps = {
  bodyRef: RefObject<RapierRigidBody | null>
}

const LOOK_ROTATION = new Euler(0, 0, 0, 'YXZ')
const LOOK_SENSITIVITY_SCALE = 0.002
const MAX_MOUSE_DELTA = 80
const MAX_PITCH_RADIANS = Math.PI / 2 - 0.05

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function applyLookRotation(camera: Camera, pitch: number, yaw: number) {
  camera.rotation.order = 'YXZ'
  camera.rotation.set(pitch, yaw, 0)
}

export function FirstPersonCamera({ bodyRef }: FirstPersonCameraProps) {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const setPointerLocked = useRendererStore((state) => state.setPointerLocked)
  const cameraRef = useRef(camera)
  const pointerLockedRef = useRef(false)
  const skipNextMouseMoveRef = useRef(false)
  const yawRef = useRef(0)
  const pitchRef = useRef(0)

  useLayoutEffect(() => {
    cameraRef.current = camera
    LOOK_ROTATION.setFromQuaternion(cameraRef.current.quaternion, 'YXZ')
    yawRef.current = LOOK_ROTATION.y
    pitchRef.current = clamp(
      LOOK_ROTATION.x,
      -MAX_PITCH_RADIANS,
      MAX_PITCH_RADIANS,
    )
    applyLookRotation(cameraRef.current, pitchRef.current, yawRef.current)
  }, [camera])

  useEffect(() => {
    const domElement = gl.domElement
    const ownerDocument = domElement.ownerDocument

    const syncPointerLockState = () => {
      const isLocked = ownerDocument.pointerLockElement === domElement

      pointerLockedRef.current = isLocked

      if (isLocked) {
        skipNextMouseMoveRef.current = true
      }

      setPointerLocked(isLocked)
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || pointerLockedRef.current) {
        return
      }

      domElement.requestPointerLock()
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!pointerLockedRef.current) {
        return
      }

      if (skipNextMouseMoveRef.current) {
        skipNextMouseMoveRef.current = false
        return
      }

      const movementX = clamp(
        Number.isFinite(event.movementX) ? event.movementX : 0,
        -MAX_MOUSE_DELTA,
        MAX_MOUSE_DELTA,
      )
      const movementY = clamp(
        Number.isFinite(event.movementY) ? event.movementY : 0,
        -MAX_MOUSE_DELTA,
        MAX_MOUSE_DELTA,
      )
      const lookDelta =
        PLAYER_MOVEMENT_CONFIG.pointerSpeed * LOOK_SENSITIVITY_SCALE

      yawRef.current -= movementX * lookDelta
      pitchRef.current = clamp(
        pitchRef.current - movementY * lookDelta,
        -MAX_PITCH_RADIANS,
        MAX_PITCH_RADIANS,
      )

      applyLookRotation(cameraRef.current, pitchRef.current, yawRef.current)
    }

    setPointerLocked(false)
    domElement.addEventListener('pointerdown', handlePointerDown)
    ownerDocument.addEventListener('pointerlockchange', syncPointerLockState)
    ownerDocument.addEventListener('mousemove', handleMouseMove)

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown)
      ownerDocument.removeEventListener(
        'pointerlockchange',
        syncPointerLockState,
      )
      ownerDocument.removeEventListener('mousemove', handleMouseMove)
      pointerLockedRef.current = false
      setPointerLocked(false)
    }
  }, [gl, setPointerLocked])

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

    applyLookRotation(cameraRef.current, pitchRef.current, yawRef.current)
  }, -1)

  return null
}
