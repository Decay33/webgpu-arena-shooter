import { HEALTH_PICKUP_CONFIG } from './healthPickupConfig.ts'
import { PickupPresentation } from '../shared/PickupPresentation.tsx'
import type { HealthPickupState } from './HealthPickupSystem.ts'

type HealthPickupProps = {
  pickup: HealthPickupState
}

function HealthShell() {
  return (
    <>
      <mesh castShadow position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.58, 10]} />
        <meshPhysicalMaterial
          clearcoat={0.56}
          clearcoatRoughness={0.2}
          color={HEALTH_PICKUP_CONFIG.stemColor}
          emissive={HEALTH_PICKUP_CONFIG.stemColor}
          emissiveIntensity={0.2}
          metalness={0.16}
          roughness={0.42}
        />
      </mesh>
      <mesh castShadow position={[0, 0.35, 0]} receiveShadow>
        <cylinderGeometry args={[0.17, 0.15, 0.08, 10]} />
        <meshPhysicalMaterial
          clearcoat={0.72}
          clearcoatRoughness={0.12}
          color={HEALTH_PICKUP_CONFIG.crossColor}
          emissive={HEALTH_PICKUP_CONFIG.auraGlowColor}
          emissiveIntensity={0.26}
          metalness={0.12}
          roughness={0.26}
        />
      </mesh>
      <mesh castShadow position={[0, -0.27, 0]} receiveShadow>
        <cylinderGeometry args={[0.18, 0.15, 0.08, 10]} />
        <meshPhysicalMaterial
          clearcoat={0.62}
          clearcoatRoughness={0.16}
          color={HEALTH_PICKUP_CONFIG.stemColor}
          emissive={HEALTH_PICKUP_CONFIG.stemColor}
          emissiveIntensity={0.16}
          metalness={0.16}
          roughness={0.38}
        />
      </mesh>
    </>
  )
}

function HealthCross() {
  return (
    <>
      <mesh castShadow position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[0.2, 0.68, 0.16]} />
        <meshPhysicalMaterial
          clearcoat={0.76}
          clearcoatRoughness={0.12}
          color={HEALTH_PICKUP_CONFIG.crossColor}
          emissive={HEALTH_PICKUP_CONFIG.auraGlowColor}
          emissiveIntensity={0.32}
          metalness={0.1}
          roughness={0.22}
        />
      </mesh>
      <mesh castShadow position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[0.66, 0.18, 0.16]} />
        <meshPhysicalMaterial
          clearcoat={0.76}
          clearcoatRoughness={0.12}
          color={HEALTH_PICKUP_CONFIG.crossColor}
          emissive={HEALTH_PICKUP_CONFIG.auraGlowColor}
          emissiveIntensity={0.32}
          metalness={0.1}
          roughness={0.22}
        />
      </mesh>
      <mesh castShadow position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[0.16, 0.18, 0.66]} />
        <meshPhysicalMaterial
          clearcoat={0.76}
          clearcoatRoughness={0.12}
          color={HEALTH_PICKUP_CONFIG.crossColor}
          emissive={HEALTH_PICKUP_CONFIG.auraGlowColor}
          emissiveIntensity={0.32}
          metalness={0.1}
          roughness={0.22}
        />
      </mesh>
      <mesh position={[0, 0.03, 0]} renderOrder={18}>
        <boxGeometry args={[0.12, 0.54, 0.12]} />
        <meshBasicMaterial
          color={HEALTH_PICKUP_CONFIG.auraGlowColor}
          opacity={0.48}
          toneMapped={false}
          transparent
        />
      </mesh>
    </>
  )
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
      <PickupPresentation
        glowColor={HEALTH_PICKUP_CONFIG.auraGlowColor}
        hoverAmplitude={HEALTH_PICKUP_CONFIG.hoverAmplitude}
        hoverSpeed={HEALTH_PICKUP_CONFIG.hoverSpeed}
        ringColor={HEALTH_PICKUP_CONFIG.auraRingColor}
        ringRadius={HEALTH_PICKUP_CONFIG.auraRadius}
        ringThickness={HEALTH_PICKUP_CONFIG.auraThickness}
        rotationSpeed={HEALTH_PICKUP_CONFIG.rotationSpeed}
        seed={pickup.position[0] * 0.19 + pickup.position[2] * 0.13}
      >
        <group position={[0, 0.06, 0]}>
          <HealthShell />
          <HealthCross />
        </group>
      </PickupPresentation>
    </group>
  )
}
