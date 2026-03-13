import { create } from 'zustand'

import { addScore } from '../core/state/scoreStore.ts'
import { applyDamage, createHealthState } from '../health/DamageSystem.ts'
import type { DamageEvent } from '../health/HealthTypes.ts'
import { debugGameLog } from '../../shared/constants/debug.ts'
import { getEnemyTypeDefinition } from './EnemyDefinitions.ts'
import {
  createWaveEnemySpawnDefinitions,
  ENEMY_WAVE_CONFIG,
} from './EnemyWaves.ts'
import type {
  EnemyId,
  EnemySpawnDefinition,
  EnemyState,
  EnemyWaveState,
} from './EnemyTypes.ts'

type EnemyStore = {
  clearEnemies: () => void
  currentWave: number
  damageEnemy: (enemyId: EnemyId, damageEvent: DamageEvent) => void
  enemies: EnemyState[]
  resetEnemyRun: () => void
  updateWaveProgress: (nowMs: number) => void
  waveIntermissionDeadlineMs: number | null
  waveState: EnemyWaveState
}

const enemyPositionSnapshots = new Map<EnemyId, [number, number, number]>()

type RadiusDamageResult = {
  damagedEnemies: number
  nextEnemies: EnemyState[] | null
  scoreAward: number
}

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
    ...createHealthState(getEnemyTypeDefinition(enemySpawn.type).maxHealth),
  }
}

function createWaveEnemyStates(waveNumber: number): EnemyState[] {
  return createWaveEnemySpawnDefinitions(waveNumber).map(createEnemyState)
}

function clearEnemyPositionSnapshots() {
  enemyPositionSnapshots.clear()
}

function applyRadiusDamageToEnemies(
  enemies: EnemyState[],
  center: [number, number, number],
  radius: number,
  damageEvent: DamageEvent,
): RadiusDamageResult {
  const radiusSquared = radius * radius
  let damagedEnemies = 0
  let nextEnemies: EnemyState[] | null = null
  let scoreAward = 0

  enemies.forEach((enemy, index) => {
    if (!enemy.alive) {
      return
    }

    const enemyPosition = getSnapshotPosition(enemy.id, enemy.position)
    const enemyTypeDefinition = getEnemyTypeDefinition(enemy.type)
    const dx = center[0] - enemyPosition[0]
    const dy = center[1] - (enemyPosition[1] + enemyTypeDefinition.colliderOffsetY)
    const dz = center[2] - enemyPosition[2]
    const distanceSquared = dx * dx + dy * dy + dz * dz

    if (distanceSquared > radiusSquared) {
      return
    }

    const damageResult = applyDamage(enemy, damageEvent)

    if (damageResult.appliedDamage <= 0) {
      return
    }

    if (!nextEnemies) {
      nextEnemies = [...enemies]
    }

    nextEnemies[index] = {
      ...enemy,
      alive: damageResult.alive,
      currentHealth: damageResult.currentHealth,
    }

    damagedEnemies += 1

    debugGameLog(
      `Enemy ${enemy.id} took ${damageResult.appliedDamage} damage from ${damageEvent.source}. ${damageResult.currentHealth}/${damageResult.maxHealth} health remaining.`,
    )

    if (damageResult.died) {
      debugGameLog(`Enemy ${enemy.id} died.`)
      enemyPositionSnapshots.delete(enemy.id)
      scoreAward += enemyTypeDefinition.scoreValue
    }
  })

  return {
    damagedEnemies,
    nextEnemies,
    scoreAward,
  }
}

const useEnemyStore = create<EnemyStore>((set) => ({
  clearEnemies: () =>
    set((state) => {
      if (state.enemies.length === 0 && state.waveIntermissionDeadlineMs === null) {
        return state
      }

      clearEnemyPositionSnapshots()

      return {
        enemies: [],
        waveIntermissionDeadlineMs: null,
      }
    }),
  currentWave: 1,
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

      debugGameLog(
        `Enemy ${enemy.id} took ${damageResult.appliedDamage} damage from ${damageEvent.source}. ${damageResult.currentHealth}/${damageResult.maxHealth} health remaining.`,
      )

      if (damageResult.died) {
        debugGameLog(`Enemy ${enemy.id} died.`)
        enemyPositionSnapshots.delete(enemy.id)
        addScore(getEnemyTypeDefinition(enemy.type).scoreValue, `${enemy.id}:kill`)
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
  enemies: createWaveEnemyStates(1),
  resetEnemyRun: () =>
    set(() => {
      clearEnemyPositionSnapshots()

      return {
        currentWave: 1,
        enemies: createWaveEnemyStates(1),
        waveIntermissionDeadlineMs: null,
        waveState: 'active',
      }
    }),
  updateWaveProgress: (nowMs) =>
    set((state) => {
      if (state.waveState === 'active') {
        const livingEnemies = state.enemies.filter((enemy) => enemy.alive)

        if (livingEnemies.length > 0) {
          return state
        }

        debugGameLog(`Wave ${state.currentWave} complete.`)
        addScore(
          ENEMY_WAVE_CONFIG.waveCompleteBonus,
          `wave-${state.currentWave}:complete`,
        )

        return {
          enemies: [],
          waveIntermissionDeadlineMs:
            nowMs + ENEMY_WAVE_CONFIG.intermissionDelaySeconds * 1000,
          waveState: 'intermission',
        }
      }

      if (
        state.waveIntermissionDeadlineMs === null ||
        state.waveIntermissionDeadlineMs > nowMs
      ) {
        return state
      }

      const nextWave = state.currentWave + 1
      debugGameLog(`Wave ${nextWave} started.`)

      return {
        currentWave: nextWave,
        enemies: createWaveEnemyStates(nextWave),
        waveIntermissionDeadlineMs: null,
        waveState: 'active',
      }
    }),
  waveIntermissionDeadlineMs: null,
  waveState: 'active',
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

export function updateEnemyWaveProgress(nowMs: number) {
  useEnemyStore.getState().updateWaveProgress(nowMs)
}

export function clearEnemies() {
  useEnemyStore.getState().clearEnemies()
}

export function resetEnemyRun() {
  useEnemyStore.getState().resetEnemyRun()
}

export function applyDamageToEnemiesInRadius(
  center: [number, number, number],
  radius: number,
  damageEvent: DamageEvent,
) {
  let damagedEnemies = 0
  let scoreAward = 0

  useEnemyStore.setState((state) => {
    const radiusDamageResult = applyRadiusDamageToEnemies(
      state.enemies,
      center,
      radius,
      damageEvent,
    )

    damagedEnemies = radiusDamageResult.damagedEnemies
    scoreAward = radiusDamageResult.scoreAward

    if (!radiusDamageResult.nextEnemies) {
      return state
    }

    return {
      enemies: radiusDamageResult.nextEnemies,
    }
  })

  if (scoreAward > 0) {
    addScore(scoreAward, `${damageEvent.source}:radius-kill`)
  }

  return damagedEnemies
}

export function useEnemySystem() {
  const currentWave = useEnemyStore((state) => state.currentWave)
  const damageEnemy = useEnemyStore((state) => state.damageEnemy)
  const enemies = useEnemyStore((state) => state.enemies)
  const waveState = useEnemyStore((state) => state.waveState)

  return {
    currentWave,
    damageEnemy,
    enemies,
    enemiesRemaining: enemies.filter((enemy) => enemy.alive).length,
    waveState,
  }
}
