import { useGameStore } from '../../state/gameStore'

export function StairwellScene() {
  const descended = useGameStore((state) => Boolean(state.flags.stairwell_first_descent))
  const phoneChecked = useGameStore((state) => Boolean(state.flags.stairwell_phone_checked))

  return (
    <group name="emergency-stairwell-scene">
      <color attach="background" args={['#050607']} />
      <fog attach="fog" args={['#050607', 4, 19]} />
      <ambientLight color="#6c7174" intensity={0.055} />
      <pointLight position={[-2.8, 2.2, 4.9]} color="#c83a2a" intensity={0.42} distance={7} decay={2} />
      <pointLight position={[2.8, 2.2, -4.9]} color="#c83a2a" intensity={descended ? 0.5 : 0.2} distance={7} decay={2} />

      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[8.4, 0.16, 14.6]} />
        <meshStandardMaterial color="#202326" roughness={0.96} metalness={0.03} />
      </mesh>
      <mesh receiveShadow position={[0, 2.65, 0]}>
        <boxGeometry args={[8.4, 0.16, 14.6]} />
        <meshStandardMaterial color="#25282a" roughness={0.94} />
      </mesh>
      <mesh position={[-4.15, 1.28, 0]}><boxGeometry args={[0.24, 2.7, 14.6]} /><meshStandardMaterial color="#33383c" roughness={0.86} /></mesh>
      <mesh position={[4.15, 1.28, 0]}><boxGeometry args={[0.24, 2.7, 14.6]} /><meshStandardMaterial color="#33383c" roughness={0.86} /></mesh>
      <mesh position={[0, 1.28, -7.25]}><boxGeometry args={[8.4, 2.7, 0.24]} /><meshStandardMaterial color="#33383c" roughness={0.86} /></mesh>
      <mesh position={[0, 1.28, 7.25]}><boxGeometry args={[8.4, 2.7, 0.24]} /><meshStandardMaterial color="#33383c" roughness={0.86} /></mesh>

      <group position={[0, 0, 0]}>
        <mesh castShadow position={[0, 0.48, 0]}><boxGeometry args={[2.2, 0.96, 1.5]} /><meshStandardMaterial color="#2b3034" roughness={0.7} metalness={0.18} /></mesh>
        <mesh castShadow position={[0, 1.12, 0]}><boxGeometry args={[1.9, 0.18, 1.2]} /><meshStandardMaterial color="#3d4449" roughness={0.66} metalness={0.28} /></mesh>
      </group>

      <group position={[-2.95, 1.38, 4.25]} userData={{ stairwellInteractableId: 'emergency-plan' }}>
        <mesh castShadow><boxGeometry args={[1.35, 1.05, 0.08]} /><meshStandardMaterial color="#d2c9ab" roughness={0.76} /></mesh>
      </group>

      <group position={[0, 1.05, 2.7]} userData={{ stairwellInteractableId: 'upper-descent' }}>
        <mesh castShadow><boxGeometry args={[2.3, 2.1, 0.14]} /><meshStandardMaterial color="#4b5054" roughness={0.48} metalness={0.34} /></mesh>
        <mesh castShadow position={[0.85, 0, -0.1]}><boxGeometry args={[0.11, 0.11, 0.16]} /><meshStandardMaterial color="#a6acaf" roughness={0.24} metalness={0.78} /></mesh>
      </group>

      <group position={[2.9, 1.25, -3.0]} userData={{ stairwellInteractableId: 'emergency-phone' }}>
        <mesh castShadow><boxGeometry args={[0.82, 1.3, 0.24]} /><meshStandardMaterial color="#5b2420" roughness={0.58} metalness={0.12} /></mesh>
        <mesh castShadow position={[0, 0.05, -0.18]}><boxGeometry args={[0.36, 0.72, 0.2]} /><meshStandardMaterial color={phoneChecked ? '#202326' : '#111315'} roughness={0.6} /></mesh>
      </group>

      <group position={[0, 1.05, -5.7]} userData={{ stairwellInteractableId: 'lower-descent' }}>
        <mesh castShadow><boxGeometry args={[2.3, 2.1, 0.14]} /><meshStandardMaterial color="#454a4e" roughness={0.5} metalness={0.32} /></mesh>
        <mesh castShadow position={[-0.85, 0, -0.1]}><boxGeometry args={[0.11, 0.11, 0.16]} /><meshStandardMaterial color="#a6acaf" roughness={0.24} metalness={0.78} /></mesh>
      </group>

      {[-2.7, 2.7].map((x, index) => (
        <mesh key={x} position={[x, 2.42, index === 0 ? 4.9 : -4.9]}>
          <boxGeometry args={[1.5, 0.12, 0.38]} />
          <meshStandardMaterial color="#9f3329" emissive="#7f120c" emissiveIntensity={0.72} roughness={0.78} />
        </mesh>
      ))}
    </group>
  )
}
