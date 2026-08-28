import { useGameStore } from '../../state/gameStore'

export function BlackoutScene() {
  const emergencyLightOn = useGameStore((state) => Boolean(state.flags.blackout_emergency_light_on))
  const recoveryComplete = useGameStore((state) => Boolean(state.flags.blackout_recovery_complete))

  return (
    <group name="blackout-recovery-scene">
      <color attach="background" args={['#010203']} />
      <fog attach="fog" args={['#010203', 2.5, emergencyLightOn ? 18 : 9]} />
      <ambientLight color="#6f7f8c" intensity={emergencyLightOn ? 0.055 : 0.012} />
      <pointLight
        position={[-2.8, 2.1, 0.8]}
        color="#b9322f"
        intensity={emergencyLightOn ? 0.72 : 0.03}
        distance={8}
        decay={2}
      />
      <pointLight
        position={[0, 2.2, -5.5]}
        color="#718593"
        intensity={recoveryComplete ? 0.17 : 0.04}
        distance={6}
        decay={2}
      />

      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[9.6, 0.16, 13]} />
        <meshStandardMaterial color="#171b1e" roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh receiveShadow position={[0, 2.62, 0]}>
        <boxGeometry args={[9.6, 0.16, 13]} />
        <meshStandardMaterial color="#22272a" roughness={0.92} />
      </mesh>
      <mesh position={[-4.78, 1.28, 0]}><boxGeometry args={[0.22, 2.7, 13]} /><meshStandardMaterial color="#2b3034" roughness={0.8} /></mesh>
      <mesh position={[4.78, 1.28, 0]}><boxGeometry args={[0.22, 2.7, 13]} /><meshStandardMaterial color="#2b3034" roughness={0.8} /></mesh>
      <mesh position={[0, 1.28, -6.42]}><boxGeometry args={[9.6, 2.7, 0.22]} /><meshStandardMaterial color="#2b3034" roughness={0.8} /></mesh>

      <group position={[0, 1.12, 6.3]}>
        <mesh castShadow><boxGeometry args={[2.5, 2.28, 0.14]} /><meshStandardMaterial color="#373f45" metalness={0.58} roughness={0.42} /></mesh>
        <mesh castShadow position={[0, 0, -0.08]}><boxGeometry args={[0.055, 2.1, 0.08]} /><meshStandardMaterial color="#15191c" roughness={0.7} /></mesh>
      </group>

      <group position={[-3.2, 0, -0.4]}>
        <mesh castShadow position={[0, 0.5, 0]} rotation={[0, 0, -0.28]}>
          <boxGeometry args={[1.35, 1.05, 0.9]} />
          <meshStandardMaterial color="#3b454b" roughness={0.62} metalness={0.24} />
        </mesh>
        <mesh castShadow position={[-0.65, 0.18, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.12, 12]} />
          <meshStandardMaterial color="#15191c" roughness={0.72} />
        </mesh>
      </group>

      <group position={[3.15, 0, -0.2]}>
        <mesh castShadow position={[0, 0.55, 0]}><boxGeometry args={[1.45, 1.1, 0.8]} /><meshStandardMaterial color="#363c40" roughness={0.7} metalness={0.16} /></mesh>
        <mesh castShadow position={[0, 1.18, 0]}><boxGeometry args={[1.2, 0.12, 0.66]} /><meshStandardMaterial color="#252a2d" roughness={0.8} /></mesh>
      </group>

      <group position={[0, 0.72, 1.55]} userData={{ blackoutInteractableId: 'brace-point' }}>
        <mesh visible={false}><boxGeometry args={[1.7, 1.2, 0.6]} /><meshStandardMaterial /></mesh>
      </group>

      <group position={[-2.85, 1.5, 0.82]} userData={{ blackoutInteractableId: 'emergency-light' }}>
        <mesh castShadow><boxGeometry args={[0.68, 0.82, 0.18]} /><meshStandardMaterial color="#30383d" roughness={0.58} metalness={0.22} /></mesh>
        <mesh position={[0, 0.08, -0.11]}><boxGeometry args={[0.42, 0.28, 0.08]} /><meshStandardMaterial color={emergencyLightOn ? '#c2463f' : '#552321'} emissive={emergencyLightOn ? '#8b1c18' : '#160807'} emissiveIntensity={emergencyLightOn ? 0.72 : 0.08} roughness={0.42} /></mesh>
      </group>

      <group position={[0.92, 1.28, 6.17]} userData={{ blackoutInteractableId: 'elevator-panel' }}>
        <mesh castShadow><boxGeometry args={[0.36, 0.72, 0.16]} /><meshStandardMaterial color="#252c31" metalness={0.4} roughness={0.5} /></mesh>
        <mesh position={[0, 0.16, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 14]} />
          <meshStandardMaterial color="#303438" roughness={0.48} metalness={0.44} />
        </mesh>
      </group>

      <group position={[0, 1.18, -6.24]} userData={{ blackoutInteractableId: 'fire-door' }}>
        <mesh castShadow><boxGeometry args={[2.2, 2.35, 0.14]} /><meshStandardMaterial color="#323a3f" metalness={0.32} roughness={0.58} /></mesh>
        <mesh castShadow position={[0.78, -0.02, -0.12]}><boxGeometry args={[0.48, 0.08, 0.1]} /><meshStandardMaterial color="#737b7f" metalness={0.72} roughness={0.28} /></mesh>
        <mesh position={[0, 0.96, -0.13]}><boxGeometry args={[1.15, 0.22, 0.06]} /><meshStandardMaterial color="#1e3f2b" emissive={recoveryComplete ? '#295c38' : '#132219'} emissiveIntensity={recoveryComplete ? 0.28 : 0.04} roughness={0.65} /></mesh>
      </group>

      <mesh position={[-2.85, 2.38, 0.82]}>
        <boxGeometry args={[1.35, 0.08, 0.26]} />
        <meshStandardMaterial color="#63211e" emissive="#5b1614" emissiveIntensity={emergencyLightOn ? 0.5 : 0.02} roughness={0.82} />
      </mesh>
    </group>
  )
}
