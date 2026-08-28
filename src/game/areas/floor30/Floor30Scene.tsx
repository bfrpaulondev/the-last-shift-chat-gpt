import { useGameStore } from '../../state/gameStore'

export function Floor30Scene() {
  const glassCleaned = useGameStore((state) => Boolean(state.flags.floor30_glass_cleaned))
  const stationRestocked = useGameStore((state) => Boolean(state.flags.floor30_station_restocked))

  return (
    <group name="floor-30-scene">
      <color attach="background" args={['#11161c']} />
      <fog attach="fog" args={['#11161c', 8, 28]} />
      <ambientLight color="#b9c7d8" intensity={0.18} />
      <directionalLight position={[2, 6, 3]} color="#dbe8f4" intensity={0.65} castShadow />

      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[11, 0.16, 14]} />
        <meshStandardMaterial color="#252b31" roughness={0.9} metalness={0.04} />
      </mesh>
      <mesh receiveShadow position={[0, 2.65, 0]}>
        <boxGeometry args={[11, 0.16, 14]} />
        <meshStandardMaterial color="#d9dde0" roughness={0.86} />
      </mesh>
      <mesh position={[-5.5, 1.3, 0]}><boxGeometry args={[0.22, 2.7, 14]} /><meshStandardMaterial color="#4d555c" roughness={0.72} /></mesh>
      <mesh position={[5.5, 1.3, 0]}><boxGeometry args={[0.22, 2.7, 14]} /><meshStandardMaterial color="#4d555c" roughness={0.72} /></mesh>
      <mesh position={[0, 1.3, -6.9]}><boxGeometry args={[11, 2.7, 0.22]} /><meshStandardMaterial color="#4d555c" roughness={0.72} /></mesh>

      <group position={[-3.5, 0, -2.15]}>
        <mesh castShadow position={[0, 0.72, 0]}><boxGeometry args={[3, 0.12, 1.3]} /><meshStandardMaterial color="#6d7378" roughness={0.48} metalness={0.18} /></mesh>
        <mesh castShadow position={[-1.25, 0.36, 0]}><boxGeometry args={[0.12, 0.72, 1.1]} /><meshStandardMaterial color="#31363a" metalness={0.5} roughness={0.48} /></mesh>
        <mesh castShadow position={[1.25, 0.36, 0]}><boxGeometry args={[0.12, 0.72, 1.1]} /><meshStandardMaterial color="#31363a" metalness={0.5} roughness={0.48} /></mesh>
      </group>

      <group position={[3.1, 0, -2.65]}>
        <mesh castShadow position={[0, 0.72, 0]}><boxGeometry args={[3.1, 0.12, 1.3]} /><meshStandardMaterial color="#727a80" roughness={0.45} metalness={0.2} /></mesh>
        <mesh castShadow position={[0, 1.38, -0.45]}><boxGeometry args={[2.5, 1.05, 0.08]} /><meshStandardMaterial color="#aeb9c1" roughness={0.22} metalness={0.05} transparent opacity={glassCleaned ? 0.28 : 0.5} /></mesh>
      </group>

      <group position={[-3.55, 0, 1.75]} userData={{ floor30InteractableId: 'supply-station' }}>
        <mesh castShadow position={[0, 0.65, 0]}><boxGeometry args={[1.1, 1.3, 0.8]} /><meshStandardMaterial color="#565d62" roughness={0.62} metalness={0.25} /></mesh>
        <mesh castShadow position={[0, 1.38, 0]}><boxGeometry args={[0.82, 0.18, 0.58]} /><meshStandardMaterial color={stationRestocked ? '#72847b' : '#454b50'} roughness={0.52} /></mesh>
      </group>

      <group position={[3.05, 1.34, -2.15]} userData={{ floor30InteractableId: 'glass-panel' }}>
        <mesh><boxGeometry args={[2.6, 1.15, 0.12]} /><meshStandardMaterial color={glassCleaned ? '#7d969f' : '#657077'} roughness={glassCleaned ? 0.12 : 0.46} metalness={0.08} /></mesh>
      </group>

      <group position={[2.8, 1.42, 2.4]} userData={{ floor30InteractableId: 'service-sheet' }}>
        <mesh castShadow><boxGeometry args={[1.35, 1.0, 0.08]} /><meshStandardMaterial color="#d7d0b9" roughness={0.72} /></mesh>
      </group>

      <group position={[0, 1.15, 6.72]} userData={{ floor30InteractableId: 'elevator-return' }}>
        <mesh castShadow><boxGeometry args={[2.25, 2.3, 0.12]} /><meshStandardMaterial color="#596169" metalness={0.55} roughness={0.4} /></mesh>
        <mesh castShadow position={[0.84, 0, -0.12]}><boxGeometry args={[0.1, 0.1, 0.14]} /><meshStandardMaterial color="#b7bec2" metalness={0.8} roughness={0.24} /></mesh>
      </group>

      {[-3.7, 0, 3.7].map((x) => (
        <mesh key={x} position={[x, 2.48, 0]}>
          <boxGeometry args={[2.5, 0.08, 0.28]} />
          <meshStandardMaterial color="#e7edf2" emissive="#e7edf2" emissiveIntensity={0.48} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}
