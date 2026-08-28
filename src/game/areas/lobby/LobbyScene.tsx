import { useMemo } from 'react'

function ReceptionDesk() {
  return (
    <group position={[0, 0, -2.9]}>
      <mesh position={[0, 0.58, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 1.16, 0.95]} />
        <meshStandardMaterial color="#1c2228" metalness={0.46} roughness={0.32} />
      </mesh>
      <mesh position={[0, 1.12, 0.38]} userData={{ lobbyInteractableId: 'security-desk' }}>
        <boxGeometry args={[2.5, 0.12, 0.46]} />
        <meshStandardMaterial color="#77828a" metalness={0.72} roughness={0.22} />
      </mesh>
      <mesh position={[-1.34, 1.1, 0.28]} userData={{ lobbyInteractableId: 'badge-reader' }}>
        <boxGeometry args={[0.48, 0.18, 0.38]} />
        <meshStandardMaterial color="#11181d" emissive="#174d38" emissiveIntensity={0.42} metalness={0.5} roughness={0.28} />
      </mesh>
      <mesh position={[1.28, 1.48, -0.02]} castShadow>
        <boxGeometry args={[0.82, 0.52, 0.08]} />
        <meshStandardMaterial color="#151c21" emissive="#263a43" emissiveIntensity={0.18} roughness={0.3} />
      </mesh>
    </group>
  )
}

function Directory() {
  return (
    <group position={[-4.65, 0, -0.2]}>
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[1.72, 2.6, 0.14]} />
        <meshStandardMaterial color="#272f34" metalness={0.56} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.45, 0.078]} userData={{ lobbyInteractableId: 'directory' }}>
        <planeGeometry args={[1.42, 2.28]} />
        <meshStandardMaterial color="#c3c8c5" emissive="#687478" emissiveIntensity={0.08} roughness={0.72} />
      </mesh>
    </group>
  )
}

function ServiceCorridorDoor() {
  return (
    <group position={[4.65, 0, -3.95]}>
      <mesh position={[0, 1.25, 0]} userData={{ lobbyInteractableId: 'b1-door' }} castShadow>
        <boxGeometry args={[1.85, 2.5, 0.16]} />
        <meshStandardMaterial color="#30383d" metalness={0.62} roughness={0.34} />
      </mesh>
      <mesh position={[0.7, 1.22, 0.11]}>
        <boxGeometry args={[0.2, 0.1, 0.08]} />
        <meshStandardMaterial color="#9ba5a7" metalness={0.9} roughness={0.16} />
      </mesh>
      <mesh position={[0, 2.78, 0.1]}>
        <planeGeometry args={[1.42, 0.35]} />
        <meshStandardMaterial color="#11171b" emissive="#d7dedc" emissiveIntensity={0.66} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Benches() {
  const seats = useMemo(() => [-2.25, 2.25], [])
  return (
    <group raycast={() => null}>
      {seats.map((x) => (
        <group key={x} position={[x, 0, 2.2]}>
          <mesh position={[0, 0.47, 0]} castShadow>
            <boxGeometry args={[1.55, 0.14, 0.54]} />
            <meshStandardMaterial color="#263139" metalness={0.5} roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.92, 0.23]} castShadow>
            <boxGeometry args={[1.55, 0.72, 0.12]} />
            <meshStandardMaterial color="#263139" metalness={0.5} roughness={0.42} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function LobbyScene() {
  return (
    <>
      <color attach="background" args={['#0b1015']} />
      <fog attach="fog" args={['#10171d', 12, 32]} />
      <ambientLight color="#80909b" intensity={0.22} />
      <hemisphereLight color="#9aabb5" groundColor="#20252a" intensity={0.32} />
      <directionalLight position={[-4, 8, 5]} color="#d0dde2" intensity={0.52} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[0, 3.2, -2.2]} color="#d6e5e8" intensity={0.95} distance={9} decay={2} />
      <pointLight position={[4, 2.8, -3.1]} color="#b8c6ca" intensity={0.55} distance={6} decay={2} />

      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshPhysicalMaterial color="#32383c" roughness={0.2} metalness={0.16} clearcoat={0.65} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, 3.35, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow raycast={() => null}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1b2228" roughness={0.82} />
      </mesh>
      <mesh position={[0, 1.65, -5.75]} receiveShadow raycast={() => null}>
        <boxGeometry args={[12, 3.4, 0.3]} />
        <meshStandardMaterial color="#20282e" roughness={0.7} />
      </mesh>
      <mesh position={[-5.85, 1.65, 0]} receiveShadow raycast={() => null}>
        <boxGeometry args={[0.3, 3.4, 12]} />
        <meshStandardMaterial color="#20282e" roughness={0.72} />
      </mesh>
      <mesh position={[5.85, 1.65, 0]} receiveShadow raycast={() => null}>
        <boxGeometry args={[0.3, 3.4, 12]} />
        <meshStandardMaterial color="#20282e" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.65, 5.75]} receiveShadow raycast={() => null}>
        <boxGeometry args={[12, 3.4, 0.3]} />
        <meshPhysicalMaterial color="#25333a" metalness={0.35} roughness={0.24} transparent opacity={0.86} transmission={0.12} />
      </mesh>

      <ReceptionDesk />
      <Directory />
      <ServiceCorridorDoor />
      <Benches />
    </>
  )
}
