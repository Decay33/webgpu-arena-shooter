import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type MutableRefObject,
} from 'react'

import { useFrame } from '@react-three/fiber'
import type {
  Group,
  Material,
  Mesh,
  Object3D,
  PointLight,
} from 'three'
import {
  AdditiveBlending,
  DoubleSide,
  MathUtils,
  NormalBlending,
  Quaternion,
  Vector3,
} from 'three'

import {
  WEAPON_VFX_POOL_CONFIG,
  WEAPON_VFX_RENDER_CONFIG,
} from '../config/weaponVfx.ts'
import type {
  Explosion,
  HitMarker,
  MuzzleFlash,
  Tracer,
  WeaponProjectile,
  WeaponVfxController,
} from './WeaponVfxTypes.ts'

type TimedSlot<T extends { createdAt: number; id: number; lifetimeMs: number }> = {
  active: boolean
  payload: T | null
}

type TimedSlotRef<
  T extends { createdAt: number; id: number; lifetimeMs: number },
> = MutableRefObject<TimedSlot<T>>

type WeaponEffectsProps = {
  children?: never
}

const BEAM_END = new Vector3()
const BEAM_MIDPOINT = new Vector3()
const BEAM_START = new Vector3()
const FLASH_TARGET = new Vector3()
const IMPACT_ALIGNMENT = new Quaternion()
const IMPACT_NORMAL = new Vector3()
const IMPACT_UP = new Vector3(0, 0, 1)
const PROJECTILE_BEAM_TARGET = new Vector3()
const FLASH_FLARE_ANGLES = WEAPON_VFX_RENDER_CONFIG.muzzleFlashFlareAngles
const IMPACT_SPARK_ANGLES = WEAPON_VFX_RENDER_CONFIG.impactSparkAngles
const EXPLOSION_SPARK_ANGLES = WEAPON_VFX_RENDER_CONFIG.explosionSparkAngles

function createSlotRefs<
  T extends { createdAt: number; id: number; lifetimeMs: number },
>(
  size: number,
): TimedSlotRef<T>[] {
  return Array.from({ length: size }, () => ({
    current: {
      active: false,
      payload: null,
    },
  }))
}

function clearSlots<
  T extends { createdAt: number; id: number; lifetimeMs: number },
>(
  slotRefs: TimedSlotRef<T>[],
) {
  slotRefs.forEach((slotRef) => {
    slotRef.current.active = false
    slotRef.current.payload = null
  })
}

function getLifeProgress(createdAt: number, lifetimeMs: number) {
  return MathUtils.clamp((performance.now() - createdAt) / lifetimeMs, 0, 1)
}

function hideObject(object: Object3D | null) {
  if (object) {
    object.visible = false
  }
}

function setMaterialColor(material: Material | Material[] | null, color: string) {
  if (!material || Array.isArray(material) || !('color' in material)) {
    return
  }

  ;(material as Material & { color: { set: (value: string) => void } }).color.set(
    color,
  )
}

function setMaterialOpacity(
  material: Material | Material[] | null,
  opacity: number,
) {
  if (!material || Array.isArray(material)) {
    return
  }

  material.opacity = opacity
}

function setBeamTransform(
  group: Group | null,
  start: [number, number, number],
  end: [number, number, number],
) {
  if (!group) {
    return
  }

  BEAM_START.set(start[0], start[1], start[2])
  BEAM_END.set(end[0], end[1], end[2])
  BEAM_MIDPOINT.copy(BEAM_START).add(BEAM_END).multiplyScalar(0.5)

  group.visible = true
  group.position.copy(BEAM_MIDPOINT)
  group.lookAt(BEAM_END)
  group.scale.set(1, 1, Math.max(BEAM_START.distanceTo(BEAM_END), 0.001))
}

function assignTimedSlot<
  T extends { createdAt: number; id: number; lifetimeMs: number },
>(
  slotRefs: TimedSlotRef<T>[],
  nextIndexRef: { current: number },
  payload: T,
) {
  for (let offset = 0; offset < slotRefs.length; offset += 1) {
    const slotIndex = (nextIndexRef.current + offset) % slotRefs.length
    const slot = slotRefs[slotIndex].current

    if (slot.active) {
      continue
    }

    slot.active = true
    slot.payload = payload
    nextIndexRef.current = (slotIndex + 1) % slotRefs.length
    return
  }

  const slot = slotRefs[nextIndexRef.current].current
  slot.active = true
  slot.payload = payload
  nextIndexRef.current = (nextIndexRef.current + 1) % slotRefs.length
}

