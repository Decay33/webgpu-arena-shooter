import { useEffect, useRef } from 'react'

import { useFrame, useThree } from '@react-three/fiber'
import { Group, Euler, MathUtils, Quaternion, Vector3 } from 'three'

import { WEAPON_VIEWMODEL_CONFIG } from '../config/weaponViewmodels.ts'
import { useRunStore } from '../core/state/runStore.ts'
import { usePlayerHealthStore } from '../player/health/playerHealthStore.ts'
import { usePlayerWeaponStore } from './playerWeaponStore.ts'

type WeaponViewmodelProps = {
  shotSequence: number
}

type WeaponPartProps = {
  color: string
  position: [number, number, number]
  rotation?: [number, number, number]
  size: [number, number, number]
}

type WeaponTubeProps = {
  color: string
  length: number
  position: [number, number, number]
  radius: number
  rotation?: [number, number, number]
}

const VIEWMODEL_OFFSET = new Vector3()
const RECOIL_POSITION = new Vector3()
const RECOIL_ROTATION = new Vector3()
const LOCAL_ROTATION = new Euler(0, 0, 0, 'XYZ')
const LOCAL_QUATERNION = new Quaternion()

function WeaponPart({
  color,
  position,
  rotation = [0, 0, 0],
  size,
}: WeaponPartProps) {
  return (
    <mesh frustumCulled={false} position={position} renderOrder={30} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        depthTest={false}
        depthWrite={false}
        metalness={0.12}
        roughness={0.72}
      />
    </mesh>
  )
}

function WeaponTube({
  color,
  length,
  position,
  radius,
  rotation = [0, 0, 0],
}: WeaponTubeProps) {
  return (
    <mesh
      frustumCulled={false}
      position={position}
      renderOrder={30}
      rotation={[Math.PI / 2 + rotation[0], rotation[1], rotation[2]]}
    >
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial
        color={color}
        depthTest={false}
        depthWrite={false}
        metalness={0.12}
        roughness={0.72}
      />
    </mesh>
  )
}

function RifleViewmodel() {
  const config = WEAPON_VIEWMODEL_CONFIG.rifle

  return (
    <group frustumCulled={false}>
      <WeaponPart
        color={config.primaryColor}
        position={[0.02, -0.08, -0.04]}
        size={[0.13, 0.15, 0.48]}
      />
      <WeaponPart
        color={config.secondaryColor}
        position={[0.04, -0.1, -0.56]}
        size={[0.06, 0.06, 0.72]}
      />
      <WeaponPart
        color={config.primaryColor}
        position={[-0.04, -0.04, 0.18]}
        rotation={[0.1, 0, 0]}
        size={[0.1, 0.12, 0.34]}
      />
      <WeaponPart
        color={config.accentColor}
        position={[0.04, 0.02, -0.08]}
        size={[0.08, 0.06, 0.18]}
      />
      <WeaponPart
        color={config.secondaryColor}
        position={[0.02, -0.18, 0.02]}
        rotation={[0.2, 0, 0]}
        size={[0.05, 0.16, 0.16]}
      />
    </group>
  )
}

function ShotgunViewmodel() {
  const config = WEAPON_VIEWMODEL_CONFIG.shotgun

  return (
    <group frustumCulled={false}>
      <WeaponPart
        color={config.primaryColor}
        position={[0.03, -0.08, -0.02]}
        size={[0.14, 0.16, 0.42]}
      />
      <WeaponPart
        color={config.secondaryColor}
        position={[0.04, -0.11, -0.34]}
        size={[0.13, 0.09, 0.3]}
      />
      <WeaponPart
        color={config.accentColor}
        position={[0.04, -0.03, -0.72]}
        size={[0.05, 0.05, 0.82]}
      />
      <WeaponPart
        color={config.secondaryColor}
        position={[0.04, -0.12, -0.66]}
        size={[0.04, 0.04, 0.68]}
      />
      <WeaponPart
        color={config.primaryColor}
        position={[-0.05, -0.03, 0.18]}
        rotation={[0.12, 0, 0]}
        size={[0.11, 0.11, 0.32]}
      />
    </group>
  )
}

function RocketLauncherViewmodel() {
  const config = WEAPON_VIEWMODEL_CONFIG.rocketLauncher

  return (
    <group frustumCulled={false}>
      <WeaponTube
        color={config.primaryColor}
        length={1.12}
        position={[0.04, -0.06, -0.38]}
        radius={0.11}
      />
      <WeaponPart
        color={config.secondaryColor}
        position={[-0.02, -0.04, 0.18]}
        size={[0.24, 0.22, 0.2]}
      />
      <WeaponPart
        color={config.accentColor}
        position={[0.06, 0.06, -0.1]}
        size={[0.07, 0.07, 0.16]}
      />
      <WeaponPart
        color={config.secondaryColor}
        position={[0.02, -0.19, -0.08]}
        size={[0.08, 0.18, 0.12]}
      />
      <WeaponPart
        color={config.accentColor}
        position={[0.04, -0.06, -0.86]}
        rotation={[0.78, 0, 0]}
        size={[0.14, 0.04, 0.14]}
      />
    </group>
  )
}

