import type { AmmoPickupState } from './AmmoPickupSystem.ts'
import { AMMO_PICKUP_CONFIG } from './ammoPickupConfig.ts'

type AmmoPickupProps = {
  pickup: AmmoPickupState
}

function RifleAmmoVisual({ color }: { color: string }) {
  return (
    <>
      <mesh castShadow position={[-0.12, 0, 0]} receiveShadow>
        <boxGeometry
          args={[
            AMMO_PICKUP_CONFIG.bodyWidth,
            AMMO_PICKUP_CONFIG.bodyHeight,
            0.18,
          ]}
        />
        <meshStandardMaterial color={color} metalness={0} roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0.12, 0, 0]} receiveShadow>
        <boxGeometry
          args={[
            AMMO_PICKUP_CONFIG.bodyWidth,
            AMMO_PICKUP_CONFIG.bodyHeight,
            0.18,
          ]}
        />
        <meshStandardMaterial color={color} metalness={0} roughness={0.82} />
      </mesh>
      <mesh castShadow position={[-0.12, 0.22, 0]} receiveShadow>
        <boxGeometry
          args={[
            AMMO_PICKUP_CONFIG.capWidth,
            AMMO_PICKUP_CONFIG.capHeight,
            0.2,
          ]}
        />
        <meshStandardMaterial color="#e2e8f0" metalness={0} roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0.12, 0.22, 0]} receiveShadow>
        <boxGeometry
          args={[
            AMMO_PICKUP_CONFIG.capWidth,
            AMMO_PICKUP_CONFIG.capHeight,
            0.2,
          ]}
        />
        <meshStandardMaterial color="#e2e8f0" metalness={0} roughness={0.75} />
      </mesh>
    </>
  )
}

function ShotgunAmmoVisual({ color }: { color: string }) {
  return (
    <>
      {[-0.18, 0, 0.18].map((offsetX) => (
        <group key={offsetX} position={[offsetX, 0, 0]}>
          <mesh castShadow position={[0, 0, 0]} receiveShadow>
            <boxGeometry
              args={[
                AMMO_PICKUP_CONFIG.bodyWidth,
                AMMO_PICKUP_CONFIG.bodyHeight * 0.9,
                0.2,
              ]}
            />
            <meshStandardMaterial color={color} metalness={0} roughness={0.78} />
          </mesh>
          <mesh castShadow position={[0, 0.18, 0]} receiveShadow>
            <boxGeometry
              args={[
                AMMO_PICKUP_CONFIG.capWidth * 0.8,
                AMMO_PICKUP_CONFIG.capHeight,
                0.22,
              ]}
            />
            <meshStandardMaterial
              color="#fde68a"
              metalness={0}
              roughness={0.68}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

function RocketAmmoVisual({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[0.28, 0.7, 0.28]} />
        <meshStandardMaterial color={color} metalness={0} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.34, 0]} receiveShadow>
        <boxGeometry args={[0.14, 0.18, 0.14]} />
        <meshStandardMaterial color="#f8fafc" metalness={0} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, -0.32, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.12, 0.12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0} roughness={0.82} />
      </mesh>
    </group>
  )
}

function AmmoVisual({ pickup }: AmmoPickupProps) {
  switch (pickup.weaponId) {
    case 'rifle':
      return <RifleAmmoVisual color={pickup.color} />
    case 'shotgun':
      return <ShotgunAmmoVisual color={pickup.color} />
    case 'rocketLauncher':
      return <RocketAmmoVisual color={pickup.color} />
  }
}

export function AmmoPickup({ pickup }: AmmoPickupProps) {
  return (
    <group
      position={[
        pickup.position[0],
        pickup.position[1] + AMMO_PICKUP_CONFIG.totalHeightOffset,
        pickup.position[2],
      ]}
    >
      <mesh castShadow position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.18, 0.92]} />
        <meshStandardMaterial color="#334155" metalness={0} roughness={0.95} />
      </mesh>

      <AmmoVisual pickup={pickup} />
    </group>
  )
}
