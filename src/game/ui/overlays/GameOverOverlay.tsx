import { useEffect } from 'react'

import { useScoreStore } from '../../core/state/scoreStore.ts'
import { useRunStore } from '../../core/state/runStore.ts'

const RESTART_KEYS = new Set(['Enter', 'KeyR'])

export function GameOverOverlay() {
  const runState = useRunStore((state) => state.runState)
  const finalScore = useRunStore((state) => state.finalScore)
  const waveReached = useRunStore((state) => state.waveReached)
  const requestRestart = useRunStore((state) => state.requestRestart)
  const bestScore = useScoreStore((state) => state.bestScore)

  useEffect(() => {
    if (runState !== 'gameOver') {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!RESTART_KEYS.has(event.code) || event.repeat) {
        return
      }

      event.preventDefault()
      requestRestart()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [requestRestart, runState])

  if (runState !== 'gameOver') {
    return null
  }

  return (
    <div className="game-over-overlay" role="dialog" aria-modal="true">
      <div className="game-over-overlay__panel">
        <p className="game-over-overlay__eyebrow">Run Complete</p>
        <h1 className="game-over-overlay__title">Game Over</h1>
        <p className="game-over-overlay__row">
          <span className="game-over-overlay__label">Final Score</span>
          <span className="game-over-overlay__value">{finalScore}</span>
        </p>
        <p className="game-over-overlay__row">
          <span className="game-over-overlay__label">Best Score</span>
          <span className="game-over-overlay__value">{bestScore}</span>
        </p>
        <p className="game-over-overlay__row">
          <span className="game-over-overlay__label">Wave Reached</span>
          <span className="game-over-overlay__value">{waveReached}</span>
        </p>
        <p className="game-over-overlay__hint">Press Enter or R to restart</p>
      </div>
    </div>
  )
}
