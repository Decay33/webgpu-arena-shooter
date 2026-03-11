import { create } from 'zustand'

import type {
  RendererInitializationState,
  RendererMode,
} from '../../../shared/types/renderer.ts'

type RendererStore = {
  rendererMode: RendererMode | null
  fpsEstimate: number
  initializationState: RendererInitializationState
  pointerLocked: boolean
  playerPosition: [number, number, number]
  playerGrounded: boolean
  setRendererMode: (rendererMode: RendererMode | null) => void
  setFpsEstimate: (fpsEstimate: number) => void
  setInitializationState: (
    initializationState: RendererInitializationState,
  ) => void
  setPointerLocked: (pointerLocked: boolean) => void
  setPlayerDebug: (
    playerPosition: [number, number, number],
    playerGrounded: boolean,
  ) => void
  resetRendererStatus: () => void
}

const initialRendererState = {
  rendererMode: null,
  fpsEstimate: 0,
  initializationState: 'idle' as const,
  pointerLocked: false,
  playerPosition: [0, 0, 0] as [number, number, number],
  playerGrounded: false,
}

export const useRendererStore = create<RendererStore>((set) => ({
  ...initialRendererState,
  setRendererMode: (rendererMode) => set({ rendererMode }),
  setFpsEstimate: (fpsEstimate) => set({ fpsEstimate }),
  setInitializationState: (initializationState) =>
    set({ initializationState }),
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  setPlayerDebug: (playerPosition, playerGrounded) =>
    set({ playerGrounded, playerPosition }),
  resetRendererStatus: () => set(initialRendererState),
}))
