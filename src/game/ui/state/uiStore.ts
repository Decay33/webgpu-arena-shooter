import { create } from 'zustand'

type UiStore = {
  debugOverlayVisible: boolean
  toggleDebugOverlay: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  debugOverlayVisible: false,
  toggleDebugOverlay: () =>
    set((state) => ({
      debugOverlayVisible: !state.debugOverlayVisible,
    })),
}))