function deactivateSlot<
  T extends { createdAt: number; id: number; lifetimeMs: number },
>(slotRef: TimedSlotRef<T>) {
  slotRef.current.active = false
  slotRef.current.payload = null
}

function PooledTracer({ slotRef }: { slotRef: TimedSlotRef<Tracer> }) {
  const groupRef = useRef<Group>(null)
  const glowRef = useRef<Mesh>(null)
  const coreRef = useRef<Mesh>(null)
  const tipRef = useRef<Mesh>(null)
  const lastTracerIdRef = useRef<number | null>(null)

  useFrame(() => {
    const slot = slotRef.current
    const tracer = slot.payload

    if (!slot.active || !tracer) {
      lastTracerIdRef.current = null
      hideObject(groupRef.current)
      hideObject(tipRef.current)
      return
    }

    const progress = getLifeProgress(tracer.createdAt, tracer.lifetimeMs)

    if (progress >= 1) {
      deactivateSlot(slotRef)
      lastTracerIdRef.current = null
      hideObject(groupRef.current)
      hideObject(tipRef.current)
      return
    }

    if (lastTracerIdRef.current !== tracer.id) {
      setBeamTransform(groupRef.current, tracer.start, tracer.end)

      if (glowRef.current) {
        glowRef.current.scale.set(
          tracer.glowThickness * 0.7,
          tracer.glowThickness,
          1,
        )
        setMaterialColor(glowRef.current.material, tracer.glowColor)
      }

      if (coreRef.current) {
        coreRef.current.scale.set(tracer.thickness * 0.7, tracer.thickness, 1)
        setMaterialColor(coreRef.current.material, tracer.color)
      }

      if (tipRef.current) {
        tipRef.current.visible = true
        tipRef.current.position.set(tracer.end[0], tracer.end[1], tracer.end[2])
        tipRef.current.scale.setScalar(tracer.tipSize)
        setMaterialColor(tipRef.current.material, tracer.tipColor)
      }

      lastTracerIdRef.current = tracer.id
    }

    const fade = 1 - progress

    if (glowRef.current) {
      setMaterialOpacity(
        glowRef.current.material,
        0.24 * fade * WEAPON_VFX_RENDER_CONFIG.bloomFriendlyGlowOpacityScale,
      )
    }

    if (coreRef.current) {
      setMaterialOpacity(
        coreRef.current.material,
        0.9 * fade * WEAPON_VFX_RENDER_CONFIG.bloomFriendlyFlashOpacityScale,
      )
    }

    if (tipRef.current) {
      tipRef.current.scale.setScalar(tracer.tipSize * (1 - progress * 0.18))
      setMaterialOpacity(
        tipRef.current.material,
        0.88 * fade * WEAPON_VFX_RENDER_CONFIG.bloomFriendlyFlashOpacityScale,
      )
    }
  })

  return (
    <>
      <group ref={groupRef} visible={false}>
        <mesh
          castShadow={false}
          receiveShadow={false}
          ref={glowRef}
          renderOrder={25}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry
            args={[1, 1, 1, WEAPON_VFX_RENDER_CONFIG.beamRadialSegments]}
          />
          <meshBasicMaterial
            blending={AdditiveBlending}
            depthWrite={false}
            opacity={0}
            toneMapped={false}
            transparent
          />
        </mesh>
        <mesh
          castShadow={false}
          receiveShadow={false}
          ref={coreRef}
          renderOrder={26}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry
            args={[1, 1, 1, WEAPON_VFX_RENDER_CONFIG.beamRadialSegments]}
          />
          <meshBasicMaterial
            blending={NormalBlending}
            depthWrite={false}
            opacity={0}
            toneMapped={false}
            transparent
          />
        </mesh>
      </group>
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={tipRef}
        renderOrder={27}
        visible={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          blending={NormalBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
    </>
  )
}

function PooledImpactBurst({ slotRef }: { slotRef: TimedSlotRef<HitMarker> }) {
  const groupRef = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const ringRef = useRef<Mesh>(null)
  const sparkRefs = useRef<Array<Mesh | null>>([])
  const lastMarkerIdRef = useRef<number | null>(null)

  useFrame(() => {
    const slot = slotRef.current
    const marker = slot.payload

    if (!slot.active || !marker) {
      lastMarkerIdRef.current = null
      hideObject(groupRef.current)
      return
    }

    const progress = getLifeProgress(marker.createdAt, marker.lifetimeMs)

    if (progress >= 1) {
      deactivateSlot(slotRef)
      lastMarkerIdRef.current = null
      hideObject(groupRef.current)
      return
    }

    if (lastMarkerIdRef.current !== marker.id) {
      IMPACT_NORMAL
        .set(marker.normal[0], marker.normal[1], marker.normal[2])
        .normalize()
      IMPACT_ALIGNMENT.setFromUnitVectors(IMPACT_UP, IMPACT_NORMAL)

      if (groupRef.current) {
        groupRef.current.visible = true
        groupRef.current.position.set(
          marker.position[0],
          marker.position[1],
          marker.position[2],
        )
        groupRef.current.quaternion.copy(IMPACT_ALIGNMENT)
      }

      if (coreRef.current) {
        setMaterialColor(coreRef.current.material, marker.color)
      }

      if (glowRef.current) {
        setMaterialColor(glowRef.current.material, marker.glowColor)
      }

      if (ringRef.current) {
        setMaterialColor(ringRef.current.material, marker.glowColor)
      }

      sparkRefs.current.forEach((sparkRef, index) => {
        if (!sparkRef) {
          return
        }

        const angle = IMPACT_SPARK_ANGLES[index]
        sparkRef.position.set(
          Math.cos(angle) * marker.sparkLength * 0.28,
          Math.sin(angle) * marker.sparkLength * 0.28,
          0.012,
        )
        sparkRef.rotation.z = angle
        setMaterialColor(sparkRef.material, marker.accentColor)
      })

      lastMarkerIdRef.current = marker.id
    }

    const fade = 1 - progress

    if (coreRef.current) {
      coreRef.current.scale.setScalar(marker.size * (0.8 + progress * 0.5))
      setMaterialOpacity(coreRef.current.material, 0.95 * fade)
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(marker.size * (1.4 + progress * 1.35))
      setMaterialOpacity(
        glowRef.current.material,
        0.24 * fade * WEAPON_VFX_RENDER_CONFIG.bloomFriendlyGlowOpacityScale,
      )
    }

    if (ringRef.current) {
      ringRef.current.scale.setScalar(marker.ringSize * (0.42 + progress * 1.06))
      setMaterialOpacity(ringRef.current.material, 0.76 * fade)
    }

    sparkRefs.current.forEach((sparkRef) => {
      if (!sparkRef) {
        return
      }

      sparkRef.scale.set(
        marker.sparkLength * (1 + progress * 0.75),
        marker.sparkWidth *
          WEAPON_VFX_RENDER_CONFIG.sparkPlaneHeightScale *
          (1 + progress * 0.18),
        1,
      )
      setMaterialOpacity(sparkRef.material, 0.86 * fade)
    })
  })

  return (
    <group ref={groupRef} visible={false}>
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={glowRef}
        renderOrder={24}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={coreRef}
        renderOrder={25}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          blending={NormalBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh
        castShadow={false}
        position={[0, 0, 0.015]}
        receiveShadow={false}
        ref={ringRef}
        renderOrder={26}
      >
        <ringGeometry args={[0.5, 1, WEAPON_VFX_RENDER_CONFIG.ringSegments]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
      {IMPACT_SPARK_ANGLES.map((angle, index) => (
        <mesh
          castShadow={false}
          key={angle}
          receiveShadow={false}
          ref={(mesh) => {
            sparkRefs.current[index] = mesh
          }}
          renderOrder={27}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            depthWrite={false}
            opacity={0}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  )
}

function PooledMuzzleFlash({
  slotRef,
}: {
  slotRef: TimedSlotRef<MuzzleFlash>
}) {
  const groupRef = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const shellRef = useRef<Mesh>(null)
  const flareRefs = useRef<Array<Mesh | null>>([])
  const lightRef = useRef<PointLight>(null)
  const lastFlashIdRef = useRef<number | null>(null)

  useFrame(() => {
    const slot = slotRef.current
    const flash = slot.payload

    if (!slot.active || !flash) {
      lastFlashIdRef.current = null
      hideObject(groupRef.current)
      return
    }

    const progress = getLifeProgress(flash.createdAt, flash.lifetimeMs)

    if (progress >= 1) {
      deactivateSlot(slotRef)
      lastFlashIdRef.current = null
      hideObject(groupRef.current)
      return
    }

    if (lastFlashIdRef.current !== flash.id) {
      if (groupRef.current) {
        FLASH_TARGET.set(
          flash.position[0] + flash.direction[0],
          flash.position[1] + flash.direction[1],
          flash.position[2] + flash.direction[2],
        )
        groupRef.current.visible = true
        groupRef.current.position.set(
          flash.position[0],
          flash.position[1],
          flash.position[2],
        )
        groupRef.current.lookAt(FLASH_TARGET)
      }

      if (glowRef.current) {
        setMaterialColor(glowRef.current.material, flash.glowColor)
      }

      if (shellRef.current) {
        setMaterialColor(shellRef.current.material, flash.secondaryColor)
      }

      if (coreRef.current) {
        setMaterialColor(coreRef.current.material, flash.color)
      }

      flareRefs.current.forEach((flareRef, index) => {
        if (!flareRef) {
          return
        }

        flareRef.position.set(0, 0, -flash.length * 0.22)
        flareRef.rotation.z = FLASH_FLARE_ANGLES[index]
        setMaterialColor(flareRef.material, flash.sparkColor)
      })

      if (lightRef.current) {
        const enablePointLight =
          flash.lightIntensity >=
          WEAPON_VFX_RENDER_CONFIG.muzzleFlashPointLightMinIntensity

        lightRef.current.visible = enablePointLight

        if (enablePointLight) {
          lightRef.current.color.set(flash.glowColor)
          lightRef.current.distance = flash.lightDistance
        }
      }

      lastFlashIdRef.current = flash.id
    }

    const fade = 1 - progress

    if (coreRef.current) {
      coreRef.current.position.set(0, 0, -flash.length * 0.46)
      coreRef.current.scale.set(
        flash.size * (1.05 + progress * 0.24),
        flash.size * (1.05 + progress * 0.24),
        flash.length * (1.05 + progress * 0.16),
      )
      setMaterialOpacity(coreRef.current.material, 0.98 * fade)
    }

    if (shellRef.current) {
      shellRef.current.position.set(0, 0, -flash.length * 0.38)
      shellRef.current.scale.set(
        flash.size * (1.72 + progress * 0.34),
        flash.size * (1.72 + progress * 0.34),
        flash.length * (1.3 + progress * 0.18),
      )
      setMaterialOpacity(shellRef.current.material, 0.78 * fade)
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(flash.size * (1.8 + progress * 0.65))
      setMaterialOpacity(
        glowRef.current.material,
        0.28 * fade * WEAPON_VFX_RENDER_CONFIG.bloomFriendlyGlowOpacityScale,
      )
    }

    flareRefs.current.forEach((flareRef) => {
      if (!flareRef) {
        return
      }

      flareRef.scale.set(
        flash.length * (0.42 + progress * 0.1),
        flash.size * (0.18 + progress * 0.12),
        1,
      )
      setMaterialOpacity(flareRef.material, 0.72 * fade)
    })

    if (lightRef.current) {
      lightRef.current.intensity = lightRef.current.visible
        ? flash.lightIntensity * fade
        : 0
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      <pointLight castShadow={false} decay={2} intensity={0} ref={lightRef} />
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={glowRef}
        renderOrder={22}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={shellRef}
        renderOrder={23}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <coneGeometry
          args={[1, 1, WEAPON_VFX_RENDER_CONFIG.beamRadialSegments]}
        />
        <meshBasicMaterial
          blending={NormalBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={coreRef}
        renderOrder={24}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <coneGeometry
          args={[1, 1, WEAPON_VFX_RENDER_CONFIG.beamRadialSegments]}
        />
        <meshBasicMaterial
          blending={NormalBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
      {FLASH_FLARE_ANGLES.map((angle, index) => (
        <mesh
          castShadow={false}
          key={angle}
          receiveShadow={false}
          ref={(mesh) => {
            flareRefs.current[index] = mesh
          }}
          renderOrder={26}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            depthWrite={false}
            opacity={0}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  )
}

function PooledProjectileVisual({
  index,
  projectilesRef,
}: {
  index: number
  projectilesRef: { current: readonly WeaponProjectile[] }
}) {
  const groupRef = useRef<Group>(null)
  const glowBeamRef = useRef<Mesh>(null)
  const coreBeamRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const coreRef = useRef<Mesh>(null)
  const lastProjectileIdRef = useRef<number | null>(null)

  useFrame(() => {
    const projectile = projectilesRef.current[index]

    if (!projectile) {
      lastProjectileIdRef.current = null
      hideObject(groupRef.current)
      hideObject(glowRef.current)
      hideObject(coreRef.current)
      return
    }

    if (lastProjectileIdRef.current !== projectile.id) {
      if (groupRef.current) {
        PROJECTILE_BEAM_TARGET.set(
          projectile.position[0] + projectile.direction[0],
          projectile.position[1] + projectile.direction[1],
          projectile.position[2] + projectile.direction[2],
        )
        groupRef.current.visible = true
        groupRef.current.lookAt(PROJECTILE_BEAM_TARGET)
        groupRef.current.scale.set(1, 1, Math.max(projectile.trailLength, 0.001))
      }

      if (glowBeamRef.current) {
        setMaterialColor(glowBeamRef.current.material, projectile.trailColor)
      }

      if (coreBeamRef.current) {
        setMaterialColor(coreBeamRef.current.material, projectile.trailAccentColor)
      }

      if (glowRef.current) {
        setMaterialColor(glowRef.current.material, projectile.glowColor)
      }

      if (coreRef.current) {
        setMaterialColor(coreRef.current.material, projectile.color)
      }

      lastProjectileIdRef.current = projectile.id
    }

    if (groupRef.current) {
      groupRef.current.position.set(
        projectile.position[0] - projectile.direction[0] * projectile.trailLength * 0.5,
        projectile.position[1] - projectile.direction[1] * projectile.trailLength * 0.5,
        projectile.position[2] - projectile.direction[2] * projectile.trailLength * 0.5,
      )
    }

    if (glowBeamRef.current) {
      glowBeamRef.current.scale.set(
        projectile.trailSize * 0.7,
        projectile.trailSize,
        1,
      )
      setMaterialOpacity(
        glowBeamRef.current.material,
        0.24 * WEAPON_VFX_RENDER_CONFIG.bloomFriendlyGlowOpacityScale,
      )
    }

    if (coreBeamRef.current) {
      coreBeamRef.current.scale.set(
        projectile.trailSize * 0.42,
        projectile.trailSize * 0.6,
        1,
      )
      setMaterialOpacity(
        coreBeamRef.current.material,
        0.88 * WEAPON_VFX_RENDER_CONFIG.bloomFriendlyFlashOpacityScale,
      )
    }

    if (glowRef.current) {
      glowRef.current.visible = true
      glowRef.current.position.set(
        projectile.position[0],
        projectile.position[1],
        projectile.position[2],
      )
      glowRef.current.scale.setScalar(projectile.size * 1.8)
      setMaterialOpacity(
        glowRef.current.material,
        0.26 * WEAPON_VFX_RENDER_CONFIG.bloomFriendlyGlowOpacityScale,
      )
    }

    if (coreRef.current) {
      coreRef.current.visible = true
      coreRef.current.position.set(
        projectile.position[0],
        projectile.position[1],
        projectile.position[2],
      )
      coreRef.current.scale.setScalar(projectile.size)
      setMaterialOpacity(coreRef.current.material, 0.98)
    }
  })

  return (
    <>
      <group ref={groupRef} visible={false}>
        <mesh
          castShadow={false}
          receiveShadow={false}
          ref={glowBeamRef}
          renderOrder={25}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry
            args={[1, 1, 1, WEAPON_VFX_RENDER_CONFIG.beamRadialSegments]}
          />
          <meshBasicMaterial
            blending={AdditiveBlending}
            depthWrite={false}
            opacity={0}
            toneMapped={false}
            transparent
          />
        </mesh>
        <mesh
          castShadow={false}
          receiveShadow={false}
          ref={coreBeamRef}
          renderOrder={26}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry
            args={[1, 1, 1, WEAPON_VFX_RENDER_CONFIG.beamRadialSegments]}
          />
          <meshBasicMaterial
            blending={NormalBlending}
            depthWrite={false}
            opacity={0}
            toneMapped={false}
            transparent
          />
        </mesh>
      </group>
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={glowRef}
        renderOrder={28}
        visible={false}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={coreRef}
        renderOrder={29}
        visible={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          blending={NormalBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
    </>
  )
}

function PooledExplosionBurst({
  slotRef,
}: {
  slotRef: TimedSlotRef<Explosion>
}) {
  const groupRef = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const innerRingRef = useRef<Mesh>(null)
  const sparkRefs = useRef<Array<Mesh | null>>([])
  const lightRef = useRef<PointLight>(null)
  const lastExplosionIdRef = useRef<number | null>(null)

  useFrame(() => {
    const slot = slotRef.current
    const explosion = slot.payload

    if (!slot.active || !explosion) {
      lastExplosionIdRef.current = null
      hideObject(groupRef.current)
      return
    }

    const progress = getLifeProgress(explosion.createdAt, explosion.lifetimeMs)

    if (progress >= 1) {
      deactivateSlot(slotRef)
      lastExplosionIdRef.current = null
      hideObject(groupRef.current)
      return
    }

    if (lastExplosionIdRef.current !== explosion.id) {
      if (groupRef.current) {
        groupRef.current.visible = true
        groupRef.current.position.set(
          explosion.position[0],
          explosion.position[1],
          explosion.position[2],
        )
      }

      if (glowRef.current) {
        setMaterialColor(glowRef.current.material, explosion.glowColor)
      }

      if (coreRef.current) {
        setMaterialColor(coreRef.current.material, explosion.color)
      }

      if (innerRingRef.current) {
        setMaterialColor(innerRingRef.current.material, explosion.ringColor)
      }

      sparkRefs.current.forEach((sparkRef, index) => {
        if (!sparkRef) {
          return
        }

        const angle = EXPLOSION_SPARK_ANGLES[index]
        sparkRef.position.set(
          Math.cos(angle) * explosion.size * 0.22,
          Math.sin(angle) * explosion.size * 0.22,
          0,
        )
        sparkRef.rotation.z = angle
        setMaterialColor(sparkRef.material, explosion.sparkColor)
      })

      if (lightRef.current) {
        lightRef.current.color.set(explosion.glowColor)
        lightRef.current.distance = explosion.lightDistance
      }

      lastExplosionIdRef.current = explosion.id
    }

    const fade = 1 - progress

    if (coreRef.current) {
      coreRef.current.scale.setScalar(explosion.size * (0.34 + progress * 0.84))
      setMaterialOpacity(coreRef.current.material, 0.88 * fade)
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(explosion.size * (0.78 + progress * 1.18))
      setMaterialOpacity(
        glowRef.current.material,
        0.22 * fade * WEAPON_VFX_RENDER_CONFIG.bloomFriendlyGlowOpacityScale,
      )
    }

    if (innerRingRef.current) {
      innerRingRef.current.scale.setScalar(
        explosion.ringSize * (0.22 + progress * 0.72),
      )
      innerRingRef.current.rotation.z += 0.035
      setMaterialOpacity(innerRingRef.current.material, 0.82 * fade)
    }

    sparkRefs.current.forEach((sparkRef) => {
      if (!sparkRef) {
        return
      }

      sparkRef.scale.set(
        explosion.size * (0.7 + progress * 0.42),
        explosion.size * (0.08 + progress * 0.02),
        1,
      )
      setMaterialOpacity(sparkRef.material, 0.78 * fade)
    })

    if (lightRef.current) {
      const pulseFade =
        progress < WEAPON_VFX_RENDER_CONFIG.explosionLightPulseWindow
          ? 1 - progress / WEAPON_VFX_RENDER_CONFIG.explosionLightPulseWindow
          : 0

      lightRef.current.visible = pulseFade > 0
      lightRef.current.intensity =
        explosion.lightIntensity *
        pulseFade *
        WEAPON_VFX_RENDER_CONFIG.explosionLightPulseIntensityScale
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      <pointLight castShadow={false} decay={2} intensity={0} ref={lightRef} />
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={glowRef}
        renderOrder={18}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={coreRef}
        renderOrder={19}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          blending={NormalBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh
        castShadow={false}
        receiveShadow={false}
        ref={innerRingRef}
        renderOrder={20}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry
          args={[1, 0.15, 8, WEAPON_VFX_RENDER_CONFIG.torusSegments]}
        />
        <meshBasicMaterial
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
      {EXPLOSION_SPARK_ANGLES.map((angle, index) => (
        <mesh
          castShadow={false}
          key={angle}
          receiveShadow={false}
          ref={(mesh) => {
            sparkRefs.current[index] = mesh
          }}
          renderOrder={22}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            depthWrite={false}
            opacity={0}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  )
}

export const WeaponEffects = forwardRef<WeaponVfxController, WeaponEffectsProps>(
  function WeaponEffects(_, ref) {
    const hitMarkerSlots = useMemo(
      () => createSlotRefs<HitMarker>(WEAPON_VFX_POOL_CONFIG.hitMarkers),
      [],
    )
    const muzzleFlashSlots = useMemo(
      () => createSlotRefs<MuzzleFlash>(WEAPON_VFX_POOL_CONFIG.muzzleFlashes),
      [],
    )
    const tracerSlots = useMemo(
      () => createSlotRefs<Tracer>(WEAPON_VFX_POOL_CONFIG.tracers),
      [],
    )
    const explosionSlots = useMemo(
      () => createSlotRefs<Explosion>(WEAPON_VFX_POOL_CONFIG.explosions),
      [],
    )
    const projectileListRef = useRef<readonly WeaponProjectile[]>([])
    const hitMarkerNextIndexRef = useRef(0)
    const muzzleFlashNextIndexRef = useRef(0)
    const tracerNextIndexRef = useRef(0)
    const explosionNextIndexRef = useRef(0)

    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          projectileListRef.current = []
          clearSlots(hitMarkerSlots)
          clearSlots(muzzleFlashSlots)
          clearSlots(tracerSlots)
          clearSlots(explosionSlots)
        },
        setProjectiles: (projectiles) => {
          projectileListRef.current = projectiles
        },
        spawnExplosion: (explosion) => {
          assignTimedSlot(explosionSlots, explosionNextIndexRef, explosion)
        },
        spawnHitMarker: (marker) => {
          assignTimedSlot(hitMarkerSlots, hitMarkerNextIndexRef, marker)
        },
        spawnMuzzleFlash: (flash) => {
          assignTimedSlot(muzzleFlashSlots, muzzleFlashNextIndexRef, flash)
        },
        spawnTracer: (tracer) => {
          assignTimedSlot(tracerSlots, tracerNextIndexRef, tracer)
        },
      }),
      [explosionSlots, hitMarkerSlots, muzzleFlashSlots, tracerSlots],
    )

    return (
      <>
        {hitMarkerSlots.map((slotRef, index) => (
          <PooledImpactBurst key={`impact-${index}`} slotRef={slotRef} />
        ))}

        {muzzleFlashSlots.map((slotRef, index) => (
          <PooledMuzzleFlash key={`flash-${index}`} slotRef={slotRef} />
        ))}

        {Array.from({ length: WEAPON_VFX_POOL_CONFIG.projectiles }).map(
          (_, index) => (
            <PooledProjectileVisual
              index={index}
              key={`projectile-${index}`}
              projectilesRef={projectileListRef}
            />
          ),
        )}

        {tracerSlots.map((slotRef, index) => (
          <PooledTracer key={`tracer-${index}`} slotRef={slotRef} />
        ))}

        {explosionSlots.map((slotRef, index) => (
          <PooledExplosionBurst key={`explosion-${index}`} slotRef={slotRef} />
        ))}
      </>
    )
  },
)
