import type { EnemyKind, EnemySpawnDefinition } from './EnemyTypes.ts'

type EnemyWaveComposition = Record<EnemyKind, number>

export const ENEMY_WAVE_CONFIG = {
  intermissionDelaySeconds: 3,
  waveCompleteBonus: 50,
} as const

const ENEMY_SPAWN_ANCHORS: Record<EnemyKind, [number, number, number][]> = {
  fast: [
    [-18, 0, 10],
    [10, 0, -18],
    [-4, 0, 18],
    [18, 0, -6],
  ],
  standard: [
    [0, 0, -18],
    [14, 0, 8],
    [-20, 0, -10],
    [6, 0, 18],
  ],
  tank: [
    [22, 0, 16],
    [-22, 0, 2],
    [18, 0, -14],
  ],
}

const ENEMY_WAVE_COMPOSITIONS: EnemyWaveComposition[] = [
  {
    fast: 1,
    standard: 2,
    tank: 0,
  },
  {
    fast: 2,
    standard: 2,
    tank: 0,
  },
  {
    fast: 2,
    standard: 2,
    tank: 1,
  },
  {
    fast: 3,
    standard: 3,
    tank: 1,
  },
  {
    fast: 4,
    standard: 3,
    tank: 1,
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
    standard: lastComposition.standard + Math.ceil(extraWaveCount / 2),
    tank: lastComposition.tank + Math.floor((extraWaveCount + 1) / 3),
  }
}

function createEnemySpawnsForKind(
  enemyType: EnemyKind,
  count: number,
  waveNumber: number,
): EnemySpawnDefinition[] {
  const spawnAnchors = ENEMY_SPAWN_ANCHORS[enemyType]

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
