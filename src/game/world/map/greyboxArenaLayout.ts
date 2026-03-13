import type { EnemyKind } from '../../enemies/EnemyTypes.ts'
import type { WeaponId } from '../../weapons/WeaponTypes.ts'
import {
  ARENA_SURFACE_COLORS,
  type ArenaMaterialPresetId,
} from '../../config/arenaVisuals.ts'

export type ArenaPoint = [number, number, number]
export type RampDirection =
  | 'positiveX'
  | 'negativeX'
  | 'positiveZ'
  | 'negativeZ'

export type GreyboxBlockDefinition = {
  castShadow?: boolean
  collidable?: boolean
  key: string
  emissiveColor?: string
  emissiveIntensity?: number
  materialPreset?: ArenaMaterialPresetId
  metalness?: number
  opacity?: number
  position: ArenaPoint
  rampDirection?: RampDirection
  receiveShadow?: boolean
  roughness?: number
  shape?: 'box' | 'ramp'
  size: [number, number, number]
  transparent?: boolean
  color: string
  rotation?: [number, number, number]
}

type UnlockableWeaponId = Exclude<WeaponId, 'rifle'>

const ARENA_WIDTH = 60
const ARENA_DEPTH = 50
const FLOOR_THICKNESS = 0.2
const FLOOR_POSITION_Y = -FLOOR_THICKNESS / 2
const WALL_HEIGHT = 7
const WALL_THICKNESS = 1
const WALL_HALF_WIDTH = ARENA_WIDTH / 2
const WALL_HALF_DEPTH = ARENA_DEPTH / 2

function createWall(
  key: string,
  position: ArenaPoint,
  size: [number, number, number],
): GreyboxBlockDefinition {
  return {
    castShadow: true,
    color: ARENA_SURFACE_COLORS.wall,
    key,
    materialPreset: 'wall',
    position,
    receiveShadow: true,
    size,
  }
}

function createCover(
  key: string,
  position: ArenaPoint,
  size: [number, number, number],
  rotation?: [number, number, number],
): GreyboxBlockDefinition {
  return {
    castShadow: true,
    color: ARENA_SURFACE_COLORS.cover,
    key,
    materialPreset: 'cover',
    position,
    receiveShadow: true,
    rotation,
    size,
  }
}

function createRamp(
  key: string,
  position: ArenaPoint,
  size: [number, number, number],
  rampDirection: RampDirection,
): GreyboxBlockDefinition {
  return {
    castShadow: true,
    color: ARENA_SURFACE_COLORS.ramp,
    key,
    materialPreset: 'ramp',
    position,
    rampDirection,
    receiveShadow: true,
    shape: 'ramp',
    size,
  }
}

function createAccent(
  key: string,
  position: ArenaPoint,
  size: [number, number, number],
  color: string,
  emissiveIntensity: number,
  rotation?: [number, number, number],
): GreyboxBlockDefinition {
  return {
    castShadow: false,
    collidable: false,
    color,
    emissiveColor: color,
    emissiveIntensity,
    key,
    materialPreset: 'accent',
    metalness: 0.14,
    opacity: 0.92,
    position,
    receiveShadow: false,
    rotation,
    roughness: 0.38,
    size,
    transparent: true,
  }
}

export const GREYBOX_ARENA_PLAYER_SPAWN_POSITION: ArenaPoint = [0, 2.2, 20]

export const GREYBOX_ARENA_FLOOR_BLOCK: GreyboxBlockDefinition = {
  castShadow: false,
  color: ARENA_SURFACE_COLORS.floor,
  key: 'floor',
  materialPreset: 'floor',
  opacity: 1,
  position: [0, FLOOR_POSITION_Y, 0],
  receiveShadow: true,
  size: [ARENA_WIDTH, FLOOR_THICKNESS, ARENA_DEPTH],
}

const GREYBOX_ARENA_BOUNDARY_WALLS: GreyboxBlockDefinition[] = [
  createWall(
    'north-wall',
    [0, WALL_HEIGHT / 2, -WALL_HALF_DEPTH],
    [ARENA_WIDTH, WALL_HEIGHT, WALL_THICKNESS],
  ),
  createWall(
    'south-wall',
    [0, WALL_HEIGHT / 2, WALL_HALF_DEPTH],
    [ARENA_WIDTH, WALL_HEIGHT, WALL_THICKNESS],
  ),
  createWall(
    'west-wall',
    [-WALL_HALF_WIDTH, WALL_HEIGHT / 2, 0],
    [WALL_THICKNESS, WALL_HEIGHT, ARENA_DEPTH],
  ),
  createWall(
    'east-wall',
    [WALL_HALF_WIDTH, WALL_HEIGHT / 2, 0],
    [WALL_THICKNESS, WALL_HEIGHT, ARENA_DEPTH],
  ),
]

