import { useFrame } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'
import { type RefObject } from 'react'

import { getPlayerHealthSnapshot } from '../../player/health/playerHealthStore.ts'
import { usePlayerWeaponStore } from '../../weapons/playerWeaponStore.ts'
import { AmmoPickup } from './AmmoPickup.tsx'
import { AMMO_PICKUP_CONFIG } from './ammoPickupConfig.ts'
import { useAmmoPickupStore } from './AmmoPickupSystem.ts'

type AmmoPickupSpawnerProps = {
  playerBodyRef: RefObject<RapierRigidBody | null>
}

const COLLECTION_RADIUS_SQUARED =
  AMMO_PICKUP_CONFIG.collectionRadius * AMMO_PICKUP_CONFIG.collectionRadius

export function AmmoPickupSpawner({
  playerBodyRef,
}: AmmoPickupSpawnerProps) {
  const pickups = useAmmoPickupStore((state) => state.pickups)

  useFrame(() => {
    const playerBody = playerBodyRef.current

    useAmmoPickupStore.getState().refreshRespawns(performance.now())

    if (!playerBody || !getPlayerHealthSnapshot().alive) {
      return
    }

    const playerTranslation = playerBody.translation()
    const { collectPickup, pickups: currentPickups } = useAmmoPickupStore.getState()
    const { grantAmmo } = usePlayerWeaponStore.getState()

    for (const pickup of currentPickups) {
      if (!pickup.active) {
        continue
      }

      const deltaX = playerTranslation.x - pickup.position[0]
      const deltaY =
        playerTranslation.y - (pickup.position[1] + AMMO_PICKUP_CONFIG.totalHeightOffset)
      const deltaZ = playerTranslation.z - pickup.position[2]
      const distanceSquared = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ

      if (distanceSquared > COLLECTION_RADIUS_SQUARED) {
        continue
      }

      const grantedAmmo = grantAmmo(pickup.weaponId, pickup.restoreAmount)

      if (grantedAmmo <= 0) {
        continue
      }

      console.log(
        `Restored ${grantedAmmo} ${pickup.weaponId} ammo from ${pickup.id}.`,
      )
      collectPickup(pickup.id)
      break
    }
  })

  return (
    <>
      {pickups
        .filter((pickup) => pickup.active)
        .map((pickup) => (
          <AmmoPickup key={pickup.id} pickup={pickup} />
        ))}
    </>
  )
}
