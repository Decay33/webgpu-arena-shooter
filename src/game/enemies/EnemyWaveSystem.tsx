import { useFrame } from '@react-three/fiber'

import { useRunStore } from '../core/state/runStore.ts'
import { updateEnemyWaveProgress } from './EnemySystem.ts'

export function EnemyWaveSystem() {
  useFrame(() => {
    if (useRunStore.getState().runState !== 'running') {
      return
    }

    updateEnemyWaveProgress(performance.now())
  })

  return null
}
