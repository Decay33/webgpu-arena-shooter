import type { EnemyKind, EnemySpawnDefinition } from './EnemyTypes.ts'
import { GREYBOX_ARENA_ENEMY_SPAWN_ANCHORS } from '../world/map/greyboxArenaLayout.ts'

type EnemyWaveComposition = Record<EnemyKind, number>

export const ENEMY_WAVE_CONFIG = {
  intermissionDelaySeconds: 1.75,
  waveCompleteBonus: 50,
} as const

const ENEMY_WAVE_COMPOSITIONS: EnemyWaveComposition[] = [
  {
    fast: 1,
    standard: 2,
    tank: 0,
  },
  {
    fast: 2,
    standard: 3,
    tank: 0,
  },
  {
    fast: 3,
    standard: 3,
    tank: 1,
  },
  {
    fast: 3,
    standard: 4,
    tank: 1,
  },
  {
    fast: 4,
    standard: 4,
    tank: 2,
  },
]

const ENEMY_KIND_ORDER: EnemyKind[] = ['standard', 'fast', 'tank']

function getWaveComposition(waveNumber: number): EnemyWaveComposition {
  const configuredComposition = ENEMY_WAVE_COMPOSITIONS[waveNumber - 1]

  if (configuredComposition) {
    return configuredComposition
  }

  const extraWaveCount = waveNumber - ENEMY_WAVE_COMPOSITIONS.length
  const lastComposition = ENEMY_WAVE_COMPOSITIONS[ENEMY_WAVE_COMPOSITIONS.length - 1]

  return {
    fast: lastComposition.fast + extraWaveCount,
    standard: lastComposition.standard + extraWaveCount,
    tank: lastComposition.tank + Math.floor((extraWaveCount + 1) / 2),
  }
}

function createEnemySpawnsForKind(
  enemyType: EnemyKind,
  count: number,
  waveNumber: number,
): EnemySpawnDefinition[] {
  const spawnAnchors = GREYBOX_ARENA_ENEMY_SPAWN_ANCHORS[enemyType]

  return Array.from({ length: count }, (_, index) => ({
    behavior: 'directPursuit',
    id: `wave-${String(waveNumber).padStart(2, '0')}-${enemyType}-${String(index + 1).padStart(2, '0')}`,
    position: spawnAnchors[index % spawnAnchors.length],
    type: enemyType,
  }))
}

export function createWaveEnemySpawnDefinitions(
  waveNumber: number,
): EnemySpawnDefinition[] {
  const composition = getWaveComposition(waveNumber)

  return ENEMY_KIND_ORDER.flatMap((enemyType) =>
    createEnemySpawnsForKind(enemyType, composition[enemyType], waveNumber),
  )
}
