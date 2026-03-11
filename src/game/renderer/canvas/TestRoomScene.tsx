import { useRef } from 'react'

import { type RapierRigidBody, Physics } from '@react-three/rapier'

import { PLAYER_WORLD_GRAVITY } from '../../config/playerMovement.ts'
import { FirstPersonCamera } from '../../player/camera/FirstPersonCamera.tsx'
import { PlayerController } from '../../player/controller/PlayerController.tsx'
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
        position={[10, 14, 8]}
        shadow-camera-bottom={-16}
        shadow-camera-far={40}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-normalBias={0.02}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />

      <Physics colliders={false} gravity={PLAYER_WORLD_GRAVITY}>
        <TestRoomMap />
        <PlayerController bodyRef={playerBodyRef} />
      </Physics>

      <FirstPersonCamera bodyRef={playerBodyRef} />
    </>
  )
}
