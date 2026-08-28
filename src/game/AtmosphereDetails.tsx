import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import {
  createFamilyPhotoTexture,
  createFridgeNoteTexture,
} from './materials/proceduralTextures'

function DetailedBuilding({
  x,
  z,
  width,
  height,
  depth,
  seed,
}: {
  x: number
  z: number
  width: number
  height: number
  depth: number
  seed: number
}) {
  const windows = useMemo(() => {
    const rows = Math.max(3, Math.floor(height / 1.45))
    const columns = Math.max(2, Math.floor(width / 1.2))
    const result: Array<{ x: number; y: number; lit: boolean }> = []

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const hash = Math.sin((row + 1) * 13.31 + (column + 1) * 7.17 + seed) * 43758.5
        result.push({
          x: -width * 0.42 + (column / Math.max(1, columns - 1)) * width * 0.84,
          y: 0.72 + row * 1.38,
          lit: hash - Math.floor(hash) > 0.72,
        })
      }
    }

    return result
  }, [height, seed, width])

  return (
    <group position={[x, -0.55, z]}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#0a0d12" roughness={0.82} metalness={0.08} />
      </mesh>

      {windows.map((window, index) => (
        <mesh key={index} position={[window.x, window.y, depth / 2 + 0.012]}>
          <planeGeometry args={[0.34, 0.48]} />
          <meshBasicMaterial
            color={window.lit ? '#c7b879' : '#15202a'}
            transparent
            opacity={window.lit ? 0.9 : 0.52}
            toneMapped={false}
          />
        </mesh>
      ))}

      <mesh position={[0, height + 0.18, 0]}>
        <boxGeometry args={[width * 0.34, 0.36, depth * 0.38]} />
        <meshStandardMaterial color="#13171c" roughness={0.88} />
      </mesh>
    </group>
  )
}

function EnhancedExterior() {
  const buildings = useMemo(() => [
    { x: -9.5, z: -12, width: 3.8, height: 9.5, depth: 3.2, seed: 3 },
    { x: -5.4, z: -15.5, width: 4.3, height: 16, depth: 4.1, seed: 7 },
    { x: -0.8, z: -13.5, width: 3.2, height: 11.5, depth: 3.6, seed: 11 },
    { x: 6.6, z: -16.5, width: 4.7, height: 19, depth: 4.5, seed: 17 },
    { x: 11.8, z: -20.5, width: 5.8, height: 24, depth: 5.3, seed: 23 },
  ], [])

  return (
    <group>
      <mesh position={[0, -0.72, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 28]} />
        <meshStandardMaterial color="#10161a" roughness={0.28} metalness={0.34} />
      </mesh>

      {buildings.map((building) => (
        <DetailedBuilding key={`${building.x}-${building.z}`} {...building} />
      ))}

      {[-5.5, 0, 5.5].map((x, index) => (
        <group key={x} position={[x, 0, -7.5 - index * 1.8]}>
          <mesh position={[0, 1.7, 0]}>
            <cylinderGeometry args={[0.035, 0.045, 3.4, 8]} />
            <meshStandardMaterial color="#252b30" metalness={0.48} roughness={0.5} />
          </mesh>
          <mesh position={[0, 3.38, 0]}>
            <sphereGeometry args={[0.11, 12, 8]} />
            <meshBasicMaterial color="#e4c28a" toneMapped={false} />
          </mesh>
          <pointLight color="#d8b57f" intensity={0.28} distance={4.8} decay={2} position={[0, 3.3, 0]} />
        </group>
      ))}

      <mesh position={[-1.3, 1.25, -4.1]} rotation={[0, 0, -0.02]}>
        <planeGeometry args={[6.6, 1.4]} />
        <meshBasicMaterial color="#56616a" transparent opacity={0.06} depthWrite={false} />
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
