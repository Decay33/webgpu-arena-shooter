import { useEffect } from 'react'

import { useUiStore } from '../state/uiStore.ts'

const DEBUG_OVERLAY_TOGGLE_KEY = 'F3'

export function DebugOverlayHotkeys() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== DEBUG_OVERLAY_TOGGLE_KEY || event.repeat) {
        return
      }

      event.preventDefault()
      useUiStore.getState().toggleDebugOverlay()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return null
}
