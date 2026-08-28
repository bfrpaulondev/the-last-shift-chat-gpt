import { useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BusPassengers } from './BusPassengers'

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function BusSeat({ x, z, rotationY }: { x: number; z: number; rotationY: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]} raycast={() => null}>
      <RoundedBox args={[0.58, 0.12, 0.56]} radius={0.08} smoothness={3} position={[0, 0.47, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#36505a" roughness={0.76} metalness={0.03} />
      </RoundedBox>
      <RoundedBox args={[0.58, 0.7, 0.12]} radius={0.07} smoothness={3} position={[0, 0.82, 0.25]} castShadow>
        <meshStandardMaterial color="#334c56" roughness={0.8} />
      </RoundedBox>
      <mesh position={[0.08, 0.84, 0.316]} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[0.3, 0.075]} />
        <meshStandardMaterial color="#aaa9a2" roughness={0.68} />
      </mesh>
      <mesh position={[-0.19, 0.22, 0.08]}>
        <cylinderGeometry args={[0.025, 0.025, 0.45, 8]} />
        <meshStandardMaterial color="#727979" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0.19, 0.22, 0.08]}>
        <cylinderGeometry args={[0.025, 0.025, 0.45, 8]} />
        <meshStandardMaterial color="#727979" metalness={0.75} roughness={0.3} />
      </mesh>
    </group>
  )
}

