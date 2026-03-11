import { memo, useEffect } from 'react'

import { Canvas } from '@react-three/fiber'

import { FpsProbe } from './FpsProbe.tsx'
import { TestRoomScene } from './TestRoomScene.tsx'
import { useRendererStore } from '../state/rendererStore.ts'
import { createGameRenderer } from '../webgpu/createGameRenderer.ts'

const CAMERA_POSITION: [number, number, number] = [10, 8, 10]

export const ArenaCanvas = memo(function ArenaCanvas() {
  const resetRendererStatus = useRendererStore(
    (state) => state.resetRendererStatus,
  )

  useEffect(() => {
    return () => {
      resetRendererStatus()
    }
  }, [resetRendererStatus])

  return (
    <Canvas
      camera={{ position: CAMERA_POSITION, fov: 50, near: 0.1, far: 100 }}
      className="arena-canvas"
      dpr={[1, 1.5]}
      gl={createGameRenderer}
      shadows
    >
      <TestRoomScene />
      <FpsProbe />
    </Canvas>
  )
})
