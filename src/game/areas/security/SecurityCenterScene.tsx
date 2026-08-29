import { useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

function Steam() {
  const [material] = useState(() => new THREE.MeshBasicMaterial({ color: '#dfe9ed', transparent: true, opacity: 0.12, depthWrite: false }))
  useFrame(({ clock }) => {
    material.opacity = 0.08 + Math.sin(clock.elapsedTime * 1.7) * 0.025
  })
  return <mesh position={[3.05, 1.14, 0.4]} material={material}><sphereGeometry args={[0.12, 10, 8]} /></mesh>
}

export function SecurityCenterScene() {
  const overrideReleased = useGameStore((state) => Boolean(state.flags.all_doors_released))
  const [observationActive, setObservationActive] = useState(false)

  useEffect(() => {
    const onObservation = () => {
      setObservationActive(true)
      window.setTimeout(() => setObservationActive(false), 1000)
    }
    window.addEventListener('security:observation', onObservation)
    return () => window.removeEventListener('security:observation', onObservation)
  }, [])

  return (
    <group name="security-center-scene">
      <color attach="background" args={['#020608']} />
      <fog attach="fog" args={['#020608', 5, 24]} />
      <ambientLight color="#5b7080" intensity={0.045} />
      <pointLight position={[0, 2.35, -4.9]} color="#75b9d8" intensity={0.75} distance={9} decay={2} />
      <pointLight position={[-3.2, 1.8, -4.8]} color="#86c7e4" intensity={0.24} distance={5} decay={2} />

      <mesh receiveShadow position={[0, -0.08, 0]}><boxGeometry args={[10.4, 0.16, 13.4]} /><meshStandardMaterial color="#151a1e" roughness={0.93} /></mesh>
      <mesh receiveShadow position={[0, 2.7, 0]}><boxGeometry args={[10.4, 0.16, 13.4]} /><meshStandardMaterial color="#22282c" roughness={0.9} /></mesh>
      <mesh position={[-5.08, 1.3, 0]}><boxGeometry args={[0.22, 2.7, 13.4]} /><meshStandardMaterial color="#2d3439" roughness={0.82} /></mesh>
      <mesh position={[5.08, 1.3, 0]}><boxGeometry args={[0.22, 2.7, 13.4]} /><meshStandardMaterial color="#2d3439" roughness={0.82} /></mesh>
      <mesh position={[0, 1.3, -6.58]}><boxGeometry args={[10.4, 2.7, 0.22]} /><meshStandardMaterial color="#20272b" roughness={0.85} /></mesh>

      <group position={[0, 1.62, -6.38]}>
        {Array.from({ length: 9 }, (_, index) => {
          const col = index % 3
          const row = Math.floor(index / 3)
          const live = index === 1
          const observed = index === 6 && observationActive
          return (
            <group key={index} position={[(col - 1) * 1.55, (1 - row) * 0.72, 0]} userData={live ? { securityInteractableId: 'cam-02' } : undefined}>
              <mesh castShadow><boxGeometry args={[1.34, 0.62, 0.11]} /><meshStandardMaterial color="#15191c" metalness={0.5} roughness={0.42} /></mesh>
              <mesh position={[0, 0, -0.065]}>
                <planeGeometry args={[1.18, 0.5]} />
                <meshStandardMaterial
                  color={observed ? '#d5e3e7' : live ? '#376477' : '#07090a'}
                  emissive={observed ? '#b9d8df' : live ? '#2b6175' : '#000000'}
                  emissiveIntensity={observed ? 1.4 : live ? 0.82 : 0}
                  roughness={0.38}
                />
              </mesh>
              {observed && <mesh position={[0, -0.02, -0.075]}><planeGeometry args={[0.16, 0.42]} /><meshBasicMaterial color="#08090a" /></mesh>}
            </group>
          )
        })}
      </group>

      <group position={[-0.7, 0, -2.0]}>
        <mesh castShadow position={[0, 0.78, 0]}><boxGeometry args={[6.2, 0.14, 1.15]} /><meshStandardMaterial color="#343c42" roughness={0.48} metalness={0.22} /></mesh>
        <mesh castShadow position={[-2.7, 0.38, 0]}><boxGeometry args={[0.16, 0.76, 0.9]} /><meshStandardMaterial color="#1f2529" metalness={0.45} roughness={0.5} /></mesh>
        <mesh castShadow position={[2.7, 0.38, 0]}><boxGeometry args={[0.16, 0.76, 0.9]} /><meshStandardMaterial color="#1f2529" metalness={0.45} roughness={0.5} /></mesh>
      </group>

      <group position={[-1.45, 0, -0.75]}>
        <mesh castShadow position={[0, 0.48, 0]} rotation={[0, 0.18, 0]}><boxGeometry args={[0.7, 0.12, 0.72]} /><meshStandardMaterial color="#2d3337" roughness={0.7} /></mesh>
        <mesh castShadow position={[0, 0.92, 0.18]} rotation={[0.08, 0.18, 0]}><boxGeometry args={[0.68, 0.75, 0.12]} /><meshStandardMaterial color="#30363a" roughness={0.72} /></mesh>
      </group>
      <group position={[0.25, 0, -0.7]}>
        <mesh castShadow position={[0, 0.5, 0]} rotation={[0, -0.42, 0]}><boxGeometry args={[0.7, 0.12, 0.72]} /><meshStandardMaterial color="#30363a" roughness={0.7} /></mesh>
        <mesh castShadow position={[0, 0.92, 0.18]} rotation={[0.1, -0.42, 0]}><boxGeometry args={[0.68, 0.75, 0.12]} /><meshStandardMaterial color="#353b3f" roughness={0.7} /></mesh>
      </group>

      <group position={[3.05, 0, 0.4]}>
        <mesh castShadow position={[0, 0.62, 0]}><boxGeometry args={[1.2, 1.15, 0.75]} /><meshStandardMaterial color="#444b4f" roughness={0.5} metalness={0.28} /></mesh>
        <mesh castShadow position={[0, 1.02, -0.2]}><cylinderGeometry args={[0.22, 0.18, 0.36, 14]} /><meshStandardMaterial color="#d8dad7" roughness={0.62} /></mesh>
        <Steam />
      </group>

      <group position={[3.85, 1.42, -2.0]} userData={{ securityInteractableId: 'fire-override' }}>
        <mesh castShadow><boxGeometry args={[1.35, 1.65, 0.18]} /><meshStandardMaterial color="#4a3130" metalness={0.26} roughness={0.58} /></mesh>
        <mesh position={[0, 0.44, -0.12]}><boxGeometry args={[0.86, 0.22, 0.08]} /><meshStandardMaterial color="#1c2022" roughness={0.45} /></mesh>
        <mesh position={[0, -0.18, -0.14]} rotation={[0, 0, overrideReleased ? Math.PI / 2 : 0]}><boxGeometry args={[0.12, 0.52, 0.08]} /><meshStandardMaterial color="#a8aeb0" metalness={0.78} roughness={0.25} /></mesh>
        <mesh position={[0.42, -0.48, -0.13]}><sphereGeometry args={[0.08, 12, 8]} /><meshStandardMaterial color={overrideReleased ? '#5bc56b' : '#d6903b'} emissive={overrideReleased ? '#2d8e42' : '#7a4213'} emissiveIntensity={0.8} /></mesh>
      </group>

      <group position={[-3.65, 1.0, -1.9]} userData={{ securityInteractableId: 'radio-base' }}>
        <mesh castShadow><boxGeometry args={[0.86, 0.48, 0.5]} /><meshStandardMaterial color="#20262a" roughness={0.58} metalness={0.25} /></mesh>
      </group>
      <group position={[-2.4, 0.86, -1.92]} userData={{ securityInteractableId: 'duty-schedule' }}><mesh><boxGeometry args={[0.72, 0.04, 0.92]} /><meshStandardMaterial color="#d5cfb9" roughness={0.8} /></mesh></group>
      <group position={[1.65, 0.86, -1.92]} userData={{ securityInteractableId: 'migration-checklist' }}><mesh><boxGeometry args={[0.72, 0.04, 0.92]} /><meshStandardMaterial color="#c9d0d2" roughness={0.78} /></mesh></group>
      <group position={[3.35, 1.1, -1.9]} userData={{ securityInteractableId: 'terminal-locked' }}><mesh><boxGeometry args={[1.15, 0.72, 0.12]} /><meshStandardMaterial color="#101416" emissive="#0b1d13" emissiveIntensity={0.18} /></mesh></group>

      <mesh castShadow position={[0.7, 0.14, -0.45]} rotation={[0.12, 0, -0.18]}><torusGeometry args={[0.22, 0.035, 8, 16]} /><meshStandardMaterial color="#171b1e" roughness={0.62} /></mesh>
    </group>
  )
}
