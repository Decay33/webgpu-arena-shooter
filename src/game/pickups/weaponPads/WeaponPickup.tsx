import type { WeaponPickupState } from './WeaponPickupSystem.ts'
import { WEAPON_PICKUP_CONFIG } from './weaponPickupConfig.ts'
import { PickupPresentation } from '../shared/PickupPresentation.tsx'

type WeaponPickupProps = {
  pickup: WeaponPickupState
}

function WeaponIconMaterial({
  color,
  glowColor,
}: {
  color: string
  glowColor: string
}) {
  return (
    <meshPhysicalMaterial
      clearcoat={0.82}
      clearcoatRoughness={0.12}
      color={color}
      emissive={glowColor}
      emissiveIntensity={0.22}
      metalness={0.12}
      roughness={0.2}
      transparent
      opacity={0.96}
    />
  )
}

function ShotgunPickupIcon({ pickup }: WeaponPickupProps) {
  return (
    <group rotation={[0.08, -0.16, 0]}>
      <mesh castShadow position={[-0.14, -0.06, 0.1]} receiveShadow rotation={[0.18, 0, 0]}>
        <boxGeometry args={[0.13, 0.1, 0.34]} />
        <WeaponIconMaterial color="#6b5448" glowColor={pickup.glowColor} />
      </mesh>
      <mesh castShadow position={[0.03, -0.04, -0.02]} receiveShadow>
        <boxGeometry args={[0.16, 0.12, 0.28]} />
        <WeaponIconMaterial color={pickup.color} glowColor={pickup.glowColor} />
      </mesh>
      <mesh castShadow position={[0.04, -0.12, 0]} receiveShadow rotation={[0.34, 0, 0]}>
        <boxGeometry args={[0.05, 0.16, 0.1]} />
        <WeaponIconMaterial color="#8f725e" glowColor={pickup.glowColor} />
      </mesh>
      <mesh castShadow position={[0.08, 0, -0.43]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.024, 0.86, 14]} />
        <WeaponIconMaterial color="#ece2d6" glowColor={pickup.glowColor} />
      </mesh>
      <mesh castShadow position={[0.08, -0.065, -0.36]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.026, 0.028, 0.74, 14]} />
        <WeaponIconMaterial color="#b78967" glowColor={pickup.glowColor} />
      </mesh>
      <mesh position={[0.08, 0.015, -0.35]} renderOrder={19} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.018, 0.018, 0.58]} />
        <meshBasicMaterial
          color={pickup.glowColor}
          opacity={0.34}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  )
}

function RocketPickupIcon({ pickup }: WeaponPickupProps) {
  return (
    <group rotation={[0.06, -0.12, 0]}>
      <mesh castShadow position={[0.05, -0.03, -0.1]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.095, 0.82, 4, 14]} />
        <WeaponIconMaterial color="#626c70" glowColor={pickup.glowColor} />
      </mesh>
      <mesh castShadow position={[-0.02, 0.03, -0.06]} receiveShadow>
        <boxGeometry args={[0.16, 0.08, 0.46]} />
        <WeaponIconMaterial color="#ecd9be" glowColor={pickup.glowColor} />
      </mesh>
      <mesh castShadow position={[-0.08, -0.04, 0.18]} receiveShadow>
        <boxGeometry args={[0.24, 0.2, 0.22]} />
        <WeaponIconMaterial color={pickup.color} glowColor={pickup.glowColor} />
      </mesh>
      <mesh castShadow position={[-0.08, -0.17, 0.08]} receiveShadow>
        <boxGeometry args={[0.08, 0.16, 0.12]} />
        <WeaponIconMaterial color="#aa7d60" glowColor={pickup.glowColor} />
      </mesh>
      <mesh castShadow position={[0.05, 0, -0.52]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.06, 0.14, 14]} />
        <WeaponIconMaterial color="#ffba67" glowColor={pickup.glowColor} />
      </mesh>
      <mesh position={[0.05, 0, -0.46]} renderOrder={19} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.3, 12]} />
        <meshBasicMaterial
          color={pickup.glowColor}
          opacity={0.42}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  )
}

function WeaponPickupIcon({ pickup }: WeaponPickupProps) {
  if (pickup.weaponId === 'shotgun') {
    return <ShotgunPickupIcon pickup={pickup} />
  }

  return <RocketPickupIcon pickup={pickup} />
}

function WeaponPadBase({ pickup }: WeaponPickupProps) {
  return (
    <>
      <mesh
        castShadow
        position={[0, -WEAPON_PICKUP_CONFIG.padOffsetY, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            WEAPON_PICKUP_CONFIG.baseSize * 0.5,
            WEAPON_PICKUP_CONFIG.baseSize * 0.56,
            WEAPON_PICKUP_CONFIG.baseHeight,
            24,
          ]}
        />
        <meshPhysicalMaterial
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          color={WEAPON_PICKUP_CONFIG.baseColor}
          metalness={0.24}
          roughness={0.5}
        />
      </mesh>

      <mesh castShadow position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.34, 0.42, 0.12, 24]} />
        <meshPhysicalMaterial
          clearcoat={0.72}
          clearcoatRoughness={0.14}
          color={WEAPON_PICKUP_CONFIG.coreColor}
          emissive={pickup.glowColor}
          emissiveIntensity={0.14}
          metalness={0.18}
          roughness={0.32}
        />
      </mesh>

      <mesh position={[0, 0.085, 0]} renderOrder={18} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.42, 32]} />
        <meshBasicMaterial
          color={pickup.glowColor}
          opacity={0.28}
          toneMapped={false}
          transparent
        />
      </mesh>
    </>
  )
}

export function WeaponPickup({ pickup }: WeaponPickupProps) {
  return (
    <group
      position={[
        pickup.position[0],
        pickup.position[1] + WEAPON_PICKUP_CONFIG.totalHeightOffset,
        pickup.position[2],
      ]}
    >
      <WeaponPadBase pickup={pickup} />

      <PickupPresentation
        glowColor={pickup.glowColor}
        hoverAmplitude={WEAPON_PICKUP_CONFIG.hoverAmplitude}
        hoverSpeed={WEAPON_PICKUP_CONFIG.hoverSpeed}
        ringColor={pickup.color}
        ringRadius={WEAPON_PICKUP_CONFIG.auraRadius}
        ringThickness={WEAPON_PICKUP_CONFIG.auraThickness}
        rotationSpeed={WEAPON_PICKUP_CONFIG.rotationSpeed}
        seed={pickup.position[0] * 0.14 + pickup.position[2] * 0.18}
      >
        <group position={[0, 0.46, 0]}>
          <WeaponPickupIcon pickup={pickup} />
        </group>
      </PickupPresentation>
    </group>
  )
}
