import { useEffect, useMemo } from 'react'

import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  Vignette,
} from '@react-three/postprocessing'
import { useFrame, useThree } from '@react-three/fiber'
import type { WebGLRenderer } from 'three'
import { RenderPipeline, type WebGPURenderer } from 'three/webgpu'
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js'
import { vignette } from 'three/examples/jsm/tsl/display/CRT.js'
import { float, luminance, mix, pass, smoothstep, vec3, vec4 } from 'three/tsl'

import { ARENA_POST_PROCESSING } from '../../config/arenaPostProcessing.ts'

type RenderSurface = WebGLRenderer | WebGPURenderer

type WebGPURendererFlag = {
  isWebGPURenderer?: boolean
}

function isWebGPURenderer(renderer: RenderSurface): renderer is WebGPURenderer {
  return (renderer as WebGPURendererFlag).isWebGPURenderer === true
}

function ArenaWebGPUPostProcessing({
  renderer,
}: {
  renderer: WebGPURenderer
}) {
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)

  const outputNode = useMemo(() => {
    const postConfig = ARENA_POST_PROCESSING.webgpu
    const scenePass = pass(scene, camera)
    const sceneColor = scenePass.getTextureNode('output')
    const bloomPass = bloom(
      sceneColor,
      postConfig.bloom.strength,
      postConfig.bloom.radius,
      postConfig.bloom.threshold,
    )
    const bloomedScene = sceneColor.add(bloomPass)
    const toneMask = smoothstep(
      float(postConfig.tone.midpointStart),
      float(postConfig.tone.midpointEnd),
      luminance(bloomedScene.rgb),
    )
    const shadowShaped = bloomedScene.rgb
      .mul(float(postConfig.tone.shadowGain))
      .mul(vec3(...postConfig.tone.shadowTint))
    const highlightShaped = bloomedScene.rgb
      .mul(float(postConfig.tone.highlightGain))
      .mul(vec3(...postConfig.tone.highlightTint))
    const tonedColor = mix(shadowShaped, highlightShaped, toneMask)
    const vignettedColor = vignette(
      tonedColor,
      float(postConfig.vignette.intensity),
      float(postConfig.vignette.smoothness),
    )

    return vec4(vignettedColor, bloomedScene.a)
  }, [camera, scene])

  const pipeline = useMemo(
    () => new RenderPipeline(renderer, outputNode),
    [outputNode, renderer],
  )

  useEffect(() => {
    return () => {
      pipeline.dispose()
    }
  }, [pipeline])

  useFrame(() => {
    pipeline.render()
  }, 1)

  return null
}

function ArenaFallbackPostProcessing() {
  const postConfig = ARENA_POST_PROCESSING.fallback

  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={postConfig.bloom.intensity}
        luminanceSmoothing={postConfig.bloom.luminanceSmoothing}
        luminanceThreshold={postConfig.bloom.luminanceThreshold}
        mipmapBlur
        radius={postConfig.bloom.radius}
      />
      <BrightnessContrast
        brightness={postConfig.tone.brightness}
        contrast={postConfig.tone.contrast}
      />
      <HueSaturation saturation={postConfig.tone.saturation} />
      <Vignette
        darkness={postConfig.vignette.darkness}
        eskil={false}
        offset={postConfig.vignette.offset}
      />
    </EffectComposer>
  )
}

export function ArenaPostProcessing() {
  const gl = useThree((state) => state.gl) as RenderSurface

  if (isWebGPURenderer(gl)) {
    return <ArenaWebGPUPostProcessing renderer={gl} />
  }

  return <ArenaFallbackPostProcessing />
}
