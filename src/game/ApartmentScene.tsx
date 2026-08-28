import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import {
  createBathroomTileTexture,
  createCeilingTexture,
  createLabelTexture,
  createWallTexture,
  createWoodTexture,
} from './materials/proceduralTextures'
import { useGameStore } from './state/gameStore'

interface SceneTextures {
  wood: THREE.CanvasTexture
  wall: THREE.CanvasTexture
  tile: THREE.CanvasTexture
  ceiling: THREE.CanvasTexture
  badge: THREE.CanvasTexture
  clock: THREE.CanvasTexture
}

function useSceneTextures(): SceneTextures {
  const textures = useMemo<SceneTextures>(() => ({
    wood: createWoodTexture(),
    wall: createWallTexture(),
    tile: createBathroomTileTexture(),
    ceiling: createCeilingTexture(),
    badge: createLabelTexture('CRACHÁ 4471', ['PAULON, B.', 'MRD-1991-4471'], '#132018', '#c9d1bd'),
    clock: createLabelTexture('05:31', ['SEX', '28 AGO'], '#d7ddd4', '#161a1c'),
  }), [])

  useEffect(() => () => {
    Object.values(textures).forEach((texture) => texture.dispose())
  }, [textures])

  return textures
}

interface WallBoxProps {
  position: [number, number, number]
  size: [number, number, number]
  texture: THREE.Texture
}

function WallBox({ position, size, texture }: WallBoxProps) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial map={texture} color="#a5a39a" roughness={1} />
    </mesh>
  )
}

