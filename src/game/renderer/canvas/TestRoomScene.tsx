import { useRef } from 'react'

import { type RapierRigidBody, Physics } from '@react-three/rapier'

import { PLAYER_WORLD_GRAVITY } from '../../config/playerMovement.ts'
import { EnemySpawner } from '../../enemies/EnemySpawner.tsx'
import { HealthPickupSpawner } from '../../pickups/health/HealthPickupSpawner.tsx'
import { FirstPersonCamera } from '../../player/camera/FirstPersonCamera.tsx'
import { PlayerController } from '../../player/controller/PlayerController.tsx'
import { PlayerLifecycle } from '../../player/health/PlayerLifecycle.tsx'
import { TestRoomMap } from '../../world/map/TestRoomMap.tsx'

export function TestRoomScene() {
  const playerBodyRef = useRef<RapierRigidBody | null>(null)

  return (
    <>
      <color attach="background" args={['#c9d2de']} />

      <ambientLight intensity={0.9} />

      <directionalLight
        castShadow
        intensity={2.3}
        position={[20, 28, 14]}
        shadow-camera-bottom={-28}
        shadow-camera-far={80}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={28}
        shadow-normalBias={0.02}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />

      <Physics colliders={false} gravity={PLAYER_WORLD_GRAVITY}>
        <TestRoomMap />
        <PlayerController bodyRef={playerBodyRef} />
        <PlayerLifecycle bodyRef={playerBodyRef} />
        <HealthPickupSpawner playerBodyRef={playerBodyRef} />
        <EnemySpawner playerBodyRef={playerBodyRef} />
      </Physics>

      <FirstPersonCamera bodyRef={playerBodyRef} />
    </>
  )
}
