import { useFrame } from '@react-three/fiber'

import { updateEnemyWaveProgress } from './EnemySystem.ts'

export function EnemyWaveSystem() {
  useFrame(() => {
    updateEnemyWaveProgress(performance.now())
  })

  return null
}
