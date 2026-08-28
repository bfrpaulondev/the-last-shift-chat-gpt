import { useMemo } from 'react'

function LockerBank({ x, side }: { x: number; side: 'left' | 'right' }) {
  const lockers = useMemo(() => Array.from({ length: 6 }, (_, index) => index), [])

  return (
    <group position={[x, 0, -0.4]} rotation={[0, side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}>
      {lockers.map((index) => (
        <group key={index} position={[0, 1.05, -2.55 + index * 1.02]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.48, 2.1, 0.9]} />
            <meshStandardMaterial color="#445057" metalness={0.72} roughness={0.34} />
          </mesh>
          <mesh position={[0.245, 0.2, 0]} raycast={() => null}>
            <boxGeometry args={[0.02, 0.42, 0.38]} />
            <meshStandardMaterial color="#10171b" metalness={0.5} roughness={0.28} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function PlayerLocker() {
  return (
    <group position={[-3.95, 0, -2.95]}>
      <mesh position={[0, 1.08, 0]} userData={{ lockerInteractableId: 'player-locker' }} castShadow>
        <boxGeometry args={[1.15, 2.16, 0.56]} />
        <meshStandardMaterial color="#59656b" metalness={0.68} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.72, 0.292]} raycast={() => null}>
        <planeGeometry args={[0.6, 0.22]} />
        <meshStandardMaterial color="#d4d8d7" emissive="#d4d8d7" emissiveIntensity={0.18} />
      </mesh>
    </group>
  )
}

function RouteBoard() {
  return (
    <group position={[3.92, 0, -2.4]}>
      <mesh position={[0, 1.38, 0]} userData={{ lockerInteractableId: 'route-board' }} castShadow>
        <boxGeometry args={[1.36, 1.68, 0.12]} />
        <meshStandardMaterial color="#263136" metalness={0.32} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.42, 0.066]} raycast={() => null}>
        <planeGeometry args={[1.08, 1.34]} />
        <meshStandardMaterial color="#d9d5c8" roughness={0.86} />
      </mesh>
    </group>
  )
}

function ServiceDoor() {
  return (
    <group position={[0, 0, -5.12]}>
      <mesh position={[0, 1.25, 0]} userData={{ lockerInteractableId: 'service-door' }} castShadow>
        <boxGeometry args={[2.3, 2.5, 0.18]} />
        <meshStandardMaterial color="#303a3f" metalness={0.58} roughness={0.34} />
      </mesh>
      <mesh position={[0.82, 1.18, 0.105]} raycast={() => null}>
        <boxGeometry args={[0.11, 0.44, 0.1]} />
        <meshStandardMaterial color="#a7b1b3" metalness={0.9} roughness={0.18} />
      </mesh>
    </group>
  )
}

export function LockerScene() {
  return (
    <>
      <color attach="background" args={['#111619']} />
      <fog attach="fog" args={['#111619', 12, 34]} />
      <ambientLight color="#9eb0b6" intensity={0.22} />
      <hemisphereLight color="#a3b9c0" groundColor="#26211d" intensity={0.3} />
      <directionalLight position={[-3, 7, 4]} color="#c9dde2" intensity={0.72} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12.4, 11.2]} />
        <meshStandardMaterial color="#343b3d" metalness={0.08} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.75, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow raycast={() => null}>
        <planeGeometry args={[12.4, 11.2]} />
        <meshStandardMaterial color="#242b2e" roughness={0.9} />
      </mesh>

      <LockerBank x={-4.45} side="left" />
      <LockerBank x={4.45} side="right" />
      <PlayerLocker />
      <RouteBoard />
      <ServiceDoor />

      <mesh position={[0, 0.27, -0.2]} castShadow receiveShadow raycast={() => null}>
        <boxGeometry args={[3.45, 0.54, 0.72]} />
        <meshStandardMaterial color="#4a4139" roughness={0.68} />
      </mesh>
      <mesh position={[0, 2.66, 0]} raycast={() => null}>
        <boxGeometry args={[4.2, 0.08, 0.72]} />
        <meshStandardMaterial color="#e9f4f3" emissive="#dcebea" emissiveIntensity={1.12} toneMapped={false} />
      </mesh>
    </>
  )
}
