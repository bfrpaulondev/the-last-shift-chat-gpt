import { useGameStore } from '../../state/gameStore'

export function Floor37Scene() {
  const suppliesReady = useGameStore((state) => Boolean(state.flags.floor37_supplies_ready))
  const windowCleaned = useGameStore((state) => Boolean(state.flags.floor37_window_cleaned))
  const binEmptied = useGameStore((state) => Boolean(state.flags.floor37_bin_emptied))
  const blackoutTriggered = useGameStore((state) => Boolean(state.flags.floor37_blackout_triggered))

  const lightIntensity = blackoutTriggered ? 0.05 : 0.55
  const ambientIntensity = blackoutTriggered ? 0.025 : 0.15

  return (
    <group name="floor-37-scene">
      <color attach="background" args={[blackoutTriggered ? '#020304' : '#0b1118']} />
      <fog attach="fog" args={[blackoutTriggered ? '#020304' : '#0b1118', 8, 30]} />
      <ambientLight color="#a9bbca" intensity={ambientIntensity} />
      <directionalLight position={[2, 6, 3]} color="#d7e6f2" intensity={blackoutTriggered ? 0.03 : 0.5} castShadow />

      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[11.4, 0.16, 15]} />
        <meshStandardMaterial color="#20262c" roughness={0.92} metalness={0.03} />
      </mesh>
      <mesh receiveShadow position={[0, 2.7, 0]}>
        <boxGeometry args={[11.4, 0.16, 15]} />
        <meshStandardMaterial color="#d4d9dd" roughness={0.88} />
      </mesh>
      <mesh position={[-5.7, 1.3, 0]}><boxGeometry args={[0.22, 2.7, 15]} /><meshStandardMaterial color="#424b53" roughness={0.7} /></mesh>
      <mesh position={[5.7, 1.3, 0]}><boxGeometry args={[0.22, 2.7, 15]} /><meshStandardMaterial color="#424b53" roughness={0.7} /></mesh>
      <mesh position={[0, 1.3, -7.4]}><boxGeometry args={[11.4, 2.7, 0.22]} /><meshStandardMaterial color="#424b53" roughness={0.7} /></mesh>

      <group position={[0, 1.35, -7.22]} userData={{ floor37InteractableId: 'window-panel' }}>
        <mesh>
          <boxGeometry args={[6.8, 2.15, 0.08]} />
          <meshStandardMaterial
            color={windowCleaned ? '#7893a5' : '#5f6f79'}
            roughness={windowCleaned ? 0.12 : 0.5}
            metalness={0.04}
            transparent
            opacity={windowCleaned ? 0.28 : 0.48}
          />
        </mesh>
      </group>

      <group position={[-3.75, 0, -2.0]}>
        <mesh castShadow position={[0, 0.74, 0]}><boxGeometry args={[2.8, 0.12, 1.35]} /><meshStandardMaterial color="#656d73" roughness={0.46} metalness={0.16} /></mesh>
        <mesh castShadow position={[-1.15, 0.37, 0]}><boxGeometry args={[0.12, 0.74, 1.1]} /><meshStandardMaterial color="#30363b" metalness={0.48} roughness={0.48} /></mesh>
        <mesh castShadow position={[1.15, 0.37, 0]}><boxGeometry args={[0.12, 0.74, 1.1]} /><meshStandardMaterial color="#30363b" metalness={0.48} roughness={0.48} /></mesh>
      </group>

      <group position={[3.65, 0, -2.15]}>
        <mesh castShadow position={[0, 0.72, 0]}><boxGeometry args={[2.4, 0.12, 1.2]} /><meshStandardMaterial color="#5c646a" roughness={0.5} metalness={0.14} /></mesh>
        <mesh castShadow position={[0, 1.16, -0.38]}><boxGeometry args={[1.9, 0.74, 0.1]} /><meshStandardMaterial color="#252c32" roughness={0.35} /></mesh>
      </group>

      <group position={[-3.8, 0, 2.05]} userData={{ floor37InteractableId: 'supply-cart' }}>
        <mesh castShadow position={[0, 0.72, 0]}><boxGeometry args={[1.35, 1.4, 0.9]} /><meshStandardMaterial color="#4c565d" roughness={0.58} metalness={0.25} /></mesh>
        <mesh castShadow position={[0, 1.47, 0]}><boxGeometry args={[1.05, 0.18, 0.68]} /><meshStandardMaterial color={suppliesReady ? '#72887a' : '#3d454b'} roughness={0.48} /></mesh>
      </group>

      <group position={[3.7, 0, 2.1]} userData={{ floor37InteractableId: 'waste-bin' }}>
        <mesh castShadow position={[0, 0.55, 0]}><cylinderGeometry args={[0.48, 0.42, 1.1, 16]} /><meshStandardMaterial color="#383f44" roughness={0.62} metalness={0.24} /></mesh>
        {!binEmptied && (
          <mesh castShadow position={[0, 1.12, 0]}><sphereGeometry args={[0.42, 12, 10]} /><meshStandardMaterial color="#25282a" roughness={0.9} /></mesh>
        )}
      </group>

      <group position={[2.95, 1.42, 4.55]} userData={{ floor37InteractableId: 'final-order' }}>
        <mesh castShadow><boxGeometry args={[1.45, 1.05, 0.08]} /><meshStandardMaterial color="#d9d2bd" roughness={0.74} /></mesh>
      </group>

      <group position={[0, 1.15, 7.22]} userData={{ floor37InteractableId: 'elevator-call' }}>
        <mesh castShadow><boxGeometry args={[2.3, 2.3, 0.12]} /><meshStandardMaterial color="#535c64" metalness={0.58} roughness={0.38} /></mesh>
        <mesh castShadow position={[1.35, 0.15, -0.02]}><boxGeometry args={[0.22, 0.55, 0.14]} /><meshStandardMaterial color="#22282d" metalness={0.4} roughness={0.45} /></mesh>
        <mesh castShadow position={[1.35, 0.15, -0.11]}><cylinderGeometry args={[0.075, 0.075, 0.04, 16]} /><meshStandardMaterial color={blackoutTriggered ? '#481414' : '#b9c7ce'} emissive={blackoutTriggered ? '#5d0909' : '#64747d'} emissiveIntensity={blackoutTriggered ? 0.55 : 0.18} metalness={0.5} roughness={0.28} rotation={[Math.PI / 2, 0, 0]} /></mesh>
      </group>

      {[-3.8, 0, 3.8].map((x) => (
        <mesh key={x} position={[x, 2.51, 0]}>
          <boxGeometry args={[2.55, 0.08, 0.28]} />
          <meshStandardMaterial color="#e6edf3" emissive="#e6edf3" emissiveIntensity={lightIntensity} roughness={0.82} />
        </mesh>
      ))}
    </group>
  )
}
