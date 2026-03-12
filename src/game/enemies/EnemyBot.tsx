import { useEffect, useRef, type RefObject } from 'react'

import {
  CapsuleCollider,
  type RapierCollider,
  type RapierRigidBody,
  RigidBody,
  useRapier,
} from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

import type { DamageEvent } from '../health/HealthTypes.ts'
import { ENEMY_COLLISION_GROUPS } from '../../shared/constants/collisionGroups.ts'
import {
  damagePlayer,
  getPlayerHealthSnapshot,
} from '../player/health/playerHealthStore.ts'
import {
  registerEnemyCollider,
  registerEnemyDamageHandler,
  unregisterEnemyCollider,
} from './EnemyRegistry.ts'
import {
  ENEMY_SHARED_COMBAT_CONFIG,
  ENEMY_SHARED_MOVEMENT_CONFIG,
  getEnemyTypeDefinition,
} from './EnemyDefinitions.ts'
import {
  getEnemyRuntimePosition,
  setEnemyRuntimePosition,
} from './EnemySystem.ts'
import type { EnemyId, EnemyState } from './EnemyTypes.ts'

type EnemyBotProps = {
  enemy: EnemyState
  onDamage: (enemyId: EnemyId, damageEvent: DamageEvent) => void
  playerBodyRef: RefObject<RapierRigidBody | null>
}

const DOWN_VECTOR = { x: 0, y: -1, z: 0 }
const PURSUIT_VECTOR = new Vector3()

function getVelocityStep(rate: number, delta: number) {
  return Math.min(1, rate * delta)
}

function toPositionTuple(position: { x: number; y: number; z: number }) {
  return [position.x, position.y, position.z] as [number, number, number]
}

