import type { GLProps } from '@react-three/fiber'
import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three'
import { WebGPURenderer } from 'three/webgpu'

import { ARENA_RENDERER_VISUALS } from '../../config/arenaVisuals.ts'
import { useRendererStore } from '../state/rendererStore.ts'
import type { RendererMode } from '../../../shared/types/renderer.ts'

type RenderSurface = WebGLRenderer | WebGPURenderer
type RendererFactoryProps<TFactory> = TFactory extends (
  defaultProps: infer TProps,
) => Promise<unknown>
  ? TProps
  : never
type DefaultRendererProps = RendererFactoryProps<GLProps>
type WebGPURendererProps = ConstructorParameters<typeof WebGPURenderer>[0]

type BackendFlags = {
  isWebGPUBackend?: boolean
}

function configureRenderer<TRenderer extends RenderSurface>(
  renderer: TRenderer,
): TRenderer {
  renderer.setClearColor(ARENA_RENDERER_VISUALS.clearColor)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = ARENA_RENDERER_VISUALS.toneMappingExposure

  return renderer
}

function resolveRendererMode(renderer: WebGPURenderer): RendererMode {
  const backend = renderer.backend as BackendFlags

  return backend.isWebGPUBackend === true ? 'WebGPU' : 'Fallback'
}

function toWebGPURendererProps(
  defaultProps: DefaultRendererProps,
): WebGPURendererProps {
  const { alpha, canvas, depth, powerPreference, stencil } = defaultProps

  return {
    alpha,
    antialias: true,
    canvas: canvas as HTMLCanvasElement,
    depth,
    powerPreference:
      powerPreference === 'high-performance' || powerPreference === 'low-power'
        ? powerPreference
        : undefined,
    stencil,
  }
}

function createWebGLFallback(defaultProps: DefaultRendererProps): WebGLRenderer {
  return configureRenderer(
    new WebGLRenderer({
      ...defaultProps,
      antialias: true,
    }),
  )
}

function setRendererReady(rendererMode: RendererMode) {
  const rendererStore = useRendererStore.getState()

  rendererStore.setRendererMode(rendererMode)
  rendererStore.setInitializationState('ready')
}

export async function createGameRenderer(
  defaultProps: DefaultRendererProps,
): Promise<RenderSurface> {
  const rendererStore = useRendererStore.getState()

  rendererStore.setFpsEstimate(0)
  rendererStore.setRendererMode(null)
  rendererStore.setInitializationState('initializing')

  try {
    const renderer = configureRenderer(
      new WebGPURenderer(toWebGPURendererProps(defaultProps)),
    )

    await renderer.init()
    setRendererReady(resolveRendererMode(renderer))

    return renderer
  } catch (webgpuError) {
    console.warn(
      'Renderer initialization failed, falling back to WebGL.',
      webgpuError,
    )

    try {
      const fallbackRenderer = createWebGLFallback(defaultProps)
      setRendererReady('Fallback')

      return fallbackRenderer
    } catch (fallbackError) {
      rendererStore.setInitializationState('failed')
      throw fallbackError
    }
  }
}