function WetWindow({ x, z, rotationY }: { x: number; z: number; rotationY: number }) {
  const drops = useRef<THREE.Group>(null)
  const streaks = useMemo(() => Array.from({ length: 12 }, (_, index) => ({
    x: -0.45 + seeded(index, z + 3) * 0.9,
    y: -0.26 + seeded(index, z + 9) * 0.55,
    length: 0.08 + seeded(index, z + 17) * 0.24,
  })), [z])

  useFrame(({ clock }) => {
    if (!drops.current) return
    drops.current.children.forEach((child, index) => {
      child.position.y -= (0.035 + seeded(index, 41) * 0.04) * 0.016
      if (child.position.y < -0.35) child.position.y = 0.35 + seeded(index, 45) * 0.08
      child.position.x += Math.sin(clock.elapsedTime * 0.15 + index) * 0.00003
    })
  })

  return (
    <group position={[x, 1.63, z]} rotation={[0, rotationY, 0]} raycast={() => null}>
      <mesh>
        <planeGeometry args={[1.0, 0.78]} />
        <meshPhysicalMaterial color="#78909a" transparent opacity={0.19} roughness={0.09} transmission={0.48} thickness={0.018} clearcoat={0.9} clearcoatRoughness={0.05} depthWrite={false} />
      </mesh>
      {streaks.map((streak, index) => (
        <mesh key={index} position={[streak.x, streak.y, 0.006]} rotation={[0, 0, -0.05]}>
          <planeGeometry args={[0.006, streak.length]} />
          <meshBasicMaterial color="#d9e6e9" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      ))}
      <group ref={drops} position={[0, 0, 0.01]}>
        {Array.from({ length: 8 }, (_, index) => (
          <mesh key={index} position={[-0.4 + seeded(index, 51) * 0.8, -0.25 + seeded(index, 52) * 0.55, 0]}>
            <sphereGeometry args={[0.014 + seeded(index, 53) * 0.012, 7, 5]} />
            <meshPhysicalMaterial color="#dce9ed" transparent opacity={0.18} transmission={0.35} roughness={0.03} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function MovingCity() {
  const group = useRef<THREE.Group>(null)
  const buildings = useMemo(() => Array.from({ length: 22 }, (_, index) => ({
    side: index % 2 === 0 ? -1 : 1,
    z: -35 + index * 3.5,
    width: 2.3 + seeded(index, 4) * 2.2,
    height: 4 + seeded(index, 7) * 8,
    depth: 2.8 + seeded(index, 12) * 2,
  })), [])

  useFrame((_, delta) => {
    if (!group.current) return
    const travel = Math.min(delta, 0.05) * 5.4
    group.current.children.forEach((child) => {
      child.position.z += travel
      if (child.position.z > 38) child.position.z -= 77
    })
  })

  return (
    <group ref={group} raycast={() => null}>
      {buildings.map((building, index) => (
        <group key={index} position={[building.side * 8.5, 0, building.z]}>
          <mesh position={[0, building.height / 2 - 0.3, 0]}>
            <boxGeometry args={[building.width, building.height, building.depth]} />
            <meshStandardMaterial color={index % 4 === 0 ? '#29323a' : '#20282e'} roughness={0.8} />
          </mesh>
          {Array.from({ length: 3 }, (_, row) => (
            <mesh key={row} position={[-building.side * (building.width / 2 + 0.01), 2 + row * 1.6, 0]} rotation={[0, building.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
              <planeGeometry args={[1.7, 0.55]} />
              <meshStandardMaterial color="#17242b" emissive={index % 9 === row ? '#a99359' : '#101a20'} emissiveIntensity={index % 9 === row ? 0.35 : 0.04} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function BusInteriorShell() {
  const seats = [-2.75, -1.7, -0.65, 0.4, 1.45, 2.5]
  const windows = [-2.9, -1.75, -0.6, 0.55, 1.7, 2.85]

  return (
    <group>
      <mesh position={[0, -0.055, 0]} receiveShadow>
        <boxGeometry args={[2.45, 0.11, 8.9]} />
        <meshStandardMaterial color="#3b4140" roughness={0.86} metalness={0.05} />
      </mesh>
      <mesh position={[0, 2.48, 0]} receiveShadow>
        <boxGeometry args={[2.45, 0.1, 8.9]} />
        <meshStandardMaterial color="#d1d1c6" roughness={0.76} />
      </mesh>
      <mesh position={[-1.23, 1.15, 0]}>
        <boxGeometry args={[0.09, 2.3, 8.9]} />
        <meshStandardMaterial color="#c6c8bf" roughness={0.7} />
      </mesh>
      <mesh position={[1.23, 1.15, 0]}>
        <boxGeometry args={[0.09, 2.3, 8.9]} />
        <meshStandardMaterial color="#c6c8bf" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.15, -4.45]}>
        <boxGeometry args={[2.45, 2.3, 0.1]} />
        <meshStandardMaterial color="#c7c7bb" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.15, 4.45]}>
        <boxGeometry args={[2.45, 2.3, 0.1]} />
        <meshStandardMaterial color="#c7c7bb" roughness={0.72} />
      </mesh>

      {seats.map((z, index) => (
        <group key={z}>
          <BusSeat x={-0.83} z={z} rotationY={index < 3 ? Math.PI : 0} />
          <BusSeat x={0.83} z={z} rotationY={index < 3 ? Math.PI : 0} />
        </group>
      ))}

      {windows.map((z) => (
        <group key={z}>
          <WetWindow x={-1.279} z={z} rotationY={Math.PI / 2} />
          <WetWindow x={1.279} z={z} rotationY={-Math.PI / 2} />
        </group>
      ))}

      {[-0.72, 0.72].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.14, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 8.2, 10]} />
            <meshStandardMaterial color="#b9b8ac" metalness={0.78} roughness={0.24} />
          </mesh>
          {[-2.6, -1.3, 0, 1.3, 2.6].map((z) => (
            <mesh key={z} position={[x, 1.52, z]}>
              <cylinderGeometry args={[0.022, 0.022, 1.15, 8]} />
              <meshStandardMaterial color="#a9aba2" metalness={0.74} roughness={0.28} />
            </mesh>
          ))}
        </group>
      ))}

      <mesh position={[0.92, 1.56, 3.72]} userData={{ busInteractableId: 'stop-bell' }}>
        <boxGeometry args={[0.13, 0.16, 0.055]} />
        <meshStandardMaterial color="#d1b33d" roughness={0.42} />
      </mesh>
      <mesh position={[0.92, 1.56, 3.69]}>
        <circleGeometry args={[0.035, 14]} />
        <meshStandardMaterial color="#a62828" emissive="#ca3434" emissiveIntensity={0.2} />
      </mesh>

      <mesh position={[-0.34, 0.008, 1.85]} rotation={[-Math.PI / 2, 0, 0.15]} raycast={() => null}>
        <circleGeometry args={[0.26, 30]} />
        <meshStandardMaterial color="#4e3930" transparent opacity={0.42} roughness={0.98} />
      </mesh>
      <mesh position={[0.98, 1.95, 0.15]} raycast={() => null}>
        <planeGeometry args={[0.35, 1.4]} />
        <meshStandardMaterial color="#d1ccaf" roughness={0.88} />
      </mesh>
    </group>
  )
}

export function BusScene() {
  return (
    <>
      <color attach="background" args={['#15202a']} />
      <fog attach="fog" args={['#17222b', 8, 55]} />
      <ambientLight color="#9aabb6" intensity={0.28} />
      <hemisphereLight color="#9aafbd" groundColor="#292725" intensity={0.4} />
      <rectAreaLight position={[0, 2.25, 0]} rotation={[Math.PI / 2, 0, 0]} width={1.8} height={7.4} color="#d7d8c8" intensity={1.05} />
      <BusInteriorShell />
      <BusPassengers />
      <MovingCity />
    </>
  )
}
