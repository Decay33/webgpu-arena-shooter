import { useEffect, useRef } from 'react'

import {
  CapsuleCollider,
  type RapierCollider,
  RigidBody,
} from '@react-three/rapier'

import type { DamageEvent } from '../health/HealthTypes.ts'
import {
  registerEnemyCollider,
  registerEnemyDamageHandler,
  unregisterEnemyCollider,
} from './EnemyRegistry.ts'
import type { EnemyId, EnemyState } from './EnemyTypes.ts'

type EnemyBotProps = {
  enemy: EnemyState
  onDamage: (enemyId: EnemyId, damageEvent: DamageEvent) => void
}

const ENEMY_BODY_RADIUS = 0.45
const ENEMY_BODY_SEGMENT_HEIGHT = 1.1
const ENEMY_HEAD_SIZE = 0.5
const ENEMY_COLLIDER_HALF_HEIGHT = 0.55
const ENEMY_COLLIDER_RADIUS = 0.45
const ENEMY_COLLIDER_OFFSET_Y = 1

export function EnemyBot({ enemy, onDamage }: EnemyBotProps) {
  const colliderRef = useRef<RapierCollider | null>(null)

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

  return (
    <RigidBody colliders={false} position={enemy.position} type="fixed">
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
        position={[0, ENEMY_COLLIDER_OFFSET_Y, 0]}
      />
    </RigidBody>
  )
}
