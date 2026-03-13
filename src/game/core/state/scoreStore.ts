import { create } from 'zustand'

import { debugGameLog } from '../../../shared/constants/debug.ts'

const BEST_SCORE_STORAGE_KEY = 'arena-shooter-best-score'

type ScoreStore = {
  addScore: (scoreAmount: number, source: string) => void
  bestScore: number
  currentScore: number
  resetScore: () => void
}

function readBestScore() {
  if (typeof window === 'undefined') {
    return 0
  }

  try {
    const storedBestScore = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY)

    if (!storedBestScore) {
      return 0
    }

    const parsedBestScore = Number.parseInt(storedBestScore, 10)
    return Number.isFinite(parsedBestScore) ? parsedBestScore : 0
  } catch {
    return 0
  }
}

function writeBestScore(bestScore: number) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(bestScore))
  } catch {
    // Ignore storage failures and keep the in-memory score path working.
  }
}

const INITIAL_BEST_SCORE = readBestScore()

export const useScoreStore = create<ScoreStore>((set) => ({
  addScore: (scoreAmount, source) =>
    set((state) => {
      if (scoreAmount <= 0) {
        return state
      }

      const nextScore = state.currentScore + scoreAmount
      const nextBestScore = Math.max(state.bestScore, nextScore)

      if (nextBestScore !== state.bestScore) {
        writeBestScore(nextBestScore)
      }

      debugGameLog(`Score +${scoreAmount} from ${source}. ${nextScore} total.`)

      return {
        bestScore: nextBestScore,
        currentScore: nextScore,
      }
    }),
  bestScore: INITIAL_BEST_SCORE,
  currentScore: 0,
  resetScore: () =>
    set((state) => {
      if (state.currentScore === 0) {
        return state
      }

      return {
        currentScore: 0,
      }
    }),
}))

export function addScore(scoreAmount: number, source: string) {
  useScoreStore.getState().addScore(scoreAmount, source)
}

export function resetScore() {
  useScoreStore.getState().resetScore()
}
