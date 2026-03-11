import { CuboidCollider, RigidBody } from '@react-three/rapier'

type WallDefinition = {
  key: string
  position: [number, number, number]
  size: [number, number, number]
}

const FLOOR_SIZE = 24
const FLOOR_HALF_SIZE = FLOOR_SIZE / 2
const FLOOR_COLLIDER_HEIGHT = 0.1
const WALL_HEIGHT = 4
const WALL_THICKNESS = 0.75
const WALL_OFFSET = FLOOR_HALF_SIZE

const WALLS: WallDefinition[] = [
  {
    key: 'north',
    position: [0, WALL_HEIGHT / 2, -WALL_OFFSET],
    size: [FLOOR_SIZE, WALL_HEIGHT, WALL_THICKNESS],
  },
  {
    key: 'south',
    position: [0, WALL_HEIGHT / 2, WALL_OFFSET],
    size: [FLOOR_SIZE, WALL_HEIGHT, WALL_THICKNESS],
  },
  {
    key: 'west',
    position: [-WALL_OFFSET, WALL_HEIGHT / 2, 0],
    size: [WALL_THICKNESS, WALL_HEIGHT, FLOOR_SIZE],
  },
  {
    key: 'east',
    position: [WALL_OFFSET, WALL_HEIGHT / 2, 0],
    size: [WALL_THICKNESS, WALL_HEIGHT, FLOOR_SIZE],
  },
]

export function TestRoomMap() {
  return (
    <>
      <RigidBody colliders={false} type="fixed">
        <mesh receiveShadow rotation-x={-Math.PI / 2}>
          <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
          <meshStandardMaterial color="#5d6b7b" metalness={0} roughness={1} />
        </mesh>
        <CuboidCollider
          args={[FLOOR_HALF_SIZE, FLOOR_COLLIDER_HEIGHT, FLOOR_HALF_SIZE]}
          position={[0, -FLOOR_COLLIDER_HEIGHT, 0]}
        />
      </RigidBody>

      {WALLS.map((wall) => (
        <RigidBody
          colliders={false}
          key={wall.key}
          position={wall.position}
          type="fixed"
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={wall.size} />
            <meshStandardMaterial
              color="#dee5ed"
              metalness={0}
              roughness={0.95}
            />
          </mesh>
          <CuboidCollider
            args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]}
          />
        </RigidBody>
      ))}

      <RigidBody colliders={false} position={[0, 1, 0]} type="fixed">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#ca8845" metalness={0} roughness={0.9} />
        </mesh>
        <CuboidCollider args={[1, 1, 1]} />
      </RigidBody>
    </>
  )
}
