import { useEffect, useMemo } from 'react'

import { CuboidCollider, RigidBody, TrimeshCollider } from '@react-three/rapier'
import { ExtrudeGeometry, Float32BufferAttribute, Shape } from 'three'

import { ARENA_MATERIAL_PRESETS } from '../../config/arenaVisuals.ts'
import { WORLD_COLLISION_GROUPS } from '../../../shared/constants/collisionGroups.ts'
import {
  GREYBOX_ARENA_DECORATIVE_BLOCKS,
  GREYBOX_ARENA_FLOOR_BLOCK,
  GREYBOX_ARENA_STRUCTURAL_BLOCKS,
  type GreyboxBlockDefinition,
  type RampDirection,
} from './greyboxArenaLayout.ts'

type RampGeometryData = {
  colliderIndices: Uint32Array
  colliderVertices: Float32Array
  geometry: ExtrudeGeometry
}

function createRampGeometry(
  size: [number, number, number],
  direction: RampDirection,
): RampGeometryData {
  const [width, height, depth] = size
  const halfWidth = width / 2
  const halfHeight = height / 2
  const halfDepth = depth / 2

  const shape = new Shape()
  shape.moveTo(0, 0)
  shape.lineTo(width, 0)
  shape.lineTo(width, height)
  shape.closePath()

  const geometry = new ExtrudeGeometry(shape, {
    bevelEnabled: false,
    depth,
    steps: 1,
  })

  geometry.translate(-halfWidth, -halfHeight, -halfDepth)

  if (direction === 'negativeX') {
    geometry.rotateY(Math.PI)
  } else if (direction === 'positiveZ') {
    geometry.rotateY(-Math.PI / 2)
  } else if (direction === 'negativeZ') {
    geometry.rotateY(Math.PI / 2)
  }

  geometry.computeVertexNormals()

  const positionAttribute = geometry.getAttribute('position')
  const colliderVertices = Float32Array.from(
    (positionAttribute as Float32BufferAttribute).array,
  )
  const index = geometry.getIndex()
  const colliderIndices = index
    ? Uint32Array.from(index.array)
    : Uint32Array.from(
        Array.from({ length: positionAttribute.count }, (_, vertexIndex) => vertexIndex),
      )

  return {
    colliderIndices,
    colliderVertices,
    geometry,
  }
}

function GreyboxMaterial({
  block,
}: {
  block: GreyboxBlockDefinition
}) {
  const materialPreset = ARENA_MATERIAL_PRESETS[block.materialPreset ?? 'cover']

  return (
    <meshPhysicalMaterial
      attenuationDistance={6}
      clearcoat={materialPreset.clearcoat}
      clearcoatRoughness={materialPreset.clearcoatRoughness}
      color={block.color}
      emissive={block.emissiveColor ?? '#000000'}
      emissiveIntensity={
        (block.emissiveIntensity ?? 0) * materialPreset.emissiveIntensityMultiplier
      }
      ior={materialPreset.ior}
      metalness={block.metalness ?? materialPreset.baseMetalness}
      opacity={block.opacity ?? 1}
      roughness={block.roughness ?? materialPreset.baseRoughness}
      specularIntensity={materialPreset.specularIntensity}
      thickness={materialPreset.thickness}
      transmission={materialPreset.transmission}
      transparent={block.transparent ?? false}
    />
  )
}

function RampBlock({
  block,
}: {
  block: GreyboxBlockDefinition & {
    rampDirection: RampDirection
    shape: 'ramp'
  }
}) {
  const {
    castShadow = true,
    collidable = true,
    color,
    emissiveColor = '#000000',
    emissiveIntensity = 0,
    key,
    metalness = 0,
    opacity = 1,
    position,
    rampDirection,
    receiveShadow = true,
    roughness = 1,
    size,
    transparent = false,
  } = block

  const rampGeometry = useMemo(
    () => createRampGeometry(size, rampDirection),
    [rampDirection, size],
  )

  useEffect(() => {
    return () => {
      rampGeometry.geometry.dispose()
    }
  }, [rampGeometry.geometry])

  return (
    <RigidBody colliders={false} key={key} position={position} type="fixed">
      <mesh
        castShadow={castShadow}
        geometry={rampGeometry.geometry}
        receiveShadow={receiveShadow}
      >
        <GreyboxMaterial
          block={{
            ...block,
            color,
            emissiveColor,
            emissiveIntensity,
            metalness,
            opacity,
            roughness,
            transparent,
          }}
        />
      </mesh>
      {collidable ? (
        <TrimeshCollider
          args={[rampGeometry.colliderVertices, rampGeometry.colliderIndices]}
          collisionGroups={WORLD_COLLISION_GROUPS}
        />
      ) : null}
    </RigidBody>
  )
}

function GreyboxBlock({
  block,
}: {
  block: GreyboxBlockDefinition
}) {
  const {
    castShadow = true,
    collidable = true,
    color,
    emissiveColor = '#000000',
    emissiveIntensity = 0,
    key,
    metalness = 0,
    opacity = 1,
    position,
    receiveShadow = true,
    rotation,
    roughness = 1,
    size,
    transparent = false,
  } = block

  if (block.shape === 'ramp' && block.rampDirection) {
    return (
      <RampBlock
        block={{
          ...block,
          rampDirection: block.rampDirection,
          shape: 'ramp',
        }}
      />
    )
  }

  return (
    <RigidBody
      colliders={false}
      key={key}
      position={position}
      rotation={rotation}
      type="fixed"
    >
      <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
        <boxGeometry args={size} />
        <GreyboxMaterial
          block={{
            ...block,
            color,
            emissiveColor,
            emissiveIntensity,
            metalness,
            opacity,
            roughness,
            transparent,
          }}
        />
      </mesh>
      {collidable ? (
        <CuboidCollider
          args={[size[0] / 2, size[1] / 2, size[2] / 2]}
          collisionGroups={WORLD_COLLISION_GROUPS}
        />
      ) : null}
    </RigidBody>
  )
}

export function TestRoomMap() {
  return (
    <>
      <GreyboxBlock block={GREYBOX_ARENA_FLOOR_BLOCK} />

      {GREYBOX_ARENA_STRUCTURAL_BLOCKS.map((block) => (
        <GreyboxBlock block={block} key={block.key} />
      ))}

      {GREYBOX_ARENA_DECORATIVE_BLOCKS.map((block) => (
        <GreyboxBlock block={block} key={block.key} />
      ))}
    </>
  )
}
