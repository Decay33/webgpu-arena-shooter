import { useEffect, useRef } from 'react'

import { useFrame } from '@react-three/fiber'

import { useRendererStore } from '../state/rendererStore.ts'

const SAMPLE_WINDOW_SECONDS = 0.4

export function FpsProbe() {
  const elapsedRef = useRef(0)
  const framesRef = useRef(0)
  const setFpsEstimate = useRendererStore((state) => state.setFpsEstimate)

  useEffect(() => {
    return () => {
      setFpsEstimate(0)
    }
  }, [setFpsEstimate])

  useFrame((_, delta) => {
    elapsedRef.current += delta
    framesRef.current += 1

    if (elapsedRef.current < SAMPLE_WINDOW_SECONDS) {
      return
    }

    setFpsEstimate(Math.round(framesRef.current / elapsedRef.current))
    elapsedRef.current = 0
    framesRef.current = 0
  })

  return null
}
