import {
  memo,
  useEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
} from 'react'

import { useFrame, useThree } from '@react-three/fiber'
import { Euler, Group, MathUtils, Object3D, Vector3 } from 'three'

import {
  WEAPON_VIEWMODEL_CONFIG,
  type WeaponViewmodelAxis,
  type WeaponViewmodelMaterial,
  type WeaponViewmodelPart,
} from '../config/weaponViewmodels.ts'
import { useRunStore } from '../core/state/runStore.ts'
import { usePlayerHealthStore } from '../player/health/playerHealthStore.ts'
import { usePlayerWeaponStore } from './playerWeaponStore.ts'

type WeaponViewmodelProps = {
  muzzleWorldPositionRef: MutableRefObject<[number, number, number] | null>
  shotSequenceRef: MutableRefObject<number>
}

type ViewmodelPartProps = {
  material: WeaponViewmodelMaterial
  part: WeaponViewmodelPart
}

const VIEWMODEL_OFFSET = new Vector3()
const LOCAL_ROTATION = new Euler(0, 0, 0, 'XYZ')
const MUZZLE_WORLD_POSITION = new Vector3()
const ORIENTATION_BY_AXIS: Record<WeaponViewmodelAxis, [number, number, number]> = {
  x: [0, 0, -Math.PI / 2],
  y: [0, 0, 0],
  z: [Math.PI / 2, 0, 0],
}

function stepSpring(
  offset: Vector3,
  velocity: Vector3,
  spring: number,
  damping: number,
  delta: number,
) {
  velocity.addScaledVector(offset, -spring * delta)
  velocity.multiplyScalar(Math.exp(-damping * delta))
  offset.addScaledVector(velocity, delta)

  if (offset.lengthSq() < 0.000001 && velocity.lengthSq() < 0.000001) {
    offset.set(0, 0, 0)
    velocity.set(0, 0, 0)
  }
}

function ViewmodelMaterialLayer({
  material,
}: {
  material: WeaponViewmodelMaterial
}) {
  const clearcoat =
    material.clearcoat ?? (material.metalness > 0.28 ? 0.72 : 0.28)
  const clearcoatRoughness =
    material.clearcoatRoughness ??
    MathUtils.clamp(material.roughness * 0.56, 0.08, 0.7)
  const ior = material.ior ?? 1.4
  const sheen = material.sheen ?? (material.metalness > 0.3 ? 0.08 : 0)
  const sheenRoughness = material.sheenRoughness ?? 0.45
  const specularIntensity =
    material.specularIntensity ?? MathUtils.lerp(0.5, 0.84, material.metalness)

  return (
    <meshPhysicalMaterial
      clearcoat={clearcoat}
      clearcoatRoughness={clearcoatRoughness}
      color={material.color}
      depthTest={false}
      depthWrite={false}
      emissive={material.emissiveColor ?? '#000000'}
      emissiveIntensity={material.emissiveIntensity ?? 0}
      ior={ior}
      metalness={material.metalness}
      roughness={material.roughness}
      sheen={sheen}
      sheenRoughness={sheenRoughness}
      specularIntensity={specularIntensity}
    />
  )
}

function ViewmodelPartMesh({ material, part }: ViewmodelPartProps) {
  const axis: WeaponViewmodelAxis = 'axis' in part && part.axis ? part.axis : 'y'
  const orientation = ORIENTATION_BY_AXIS[axis]

  return (
    <group position={part.position} rotation={part.rotation}>
      <mesh
        castShadow={false}
        frustumCulled={false}
        receiveShadow={false}
        renderOrder={30}
        rotation={orientation}
      >
        {part.shape === 'box' ? <boxGeometry args={part.size} /> : null}
        {part.shape === 'capsule' ? (
          <capsuleGeometry
            args={[
              part.radius,
              part.length,
              part.capSegments ?? 4,
              part.radialSegments ?? 12,
            ]}
          />
        ) : null}
        {part.shape === 'cylinder' ? (
          <cylinderGeometry
            args={[
              part.radiusTop,
              part.radiusBottom,
              part.length,
              part.radialSegments ?? 14,
            ]}
          />
        ) : null}
        {part.shape === 'cone' ? (
          <coneGeometry
            args={[part.radius, part.length, part.radialSegments ?? 14]}
          />
        ) : null}
        <ViewmodelMaterialLayer material={material} />
      </mesh>
    </group>
  )
}

function ViewmodelMesh({
  muzzleAnchorRef,
}: {
  muzzleAnchorRef: RefObject<Object3D | null>
}) {
  const currentWeaponId = usePlayerWeaponStore((state) => state.currentWeaponId)
  const config = WEAPON_VIEWMODEL_CONFIG[currentWeaponId]

  return (
    <group frustumCulled={false}>
      <object3D
        position={config.muzzleLocalPosition}
        ref={muzzleAnchorRef}
      />
      {config.parts.map((part) => (
        <ViewmodelPartMesh
          key={part.key}
          material={config.materials[part.material]}
          part={part}
        />
      ))}
    </group>
  )
}

