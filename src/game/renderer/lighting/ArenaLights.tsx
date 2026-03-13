import { useLayoutEffect, useRef } from 'react'

import type { DirectionalLight, Object3D } from 'three'

import {
  ARENA_BACKGROUND_COLOR,
  ARENA_LIGHT_RIG,
  type ArenaDirectionalLightConfig,
} from '../../config/arenaVisuals.ts'

function ArenaDirectionalLight({
  castShadow = false,
  config,
}: {
  castShadow?: boolean
  config: ArenaDirectionalLightConfig
}) {
  const lightRef = useRef<DirectionalLight | null>(null)
  const targetRef = useRef<Object3D | null>(null)

  useLayoutEffect(() => {
    if (!lightRef.current || !targetRef.current) {
      return
    }

    lightRef.current.target = targetRef.current
    targetRef.current.updateMatrixWorld()
    lightRef.current.target.updateMatrixWorld()
  }, [])

  return (
    <>
      <directionalLight
        castShadow={castShadow}
        color={config.color}
        intensity={config.intensity}
        position={config.position}
        ref={lightRef}
        shadow-bias={config.shadow?.bias}
        shadow-camera-bottom={
          config.shadow ? -config.shadow.bounds : undefined
        }
        shadow-camera-far={config.shadow?.far}
        shadow-camera-left={config.shadow ? -config.shadow.bounds : undefined}
        shadow-camera-near={config.shadow?.near}
        shadow-camera-right={config.shadow?.bounds}
        shadow-camera-top={config.shadow?.bounds}
        shadow-mapSize-height={config.shadow?.mapSize}
        shadow-mapSize-width={config.shadow?.mapSize}
        shadow-normalBias={config.shadow?.normalBias}
      />
      <object3D position={config.target} ref={targetRef} />
    </>
  )
}

export function ArenaLights() {
  return (
    <>
      <color attach="background" args={[ARENA_BACKGROUND_COLOR]} />

      <ambientLight
        color={ARENA_LIGHT_RIG.ambient.color}
        intensity={ARENA_LIGHT_RIG.ambient.intensity}
      />
      <hemisphereLight
        args={[
          ARENA_LIGHT_RIG.hemisphere.skyColor,
          ARENA_LIGHT_RIG.hemisphere.groundColor,
          ARENA_LIGHT_RIG.hemisphere.intensity,
        ]}
        groundColor={ARENA_LIGHT_RIG.hemisphere.groundColor}
        intensity={ARENA_LIGHT_RIG.hemisphere.intensity}
      />

      <ArenaDirectionalLight castShadow config={ARENA_LIGHT_RIG.key} />
      <ArenaDirectionalLight config={ARENA_LIGHT_RIG.fill} />
    </>
  )
}
