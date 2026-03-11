import { useLayoutEffect, useRef } from 'react'

import type { Mesh } from 'three'
import { Vector3 } from 'three'

import type { WeaponEffectsState } from './WeaponSystem.ts'

type TracerBeamProps = {
  color: string
  end: [number, number, number]
  start: [number, number, number]
  thickness: number
}

type WeaponEffectsProps = {
  effects: WeaponEffectsState
}

const TRACER_START = new Vector3()
const TRACER_END = new Vector3()
const TRACER_MIDPOINT = new Vector3()

function TracerBeam({ color, end, start, thickness }: TracerBeamProps) {
  const meshRef = useRef<Mesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current

    if (!mesh) {
      return
    }

    TRACER_START.set(start[0], start[1], start[2])
    TRACER_END.set(end[0], end[1], end[2])
    TRACER_MIDPOINT.copy(TRACER_START).add(TRACER_END).multiplyScalar(0.5)

    mesh.position.copy(TRACER_MIDPOINT)
    mesh.lookAt(TRACER_END)
    mesh.scale.set(1, 1, Math.max(TRACER_START.distanceTo(TRACER_END), 0.001))
  }, [end, start])

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[thickness, thickness, 1]} />
      <meshBasicMaterial
        color={color}
        depthWrite={false}
        opacity={0.9}
        toneMapped={false}
        transparent
      />
    </mesh>
  )
}

export function WeaponEffects({ effects }: WeaponEffectsProps) {
  return (
    <>
      {effects.hitMarkers.map((marker) => (
        <mesh key={marker.id} position={marker.position}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#d62828" toneMapped={false} />
        </mesh>
      ))}

      {effects.muzzleFlashes.map((flash) => (
        <mesh key={flash.id} position={flash.position}>
          <sphereGeometry args={[flash.size, 10, 10]} />
          <meshBasicMaterial
            color={flash.color}
            depthWrite={false}
            opacity={0.85}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}

      {effects.tracers.map((tracer) => (
        <TracerBeam
          key={tracer.id}
          color={tracer.color}
          end={tracer.end}
          start={tracer.start}
          thickness={tracer.thickness}
        />
      ))}
    </>
  )
}
