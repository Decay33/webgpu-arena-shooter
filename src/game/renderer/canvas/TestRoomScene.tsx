import { useRef } from 'react'

import { type RapierRigidBody, Physics } from '@react-three/rapier'

import { PLAYER_WORLD_GRAVITY } from '../../config/playerMovement.ts'
import { RunLifecycle } from '../../core/RunLifecycle.tsx'
import { EnemySpawner } from '../../enemies/EnemySpawner.tsx'
import { EnemyWaveSystem } from '../../enemies/EnemyWaveSystem.tsx'
import { AmmoPickupSpawner } from '../../pickups/ammo/AmmoPickupSpawner.tsx'
import { HealthPickupSpawner } from '../../pickups/health/HealthPickupSpawner.tsx'
import { WeaponPickupSpawner } from '../../pickups/weaponPads/WeaponPickupSpawner.tsx'
import { FirstPersonCamera } from '../../player/camera/FirstPersonCamera.tsx'
import { PlayerController } from '../../player/controller/PlayerController.tsx'
import { PlayerLifecycle } from '../../player/health/PlayerLifecycle.tsx'
import { TestRoomMap } from '../../world/map/TestRoomMap.tsx'

export function TestRoomScene() {
  const playerBodyRef = useRef<RapierRigidBody | null>(null)

  return (
    <>
      <color attach="background" args={['#9fb5c9']} />

      <ambientLight color="#eef4fb" intensity={0.62} />
      <hemisphereLight
        args={['#f7fbff', '#243341', 0.82]}
        groundColor="#293847"
        intensity={0.7}
      />

      <directionalLight
        castShadow
        color="#fff2de"
        intensity={2.55}
        position={[24, 30, 18]}
        shadow-camera-bottom={-30}
        shadow-camera-far={86}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={30}
        shadow-normalBias={0.024}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />
      <directionalLight
        color="#8bbcff"
        intensity={0.78}
        position={[-22, 18, -20]}
      />

      <Physics colliders={false} gravity={PLAYER_WORLD_GRAVITY}>
        <TestRoomMap />
        <PlayerController bodyRef={playerBodyRef} />
        <PlayerLifecycle bodyRef={playerBodyRef} />
        <RunLifecycle bodyRef={playerBodyRef} />
        <HealthPickupSpawner playerBodyRef={playerBodyRef} />
        <AmmoPickupSpawner playerBodyRef={playerBodyRef} />
        <WeaponPickupSpawner playerBodyRef={playerBodyRef} />
        <EnemyWaveSystem />
        <EnemySpawner playerBodyRef={playerBodyRef} />
      </Physics>

      <FirstPersonCamera bodyRef={playerBodyRef} />
    </>
  )
}
