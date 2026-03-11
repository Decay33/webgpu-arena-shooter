import type { WeaponPickupState } from './WeaponPickupSystem.ts'
import { WEAPON_PICKUP_CONFIG } from './weaponPickupConfig.ts'

type WeaponPickupProps = {
  pickup: WeaponPickupState
}

function WeaponPickupIcon({ pickup }: WeaponPickupProps) {
  if (pickup.weaponId === 'shotgun') {
    return (
      <>
        <mesh castShadow position={[0, 0, 0]} receiveShadow>
          <boxGeometry
            args={[
              WEAPON_PICKUP_CONFIG.iconWidth,
              WEAPON_PICKUP_CONFIG.iconHeight,
              0.22,
            ]}
          />
          <meshStandardMaterial
            color={pickup.color}
            metalness={0}
            roughness={0.75}
          />
        </mesh>
        <mesh castShadow position={[0.28, 0.16, 0]} receiveShadow>
          <boxGeometry args={[0.32, 0.12, 0.16]} />
          <meshStandardMaterial
            color="#f1f5f9"
            metalness={0}
            roughness={0.8}
          />
        </mesh>
      </>
    )
  }

  return (
    <>
      <mesh castShadow position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[0.22, 0.56, 0.22]} />
        <meshStandardMaterial color={pickup.color} metalness={0} roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, -0.14, 0]} receiveShadow>
        <boxGeometry args={[0.52, 0.16, 0.18]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0} roughness={0.8} />
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
      <mesh
        castShadow
        position={[0, -WEAPON_PICKUP_CONFIG.padOffsetY, 0]}
        receiveShadow
      >
        <boxGeometry
          args={[
            WEAPON_PICKUP_CONFIG.baseSize,
            WEAPON_PICKUP_CONFIG.baseHeight,
            WEAPON_PICKUP_CONFIG.baseSize,
          ]}
        />
        <meshStandardMaterial color="#475569" metalness={0} roughness={0.95} />
      </mesh>

      <mesh castShadow position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.38, 0.24, 0.38]} />
        <meshStandardMaterial color="#94a3b8" metalness={0} roughness={0.88} />
      </mesh>

      <group position={[0, 0.46, 0]}>
        <WeaponPickupIcon pickup={pickup} />
      </group>
    </group>
  )
}