export const WeaponViewmodel = memo(function WeaponViewmodel({
  muzzleWorldPositionRef,
  shotSequenceRef,
}: WeaponViewmodelProps) {
  const camera = useThree((state) => state.camera)
  const currentWeaponId = usePlayerWeaponStore((state) => state.currentWeaponId)
  const playerAlive = usePlayerHealthStore((state) => state.alive)
  const runState = useRunStore((state) => state.runState)
  const rootGroupRef = useRef<Group>(null)
  const localGroupRef = useRef<Group>(null)
  const muzzleAnchorRef = useRef<Object3D | null>(null)
  const recoilPositionRef = useRef(new Vector3())
  const recoilPositionVelocityRef = useRef(new Vector3())
  const recoilRotationRef = useRef(new Vector3())
  const recoilRotationVelocityRef = useRef(new Vector3())
  const lastShotSequenceRef = useRef(0)

  useEffect(() => {
    recoilPositionRef.current.set(0, 0, 0)
    recoilPositionVelocityRef.current.set(0, 0, 0)
    recoilRotationRef.current.set(0, 0, 0)
    recoilRotationVelocityRef.current.set(0, 0, 0)
    lastShotSequenceRef.current = shotSequenceRef.current
  }, [currentWeaponId, shotSequenceRef])

  useFrame((_, delta) => {
    const rootGroup = rootGroupRef.current
    const localGroup = localGroupRef.current

    if (!rootGroup || !localGroup) {
      return
    }

    const config = WEAPON_VIEWMODEL_CONFIG[currentWeaponId]
    const isVisible = runState === 'running' && playerAlive

    rootGroup.visible = isVisible

    if (!isVisible) {
      muzzleWorldPositionRef.current = null
      return
    }

    const nextShotSequence = shotSequenceRef.current

    if (nextShotSequence < lastShotSequenceRef.current) {
      lastShotSequenceRef.current = nextShotSequence
    }

    if (lastShotSequenceRef.current !== nextShotSequence) {
      const shotDelta = Math.max(
        0,
        nextShotSequence - lastShotSequenceRef.current,
      )
      lastShotSequenceRef.current = nextShotSequence

      recoilPositionRef.current.x += config.recoilImpulsePosition[0] * shotDelta
      recoilPositionRef.current.y +=
        (config.recoilImpulsePosition[1] + config.recoilJitterPosition[1]) *
        shotDelta
      recoilPositionRef.current.z +=
        (config.recoilImpulsePosition[2] + config.recoilJitterPosition[2]) *
        shotDelta

      recoilRotationRef.current.x +=
        (config.recoilImpulseRotation[0] + config.recoilJitterRotation[0]) *
        shotDelta
      recoilRotationRef.current.y += config.recoilImpulseRotation[1] * shotDelta
      recoilRotationRef.current.z +=
        (config.recoilImpulseRotation[2] + config.recoilJitterRotation[2]) *
        shotDelta

      recoilPositionVelocityRef.current.z += config.recoilImpulsePosition[2] * 1.6
      recoilRotationVelocityRef.current.x += config.recoilImpulseRotation[0] * 1.2
    }

    stepSpring(
      recoilPositionRef.current,
      recoilPositionVelocityRef.current,
      config.recoilSpring,
      config.recoilDamping,
      delta,
    )
    stepSpring(
      recoilRotationRef.current,
      recoilRotationVelocityRef.current,
      config.recoilSpring,
      config.recoilDamping,
      delta,
    )

    VIEWMODEL_OFFSET.set(
      config.transformPosition[0] + recoilPositionRef.current.x,
      config.transformPosition[1] + recoilPositionRef.current.y,
      config.transformPosition[2] + recoilPositionRef.current.z,
    )

    rootGroup.position.copy(camera.position)
    rootGroup.quaternion.copy(camera.quaternion)
    localGroup.position.copy(VIEWMODEL_OFFSET)

    LOCAL_ROTATION.set(
      config.transformRotation[0] + recoilRotationRef.current.x,
      config.transformRotation[1] + recoilRotationRef.current.y,
      config.transformRotation[2] + recoilRotationRef.current.z,
    )

    localGroup.rotation.copy(LOCAL_ROTATION)
    rootGroup.updateMatrixWorld()

    const muzzleAnchor = muzzleAnchorRef.current

    if (!muzzleAnchor) {
      muzzleWorldPositionRef.current = null
      return
    }

    muzzleAnchor.getWorldPosition(MUZZLE_WORLD_POSITION)
    muzzleWorldPositionRef.current = [
      MUZZLE_WORLD_POSITION.x,
      MUZZLE_WORLD_POSITION.y,
      MUZZLE_WORLD_POSITION.z,
    ]
  })

  return (
    <group ref={rootGroupRef}>
      <group ref={localGroupRef}>
        <ViewmodelMesh muzzleAnchorRef={muzzleAnchorRef} />
      </group>
    </group>
  )
})
