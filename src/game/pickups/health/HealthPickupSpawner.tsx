import { useFrame } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'
import { type RefObject } from 'react'

import {
  getPlayerHealthSnapshot,
  restorePlayerHealth,
} from '../../player/health/playerHealthStore.ts'
import { HealthPickup } from './HealthPickup.tsx'
import { HEALTH_PICKUP_CONFIG } from './healthPickupConfig.ts'
import { useHealthPickupStore } from './HealthPickupSystem.ts'

type HealthPickupSpawnerProps = {
  playerBodyRef: RefObject<RapierRigidBody | null>
}

const COLLECTION_RADIUS_SQUARED =
  HEALTH_PICKUP_CONFIG.collectionRadius * HEALTH_PICKUP_CONFIG.collectionRadius

export function HealthPickupSpawner({
  playerBodyRef,
}: HealthPickupSpawnerProps) {
  const pickups = useHealthPickupStore((state) => state.pickups)

  useFrame(() => {
    const playerBody = playerBodyRef.current

    useHealthPickupStore.getState().refreshRespawns(performance.now())

    if (!playerBody) {
      return
    }

    const playerHealthSnapshot = getPlayerHealthSnapshot()

    if (
      !playerHealthSnapshot.alive ||
      playerHealthSnapshot.currentHealth >= playerHealthSnapshot.maxHealth
    ) {
      return
    }

    const playerTranslation = playerBody.translation()
    const { collectPickup, pickups: currentPickups } =
      useHealthPickupStore.getState()

    for (const pickup of currentPickups) {
      if (!pickup.active) {
        continue
      }

      const deltaX = playerTranslation.x - pickup.position[0]
      const deltaY =
        playerTranslation.y - (pickup.position[1] + HEALTH_PICKUP_CONFIG.totalHeightOffset)
      const deltaZ = playerTranslation.z - pickup.position[2]
      const distanceSquared = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ

      if (distanceSquared > COLLECTION_RADIUS_SQUARED) {
        continue
      }

      const restoredHealth = restorePlayerHealth(pickup.restoreAmount, pickup.id)

      if (restoredHealth <= 0) {
        continue
      }

      collectPickup(pickup.id)
      break
    }
  })

  return (
    <>
      {pickups
        .filter((pickup) => pickup.active)
        .map((pickup) => (
          <HealthPickup key={pickup.id} pickup={pickup} />
        ))}
    </>
  )
}
