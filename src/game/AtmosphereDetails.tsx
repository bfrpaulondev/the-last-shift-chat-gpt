import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  createFamilyPhotoTexture,
  createFridgeNoteTexture,
} from './materials/proceduralTextures'

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function DetailedBuilding({
  x,
  z,
  width,
  height,
  depth,
  seed,
  color,
}: {
  x: number
  z: number
  width: number
  height: number
  depth: number
  seed: number
  color: string
}) {
  const beacon = useRef<THREE.Mesh>(null)
  const windows = useMemo(() => {
    const rows = Math.max(4, Math.floor(height / 1.25))
    const columns = Math.max(2, Math.floor(width / 1.05))
    const result: Array<{ x: number; y: number; lit: boolean; warm: boolean }> = []

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const hash = seeded(row * 31 + column * 17 + seed, seed)
        result.push({
          x: -width * 0.42 + (column / Math.max(1, columns - 1)) * width * 0.84,
          y: 0.72 + row * 1.18,
          lit: hash > 0.67,
          warm: seeded(column * 13 + row * 7, seed + 5) > 0.42,
        })
      }
    }

    return result
  }, [height, seed, width])

  useFrame(({ clock }) => {
    if (!beacon.current) {
      return
    }
    const material = beacon.current.material as THREE.MeshBasicMaterial
    const pulse = Math.max(0, Math.sin(clock.elapsedTime * 2.4 + seed) - 0.82) * 5.4
    material.opacity = pulse
  })

  return (
    <group position={[x, -0.55, z]}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.78} metalness={0.12} />
      </mesh>

      <mesh position={[0, height + 0.14, 0]}>
        <boxGeometry args={[width * 0.44, 0.28, depth * 0.46]} />
        <meshStandardMaterial color="#13181d" roughness={0.72} metalness={0.18} />
      </mesh>

      <mesh position={[width * 0.16, height + 0.52, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 0.78, 8]} />
        <meshStandardMaterial color="#2a3137" metalness={0.62} roughness={0.42} />
      </mesh>
      <mesh ref={beacon} position={[width * 0.16, height + 0.94, 0]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshBasicMaterial color="#ff3b31" transparent opacity={0} toneMapped={false} />
      </mesh>

      <group position={[0, height + 0.24, 0]}>
        <mesh position={[-width * 0.18, 0.28, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.55, 10]} />
          <meshStandardMaterial color="#242a2d" roughness={0.68} metalness={0.22} />
        </mesh>
        <mesh position={[width * 0.06, 0.24, depth * 0.08]}>
          <boxGeometry args={[0.48, 0.36, 0.42]} />
          <meshStandardMaterial color="#1b2024" roughness={0.82} />
        </mesh>
      </group>

      {windows.map((window, index) => (
        <mesh key={index} position={[window.x, window.y, depth / 2 + 0.012]}>
          <planeGeometry args={[0.31, 0.44]} />
          <meshBasicMaterial
            color={window.lit ? (window.warm ? '#d7b77b' : '#96b7c6') : '#101b23'}
            transparent
            opacity={window.lit ? 0.84 : 0.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function MovingTraffic() {
  const eastbound = useRef<THREE.Group>(null)
  const westbound = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (eastbound.current) {
      eastbound.current.position.x += delta * 2.15
      if (eastbound.current.position.x > 9.5) {
        eastbound.current.position.x = -9.5
      }
    }
    if (westbound.current) {
      westbound.current.position.x -= delta * 1.65
      if (westbound.current.position.x < -9.5) {
        westbound.current.position.x = 9.5
      }
    }
  })

  return (
    <group position={[0, -0.46, -7.6]}>
      <group ref={eastbound} position={[-7, 0, 0]}>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.78, 0.28, 0.36]} />
          <meshStandardMaterial color="#202a33" roughness={0.38} metalness={0.32} />
        </mesh>
        <mesh position={[0.34, 0.16, 0.2]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshBasicMaterial color="#fff0bb" toneMapped={false} />
        </mesh>
        <mesh position={[0.34, 0.16, -0.2]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshBasicMaterial color="#fff0bb" toneMapped={false} />
        </mesh>
      </group>

      <group ref={westbound} position={[5, 0.04, -0.7]}>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.92, 0.3, 0.38]} />
          <meshStandardMaterial color="#2a2323" roughness={0.42} metalness={0.24} />
        </mesh>
        <mesh position={[-0.39, 0.16, 0.2]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshBasicMaterial color="#d92721" toneMapped={false} />
        </mesh>
        <mesh position={[-0.39, 0.16, -0.2]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshBasicMaterial color="#d92721" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function EnhancedExterior() {
  const buildings = useMemo(() => [
    { x: -12.5, z: -18.5, width: 5.4, height: 22, depth: 4.8, seed: 2, color: '#0b1015' },
    { x: -8.4, z: -12.5, width: 3.8, height: 10.8, depth: 3.4, seed: 3, color: '#11171c' },
    { x: -5.1, z: -16.4, width: 4.2, height: 17.2, depth: 4.2, seed: 7, color: '#0d1217' },
    { x: -1.1, z: -13.6, width: 3.3, height: 12.6, depth: 3.7, seed: 11, color: '#10161a' },
    { x: 3.8, z: -18.8, width: 5.1, height: 21.5, depth: 4.8, seed: 15, color: '#0a1014' },
    { x: 7.4, z: -15.8, width: 4.5, height: 18.8, depth: 4.3, seed: 17, color: '#0c1217' },
    { x: 12.2, z: -21.2, width: 6.2, height: 26.5, depth: 5.5, seed: 23, color: '#080d12' },
  ], [])

  return (
    <group>
      <mesh position={[0, -0.72, -13]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[34, 32]} />
        <meshPhysicalMaterial
          color="#0d1519"
          roughness={0.18}
          metalness={0.34}
          clearcoat={0.36}
          clearcoatRoughness={0.18}
        />
      </mesh>

      <mesh position={[0, -0.69, -7.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 4.6]} />
        <meshPhysicalMaterial
          color="#11171b"
          roughness={0.12}
          metalness={0.42}
          clearcoat={0.5}
          clearcoatRoughness={0.16}
        />
      </mesh>

      {[-5.2, 0, 5.2].map((x) => (
        <mesh key={x} position={[x, -0.665, -7.78]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 0.035]} />
          <meshBasicMaterial color="#8d8875" transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}

      {buildings.map((building) => (
        <DetailedBuilding key={`${building.x}-${building.z}`} {...building} />
      ))}

      {[-6.6, -2.2, 2.2, 6.6].map((x, index) => (
        <group key={x} position={[x, 0, -6.4 - (index % 2) * 0.5]}>
          <mesh position={[0, 1.72, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 3.45, 8]} />
            <meshStandardMaterial color="#252d31" metalness={0.52} roughness={0.46} />
          </mesh>
          <mesh position={[0.08, 3.36, 0]} rotation={[0, 0, -0.35]}>
            <capsuleGeometry args={[0.07, 0.26, 4, 8]} />
            <meshBasicMaterial color="#e9c98d" toneMapped={false} />
          </mesh>
          <pointLight color="#d7b47b" intensity={0.23} distance={5.4} decay={2} position={[0, 3.25, 0]} />
        </group>
      ))}

      <MovingTraffic />

      <mesh position={[-1.3, 2.05, -10.2]}>
        <planeGeometry args={[24, 7]} />
        <meshBasicMaterial color="#455566" transparent opacity={0.035} depthWrite={false} />
      </mesh>
      <mesh position={[-1.3, 4.8, -19]}>
        <planeGeometry args={[34, 11]} />
        <meshBasicMaterial color="#52606e" transparent opacity={0.026} depthWrite={false} />
      </mesh>
    </group>
  )
}

function StoryPropTextures() {
  const textures = useMemo(() => ({
    fridgeNote: createFridgeNoteTexture(),
    familyPhoto: createFamilyPhotoTexture(),
  }), [])

  useEffect(() => () => {
    textures.fridgeNote.dispose()
    textures.familyPhoto.dispose()
  }, [textures])

  return (
    <group>
      <group position={[-2.697, 1.42, 1.34]} rotation={[0, Math.PI / 2, 0]}>
        <mesh raycast={() => null} position={[0, 0, 0.003]}>
          <planeGeometry args={[0.39, 0.5]} />
          <meshStandardMaterial map={textures.fridgeNote} roughness={0.88} />
        </mesh>
        <mesh raycast={() => null} position={[-0.14, 0.205, 0.014]}>
          <circleGeometry args={[0.027, 12]} />
          <meshStandardMaterial color="#8f3130" roughness={0.52} />
        </mesh>
        <mesh raycast={() => null} position={[0.14, 0.205, 0.014]}>
          <circleGeometry args={[0.027, 12]} />
          <meshStandardMaterial color="#2f5d79" roughness={0.52} />
        </mesh>
      </group>

      <group position={[2.75, 1.48, 2.885]} rotation={[0, Math.PI, 0]}>
        <mesh raycast={() => null} position={[0, 0, 0.041]} renderOrder={4}>
          <planeGeometry args={[0.61, 0.74]} />
          <meshStandardMaterial map={textures.familyPhoto} roughness={0.62} />
        </mesh>
        <mesh raycast={() => null} position={[0.02, 0.01, 0.046]} renderOrder={5}>
          <planeGeometry args={[0.58, 0.7]} />
          <meshPhysicalMaterial
            color="#d7e4e8"
            transparent
            opacity={0.07}
            roughness={0.08}
            transmission={0.12}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  )
}

export function AtmosphereDetails() {
  return (
    <>
      <EnhancedExterior />
      <StoryPropTextures />
    </>
  )
}
