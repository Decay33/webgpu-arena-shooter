import { create } from 'zustand'

import { applyDamage, createHealthState } from '../health/DamageSystem.ts'
import type { DamageEvent } from '../health/HealthTypes.ts'
import type { EnemyId, EnemySpawnDefinition, EnemyState } from './EnemyTypes.ts'

type EnemyStore = {
  damageEnemy: (enemyId: EnemyId, damageEvent: DamageEvent) => void
  enemies: EnemyState[]
}

export const ENEMY_MOVEMENT_CONFIG = {
  moveSpeed: 2.6,
  stopDistance: 2.2,
  airControl: 0.16,
  groundProbeDistance: 0.18,
  linearDamping: 5,
  minGroundNormalY: 0.7,
  snapshotInterval: 0.15,
}

export const ENEMY_COMBAT_CONFIG = {
  contactDamage: 12,
  contactDamageIntervalSeconds: 0.85,
  contactDamageRadius: 2.35,
  contactVerticalTolerance: 2.5,
}

export const ENEMY_HALF_HEIGHT = 1

const enemyPositionSnapshots = new Map<EnemyId, [number, number, number]>()

const ENEMY_SPAWNS: EnemySpawnDefinition[] = [
  {
    behavior: 'directPursuit',
    id: 'bot-01',
    maxHealth: 100,
    position: [0, 0, -18],
    type: 'bot',
  },
  {
    behavior: 'directPursuit',
    id: 'bot-02',
    maxHealth: 100,
    position: [14, 0, 8],
    type: 'bot',
  },
  {
    behavior: 'directPursuit',
    id: 'bot-03',
    maxHealth: 100,
    position: [-18, 0, 10],
    type: 'bot',
  },
]

function getSnapshotPosition(
  enemyId: EnemyId,
  fallbackPosition: [number, number, number],
): [number, number, number] {
  return enemyPositionSnapshots.get(enemyId) ?? fallbackPosition
}

function createEnemyState(enemySpawn: EnemySpawnDefinition): EnemyState {
  return {
    ...enemySpawn,
    position: getSnapshotPosition(enemySpawn.id, enemySpawn.position),
    ...createHealthState(enemySpawn.maxHealth),
  }
}

const useEnemyStore = create<EnemyStore>((set) => ({
  damageEnemy: (enemyId, damageEvent) =>
    set((state) => {
      const enemyIndex = state.enemies.findIndex((enemy) => enemy.id === enemyId)

      if (enemyIndex < 0) {
        return state
      }

      const enemy = state.enemies[enemyIndex]

      if (!enemy.alive) {
        return state
      }

      const damageResult = applyDamage(enemy, damageEvent)

      if (damageResult.appliedDamage <= 0) {
        return state
      }

      console.log(
        `Enemy ${enemy.id} took ${damageResult.appliedDamage} damage from ${damageEvent.source}. ${damageResult.currentHealth}/${damageResult.maxHealth} health remaining.`,
      )

      if (damageResult.died) {
        console.log(`Enemy ${enemy.id} died.`)
      }

      const nextEnemies = [...state.enemies]
      nextEnemies[enemyIndex] = {
        ...enemy,
        alive: damageResult.alive,
        currentHealth: damageResult.currentHealth,
      }

      return {
        enemies: nextEnemies,
      }
    }),
  enemies: ENEMY_SPAWNS.map(createEnemyState),
}))

export function getEnemyRuntimePosition(
  enemyId: EnemyId,
  fallbackPosition: [number, number, number],
): [number, number, number] {
  return getSnapshotPosition(enemyId, fallbackPosition)
}

export function setEnemyRuntimePosition(
  enemyId: EnemyId,
  position: [number, number, number],
) {
  enemyPositionSnapshots.set(enemyId, position)
}

export function applyDamageToEnemiesInRadius(
  center: [number, number, number],
  radius: number,
  damageEvent: DamageEvent,
) {
  const { damageEnemy, enemies } = useEnemyStore.getState()
  let damagedEnemies = 0

  enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return
    }

    const enemyPosition = getSnapshotPosition(enemy.id, enemy.position)
    const distanceToExplosion = Math.hypot(
      center[0] - enemyPosition[0],
      center[1] - (enemyPosition[1] + ENEMY_HALF_HEIGHT),
      center[2] - enemyPosition[2],
    )

    if (distanceToExplosion > radius) {
      return
    }

    damageEnemy(enemy.id, damageEvent)
    damagedEnemies += 1
  })

  return damagedEnemies
}

export function useEnemySystem() {
  const damageEnemy = useEnemyStore((state) => state.damageEnemy)
  const enemies = useEnemyStore((state) => state.enemies)

  return {
    damageEnemy,
    enemies,
  }
}
