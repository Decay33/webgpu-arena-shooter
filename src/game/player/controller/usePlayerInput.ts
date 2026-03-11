import { useEffect, useState } from 'react'

export type PlayerInputState = {
  moveForward: boolean
  moveBackward: boolean
  moveLeft: boolean
  moveRight: boolean
  jump: boolean
  sprint: boolean
}

const INITIAL_INPUT_STATE: PlayerInputState = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  jump: false,
  sprint: false,
}

const INPUT_KEYS: Record<string, keyof PlayerInputState> = {
  KeyW: 'moveForward',
  KeyS: 'moveBackward',
  KeyA: 'moveLeft',
  KeyD: 'moveRight',
  Space: 'jump',
  ShiftLeft: 'sprint',
  ShiftRight: 'sprint',
}

export function usePlayerInput(): PlayerInputState {
  const [inputState, setInputState] =
    useState<PlayerInputState>(INITIAL_INPUT_STATE)

  useEffect(() => {
    const setKeyState = (code: string, value: boolean) => {
      const inputKey = INPUT_KEYS[code]

      if (!inputKey) {
        return
      }

      setInputState((currentState) => {
        if (currentState[inputKey] === value) {
          return currentState
        }

        return {
          ...currentState,
          [inputKey]: value,
        }
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code in INPUT_KEYS) {
        event.preventDefault()
      }

      setKeyState(event.code, true)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeyState(event.code, false)
    }

    const resetInputState = () => {
      setInputState(INITIAL_INPUT_STATE)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', resetInputState)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', resetInputState)
    }
  }, [])

  return inputState
}
