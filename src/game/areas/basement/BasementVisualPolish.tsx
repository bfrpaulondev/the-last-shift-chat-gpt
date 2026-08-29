import { Text } from '@react-three/drei'
import { useMemo } from 'react'

const PARKING_EXTENSION_COUNT = 27
const DUST_COUNT = 60

function ParkingDepthExtension() {
  const bays = useMemo(() => {
    const positions: Array<[number, number]> = []
    const columns = [-7.0, -3.5, 0, 3.5, 7.0]

    for (let index = 0; index < PARKING_EXTENSION_COUNT; index += 1) {
      const row = Math.floor(index / columns.length)
      const column = index % columns.length
      positions.push([columns[column], 18.2 + row * 4.3])
    }

    return positions
  }, [])

  return (
    <group name="basement-parking-30-bays">
      <mesh position={[0, -0.075, 29.5]} receiveShadow>
        <boxGeometry args={[18, 0.12, 29]} />
        <meshStandardMaterial color="#1d2022" roughness={0.98} />
      </mesh>

      {bays.map(([x, z], index) => (
        <group key={`${x}-${z}-${index}`} position={[x, 0.012, z]}>
          <mesh position={[-1.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.045, 3.8]} />
            <meshBasicMaterial color="#8f896a" />
          </mesh>
          <mesh position={[1.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.045, 3.8]} />
            <meshBasicMaterial color="#8f896a" />
          </mesh>
        </group>
      ))}

      <Text position={[-7.5, 2.35, 15.35]} rotation={[0, Math.PI, 0]} fontSize={0.22} color="#8f938c">
        B1 — 30 VAGAS
      </Text>
    </group>
  )
}

function ArchiveDust() {
  const positions = useMemo(() => {
    const values = new Float32Array(DUST_COUNT * 3)
    let seed = 4471

    const random = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    for (let index = 0; index < DUST_COUNT; index += 1) {
      values[index * 3] = -7.8 + random() * 15.6
      values[index * 3 + 1] = 0.3 + random() * 2.25
      values[index * 3 + 2] = -15.2 + random() * 6.1
    }

    return values
  }, [])

  return (
    <points name="archive-dust-60">
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#b8b1a0" transparent opacity={0.28} depthWrite={false} />
    </points>
  )
}

export function BasementVisualPolish() {
  return (
    <>
      <ParkingDepthExtension />
      <ArchiveDust />
    </>
  )
}
