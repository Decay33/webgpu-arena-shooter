import { create } from 'zustand'

import type {
  RendererInitializationState,
  RendererMode,
} from '../../../shared/types/renderer.ts'

type RendererStore = {
  rendererMode: RendererMode | null
  fpsEstimate: number
  initializationState: RendererInitializationState
  setRendererMode: (rendererMode: RendererMode | null) => void
  setFpsEstimate: (fpsEstimate: number) => void
  setInitializationState: (
    initializationState: RendererInitializationState,
  ) => void
  resetRendererStatus: () => void
}

const initialRendererState = {
  rendererMode: null,
  fpsEstimate: 0,
  initializationState: 'idle' as const,
}

export const useRendererStore = create<RendererStore>((set) => ({
  ...initialRendererState,
  setRendererMode: (rendererMode) => set({ rendererMode }),
  setFpsEstimate: (fpsEstimate) => set({ fpsEstimate }),
  setInitializationState: (initializationState) =>
    set({ initializationState }),
  resetRendererStatus: () => set(initialRendererState),
}))
