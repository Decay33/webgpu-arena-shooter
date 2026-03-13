import { useEffect, useRef, type RefObject } from 'react'

import {
  CapsuleCollider,
  type RapierRigidBody,
  RigidBody,
  useRapier,
} from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

import {
  PLAYER_HALF_HEIGHT,
  PLAYER_MOVEMENT_CONFIG,
} from '../../config/playerMovement.ts'
import { usePlayerHealthStore } from '../health/playerHealthStore.ts'
import { useRendererStore } from '../../renderer/state/rendererStore.ts'
import { WeaponEffects } from '../../weapons/WeaponEffects.tsx'
import { useWeaponSystem } from '../../weapons/WeaponSystem.ts'
import type { WeaponVfxController } from '../../weapons/WeaponVfxTypes.ts'
import { WeaponViewmodel } from '../../weapons/WeaponViewmodel.tsx'
import { useWeaponSwitchInput } from '../../weapons/useWeaponSwitchInput.ts'
import { PLAYER_COLLISION_GROUPS } from '../../../shared/constants/collisionGroups.ts'
import { usePlayerInput } from './usePlayerInput.ts'

type PlayerControllerProps = {
  bodyRef: RefObject<RapierRigidBody | null>
}

const DOWN_VECTOR = { x: 0, y: -1, z: 0 }
const UP_VECTOR = new Vector3(0, 1, 0)
const FORWARD_VECTOR = new Vector3()
const RIGHT_VECTOR = new Vector3()
const MOVE_VECTOR = new Vector3()

function getVelocityStep(rate: number, delta: number) {
  return Math.min(1, rate * delta)
}

function clampPlayerDebugValue(value: number) {
  return Number(value.toFixed(2))
}

export function PlayerController({ bodyRef }: PlayerControllerProps) {
  const camera = useThree((state) => state.camera)
  const { rapier, world } = useRapier()
  const inputState = usePlayerInput()
  const playerAlive = usePlayerHealthStore((state) => state.alive)
  const pointerLocked = useRendererStore((state) => state.pointerLocked)
  const setPlayerDebug = useRendererStore((state) => state.setPlayerDebug)
  const debugTimerRef = useRef(0)
  const jumpPressedRef = useRef(false)
  const muzzleWorldPositionRef = useRef<[number, number, number] | null>(null)
  const weaponVfxControllerRef = useRef<WeaponVfxController | null>(null)
  const weaponSystem = useWeaponSystem({
    bodyRef,
    muzzleWorldPositionRef,
    vfxControllerRef: weaponVfxControllerRef,
  })

  useWeaponSwitchInput()

  useEffect(() => {
    return () => {
      setPlayerDebug([0, 0, 0], false)
    }
  }, [setPlayerDebug])

  useFrame((_, delta) => {
    const rigidBody = bodyRef.current

    if (!rigidBody) {
      return
    }

    if (!playerAlive) {
      jumpPressedRef.current = inputState.jump
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }

    const bodyTranslation = rigidBody.translation()
    const ray = new rapier.Ray(bodyTranslation, DOWN_VECTOR)
    const groundHit = world.castRayAndGetNormal(
      ray,
      PLAYER_HALF_HEIGHT + PLAYER_MOVEMENT_CONFIG.groundProbeDistance,
      true,
      undefined,
      undefined,
      undefined,
      rigidBody,
    )
    const isGrounded =
      groundHit !== null &&
      groundHit.normal.y >= PLAYER_MOVEMENT_CONFIG.minGroundNormalY

    const moveForwardAxis =
      Number(inputState.moveForward) - Number(inputState.moveBackward)
    const moveRightAxis =
      Number(inputState.moveRight) - Number(inputState.moveLeft)
    const isMoving = moveForwardAxis !== 0 || moveRightAxis !== 0

    FORWARD_VECTOR.set(0, 0, -1).applyQuaternion(camera.quaternion)
    FORWARD_VECTOR.y = 0

    if (FORWARD_VECTOR.lengthSq() === 0) {
      FORWARD_VECTOR.set(0, 0, -1)
    } else {
      FORWARD_VECTOR.normalize()
    }

    RIGHT_VECTOR.crossVectors(FORWARD_VECTOR, UP_VECTOR).normalize()

    MOVE_VECTOR.set(0, 0, 0)
      .addScaledVector(FORWARD_VECTOR, moveForwardAxis)
      .addScaledVector(RIGHT_VECTOR, moveRightAxis)

    if (isMoving) {
      MOVE_VECTOR.normalize()
    }

    const currentVelocity = rigidBody.linvel()
    const targetSpeed =
      PLAYER_MOVEMENT_CONFIG.walkSpeed *
      (inputState.sprint ? PLAYER_MOVEMENT_CONFIG.sprintMultiplier : 1)
    const horizontalVelocityScale =
      pointerLocked && isMoving ? targetSpeed : 0
    const targetVelocityX = MOVE_VECTOR.x * horizontalVelocityScale
    const targetVelocityZ = MOVE_VECTOR.z * horizontalVelocityScale
    const accelerationRate = isGrounded
      ? isMoving
        ? PLAYER_MOVEMENT_CONFIG.groundAcceleration
        : PLAYER_MOVEMENT_CONFIG.groundDeceleration
      : isMoving
        ? PLAYER_MOVEMENT_CONFIG.airAcceleration
        : PLAYER_MOVEMENT_CONFIG.airDeceleration
    const velocityStep = getVelocityStep(accelerationRate, delta)

    let nextVelocityY = currentVelocity.y

    if (inputState.jump && !jumpPressedRef.current && isGrounded && pointerLocked) {
      nextVelocityY = PLAYER_MOVEMENT_CONFIG.jumpVelocity
    }

    jumpPressedRef.current = inputState.jump

    rigidBody.setLinvel(
      {
        x:
          currentVelocity.x +
          (targetVelocityX - currentVelocity.x) * velocityStep,
        y: nextVelocityY,
        z:
          currentVelocity.z +
          (targetVelocityZ - currentVelocity.z) * velocityStep,
      },
      true,
    )

    debugTimerRef.current += delta

    if (debugTimerRef.current < PLAYER_MOVEMENT_CONFIG.debugSampleInterval) {
      return
    }

    const updatedTranslation = rigidBody.translation()

    setPlayerDebug(
      [
        clampPlayerDebugValue(updatedTranslation.x),
        clampPlayerDebugValue(updatedTranslation.y),
        clampPlayerDebugValue(updatedTranslation.z),
      ],
      isGrounded,
    )
    debugTimerRef.current = 0
  })

  return (
    <>
      <RigidBody
        ref={bodyRef}
        ccd
        colliders={false}
        enabledRotations={[false, false, false]}
        friction={0}
        position={PLAYER_MOVEMENT_CONFIG.spawnPosition}
        type="dynamic"
      >
        <CapsuleCollider
          args={[
            PLAYER_MOVEMENT_CONFIG.capsuleHalfHeight,
            PLAYER_MOVEMENT_CONFIG.capsuleRadius,
          ]}
          collisionGroups={PLAYER_COLLISION_GROUPS}
          friction={0}
        />
      </RigidBody>
      <WeaponEffects ref={weaponVfxControllerRef} />
      <WeaponViewmodel
        muzzleWorldPositionRef={muzzleWorldPositionRef}
        shotSequenceRef={weaponSystem.shotSequenceRef}
      />
    </>
  )
}
