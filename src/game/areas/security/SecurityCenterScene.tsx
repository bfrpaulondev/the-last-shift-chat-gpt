import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'
import { SecurityCameraFeed } from './SecurityCameraFeed'
import { SecurityObservationMonitor } from './SecurityObservationMonitor'

function DarkMonitor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} raycast={() => null}>
      <mesh castShadow>
        <boxGeometry args={[1.38, 0.88, 0.1]} />
        <meshStandardMaterial color="#20262a" roughness={0.42} metalness={0.48} />
      </mesh>
      <mesh position={[0, 0, 0.058]}>
        <planeGeometry args={[1.2, 0.675]} />
        <meshStandardMaterial color="#040607" emissive="#030506" emissiveIntensity={0.04} roughness={0.22} />
      </mesh>
    </group>
  )
}

function OperatorChair() {
  const root = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (root.current) root.current.rotation.y += delta * 0.08
  })

  return (
    <group ref={root} position={[-1.45, 0, -0.65]} raycast={() => null}>
      <mesh castShadow position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.42, 0.4, 0.12, 16]} />
        <meshStandardMaterial color="#1c2023" roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[0, 1.03, 0.24]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.7, 0.82, 0.12]} />
        <meshStandardMaterial color="#1c2023" roughness={0.74} metalness={0.1} />
      </mesh>
      <mesh castShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.5, 10]} />
        <meshStandardMaterial color="#555d62" roughness={0.38} metalness={0.7} />
      </mesh>
      {[0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6].map((angle) => (
        <mesh
          key={angle}
          castShadow
          position={[Math.sin(angle) * 0.32, 0.08, Math.cos(angle) * 0.32]}
          rotation={[0, angle, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.025, 0.025, 0.58, 8]} />
          <meshStandardMaterial color="#43494d" roughness={0.45} metalness={0.68} />
        </mesh>
      ))}
    </group>
  )
}

function CoffeeSteam() {
  const puffs = useRef<Array<THREE.Mesh | null>>([])

  useFrame(({ clock }) => {
    puffs.current.forEach((puff, index) => {
      if (!puff) return
      const phase = (clock.elapsedTime * 0.22 + index / 3) % 1
      puff.position.y = 1.16 + phase * 0.55
      puff.position.x = 2.75 + Math.sin(clock.elapsedTime * 0.8 + index) * 0.035
      puff.scale.setScalar(0.045 + phase * 0.08)
      ;(puff.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.13
    })
  })

  return (
    <group raycast={() => null}>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(node) => { puffs.current[index] = node }}
          position={[2.75, 1.2, -1.7]}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#c5d2d2" transparent opacity={0.1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function FiremanOverride() {
  const key = useRef<THREE.Group>(null)
  const handAction = useGameStore((state) => state.handAction)
  const released = useGameStore((state) => Boolean(state.flags.all_doors_released))

  useFrame((_, delta) => {
    if (!key.current) return
    let target = released ? -Math.PI / 2 : 0
    if (handAction?.objectId === 'fireman-override') {
      const progress = THREE.MathUtils.clamp(
        (performance.now() - handAction.startedAt) / handAction.durationMs,
        0,
        1,
      )
      target = -Math.PI / 2 * (progress * progress * (3 - 2 * progress))
    }
    key.current.rotation.z = THREE.MathUtils.damp(key.current.rotation.z, target, 12, Math.min(delta, 0.05))
  })

  return (
    <group
      position={[4.87, 1.35, 0.45]}
      rotation={[0, -Math.PI / 2, 0]}
      userData={{ securityInteractableId: 'fireman-override' }}
    >
      <mesh castShadow>
        <boxGeometry args={[1.3, 1.65, 0.16]} />
        <meshStandardMaterial color="#353a3d" roughness={0.56} metalness={0.42} />
      </mesh>
      <mesh position={[0, 0.52, -0.1]}>
        <boxGeometry args={[0.7, 0.24, 0.04]} />
        <meshStandardMaterial color="#171b1e" roughness={0.4} />
      </mesh>
      <group ref={key} position={[0, 0.02, -0.14]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.12, 14]} />
          <meshStandardMaterial color="#b4b6b4" roughness={0.3} metalness={0.78} />
        </mesh>
        <mesh castShadow position={[0, 0.19, 0]}>
          <boxGeometry args={[0.09, 0.38, 0.08]} />
          <meshStandardMaterial color="#c0c1bd" roughness={0.28} metalness={0.78} />
        </mesh>
      </group>
      <mesh position={[-0.35, -0.55, -0.105]}>
        <sphereGeometry args={[0.07, 12, 8]} />
        <meshStandardMaterial
          color={released ? '#4aff79' : '#c27b22'}
          emissive={released ? '#25ff5b' : '#c26d13'}
          emissiveIntensity={released ? 1.6 : 0.55}
        />
      </mesh>
    </group>
  )
}

