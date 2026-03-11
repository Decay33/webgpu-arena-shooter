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
  ENEMY_COMBAT_CONFIG,
  ENEMY_HALF_HEIGHT,
  ENEMY_MOVEMENT_CONFIG,
  getEnemyRuntimePosition,
  setEnemyRuntimePosition,
} from './EnemySystem.ts'
import type { EnemyId, EnemyState } from './EnemyTypes.ts'

type EnemyBotProps = {
  enemy: EnemyState
  onDamage: (enemyId: EnemyId, damageEvent: DamageEvent) => void
  playerBodyRef: RefObject<RapierRigidBody | null>
}

const ENEMY_BODY_RADIUS = 0.45
const ENEMY_BODY_SEGMENT_HEIGHT = 1.1
const ENEMY_HEAD_SIZE = 0.5
const ENEMY_COLLIDER_HALF_HEIGHT = 0.55
const ENEMY_COLLIDER_RADIUS = 0.45
const ENEMY_COLLIDER_OFFSET_Y = 1
const DOWN_VECTOR = { x: 0, y: -1, z: 0 }
const PURSUIT_VECTOR = new Vector3()

function toPositionTuple(position: { x: number; y: number; z: number }) {
  return [position.x, position.y, position.z] as [number, number, number]
}

export function EnemyBot({ enemy, onDamage, playerBodyRef }: EnemyBotProps) {
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

  useEffect(() => {
    return () => {
      setEnemyRuntimePosition(enemy.id, lastPositionRef.current)
    }
  }, [enemy.id])

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
      ENEMY_HALF_HEIGHT + ENEMY_MOVEMENT_CONFIG.groundProbeDistance,
      true,
      undefined,
      undefined,
      undefined,
      body,
    )
    const isGrounded =
      groundHit !== null &&
      groundHit.normal.y >= ENEMY_MOVEMENT_CONFIG.minGroundNormalY
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
      planarDistanceToPlayer <= ENEMY_COMBAT_CONFIG.contactDamageRadius &&
      verticalDistanceToPlayer <= ENEMY_COMBAT_CONFIG.contactVerticalTolerance

    if (
      isWithinContactRange &&
      nowSeconds - lastContactDamageAtRef.current >=
        ENEMY_COMBAT_CONFIG.contactDamageIntervalSeconds
    ) {
      damagePlayer({
        amount: ENEMY_COMBAT_CONFIG.contactDamage,
        source: `${enemy.id}:contact`,
      })
      lastContactDamageAtRef.current = nowSeconds
    }

    const shouldChase =
      planarDistanceToPlayer > ENEMY_MOVEMENT_CONFIG.stopDistance
    const targetVelocityX = shouldChase
      ? PURSUIT_VECTOR.x * ENEMY_MOVEMENT_CONFIG.moveSpeed
      : 0
    const targetVelocityZ = shouldChase
      ? PURSUIT_VECTOR.z * ENEMY_MOVEMENT_CONFIG.moveSpeed
      : 0
    const controlStrength = isGrounded ? 1 : ENEMY_MOVEMENT_CONFIG.airControl

    body.setLinvel(
      {
        x:
          currentVelocity.x +
          (targetVelocityX - currentVelocity.x) * controlStrength,
        y: currentVelocity.y,
        z:
          currentVelocity.z +
          (targetVelocityZ - currentVelocity.z) * controlStrength,
      },
      true,
    )

    snapshotTimerRef.current += delta

    if (snapshotTimerRef.current < ENEMY_MOVEMENT_CONFIG.snapshotInterval) {
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
      linearDamping={ENEMY_MOVEMENT_CONFIG.linearDamping}
      position={getEnemyRuntimePosition(enemy.id, enemy.position)}
      type="dynamic"
    >
      <mesh castShadow position={[0, 1, 0]} receiveShadow>
        <capsuleGeometry
          args={[ENEMY_BODY_RADIUS, ENEMY_BODY_SEGMENT_HEIGHT, 4, 10]}
        />
        <meshStandardMaterial color="#7f8a99" metalness={0} roughness={0.9} />
      </mesh>

      <mesh castShadow position={[0, 1.85, 0]} receiveShadow>
        <boxGeometry args={[ENEMY_HEAD_SIZE, ENEMY_HEAD_SIZE, ENEMY_HEAD_SIZE]} />
        <meshStandardMaterial color="#b4beca" metalness={0} roughness={0.85} />
      </mesh>

      <CapsuleCollider
        ref={colliderRef}
        args={[ENEMY_COLLIDER_HALF_HEIGHT, ENEMY_COLLIDER_RADIUS]}
        collisionGroups={ENEMY_COLLISION_GROUPS}
        friction={1}
        position={[0, ENEMY_COLLIDER_OFFSET_Y, 0]}
      />
    </RigidBody>
  )
}
