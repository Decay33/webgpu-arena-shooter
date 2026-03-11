export type RendererMode = 'WebGPU' | 'Fallback'

export type RendererInitializationState =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'failed'
