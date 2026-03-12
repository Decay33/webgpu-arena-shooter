import { create } from 'zustand'

export type RunState = 'gameOver' | 'restarting' | 'running'

type RunStore = {
  endRun: (finalScore: number, waveReached: number) => void
  finalScore: number
  requestRestart: () => void
  runState: RunState
  startRun: () => void
  waveReached: number
}

const INITIAL_RUN_STATE = {
  finalScore: 0,
  runState: 'running' as const,
  waveReached: 1,
}

export const useRunStore = create<RunStore>((set) => ({
  ...INITIAL_RUN_STATE,
  endRun: (finalScore, waveReached) =>
    set((state) => {
      if (state.runState !== 'running') {
        return state
      }

      return {
        finalScore,
        runState: 'gameOver',
        waveReached,
      }
    }),
  requestRestart: () =>
    set((state) => {
      if (state.runState !== 'gameOver') {
        return state
      }

      return {
        runState: 'restarting',
      }
    }),
  runState: INITIAL_RUN_STATE.runState,
  startRun: () => set(INITIAL_RUN_STATE),
  waveReached: INITIAL_RUN_STATE.waveReached,
}))
