import { useFrame } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'
import { type RefObject } from 'react'

import { getPlayerHealthSnapshot } from '../../player/health/playerHealthStore.ts'
import { usePlayerWeaponStore } from '../../weapons/playerWeaponStore.ts'
import { WeaponPickup } from './WeaponPickup.tsx'
import { WEAPON_PICKUP_CONFIG } from './weaponPickupConfig.ts'
import { useWeaponPickupStore } from './WeaponPickupSystem.ts'

type WeaponPickupSpawnerProps = {
  playerBodyRef: RefObject<RapierRigidBody | null>
}

const COLLECTION_RADIUS_SQUARED =
  WEAPON_PICKUP_CONFIG.collectionRadius * WEAPON_PICKUP_CONFIG.collectionRadius

export function WeaponPickupSpawner({
  playerBodyRef,
}: WeaponPickupSpawnerProps) {
  const pickups = useWeaponPickupStore((state) => state.pickups)

  useFrame(() => {
    const playerBody = playerBodyRef.current

    useWeaponPickupStore.getState().refreshRespawns(performance.now())

    if (!playerBody || !getPlayerHealthSnapshot().alive) {
      return
    }

    const playerTranslation = playerBody.translation()
    const {
      collectPickup,
      pickups: currentPickups,
    } = useWeaponPickupStore.getState()
    const { unlockWeapon, unlockedWeapons } = usePlayerWeaponStore.getState()

    for (const pickup of currentPickups) {
      if (!pickup.active) {
        continue
      }

      const deltaX = playerTranslation.x - pickup.position[0]
      const deltaY =
        playerTranslation.y - (pickup.position[1] + WEAPON_PICKUP_CONFIG.totalHeightOffset)
      const deltaZ = playerTranslation.z - pickup.position[2]
      const distanceSquared = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ

      if (distanceSquared > COLLECTION_RADIUS_SQUARED) {
        continue
      }

      if (!unlockedWeapons[pickup.weaponId]) {
        unlockWeapon(pickup.weaponId)
        console.log(`Unlocked ${pickup.weaponId}.`)
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
          <WeaponPickup key={pickup.id} pickup={pickup} />
        ))}
    </>
  )
}
