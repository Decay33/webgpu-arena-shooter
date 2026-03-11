import type { RefObject } from 'react'

import type { RapierRigidBody } from '@react-three/rapier'

import { EnemyBot } from './EnemyBot.tsx'
import { useEnemySystem } from './EnemySystem.ts'

type EnemySpawnerProps = {
  playerBodyRef: RefObject<RapierRigidBody | null>
}

export function EnemySpawner({ playerBodyRef }: EnemySpawnerProps) {
  const { damageEnemy, enemies } = useEnemySystem()

  return (
    <>
      {enemies
        .filter((enemy) => enemy.alive)
        .map((enemy) => (
          <EnemyBot
            enemy={enemy}
            key={enemy.id}
            onDamage={damageEnemy}
            playerBodyRef={playerBodyRef}
          />
        ))}
    </>
  )
}