function Cityscape() {
  const buildings = useMemo(() => [
    { x: -13, z: -15, width: 4, height: 13 },
    { x: -8, z: -19, width: 3.5, height: 20 },
    { x: -3, z: -14, width: 4.5, height: 11 },
    { x: 8, z: -18, width: 5, height: 18 },
    { x: 14, z: -22, width: 6, height: 26 },
  ], [])

  const litWindows = useMemo(() => [
    [-1.8, 5.5],
    [1.5, 9],
    [-1.6, 14],
    [1.7, 18.5],
    [-1.7, 23],
    [1.6, 28],
    [-1.5, 33],
    [1.5, 38],
  ] as const, [])

  return (
    <group>
      {buildings.map((building) => (
        <mesh
          key={`${building.x}-${building.z}`}
          position={[building.x, building.height / 2 - 3, building.z]}
        >
          <boxGeometry args={[building.width, building.height, 4]} />
          <meshStandardMaterial color="#070a0f" roughness={1} />
        </mesh>
      ))}

      <group position={[3.5, 16, -27]}>
        <mesh>
          <boxGeometry args={[7, 120, 7]} />
          <meshStandardMaterial color="#070a10" roughness={0.95} />
        </mesh>

        {litWindows.map(([x, y], index) => (
          <mesh key={`${x}-${y}-${index}`} position={[x, y - 16, 3.51]}>
            <planeGeometry args={[0.75, 0.48]} />
            <meshStandardMaterial
              color="#918c64"
              emissive="#d6c86e"
              emissiveIntensity={1.35}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Architecture({ textures }: { textures: SceneTextures }) {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[7, 0.1, 6]} />
        <meshStandardMaterial map={textures.wood} color="#5b493d" roughness={0.96} />
      </mesh>

      <mesh receiveShadow position={[2.475, 0.006, -1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.05, 2.2]} />
        <meshStandardMaterial map={textures.tile} color="#bcb6a4" roughness={0.9} />
      </mesh>

      <mesh receiveShadow position={[0, 2.58, 0]}>
        <boxGeometry args={[7, 0.08, 6]} />
        <meshStandardMaterial map={textures.ceiling} color="#aaa79e" roughness={1} />
      </mesh>

      <WallBox position={[-3.5, 1.275, 0]} size={[0.12, 2.55, 6]} texture={textures.wall} />
      <WallBox position={[3.5, 1.275, 0]} size={[0.12, 2.55, 6]} texture={textures.wall} />
      <WallBox position={[0, 1.275, 3]} size={[7, 2.55, 0.12]} texture={textures.wall} />

      <WallBox position={[-3.075, 1.275, -3]} size={[0.85, 2.55, 0.12]} texture={textures.wall} />
      <WallBox position={[1.775, 1.275, -3]} size={[3.45, 2.55, 0.12]} texture={textures.wall} />
      <WallBox position={[-1.3, 0.35, -3]} size={[2.7, 0.7, 0.12]} texture={textures.wall} />
      <WallBox position={[-1.3, 2.375, -3]} size={[2.7, 0.35, 0.12]} texture={textures.wall} />

      <WallBox position={[-1.925, 1.275, 0.55]} size={[3.15, 2.55, 0.12]} texture={textures.wall} />
      <WallBox position={[0.6, 1.275, 0.55]} size={[0.1, 2.55, 0.12]} texture={textures.wall} />

      <WallBox position={[1.45, 1.275, -1.9]} size={[0.12, 2.55, 2.2]} texture={textures.wall} />
      <WallBox position={[1.7, 1.275, -0.8]} size={[0.5, 2.55, 0.12]} texture={textures.wall} />
      <WallBox position={[3.175, 1.275, -0.8]} size={[0.65, 2.55, 0.12]} texture={textures.wall} />

      <WallBox position={[-0.9, 1.275, 0.95]} size={[0.12, 2.55, 0.8]} texture={textures.wall} />
      <WallBox position={[-0.9, 1.275, 2.725]} size={[0.12, 2.55, 0.55]} texture={textures.wall} />

      <mesh
        position={[-1.3, 1.48, -3.045]}
        userData={{ interactableId: 'window' }}
      >
        <planeGeometry args={[2.65, 1.4]} />
        <meshStandardMaterial
          color="#8295a8"
          transparent
          opacity={0.24}
          roughness={0.18}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[-1.3, 0.78, -2.98]} castShadow>
        <boxGeometry args={[2.82, 0.08, 0.12]} />
        <meshStandardMaterial color="#282c31" roughness={0.85} />
      </mesh>
      <mesh position={[-2.68, 1.48, -2.98]} castShadow>
        <boxGeometry args={[0.08, 1.48, 0.12]} />
        <meshStandardMaterial color="#282c31" roughness={0.85} />
      </mesh>
      <mesh position={[0.08, 1.48, -2.98]} castShadow>
        <boxGeometry args={[0.08, 1.48, 0.12]} />
        <meshStandardMaterial color="#282c31" roughness={0.85} />
      </mesh>
      <mesh position={[-1.3, 2.18, -2.98]} castShadow>
        <boxGeometry args={[2.82, 0.08, 0.12]} />
        <meshStandardMaterial color="#282c31" roughness={0.85} />
      </mesh>
      <mesh position={[-1.3, 1.48, -2.97]} castShadow>
        <boxGeometry args={[0.06, 1.4, 0.1]} />
        <meshStandardMaterial color="#282c31" roughness={0.85} />
      </mesh>
    </group>
  )
}

function Bedroom() {
  return (
    <group>
      <group position={[-2.4, 0, -1.2]} userData={{ interactableId: 'bed' }}>
        <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
          <boxGeometry args={[1.65, 0.34, 2.45]} />
          <meshStandardMaterial color="#332d2b" roughness={1} />
        </mesh>
        <mesh castShadow position={[0, 0.48, 0]}>
          <boxGeometry args={[1.56, 0.24, 2.32]} />
          <meshStandardMaterial color="#716e67" roughness={1} />
        </mesh>
        <mesh castShadow position={[-0.42, 0.66, -0.78]} rotation={[0, 0.18, 0]}>
          <boxGeometry args={[0.58, 0.16, 0.42]} />
          <meshStandardMaterial color="#8a877f" roughness={1} />
        </mesh>
        <mesh castShadow position={[0.1, 0.64, 0.2]} rotation={[0, -0.08, 0]}>
          <boxGeometry args={[1.25, 0.08, 1.15]} />
          <meshStandardMaterial color="#494c50" roughness={1} />
        </mesh>
      </group>

      <group position={[-1.18, 0, -2.12]}>
        <mesh castShadow receiveShadow position={[0, 0.34, 0]}>
          <boxGeometry args={[0.56, 0.68, 0.68]} />
          <meshStandardMaterial color="#352e29" roughness={1} />
        </mesh>
        <mesh
          castShadow
          position={[0.06, 0.72, 0.02]}
          rotation={[0, -0.12, 0]}
          userData={{ interactableId: 'phone' }}
        >
          <boxGeometry args={[0.22, 0.035, 0.42]} />
          <meshStandardMaterial color="#11151b" roughness={0.58} metalness={0.12} />
        </mesh>
      </group>

      <group position={[-3, 0, 0.23]}>
        <mesh castShadow receiveShadow position={[0, 1.05, 0]}>
          <boxGeometry args={[0.66, 2.1, 0.38]} />
          <meshStandardMaterial color="#403832" roughness={1} />
        </mesh>
        <mesh position={[0, 1.05, 0.2]}>
          <boxGeometry args={[0.03, 1.92, 0.02]} />
          <meshStandardMaterial color="#27231f" roughness={1} />
        </mesh>
      </group>

      <group position={[-0.6, 0, -1.3]}>
        <mesh castShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[0.48, 0.08, 0.48]} />
          <meshStandardMaterial color="#493d34" roughness={1} />
        </mesh>
        <mesh castShadow position={[-0.18, 0.22, -0.18]}>
          <boxGeometry args={[0.05, 0.45, 0.05]} />
          <meshStandardMaterial color="#332a24" roughness={1} />
        </mesh>
        <mesh castShadow position={[0.18, 0.22, 0.18]}>
          <boxGeometry args={[0.05, 0.45, 0.05]} />
          <meshStandardMaterial color="#332a24" roughness={1} />
        </mesh>
        <mesh position={[0, 0.53, 0]} rotation={[0.1, 0.2, 0.05]}>
          <boxGeometry args={[0.42, 0.08, 0.34]} />
          <meshStandardMaterial color="#42484f" roughness={1} />
        </mesh>
      </group>
    </group>
  )
}

function Bathroom({ textures }: { textures: SceneTextures }) {
  return (
    <group>
      <mesh position={[1.51, 1.35, -1.9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.05, 2.45]} />
        <meshStandardMaterial map={textures.tile} color="#b9b3a3" roughness={0.92} />
      </mesh>
      <mesh position={[2.47, 1.35, -2.93]}>
        <planeGeometry args={[1.9, 2.45]} />
        <meshStandardMaterial map={textures.tile} color="#b9b3a3" roughness={0.92} />
      </mesh>

      <group position={[1.98, 0, -2.68]}>
        <mesh castShadow receiveShadow position={[0, 0.68, 0]}>
          <boxGeometry args={[0.72, 0.18, 0.5]} />
          <meshStandardMaterial color="#b8b5a9" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 0.68, 8]} />
          <meshStandardMaterial color="#8d8b83" roughness={0.78} />
        </mesh>
        <group position={[0, 0.86, -0.08]} userData={{ interactableId: 'faucet_bathroom' }}>
          <mesh castShadow position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.17, 8]} />
            <meshStandardMaterial color="#777e82" metalness={0.65} roughness={0.32} />
          </mesh>
          <mesh castShadow position={[0, 0.16, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.14, 8]} />
            <meshStandardMaterial color="#777e82" metalness={0.65} roughness={0.32} />
          </mesh>
        </group>
      </group>

      <mesh
        position={[1.98, 1.58, -2.915]}
        userData={{ interactableId: 'mirror' }}
      >
        <planeGeometry args={[0.92, 0.72]} />
        <meshStandardMaterial color="#65717a" metalness={0.72} roughness={0.18} />
      </mesh>

      <group position={[3.02, 0, -2.52]} userData={{ interactableId: 'shower' }}>
        <mesh castShadow position={[0, 1.08, 0.36]}>
          <boxGeometry args={[0.68, 2.08, 0.05]} />
          <meshStandardMaterial color="#7b8991" transparent opacity={0.22} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[-0.34, 1.08, 0]}>
          <boxGeometry args={[0.05, 2.08, 0.72]} />
          <meshStandardMaterial color="#7b8991" transparent opacity={0.2} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[0.18, 2.0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.04, 12]} />
          <meshStandardMaterial color="#70787b" metalness={0.55} roughness={0.35} />
        </mesh>
      </group>

      <group position={[1.96, 0, -1.4]}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.28, 0.22, 0.48, 12]} />
          <meshStandardMaterial color="#b7b4aa" roughness={0.72} />
        </mesh>
        <mesh castShadow position={[0, 0.55, -0.08]}>
          <boxGeometry args={[0.52, 0.12, 0.58]} />
          <meshStandardMaterial color="#c2beb2" roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