export function SecurityCenterScene() {
  const released = useGameStore((state) => Boolean(state.flags.all_doors_released))
  const darkMonitors: Array<[number, number, number]> = [
    [-1.18, 2.62, -6.16], [0.2, 2.62, -6.16], [1.58, 2.62, -6.16],
    [0.2, 1.82, -6.16],
    [-1.18, 1.02, -6.16], [0.2, 1.02, -6.16], [1.58, 1.02, -6.16],
  ]

  return (
    <group name="part3-security-center-39">
      <color attach="background" args={['#030608']} />
      <fog attach="fog" args={['#030608', 7, 24]} />
      <ambientLight color="#6b7680" intensity={0.045} />
      <pointLight position={[0.2, 2.2, -5.3]} color="#6db9d0" intensity={1.05} distance={8} decay={2} />
      <pointLight position={[4.2, 1.9, 0.5]} color={released ? '#5dff87' : '#bf812e'} intensity={0.24} distance={3.5} decay={2} />

      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[10.4, 0.16, 13.4]} />
        <meshStandardMaterial color="#171b1e" roughness={0.94} metalness={0.04} />
      </mesh>
      <mesh receiveShadow position={[0, 2.82, 0]}>
        <boxGeometry args={[10.4, 0.16, 13.4]} />
        <meshStandardMaterial color="#23272a" roughness={0.9} />
      </mesh>
      <mesh position={[-5.08, 1.36, 0]}><boxGeometry args={[0.24, 2.8, 13.4]} /><meshStandardMaterial color="#2b3033" roughness={0.84} /></mesh>
      <mesh position={[5.08, 1.36, 0]}><boxGeometry args={[0.24, 2.8, 13.4]} /><meshStandardMaterial color="#2b3033" roughness={0.84} /></mesh>
      <mesh position={[0, 1.36, -6.58]}><boxGeometry args={[10.4, 2.8, 0.24]} /><meshStandardMaterial color="#252a2d" roughness={0.86} /></mesh>
      <mesh position={[0, 1.36, 6.58]}><boxGeometry args={[10.4, 2.8, 0.24]} /><meshStandardMaterial color="#252a2d" roughness={0.86} /></mesh>

      <mesh position={[0.2, 2.22, -6.25]} raycast={() => null}>
        <boxGeometry args={[4.55, 3.0, 0.08]} />
        <meshStandardMaterial color="#14191c" roughness={0.5} metalness={0.38} />
      </mesh>
      {darkMonitors.map((position) => <DarkMonitor key={position.join(':')} position={position} />)}
      <SecurityCameraFeed />
      <SecurityObservationMonitor />

      <group position={[-0.65, 0, -2.05]}>
        <mesh castShadow position={[0, 0.82, 0]}><boxGeometry args={[6.65, 0.16, 1.1]} /><meshStandardMaterial color="#343a3e" roughness={0.48} metalness={0.36} /></mesh>
        <mesh castShadow position={[-2.95, 0.82, 1.35]}><boxGeometry args={[0.75, 0.16, 3.8]} /><meshStandardMaterial color="#343a3e" roughness={0.48} metalness={0.36} /></mesh>
        <mesh castShadow position={[-3.0, 0.4, 0]}><boxGeometry args={[0.12, 0.8, 1]} /><meshStandardMaterial color="#24292c" metalness={0.42} roughness={0.5} /></mesh>
        <mesh castShadow position={[3.0, 0.4, 0]}><boxGeometry args={[0.12, 0.8, 1]} /><meshStandardMaterial color="#24292c" metalness={0.42} roughness={0.5} /></mesh>
      </group>

      <OperatorChair />
      <group position={[1.25, 0, -0.6]} raycast={() => null}>
        <mesh castShadow position={[0, 0.58, 0]}><cylinderGeometry args={[0.4, 0.38, 0.12, 16]} /><meshStandardMaterial color="#191d20" roughness={0.74} /></mesh>
        <mesh castShadow position={[0, 1.0, 0.22]}><boxGeometry args={[0.68, 0.76, 0.12]} /><meshStandardMaterial color="#191d20" roughness={0.74} /></mesh>
      </group>

      <group position={[2.75, 0.95, -1.7]} raycast={() => null}>
        <mesh castShadow><cylinderGeometry args={[0.16, 0.13, 0.3, 16]} /><meshStandardMaterial color="#5b5f5d" roughness={0.55} /></mesh>
        <mesh position={[0.16, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.095, 0.018, 8, 16]} /><meshStandardMaterial color="#5b5f5d" roughness={0.55} /></mesh>
      </group>
      <CoffeeSteam />

      <group position={[-2.35, 0.08, -0.4]} rotation={[0.18, 0.2, 1.1]} raycast={() => null}>
        <mesh castShadow><torusGeometry args={[0.22, 0.04, 8, 20, Math.PI * 1.5]} /><meshStandardMaterial color="#171b1e" roughness={0.42} metalness={0.3} /></mesh>
        <mesh castShadow position={[0.22, 0, -0.06]}><boxGeometry args={[0.38, 0.055, 0.05]} /><meshStandardMaterial color="#101315" roughness={0.5} /></mesh>
      </group>

      <group position={[2.15, 1.05, -2.12]} userData={{ securityInteractableId: 'radio-base' }}>
        <mesh castShadow><boxGeometry args={[0.78, 0.24, 0.48]} /><meshStandardMaterial color="#1a2023" roughness={0.44} metalness={0.35} /></mesh>
        <mesh position={[0.16, 0.14, -0.04]}><boxGeometry args={[0.32, 0.05, 0.16]} /><meshStandardMaterial color="#122014" emissive="#1a4d23" emissiveIntensity={0.4} /></mesh>
      </group>

      <group position={[0.55, 1.28, -2.15]} rotation={[-0.18, 0, 0]} userData={{ securityInteractableId: 'terminal-main' }}>
        <mesh castShadow><boxGeometry args={[1.28, 0.82, 0.12]} /><meshStandardMaterial color="#181e21" roughness={0.42} metalness={0.4} /></mesh>
        <mesh position={[0, 0, 0.068]}><planeGeometry args={[1.08, 0.62]} /><meshStandardMaterial color="#050807" emissive="#0b1b12" emissiveIntensity={0.16} /></mesh>
      </group>

      <group position={[-1.0, 0.91, -2.06]} rotation={[-Math.PI / 2, 0, 0.08]} userData={{ securityInteractableId: 'schedule' }}>
        <mesh castShadow><planeGeometry args={[0.72, 0.96]} /><meshStandardMaterial color="#b9b09a" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      </group>
      <group position={[-2.0, 0.915, -2.06]} rotation={[-Math.PI / 2, 0, -0.12]} userData={{ securityInteractableId: 'migration-checklist' }}>
        <mesh castShadow><planeGeometry args={[0.78, 1.02]} /><meshStandardMaterial color="#c8c3af" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      </group>

      <FiremanOverride />

      <group position={[0, 1.16, 6.43]} raycast={() => null}>
        <mesh castShadow><boxGeometry args={[2.5, 2.32, 0.14]} /><meshStandardMaterial color="#394045" roughness={0.5} metalness={0.3} /></mesh>
        <mesh castShadow position={[-0.84, -0.05, -0.1]}><boxGeometry args={[0.5, 0.08, 0.1]} /><meshStandardMaterial color="#8e9699" roughness={0.3} metalness={0.72} /></mesh>
      </group>

      <group position={[-4.85, 1.18, 3.5]} rotation={[0, Math.PI / 2, 0]} userData={{ securityInteractableId: 'corridor-check' }}>
        <mesh castShadow><boxGeometry args={[2.3, 2.32, 0.12]} /><meshStandardMaterial color="#30373b" roughness={0.55} metalness={0.26} /></mesh>
        <mesh position={[-0.76, -0.02, -0.1]}><boxGeometry args={[0.46, 0.08, 0.09]} /><meshStandardMaterial color="#83898c" metalness={0.68} roughness={0.3} /></mesh>
      </group>

      <group position={[4.35, 0.75, -4.0]} raycast={() => null}>
        {[0, 1, 2, 3].map((index) => (
          <mesh key={index} castShadow position={[0, index * 0.58, 0]}>
            <boxGeometry args={[0.88, 0.5, 0.95]} />
            <meshStandardMaterial color="#181d20" roughness={0.52} metalness={0.46} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