export function EnemyBot({ enemy, onDamage, playerBodyRef }: EnemyBotProps) {
  const enemyTypeDefinition = getEnemyTypeDefinition(enemy.type)
  const bodyRef = useRef<RapierRigidBody | null>(null)
  const colliderRef = useRef<RapierCollider | null>(null)
  const lastContactDamageAtRef = useRef(Number.NEGATIVE_INFINITY)
  const lastPositionRef = useRef<[number, number, number]>(
    getEnemyRuntimePosition(enemy.id, enemy.position),
  )
  const snapshotTimerRef = useRef(0)
  const { rapier, world } = useRapier()

  useEffect(() => {
    const collider = colliderRef.current

    if (!collider) {
      return
    }

    registerEnemyCollider(enemy.id, collider.handle)

    const unregisterDamageHandler = registerEnemyDamageHandler(
      enemy.id,
      (damageEvent) => {
        onDamage(enemy.id, damageEvent)
      },
    )

    return () => {
      unregisterEnemyCollider(collider.handle)
      unregisterDamageHandler()
    }
  }, [enemy.id, onDamage])

  useFrame((_, delta) => {
    const body = bodyRef.current

    if (!body || !enemy.alive) {
      return
    }

    const currentVelocity = body.linvel()
    const playerBody = playerBodyRef.current
    const playerHealthSnapshot = getPlayerHealthSnapshot()

    if (!playerBody || !playerHealthSnapshot.alive) {
      body.setLinvel(
        {
          x: 0,
          y: currentVelocity.y,
          z: 0,
        },
        true,
      )
      return
    }

    const nowSeconds = performance.now() / 1000
    const enemyTranslation = body.translation()
    const enemyPosition = toPositionTuple(enemyTranslation)
    lastPositionRef.current = enemyPosition
    const groundHit = world.castRayAndGetNormal(
      new rapier.Ray(enemyTranslation, DOWN_VECTOR),
      enemyTypeDefinition.colliderHalfHeight +
        enemyTypeDefinition.colliderRadius +
        ENEMY_SHARED_MOVEMENT_CONFIG.groundProbeDistance,
      true,
      undefined,
      undefined,
      undefined,
      body,
    )
    const isGrounded =
      groundHit !== null &&
      groundHit.normal.y >= ENEMY_SHARED_MOVEMENT_CONFIG.minGroundNormalY
    const playerTranslation = playerBody.translation()
    const verticalDistanceToPlayer = Math.abs(
      playerTranslation.y - enemyTranslation.y,
    )

    PURSUIT_VECTOR.set(
      playerTranslation.x - enemyTranslation.x,
      0,
      playerTranslation.z - enemyTranslation.z,
    )

    if (PURSUIT_VECTOR.lengthSq() > 0) {
      PURSUIT_VECTOR.normalize()
    }

    const planarDistanceToPlayer = Math.hypot(
      playerTranslation.x - enemyTranslation.x,
      playerTranslation.z - enemyTranslation.z,
    )
    const isWithinContactRange =
      planarDistanceToPlayer <= enemyTypeDefinition.contactDamageRadius &&
      verticalDistanceToPlayer <= ENEMY_SHARED_COMBAT_CONFIG.contactVerticalTolerance

    if (
      isWithinContactRange &&
      nowSeconds - lastContactDamageAtRef.current >=
        ENEMY_SHARED_COMBAT_CONFIG.contactDamageIntervalSeconds
    ) {
      damagePlayer({
        amount: enemyTypeDefinition.contactDamage,
        source: `${enemy.id}:contact`,
      })
      lastContactDamageAtRef.current = nowSeconds
    }

    const shouldChase = planarDistanceToPlayer > enemyTypeDefinition.stopDistance
    const targetVelocityX = shouldChase
      ? PURSUIT_VECTOR.x * enemyTypeDefinition.moveSpeed
      : 0
    const targetVelocityZ = shouldChase
      ? PURSUIT_VECTOR.z * enemyTypeDefinition.moveSpeed
      : 0
    const accelerationRate = isGrounded
      ? shouldChase
        ? ENEMY_SHARED_MOVEMENT_CONFIG.groundAcceleration
        : ENEMY_SHARED_MOVEMENT_CONFIG.groundDeceleration
      : shouldChase
        ? ENEMY_SHARED_MOVEMENT_CONFIG.airAcceleration
        : ENEMY_SHARED_MOVEMENT_CONFIG.airDeceleration
    const velocityStep = getVelocityStep(accelerationRate, delta)

    body.setLinvel(
      {
        x:
          currentVelocity.x +
          (targetVelocityX - currentVelocity.x) * velocityStep,
        y: currentVelocity.y,
        z:
          currentVelocity.z +
          (targetVelocityZ - currentVelocity.z) * velocityStep,
      },
      true,
    )

    snapshotTimerRef.current += delta

    if (snapshotTimerRef.current < ENEMY_SHARED_MOVEMENT_CONFIG.snapshotInterval) {
      return
    }

    setEnemyRuntimePosition(enemy.id, enemyPosition)
    snapshotTimerRef.current = 0
  })

  return (
    <RigidBody
      ref={bodyRef}
      ccd
      canSleep={false}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={ENEMY_SHARED_MOVEMENT_CONFIG.linearDamping}
      position={getEnemyRuntimePosition(enemy.id, enemy.position)}
      type="dynamic"
    >
      <mesh castShadow position={[0, enemyTypeDefinition.bodyOffsetY, 0]} receiveShadow>
        <capsuleGeometry
          args={[
            enemyTypeDefinition.bodyRadius,
            enemyTypeDefinition.bodySegmentHeight,
            4,
            10,
          ]}
        />
        <meshStandardMaterial
          color={enemyTypeDefinition.bodyColor}
          metalness={0}
          roughness={0.9}
        />
      </mesh>

      <mesh castShadow position={[0, enemyTypeDefinition.headOffsetY, 0]} receiveShadow>
        <boxGeometry
          args={[
            enemyTypeDefinition.headSize,
            enemyTypeDefinition.headSize,
            enemyTypeDefinition.headSize,
          ]}
        />
        <meshStandardMaterial
          color={enemyTypeDefinition.headColor}
          metalness={0}
          roughness={0.85}
        />
      </mesh>

      <CapsuleCollider
        ref={colliderRef}
        args={[
          enemyTypeDefinition.colliderHalfHeight,
          enemyTypeDefinition.colliderRadius,
        ]}
        collisionGroups={ENEMY_COLLISION_GROUPS}
        friction={1}
        position={[0, enemyTypeDefinition.colliderOffsetY, 0]}
      />
    </RigidBody>
  )
}
