import { useEffect, useRef, useState } from 'react'

import { applyDamage, createHealthState } from '../health/DamageSystem.ts'
import type { DamageEvent } from '../health/HealthTypes.ts'
import type { EnemyId, EnemySpawnDefinition, EnemyState } from './EnemyTypes.ts'

const ENEMY_SPAWNS: EnemySpawnDefinition[] = [
  {
    id: 'bot-01',
    maxHealth: 100,
    position: [0, 0, -18],
    type: 'bot',
  },
  {
    id: 'bot-02',
    maxHealth: 100,
    position: [14, 0, 8],
    type: 'bot',
  },
  {
    id: 'bot-03',
    maxHealth: 100,
    position: [-18, 0, 10],
    type: 'bot',
  },
]

function createEnemyState(enemySpawn: EnemySpawnDefinition): EnemyState {
  return {
    ...enemySpawn,
    ...createHealthState(enemySpawn.maxHealth),
  }
}

export function useEnemySystem() {
  const [enemies, setEnemies] = useState<EnemyState[]>(() =>
    ENEMY_SPAWNS.map(createEnemyState),
  )
  const enemiesRef = useRef(enemies)
  
  useEffect(() => {
    enemiesRef.current = enemies
  }, [enemies])

  const damageEnemy = (enemyId: EnemyId, damageEvent: DamageEvent) => {
    const currentEnemies = enemiesRef.current
    const enemyIndex = currentEnemies.findIndex((enemy) => enemy.id === enemyId)

    if (enemyIndex < 0) {
      return
    }

    const enemy = currentEnemies[enemyIndex]

    if (!enemy.alive) {
      return
    }

    const damageResult = applyDamage(enemy, damageEvent)

    if (damageResult.appliedDamage <= 0) {
      return
    }

    console.log(
      `Enemy ${enemy.id} took ${damageResult.appliedDamage} damage from ${damageEvent.source}. ${damageResult.currentHealth}/${damageResult.maxHealth} health remaining.`,
    )

    if (damageResult.died) {
      console.log(`Enemy ${enemy.id} died.`)
    }

    const nextEnemies = [...currentEnemies]
    nextEnemies[enemyIndex] = {
      ...enemy,
      alive: damageResult.alive,
      currentHealth: damageResult.currentHealth,
    }

    enemiesRef.current = nextEnemies
    setEnemies(nextEnemies)
  }

  return {
    damageEnemy,
    enemies,
  }
}
