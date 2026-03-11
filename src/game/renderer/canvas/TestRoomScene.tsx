import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'

type WallDefinition = {
  key: string
  position: [number, number, number]
  size: [number, number, number]
}

const FLOOR_SIZE = 24
const WALL_HEIGHT = 4
const WALL_THICKNESS = 0.75
const WALL_OFFSET = FLOOR_SIZE / 2
const CONTROL_TARGET = new Vector3(0, 1.2, 0)

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

export function TestRoomScene() {
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

      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
        <meshStandardMaterial color="#5d6b7b" metalness={0} roughness={1} />
      </mesh>

      {WALLS.map((wall) => (
        <mesh
          castShadow
          key={wall.key}
          position={wall.position}
          receiveShadow
        >
          <boxGeometry args={wall.size} />
          <meshStandardMaterial color="#dee5ed" metalness={0} roughness={0.95} />
        </mesh>
      ))}

      <mesh castShadow position={[0, 1, 0]} receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#ca8845" metalness={0} roughness={0.9} />
      </mesh>

      <OrbitControls
        dampingFactor={0.08}
        enableDamping
        makeDefault
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.02}
        minDistance={6}
        target={CONTROL_TARGET}
      />
    </>
  )
}
