import { HEALTH_PICKUP_CONFIG } from './healthPickupConfig.ts'
import type { HealthPickupState } from './HealthPickupSystem.ts'

type HealthPickupProps = {
  pickup: HealthPickupState
}

export function HealthPickup({ pickup }: HealthPickupProps) {
  return (
    <group
      position={[
        pickup.position[0],
        pickup.position[1] + HEALTH_PICKUP_CONFIG.totalHeightOffset,
        pickup.position[2],
      ]}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry
          args={[
            HEALTH_PICKUP_CONFIG.width,
            HEALTH_PICKUP_CONFIG.stemHeight,
            HEALTH_PICKUP_CONFIG.topWidth,
          ]}
        />
        <meshStandardMaterial color="#55c271" metalness={0} roughness={0.75} />
      </mesh>

      <mesh castShadow position={[0, 0, 0]} receiveShadow rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry
          args={[
            HEALTH_PICKUP_CONFIG.width,
            HEALTH_PICKUP_CONFIG.topHeight,
            HEALTH_PICKUP_CONFIG.topWidth,
          ]}
        />
        <meshStandardMaterial color="#7be495" metalness={0} roughness={0.7} />
      </mesh>
    </group>
  )
}