function Kitchen() {
  return (
    <group>
      <group position={[-3.02, 0, 1.3]}>
        <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
          <boxGeometry args={[0.62, 2.0, 0.95]} />
          <meshStandardMaterial color="#777a76" roughness={0.88} />
        </mesh>
        <mesh position={[0.32, 1.42, 0.04]} rotation={[0, Math.PI / 2, 0]} userData={{ interactableId: 'fridge_note' }}>
          <planeGeometry args={[0.42, 0.52]} />
          <meshStandardMaterial color="#d6d0b8" roughness={1} />
        </mesh>
        <mesh position={[0.335, 0.88, -0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.32, 6]} />
          <meshStandardMaterial color="#333636" metalness={0.38} roughness={0.5} />
        </mesh>
      </group>

      <group position={[-1.88, 0, 2.57]}>
        <mesh castShadow receiveShadow position={[0, 0.48, 0]}>
          <boxGeometry args={[1.55, 0.92, 0.54]} />
          <meshStandardMaterial color="#4d4540" roughness={1} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.97, 0]}>
          <boxGeometry args={[1.63, 0.08, 0.6]} />
          <meshStandardMaterial color="#77726a" roughness={0.72} />
        </mesh>

        <group position={[0.28, 1.05, -0.02]} userData={{ interactableId: 'coffee' }}>
          <mesh castShadow position={[0, 0.2, 0]}>
            <boxGeometry args={[0.34, 0.42, 0.32]} />
            <meshStandardMaterial color="#1d2021" roughness={0.58} />
          </mesh>
          <mesh castShadow position={[0, 0.42, 0.02]}>
            <boxGeometry args={[0.25, 0.08, 0.26]} />
            <meshStandardMaterial color="#3b3f40" roughness={0.48} />
          </mesh>
          <mesh position={[0, 0.1, -0.19]}>
            <cylinderGeometry args={[0.08, 0.07, 0.16, 10]} />
            <meshStandardMaterial color="#786c5d" roughness={0.86} />
          </mesh>
        </group>

        <mesh castShadow position={[-0.5, 1.1, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.18, 10]} />
          <meshStandardMaterial color="#554a40" roughness={0.9} />
        </mesh>
      </group>

      <mesh position={[-2.45, 0.015, 1.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.012, 6, 20, Math.PI * 1.55]} />
        <meshStandardMaterial color="#17191b" roughness={0.82} />
      </mesh>
    </group>
  )
}

