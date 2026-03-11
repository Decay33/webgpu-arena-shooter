import { CuboidCollider, RigidBody } from '@react-three/rapier'

import { WORLD_COLLISION_GROUPS } from '../../../shared/constants/collisionGroups.ts'

type GreyboxBlockDefinition = {
  key: string
  position: [number, number, number]
  size: [number, number, number]
  color: string
  rotation?: [number, number, number]
}

const ARENA_WIDTH = 56
const ARENA_DEPTH = 44
const FLOOR_THICKNESS = 0.2
const FLOOR_POSITION_Y = -FLOOR_THICKNESS / 2
const WALL_HEIGHT = 6
const WALL_THICKNESS = 1
const WALL_HALF_WIDTH = ARENA_WIDTH / 2
const WALL_HALF_DEPTH = ARENA_DEPTH / 2

const COLORS = {
  floor: '#646f7c',
  wall: '#dfe5ec',
  cover: '#9ba8b8',
  platform: '#b7c1cc',
  ramp: '#8c99a9',
}

const FLOOR: GreyboxBlockDefinition = {
  key: 'floor',
  position: [0, FLOOR_POSITION_Y, 0],
  size: [ARENA_WIDTH, FLOOR_THICKNESS, ARENA_DEPTH],
  color: COLORS.floor,
}

const BOUNDARY_WALLS: GreyboxBlockDefinition[] = [
  {
    key: 'north-wall',
    position: [0, WALL_HEIGHT / 2, -WALL_HALF_DEPTH],
    size: [ARENA_WIDTH, WALL_HEIGHT, WALL_THICKNESS],
    color: COLORS.wall,
  },
  {
    key: 'south-wall',
    position: [0, WALL_HEIGHT / 2, WALL_HALF_DEPTH],
    size: [ARENA_WIDTH, WALL_HEIGHT, WALL_THICKNESS],
    color: COLORS.wall,
  },
  {
    key: 'west-wall',
    position: [-WALL_HALF_WIDTH, WALL_HEIGHT / 2, 0],
    size: [WALL_THICKNESS, WALL_HEIGHT, ARENA_DEPTH],
    color: COLORS.wall,
  },
  {
    key: 'east-wall',
    position: [WALL_HALF_WIDTH, WALL_HEIGHT / 2, 0],
    size: [WALL_THICKNESS, WALL_HEIGHT, ARENA_DEPTH],
    color: COLORS.wall,
  },
]

const COVER_BLOCKS: GreyboxBlockDefinition[] = [
  {
    key: 'central-pillar',
    position: [0, 1.8, 0],
    size: [4, 3.6, 4],
    color: COLORS.cover,
  },
  {
    key: 'cover-west-mid',
    position: [-8, 1.25, -4],
    size: [5, 2.5, 3],
    color: COLORS.cover,
  },
  {
    key: 'cover-east-mid',
    position: [8, 1.25, 8],
    size: [5, 2.5, 3],
    color: COLORS.cover,
  },
  {
    key: 'cover-west-far',
    position: [-20, 1.25, -10],
    size: [6, 2.5, 3],
    color: COLORS.cover,
  },
  {
    key: 'cover-south-center',
    position: [3, 1.25, 14],
    size: [6, 2.5, 3],
    color: COLORS.cover,
  },
  {
    key: 'cover-north-east',
    position: [17, 1.25, -11],
    size: [4, 2.5, 4],
    color: COLORS.cover,
  },
]

const DIVIDER_WALLS: GreyboxBlockDefinition[] = [
  {
    key: 'divider-west-lane',
    position: [-13, 1.5, 6],
    size: [1, 3, 20],
    color: COLORS.wall,
  },
  {
    key: 'divider-north-cross',
    position: [-6, 1.5, -15],
    size: [16, 3, 1],
    color: COLORS.wall,
  },
  {
    key: 'divider-south-east',
    position: [12, 1.5, 14],
    size: [14, 3, 1],
    color: COLORS.wall,
  },
]

const RAISED_PLATFORM: GreyboxBlockDefinition = {
  key: 'raised-platform',
  position: [18, 1, 0],
  size: [10, 2, 10],
  color: COLORS.platform,
}

const PLATFORM_RAMP: GreyboxBlockDefinition = {
  key: 'platform-ramp',
  position: [9, 0.6, 0],
  size: [8, 0.8, 6],
  color: COLORS.ramp,
  rotation: [0, 0, 0.25],
}

function GreyboxBlock({
  block,
}: {
  block: GreyboxBlockDefinition
}) {
  const { color, key, position, rotation, size } = block

  return (
    <RigidBody
      colliders={false}
      key={key}
      position={position}
      rotation={rotation}
      type="fixed"
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} metalness={0} roughness={1} />
      </mesh>
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2, size[2] / 2]}
        collisionGroups={WORLD_COLLISION_GROUPS}
      />
    </RigidBody>
  )
}

const STRUCTURAL_BLOCKS: GreyboxBlockDefinition[] = [
  ...BOUNDARY_WALLS,
  ...DIVIDER_WALLS,
  ...COVER_BLOCKS,
  RAISED_PLATFORM,
  PLATFORM_RAMP,
]

export function TestRoomMap() {
  return (
    <>
      <GreyboxBlock block={FLOOR} />

      {STRUCTURAL_BLOCKS.map((block) => (
        <GreyboxBlock block={block} key={block.key} />
      ))}
    </>
  )
}
