import { useRef } from 'react'

import { type RapierRigidBody, Physics } from '@react-three/rapier'

import { PLAYER_WORLD_GRAVITY } from '../../config/playerMovement.ts'
import { RunLifecycle } from '../../core/RunLifecycle.tsx'
import { EnemySpawner } from '../../enemies/EnemySpawner.tsx'
import { EnemyWaveSystem } from '../../enemies/EnemyWaveSystem.tsx'
import { AmmoPickupSpawner } from '../../pickups/ammo/AmmoPickupSpawner.tsx'
import { HealthPickupSpawner } from '../../pickups/health/HealthPickupSpawner.tsx'
import { WeaponPickupSpawner } from '../../pickups/weaponPads/WeaponPickupSpawner.tsx'
import { ArenaLights } from '../lighting/ArenaLights.tsx'
import { FirstPersonCamera } from '../../player/camera/FirstPersonCamera.tsx'
import { PlayerController } from '../../player/controller/PlayerController.tsx'
import { PlayerLifecycle } from '../../player/health/PlayerLifecycle.tsx'
import { TestRoomMap } from '../../world/map/TestRoomMap.tsx'

export function TestRoomScene() {
  const playerBodyRef = useRef<RapierRigidBody | null>(null)

  return (
    <>
      <ArenaLights />

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
