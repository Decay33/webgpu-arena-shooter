import type { AmmoPickupState } from './AmmoPickupSystem.ts'
import { AMMO_PICKUP_CONFIG } from './ammoPickupConfig.ts'
import { PickupPresentation } from '../shared/PickupPresentation.tsx'

type AmmoPickupProps = {
  pickup: AmmoPickupState
}

function AmmoShellMaterial({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial
      clearcoat={0.6}
      clearcoatRoughness={0.16}
      color={color}
      emissive={color}
      emissiveIntensity={0.12}
      metalness={0.18}
      roughness={0.34}
    />
  )
}

function AmmoCapMaterial({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial
      clearcoat={0.74}
      clearcoatRoughness={0.12}
      color={color}
      metalness={0.2}
      roughness={0.22}
    />
  )
}

function RifleAmmoVisual({ color }: { color: string }) {
  return (
    <>
      {[
        { offsetX: -0.13, tilt: 0.12 },
        { offsetX: 0.13, tilt: -0.12 },
      ].map(({ offsetX, tilt }) => (
        <group key={offsetX} position={[offsetX, 0.02, 0]} rotation={[0, 0, tilt]}>
          <mesh castShadow position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[0.16, 0.52, 0.11]} />
            <AmmoShellMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0, 0.23, 0]} receiveShadow>
            <boxGeometry args={[0.13, 0.1, 0.12]} />
            <AmmoCapMaterial color="#edf3f9" />
          </mesh>
          <mesh castShadow position={[0, -0.22, 0]} receiveShadow>
            <boxGeometry args={[0.18, 0.06, 0.12]} />
            <meshPhysicalMaterial
              clearcoat={0.62}
              clearcoatRoughness={0.18}
              color="#d5dee8"
              metalness={0.18}
              roughness={0.28}
            />
          </mesh>
          <mesh position={[0, 0.01, 0.058]} renderOrder={18}>
            <boxGeometry args={[0.04, 0.36, 0.02]} />
            <meshBasicMaterial
              color={pickupGlow(color)}
              opacity={0.42}
              toneMapped={false}
              transparent
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

function ShotgunAmmoVisual({ color }: { color: string }) {
  return (
    <>
      {[-0.18, 0, 0.18].map((offsetX) => (
        <group key={offsetX} position={[offsetX, 0.01, 0]}>
          <mesh castShadow position={[0, -0.02, 0]} receiveShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.46, 16]} />
            <AmmoShellMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0, 0.24, 0]} receiveShadow>
            <cylinderGeometry args={[0.082, 0.082, 0.08, 16]} />
            <AmmoCapMaterial color="#f4d38a" />
          </mesh>
          <mesh castShadow position={[0, -0.24, 0]} receiveShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 14]} />
            <meshPhysicalMaterial
              clearcoat={0.6}
              clearcoatRoughness={0.16}
              color="#d9c2a7"
              metalness={0.22}
              roughness={0.32}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

function RocketAmmoVisual({ color, glowColor }: { color: string; glowColor: string }) {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh castShadow position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.58, 16]} />
        <AmmoShellMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 0.38, 0]} receiveShadow>
        <coneGeometry args={[0.11, 0.22, 16]} />
        <AmmoCapMaterial color="#f0f4fa" />
      </mesh>
      <mesh castShadow position={[0, -0.18, 0]} receiveShadow>
        <cylinderGeometry args={[0.122, 0.122, 0.08, 16]} />
        <meshPhysicalMaterial
          clearcoat={0.7}
          clearcoatRoughness={0.14}
          color="#d6dfeb"
          metalness={0.18}
          roughness={0.24}
        />
      </mesh>
      {[
        { position: [0, -0.3, 0.11], rotation: [0, 0, 0] },
        { position: [0, -0.3, -0.11], rotation: [0, Math.PI, 0] },
        { position: [0.11, -0.3, 0], rotation: [0, Math.PI / 2, 0] },
        { position: [-0.11, -0.3, 0], rotation: [0, -Math.PI / 2, 0] },
      ].map((fin, index) => (
        <mesh
          castShadow
          key={index}
          position={fin.position as [number, number, number]}
          receiveShadow
          rotation={fin.rotation as [number, number, number]}
        >
          <boxGeometry args={[0.14, 0.16, 0.022]} />
          <meshPhysicalMaterial
            clearcoat={0.64}
            clearcoatRoughness={0.16}
            color="#e8eef6"
            metalness={0.16}
            roughness={0.28}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]} renderOrder={18}>
        <cylinderGeometry args={[0.05, 0.05, 0.44, 12]} />
        <meshBasicMaterial
          color={glowColor}
          opacity={0.34}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  )
}

function pickupGlow(color: string) {
  return color
}

function AmmoVisual({ pickup }: AmmoPickupProps) {
  switch (pickup.weaponId) {
    case 'rifle':
      return <RifleAmmoVisual color={pickup.color} />
    case 'shotgun':
      return <ShotgunAmmoVisual color={pickup.color} />
    case 'rocketLauncher':
      return <RocketAmmoVisual color={pickup.color} glowColor={pickup.glowColor} />
  }
}

function AmmoBase({ glowColor }: { glowColor: string }) {
  return (
    <>
      <mesh castShadow position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[0.52, 0.62, 0.14, 24]} />
        <meshPhysicalMaterial
          clearcoat={0.42}
          clearcoatRoughness={0.2}
          color={AMMO_PICKUP_CONFIG.baseColor}
          metalness={0.22}
          roughness={0.54}
        />
      </mesh>
      <mesh castShadow position={[0, -0.12, 0]} receiveShadow>
        <cylinderGeometry args={[0.36, 0.42, 0.08, 24]} />
        <meshPhysicalMaterial
          clearcoat={0.68}
          clearcoatRoughness={0.14}
          color="#8ea2bb"
          emissive={glowColor}
          emissiveIntensity={0.12}
          metalness={0.18}
          roughness={0.32}
        />
      </mesh>
    </>
  )
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
      <AmmoBase glowColor={pickup.glowColor} />

      <PickupPresentation
        glowColor={pickup.glowColor}
        hoverAmplitude={AMMO_PICKUP_CONFIG.hoverAmplitude}
        hoverSpeed={AMMO_PICKUP_CONFIG.hoverSpeed}
        ringColor={pickup.color}
        ringRadius={AMMO_PICKUP_CONFIG.auraRadius}
        ringThickness={AMMO_PICKUP_CONFIG.auraThickness}
        rotationSpeed={AMMO_PICKUP_CONFIG.rotationSpeed}
        seed={pickup.position[0] * 0.11 + pickup.position[2] * 0.17}
      >
        <group position={[0, 0.06, 0]}>
          <AmmoVisual pickup={pickup} />
        </group>
      </PickupPresentation>
    </group>
  )
}