const GREYBOX_ARENA_ROUTE_BLOCKERS: GreyboxBlockDefinition[] = [
  createWall('west-lane-divider-north', [-10.5, 1.6, -10.5], [1.2, 3.2, 5]),
  createWall('west-lane-divider-south', [-10.5, 1.6, 5.5], [1.2, 3.2, 13]),
  createWall('east-lane-divider', [11.5, 1.6, -6], [1.2, 3.2, 12]),
  createWall('north-spine-wall-west', [-6, 1.6, -10.5], [6, 3.2, 1.2]),
  createWall('north-spine-wall-east', [6, 1.6, -10.5], [6, 3.2, 1.2]),
  createWall('south-spine-wall', [0, 1.6, 11.5], [18, 3.2, 1.2]),
  createCover('central-pillar', [0, 2, 0], [4.5, 4, 4.5]),
  createCover(
    'center-angle-west',
    [-7.5, 1.4, 0.5],
    [4.6, 2.8, 1],
    [0, 0.36, 0],
  ),
  createCover(
    'center-angle-east',
    [7.5, 1.4, 0.5],
    [4.6, 2.8, 1],
    [0, -0.36, 0],
  ),
  createCover('north-west-pocket-cover', [-19, 1.25, -17.5], [6, 2.5, 2.6]),
  createCover('north-east-pocket-cover', [18, 1.25, -18], [5.5, 2.5, 3]),
  createCover('south-west-pocket-cover', [-17, 1.25, 16], [6.5, 2.5, 2.6]),
  createCover('south-east-pocket-cover', [18, 1.25, 16.5], [5.5, 2.5, 3]),
]

const GREYBOX_ARENA_ELEVATION_BLOCKS: GreyboxBlockDefinition[] = [
  {
    castShadow: true,
    color: ARENA_SURFACE_COLORS.platform,
    key: 'west-shotgun-platform',
    materialPreset: 'platform',
    position: [-20, 1.2, -4],
    receiveShadow: true,
    size: [10, 2.4, 10],
  },
  createRamp('west-shotgun-ramp', [-11, 1.2, -4], [8, 2.4, 5.6], 'negativeX'),
  {
    castShadow: true,
    color: ARENA_SURFACE_COLORS.platform,
    key: 'east-rocket-platform',
    materialPreset: 'platform',
    position: [20, 1.2, 5],
    receiveShadow: true,
    size: [10, 2.4, 10],
  },
  createRamp('east-rocket-ramp', [11, 1.2, 5], [8, 2.4, 5.6], 'positiveX'),
  {
    castShadow: true,
    color: ARENA_SURFACE_COLORS.platform,
    key: 'north-overlook-platform',
    materialPreset: 'platform',
    position: [0, 0.8, -19],
    receiveShadow: true,
    size: [10, 1.6, 6],
  },
  createRamp('north-overlook-ramp', [0, 0.8, -13], [5.6, 1.6, 6], 'negativeZ'),
]

export const GREYBOX_ARENA_DECORATIVE_BLOCKS: GreyboxBlockDefinition[] = [
  createAccent(
    'center-pillar-cap',
    [0, 4.18, 0],
    [4.26, 0.1, 4.26],
    ARENA_SURFACE_COLORS.accentCenter,
    0.34,
  ),
  createAccent(
    'west-platform-edge',
    [-20, 2.46, 0.84],
    [8.3, 0.06, 0.14],
    ARENA_SURFACE_COLORS.accentWest,
    0.86,
  ),
  createAccent(
    'east-platform-edge',
    [20, 2.46, 9.16],
    [8.3, 0.06, 0.14],
    ARENA_SURFACE_COLORS.accentEast,
    0.88,
  ),
  createAccent(
    'north-overlook-strip',
    [0, 1.66, -16.12],
    [7.8, 0.06, 0.14],
    ARENA_SURFACE_COLORS.accentNorth,
    0.78,
  ),
]

export const GREYBOX_ARENA_STRUCTURAL_BLOCKS: GreyboxBlockDefinition[] = [
  ...GREYBOX_ARENA_BOUNDARY_WALLS,
  ...GREYBOX_ARENA_ROUTE_BLOCKERS,
  ...GREYBOX_ARENA_ELEVATION_BLOCKS,
]

export const GREYBOX_ARENA_HEALTH_PICKUP_POINTS: ArenaPoint[] = [
  [0, 1.6, -19],
  [-24, 0, 9],
  [24, 0, -9],
  [0, 0, 18.5],
]

export const GREYBOX_ARENA_AMMO_PICKUP_POINTS: Record<WeaponId, ArenaPoint[]> = {
  rifle: [
    [12, 0, -21],
    [-10, 0, 21],
  ],
  rocketLauncher: [[24, 2.4, 9]],
  shotgun: [[-24, 2.4, 0]],
}

export const GREYBOX_ARENA_WEAPON_PICKUP_POINTS: Record<
  UnlockableWeaponId,
  ArenaPoint
> = {
  rocketLauncher: [20, 2.4, 5],
  shotgun: [-20, 2.4, -4],
}

export const GREYBOX_ARENA_ENEMY_SPAWN_ANCHORS: Record<
  EnemyKind,
  ArenaPoint[]
> = {
  fast: [
    [-24, 0, 6],
    [24, 0, -2],
    [-6, 0, 22],
    [8, 0, -23],
  ],
  standard: [
    [-18, 0, -22],
    [18, 0, -20],
    [-22, 0, 14],
    [22, 0, 14],
  ],
  tank: [
    [24, 0, 16],
    [-24, 0, -16],
    [22, 0, -20],
  ],
}
