import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import type { Group, Material, Mesh } from 'three'
import { AdditiveBlending } from 'three'

type PickupPresentationProps = {
  children: ReactNode
  glowColor: string
  hoverAmplitude: number
  hoverSpeed: number
  ringColor: string
  ringRadius: number
  ringThickness: number
  rotationSpeed: number
  seed: number
}

function setMaterialOpacity(material: Material | Material[] | null, opacity: number) {
  if (!material || Array.isArray(material)) {
    return
  }

  material.opacity = opacity
}

export function PickupPresentation({
  children,
  glowColor,
  hoverAmplitude,
  hoverSpeed,
  ringColor,
  ringRadius,
  ringThickness,
  rotationSpeed,
  seed,
}: PickupPresentationProps) {
  const groupRef = useRef<Group>(null)
  const glowRef = useRef<Mesh>(null)
  const ringRef = useRef<Mesh>(null)
  const crownRef = useRef<Mesh>(null)
  const discRef = useRef<Mesh>(null)
  const phase = useMemo(() => seed * 0.37, [seed])

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime
    const hoverWave = elapsed * hoverSpeed + phase
    const bobOffset = Math.sin(hoverWave) * hoverAmplitude
    const pulse = 0.84 + (Math.sin(hoverWave * 1.45) + 1) * 0.075

    if (groupRef.current) {
      groupRef.current.position.y = bobOffset
      groupRef.current.rotation.y = elapsed * rotationSpeed + phase
      groupRef.current.rotation.z = Math.sin(hoverWave * 0.42) * 0.025
    }

    if (glowRef.current) {
      glowRef.current.scale.set(1.08 * pulse, 0.62 * pulse, 1.08 * pulse)
      setMaterialOpacity(glowRef.current.material, 0.14 + pulse * 0.08)
    }

    if (ringRef.current) {
      ringRef.current.scale.setScalar(0.96 + pulse * 0.09)
      ringRef.current.rotation.z = elapsed * rotationSpeed * 0.65
      setMaterialOpacity(ringRef.current.material, 0.28 + pulse * 0.12)
    }

    if (crownRef.current) {
      crownRef.current.position.y = ringRadius * 0.54 + bobOffset * 0.16
      crownRef.current.scale.setScalar(0.94 + pulse * 0.06)
      crownRef.current.rotation.z = -elapsed * rotationSpeed * 0.48
      setMaterialOpacity(crownRef.current.material, 0.22 + pulse * 0.1)
    }

    if (discRef.current) {
      discRef.current.scale.set(1.06 + pulse * 0.07, 1, 1.06 + pulse * 0.07)
      setMaterialOpacity(discRef.current.material, 0.12 + pulse * 0.06)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={glowRef} position={[0, -0.02, 0]} renderOrder={16}>
        <sphereGeometry args={[ringRadius * 0.56, 18, 16]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={glowColor}
          depthTest={false}
          depthWrite={false}
          opacity={0.2}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh
        ref={discRef}
        position={[0, -0.26, 0]}
        renderOrder={16}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[ringRadius * 0.46, ringRadius * 0.84, 32]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={glowColor}
          depthTest={false}
          depthWrite={false}
          opacity={0.16}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh ref={ringRef} position={[0, -0.2, 0]} renderOrder={17} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ringRadius, ringThickness, 10, 32]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={ringColor}
          depthTest={false}
          depthWrite={false}
          opacity={0.42}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh
        ref={crownRef}
        position={[0, ringRadius * 0.54, 0]}
        renderOrder={17}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[ringRadius * 0.58, ringThickness * 0.68, 10, 28]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={glowColor}
          depthTest={false}
          depthWrite={false}
          opacity={0.28}
          toneMapped={false}
          transparent
        />
      </mesh>
      {children}
    </group>
  )
}