function Hallway({ textures }: { textures: SceneTextures }) {
  const badgeTaken = useGameStore((state) => Boolean(state.flags.badge_taken))

  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        position={[0.92, 1.08, 2.91]}
        userData={{ interactableId: 'door_exit' }}
      >
        <boxGeometry args={[0.94, 2.16, 0.1]} />
        <meshStandardMaterial color="#332c28" roughness={0.94} />
      </mesh>
      <mesh position={[1.27, 1.08, 2.84]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#81735b" metalness={0.55} roughness={0.38} />
      </mesh>

      {!badgeTaken && (
        <group position={[0.22, 1.52, 2.86]} rotation={[0, Math.PI, 0]} userData={{ interactableId: 'badge' }}>
          <mesh castShadow>
            <boxGeometry args={[0.46, 0.3, 0.035]} />
            <meshStandardMaterial color="#c9d1bd" roughness={0.78} />
          </mesh>
          <mesh position={[0, 0, -0.019]}>
            <planeGeometry args={[0.42, 0.26]} />
            <meshBasicMaterial map={textures.badge} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.18, 6]} />
            <meshStandardMaterial color="#3e3d39" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      )}

      <group position={[1.82, 1.92, 2.88]} rotation={[0, Math.PI, 0]} userData={{ interactableId: 'clock' }}>
        <mesh castShadow>
          <boxGeometry args={[0.52, 0.42, 0.055]} />
          <meshStandardMaterial color="#1b1e20" roughness={0.86} />
        </mesh>
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[0.45, 0.34]} />
          <meshBasicMaterial map={textures.clock} />
        </mesh>
      </group>

      <group position={[2.75, 1.48, 2.885]} rotation={[0, Math.PI, 0]} userData={{ interactableId: 'frame' }}>
        <mesh castShadow>
          <boxGeometry args={[0.76, 0.92, 0.06]} />
          <meshStandardMaterial color="#382d26" roughness={0.96} />
        </mesh>
        <mesh position={[0, 0, -0.032]}>
          <planeGeometry args={[0.63, 0.76]} />
          <meshStandardMaterial color="#6a6256" roughness={1} />
        </mesh>
        <mesh position={[-0.22, -0.34, -0.037]} rotation={[0, 0, 0.18]}>
          <boxGeometry args={[0.24, 0.025, 0.02]} />
          <meshStandardMaterial color="#161412" roughness={1} />
        </mesh>
      </group>

      <group position={[2.65, 0, 2.58]}>
        <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
          <boxGeometry args={[1.15, 0.78, 0.42]} />
          <meshStandardMaterial color="#443a32" roughness={1} />
        </mesh>
        <mesh castShadow position={[0, 0.86, 0]}>
          <boxGeometry args={[1.22, 0.08, 0.46]} />
          <meshStandardMaterial color="#64574a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

export function ApartmentScene() {
  const textures = useSceneTextures()

  return (
    <>
      <fog attach="fog" args={['#0d1017', 8, 40]} />
      <ambientLight color="#9cabc0" intensity={0.25} />
      <directionalLight
        castShadow
        color="#b8c7d9"
        intensity={1.45}
        position={[-4.5, 6.5, -5.5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight color="#e4c58d" intensity={0.55} distance={5} position={[2.45, 2.25, -1.85]} />

      <Cityscape />
      <Architecture textures={textures} />
      <Bedroom />
      <Bathroom textures={textures} />
      <Kitchen />
      <Hallway textures={textures} />
    </>
  )
}
