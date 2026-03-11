import { interactionGroups } from '@react-three/rapier'

export const PHYSICS_GROUPS = {
  enemy: 2,
  player: 1,
  world: 0,
} as const

export const WORLD_COLLISION_GROUPS = interactionGroups(
  PHYSICS_GROUPS.world,
  [PHYSICS_GROUPS.player, PHYSICS_GROUPS.enemy],
)

export const PLAYER_COLLISION_GROUPS = interactionGroups(
  PHYSICS_GROUPS.player,
  [PHYSICS_GROUPS.world],
)

export const ENEMY_COLLISION_GROUPS = interactionGroups(
  PHYSICS_GROUPS.enemy,
  [PHYSICS_GROUPS.world],
)