function ViewmodelMesh() {
  const currentWeaponId = usePlayerWeaponStore((state) => state.currentWeaponId)

  switch (currentWeaponId) {
    case 'rifle':
      return <RifleViewmodel />
    case 'shotgun':
      return <ShotgunViewmodel />
    case 'rocketLauncher':
      return <RocketLauncherViewmodel />
  }
}

export function WeaponViewmodel({ shotSequence }: WeaponViewmodelProps) {
  const camera = useThree((state) => state.camera)
  const currentWeaponId = usePlayerWeaponStore((state) => state.currentWeaponId)
  const playerAlive = usePlayerHealthStore((state) => state.alive)
  const runState = useRunStore((state) => state.runState)
  const groupRef = useRef<Group>(null)
  const recoilPositionRef = useRef(new Vector3())
  const recoilRotationRef = useRef(new Vector3())
  const lastShotSequenceRef = useRef(shotSequence)

  useEffect(() => {
    recoilPositionRef.current.set(0, 0, 0)
    recoilRotationRef.current.set(0, 0, 0)
    lastShotSequenceRef.current = shotSequence
  }, [currentWeaponId, shotSequence])

  useFrame((_, delta) => {
    const group = groupRef.current

    if (!group) {
      return
    }

    const config = WEAPON_VIEWMODEL_CONFIG[currentWeaponId]
    const isVisible = runState === 'running' && playerAlive

    group.visible = isVisible

    if (!isVisible) {
      return
    }

    if (lastShotSequenceRef.current !== shotSequence) {
      const shotDelta = shotSequence - lastShotSequenceRef.current
      lastShotSequenceRef.current = shotSequence

      recoilPositionRef.current.x += config.recoilPosition[0] * shotDelta
      recoilPositionRef.current.y += config.recoilPosition[1] * shotDelta
      recoilPositionRef.current.z += config.recoilPosition[2] * shotDelta
      recoilRotationRef.current.x += config.recoilRotation[0] * shotDelta
      recoilRotationRef.current.y += config.recoilRotation[1] * shotDelta
      recoilRotationRef.current.z += config.recoilRotation[2] * shotDelta
    }

    recoilPositionRef.current.x = MathUtils.damp(
      recoilPositionRef.current.x,
      0,
      config.recoilRecoverySpeed,
      delta,
    )
    recoilPositionRef.current.y = MathUtils.damp(
      recoilPositionRef.current.y,
      0,
      config.recoilRecoverySpeed,
      delta,
    )
    recoilPositionRef.current.z = MathUtils.damp(
      recoilPositionRef.current.z,
      0,
      config.recoilRecoverySpeed,
      delta,
    )
    recoilRotationRef.current.x = MathUtils.damp(
      recoilRotationRef.current.x,
      0,
      config.recoilRecoverySpeed,
      delta,
    )
    recoilRotationRef.current.y = MathUtils.damp(
      recoilRotationRef.current.y,
      0,
      config.recoilRecoverySpeed,
      delta,
    )
    recoilRotationRef.current.z = MathUtils.damp(
      recoilRotationRef.current.z,
      0,
      config.recoilRecoverySpeed,
      delta,
    )

    VIEWMODEL_OFFSET.set(
      config.transformPosition[0] + recoilPositionRef.current.x,
      config.transformPosition[1] + recoilPositionRef.current.y,
      config.transformPosition[2] + recoilPositionRef.current.z,
    ).applyQuaternion(camera.quaternion)

    group.position.copy(camera.position).add(VIEWMODEL_OFFSET)

    RECOIL_POSITION.copy(recoilPositionRef.current)
    RECOIL_ROTATION.copy(recoilRotationRef.current)
    LOCAL_ROTATION.set(
      config.transformRotation[0] + RECOIL_ROTATION.x,
      config.transformRotation[1] + RECOIL_ROTATION.y,
      config.transformRotation[2] + RECOIL_ROTATION.z,
    )
    LOCAL_QUATERNION.setFromEuler(LOCAL_ROTATION)
    group.quaternion.copy(camera.quaternion).multiply(LOCAL_QUATERNION)
  })

  return (
    <group ref={groupRef}>
      <ViewmodelMesh />
    </group>
  )
}
