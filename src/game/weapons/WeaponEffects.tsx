import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import type { Group, Material, Mesh } from 'three'
import {
  AdditiveBlending,
  DoubleSide,
  MathUtils,
  Quaternion,
  Vector3,
} from 'three'

import type { WeaponEffectsState } from './WeaponSystem.ts'

type BeamProps = {
  color: string
  end: [number, number, number]
  glowColor: string
  glowThickness: number
  start: [number, number, number]
  thickness: number
}

type WeaponEffectsProps = {
  effects: WeaponEffectsState
}

const BEAM_END = new Vector3()
const BEAM_MIDPOINT = new Vector3()
const BEAM_START = new Vector3()
const FLASH_TARGET = new Vector3()
const IMPACT_ALIGNMENT = new Quaternion()
const IMPACT_NORMAL = new Vector3()
const IMPACT_UP = new Vector3(0, 0, 1)

function getLifeProgress(createdAt: number, lifetimeMs: number) {
  return MathUtils.clamp((performance.now() - createdAt) / lifetimeMs, 0, 1)
}

function setMaterialOpacity(material: Material | Material[] | null, opacity: number) {
  if (!material || Array.isArray(material)) {
    return
  }

  material.opacity = opacity
}

function Beam({
  color,
  end,
  glowColor,
  glowThickness,
  start,
  thickness,
}: BeamProps) {
  const groupRef = useRef<Group>(null)

  useLayoutEffect(() => {
    const group = groupRef.current

    if (!group) {
      return
    }

    BEAM_START.set(start[0], start[1], start[2])
    BEAM_END.set(end[0], end[1], end[2])
    BEAM_MIDPOINT.copy(BEAM_START).add(BEAM_END).multiplyScalar(0.5)

    group.position.copy(BEAM_MIDPOINT)
    group.lookAt(BEAM_END)
    group.scale.set(1, 1, Math.max(BEAM_START.distanceTo(BEAM_END), 0.001))
  }, [end, start])

  return (
    <>
      <group ref={groupRef}>
        <mesh renderOrder={25}>
          <boxGeometry args={[glowThickness, glowThickness, 1]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={glowColor}
            depthWrite={false}
            opacity={0.28}
            toneMapped={false}
            transparent
          />
        </mesh>
        <mesh renderOrder={26}>
          <boxGeometry args={[thickness, thickness, 1]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={color}
            depthWrite={false}
            opacity={0.96}
            toneMapped={false}
            transparent
          />
        </mesh>
      </group>
      <mesh position={end} renderOrder={26}>
        <sphereGeometry args={[glowThickness * 0.55, 10, 10]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={glowColor}
          depthWrite={false}
          opacity={0.45}
          toneMapped={false}
          transparent
        />
      </mesh>
    </>
  )
}

function ImpactBurst({
  marker,
}: {
  marker: WeaponEffectsState['hitMarkers'][number]
}) {
  const groupRef = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const ringRef = useRef<Mesh>(null)

  useLayoutEffect(() => {
    const group = groupRef.current

    if (!group) {
      return
    }

    IMPACT_NORMAL
      .set(marker.normal[0], marker.normal[1], marker.normal[2])
      .normalize()
    IMPACT_ALIGNMENT.setFromUnitVectors(IMPACT_UP, IMPACT_NORMAL)
    group.position.set(marker.position[0], marker.position[1], marker.position[2])
    group.quaternion.copy(IMPACT_ALIGNMENT)
  }, [marker.normal, marker.position])

  useFrame(() => {
    const progress = getLifeProgress(marker.createdAt, marker.lifetimeMs)
    const fade = 1 - progress

    if (coreRef.current) {
      coreRef.current.scale.setScalar(marker.size * (0.76 + progress * 0.6))
      setMaterialOpacity(coreRef.current.material, 0.95 * fade)
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(marker.size * (1.7 + progress * 1.3))
      setMaterialOpacity(glowRef.current.material, 0.34 * fade)
    }

    if (ringRef.current) {
      ringRef.current.scale.setScalar(marker.ringSize * (0.5 + progress * 1.02))
      setMaterialOpacity(ringRef.current.material, 0.72 * fade)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={glowRef} renderOrder={24}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={marker.glowColor}
          depthWrite={false}
          opacity={0.34}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh ref={coreRef} renderOrder={25}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={marker.color}
          depthWrite={false}
          opacity={0.95}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, 0.015]} renderOrder={26}>
        <ringGeometry args={[0.48, 1, 24]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={marker.glowColor}
          depthWrite={false}
          opacity={0.72}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  )
}

function MuzzleFlashBurst({
  flash,
}: {
  flash: WeaponEffectsState['muzzleFlashes'][number]
}) {
  const groupRef = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const flareRef = useRef<Mesh>(null)

  useLayoutEffect(() => {
    const group = groupRef.current

    if (!group) {
      return
    }

    FLASH_TARGET.set(
      flash.position[0] + flash.direction[0],
      flash.position[1] + flash.direction[1],
      flash.position[2] + flash.direction[2],
    )
    group.position.set(flash.position[0], flash.position[1], flash.position[2])
    group.lookAt(FLASH_TARGET)
  }, [flash.direction, flash.position])

  useFrame(() => {
    const progress = getLifeProgress(flash.createdAt, flash.lifetimeMs)
    const fade = 1 - progress

    if (coreRef.current) {
      coreRef.current.scale.set(
        flash.size * (1 + progress * 0.25),
        flash.size * (0.82 - progress * 0.14),
        flash.length * (1.1 + progress * 0.12),
      )
      setMaterialOpacity(coreRef.current.material, 0.96 * fade)
    }

    if (glowRef.current) {
      glowRef.current.scale.set(
        flash.size * (1.85 + progress * 0.45),
        flash.size * (1.5 + progress * 0.35),
        flash.length * (1.45 + progress * 0.25),
      )
      setMaterialOpacity(glowRef.current.material, 0.3 * fade)
    }

    if (flareRef.current) {
      flareRef.current.scale.set(
        flash.size * (0.56 + progress * 0.08),
        flash.size * (0.56 + progress * 0.08),
        flash.length * (1.72 - progress * 0.25),
      )
      setMaterialOpacity(flareRef.current.material, 0.8 * fade)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={glowRef} renderOrder={22}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={flash.glowColor}
          depthWrite={false}
          opacity={0.3}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh ref={flareRef} renderOrder={23}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={flash.color}
          depthWrite={false}
          opacity={0.8}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh ref={coreRef} renderOrder={24}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={flash.color}
          depthWrite={false}
          opacity={0.96}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  )
}

function ProjectileVisual({
  projectile,
}: {
  projectile: WeaponEffectsState['projectiles'][number]
}) {
  const tailEnd: [number, number, number] = [
    projectile.position[0] - projectile.direction[0] * projectile.trailLength,
    projectile.position[1] - projectile.direction[1] * projectile.trailLength,
    projectile.position[2] - projectile.direction[2] * projectile.trailLength,
  ]

  return (
    <>
      <Beam
        color={projectile.color}
        end={projectile.position}
        glowColor={projectile.trailColor}
        glowThickness={projectile.trailSize}
        start={tailEnd}
        thickness={projectile.trailSize * 0.45}
      />
      <mesh position={projectile.position} renderOrder={27}>
        <sphereGeometry args={[projectile.size * 1.85, 12, 12]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={projectile.glowColor}
          depthWrite={false}
          opacity={0.34}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh position={projectile.position} renderOrder={28}>
        <sphereGeometry args={[projectile.size, 12, 12]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={projectile.color}
          depthWrite={false}
          opacity={0.98}
          toneMapped={false}
          transparent
        />
      </mesh>
    </>
  )
}

function ExplosionBurst({
  explosion,
}: {
  explosion: WeaponEffectsState['explosions'][number]
}) {
  const coreRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const ringRef = useRef<Mesh>(null)

  useFrame(() => {
    const progress = getLifeProgress(explosion.createdAt, explosion.lifetimeMs)
    const fade = 1 - progress

    if (coreRef.current) {
      coreRef.current.scale.setScalar(explosion.size * (0.42 + progress * 0.72))
      setMaterialOpacity(coreRef.current.material, 0.84 * fade)
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(explosion.size * (0.9 + progress * 1.05))
      setMaterialOpacity(glowRef.current.material, 0.26 * fade)
    }

    if (ringRef.current) {
      ringRef.current.scale.set(
        explosion.ringSize * (0.32 + progress * 0.82),
        explosion.ringSize * (0.32 + progress * 0.82),
        1,
      )
      ringRef.current.rotation.z += 0.06
      setMaterialOpacity(ringRef.current.material, 0.68 * fade)
    }
  })

  return (
    <group position={explosion.position}>
      <mesh ref={glowRef} renderOrder={18}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={explosion.glowColor}
          depthWrite={false}
          opacity={0.26}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh ref={coreRef} renderOrder={19}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={explosion.color}
          depthWrite={false}
          opacity={0.84}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} renderOrder={20}>
        <torusGeometry args={[1, 0.12, 12, 28]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={explosion.ringColor}
          depthWrite={false}
          opacity={0.68}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  )
}

export function WeaponEffects({ effects }: WeaponEffectsProps) {
  return (
    <>
      {effects.hitMarkers.map((marker) => (
        <ImpactBurst key={marker.id} marker={marker} />
      ))}

      {effects.muzzleFlashes.map((flash) => (
        <MuzzleFlashBurst flash={flash} key={flash.id} />
      ))}

      {effects.projectiles.map((projectile) => (
        <ProjectileVisual key={projectile.id} projectile={projectile} />
      ))}

      {effects.tracers.map((tracer) => (
        <Beam
          key={tracer.id}
          color={tracer.color}
          end={tracer.end}
          glowColor={tracer.glowColor}
          glowThickness={tracer.glowThickness}
          start={tracer.start}
          thickness={tracer.thickness}
        />
      ))}

      {effects.explosions.map((explosion) => (
        <ExplosionBurst explosion={explosion} key={explosion.id} />
      ))}
    </>
  )
}
