import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const RAIN_COUNT = 180

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function NightRain() {
  const geometry = useRef<THREE.BufferGeometry>(null)
  const positions = useMemo(() => {
    const values = new Float32Array(RAIN_COUNT * 6)
    for (let index = 0; index < RAIN_COUNT; index += 1) {
      const offset = index * 6
      const x = -5.2 + seeded(index, 1) * 10.4
      const y = -0.5 + seeded(index, 2) * 7
      const z = -7.7 - seeded(index, 3) * 3.5
      const length = 0.16 + seeded(index, 4) * 0.42
      values[offset] = x
      values[offset + 1] = y
      values[offset + 2] = z
      values[offset + 3] = x - 0.03
      values[offset + 4] = y - length
      values[offset + 5] = z
    }
    return values
  }, [])

  useFrame((_, delta) => {
    if (!geometry.current) return
    const attribute = geometry.current.getAttribute('position') as THREE.BufferAttribute
    const values = attribute.array as Float32Array
    for (let index = 0; index < RAIN_COUNT; index += 1) {
      const offset = index * 6
      values[offset + 1] -= delta * 7.2
      values[offset + 4] -= delta * 7.2
      if (values[offset + 1] < -0.7) {
        const length = values[offset + 1] - values[offset + 4]
        values[offset + 1] = 6.1 + seeded(index, Math.floor(performance.now() / 900)) * 1.2
        values[offset + 4] = values[offset + 1] - Math.max(0.15, length)
      }
    }
    attribute.needsUpdate = true
  })

  return (
    <lineSegments frustumCulled={false} raycast={() => null}>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#9fb3c0" transparent opacity={0.34} depthWrite={false} toneMapped={false} />
    </lineSegments>
  )
}

export function BlackoutScene() {
  const strobeA = useRef<THREE.PointLight>(null)
  const strobeB = useRef<THREE.PointLight>(null)
  const alarmMaterial = useRef<THREE.MeshStandardMaterial>(null)
  const doorLocked = useGameStore((state) => Boolean(state.flags.door37_locked))

  useFrame(({ clock }) => {
    const t = clock.elapsedTime % 4.65
    const pulse =
      (t >= 0.05 && t < 0.16) ||
      (t >= 0.34 && t < 0.47) ||
      (t >= 0.72 && t < 0.86)
    const intensity = pulse ? 2.25 : 0.035
    if (strobeA.current) strobeA.current.intensity = intensity
    if (strobeB.current) strobeB.current.intensity = pulse ? 1.8 : 0.025
    if (alarmMaterial.current) alarmMaterial.current.emissiveIntensity = pulse ? 1.15 : 0.08
  })

  return (
    <group name="part3-awakening-floor37-night">
      <color attach="background" args={['#020305']} />
      <fog attach="fog" args={['#030405', 7, 28]} />
      <ambientLight color="#3b4650" intensity={0.025} />
      <pointLight ref={strobeA} position={[-3.4, 2.35, -1.8]} color="#ff5a1f" intensity={0.03} distance={10} decay={2} castShadow />
      <pointLight ref={strobeB} position={[3.5, 2.35, 3.5]} color="#ff6b28" intensity={0.02} distance={9} decay={2} />

      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[11.4, 0.16, 15]} />
        <meshStandardMaterial color="#171b1f" roughness={0.94} metalness={0.03} />
      </mesh>
      <mesh receiveShadow position={[0, 2.7, 0]}>
        <boxGeometry args={[11.4, 0.16, 15]} />
        <meshStandardMaterial color="#292b2d" roughness={0.9} />
      </mesh>
      <mesh position={[-5.7, 1.3, 0]}><boxGeometry args={[0.22, 2.7, 15]} /><meshStandardMaterial color="#34383c" roughness={0.76} /></mesh>
      <mesh position={[5.7, 1.3, 0]}><boxGeometry args={[0.22, 2.7, 15]} /><meshStandardMaterial color="#34383c" roughness={0.76} /></mesh>

      <group position={[0, 1.35, -7.22]}>
        <mesh raycast={() => null}>
          <boxGeometry args={[7.8, 2.25, 0.08]} />
          <meshPhysicalMaterial color="#263440" transparent opacity={0.24} roughness={0.12} transmission={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.1]} raycast={() => null}>
          <planeGeometry args={[7.7, 2.14]} />
          <meshBasicMaterial color="#05080d" transparent opacity={0.82} />
        </mesh>
      </group>
      <NightRain />

      <group position={[-3.75, 0, -2]}>
        <mesh castShadow position={[0, 0.74, 0]}><boxGeometry args={[2.8, 0.12, 1.35]} /><meshStandardMaterial color="#4c5155" roughness={0.54} metalness={0.12} /></mesh>
        <mesh castShadow position={[-1.15, 0.37, 0]}><boxGeometry args={[0.12, 0.74, 1.1]} /><meshStandardMaterial color="#262a2e" metalness={0.45} roughness={0.5} /></mesh>
        <mesh castShadow position={[1.15, 0.37, 0]}><boxGeometry args={[0.12, 0.74, 1.1]} /><meshStandardMaterial color="#262a2e" metalness={0.45} roughness={0.5} /></mesh>
      </group>

      <group position={[3.55, 0, -2.05]}>
        <mesh castShadow position={[0, 0.82, 0]}><boxGeometry args={[3.1, 1.55, 1.2]} /><meshStandardMaterial color="#3a4044" roughness={0.68} /></mesh>
        <mesh castShadow position={[0, 1.64, -0.36]}><boxGeometry args={[2.5, 0.1, 0.72]} /><meshStandardMaterial color="#25292c" roughness={0.52} /></mesh>
        <group position={[0.56, 1.86, -0.3]} rotation={[Math.PI, 0, 0]} raycast={() => null}>
          <mesh><cylinderGeometry args={[0.13, 0.11, 0.28, 16]} /><meshStandardMaterial color="#c8c1b4" roughness={0.68} /></mesh>
          <mesh position={[0.14, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.08, 0.018, 7, 14]} /><meshStandardMaterial color="#c8c1b4" roughness={0.68} /></mesh>
        </group>
        <group position={[-0.5, 1.8, -0.28]} userData={{ blackoutInteractableId: 'phone-37' }}>
          <mesh castShadow rotation={[-0.08, 0.1, 0]}><boxGeometry args={[0.34, 0.045, 0.7]} /><meshStandardMaterial color="#101315" roughness={0.4} metalness={0.16} /></mesh>
          <mesh position={[0, 0.026, -0.02]}><boxGeometry args={[0.28, 0.008, 0.56]} /><meshStandardMaterial color="#07121a" emissive="#102534" emissiveIntensity={0.12} /></mesh>
        </group>
      </group>

      <group position={[-0.8, 0.18, -0.1]} userData={{ blackoutInteractableId: 'fallen-bucket' }} rotation={[0.08, 0.25, Math.PI / 2.25]}>
        <mesh castShadow><cylinderGeometry args={[0.42, 0.34, 0.58, 16, 1, true]} /><meshStandardMaterial color="#50585e" roughness={0.7} metalness={0.08} /></mesh>
      </group>

      <group position={[0, 0.76, 1.86]} userData={{ blackoutInteractableId: 'shadow-note' }}>
        <mesh castShadow rotation={[-Math.PI / 2, 0, 0.08]}>
          <boxGeometry args={[0.72, 0.005, 0.46]} />
          <meshStandardMaterial color="#d7d0bb" roughness={0.86} />
        </mesh>
      </group>

      <group position={[-5.5, 1.18, -3.4]} userData={{ blackoutInteractableId: 'ceo-door-night' }} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow><boxGeometry args={[2.25, 2.35, 0.14]} /><meshStandardMaterial color="#262c31" roughness={0.44} metalness={0.3} /></mesh>
        <mesh position={[0, 0.2, -0.09]}><boxGeometry args={[0.72, 0.42, 0.05]} /><meshStandardMaterial color="#050607" emissive="#000000" emissiveIntensity={0} /></mesh>
      </group>

      <group position={[0, 1.16, 7.22]}>
        <mesh castShadow><boxGeometry args={[2.35, 2.34, 0.14]} /><meshStandardMaterial color="#353a3e" roughness={0.48} metalness={0.34} /></mesh>
        <group position={[1.42, 0.18, -0.08]} userData={{ blackoutInteractableId: 'door37-reader' }}>
          <mesh castShadow><boxGeometry args={[0.34, 0.68, 0.14]} /><meshStandardMaterial color="#171b1e" roughness={0.48} metalness={0.3} /></mesh>
          <mesh position={[0, 0.15, -0.085]}><boxGeometry args={[0.18, 0.09, 0.03]} /><meshStandardMaterial color="#54110d" emissive="#b01c14" emissiveIntensity={doorLocked ? 1.1 : 0.5} /></mesh>
        </group>
      </group>

      <group position={[5.5, 1.16, 2.2]} rotation={[0, Math.PI / 2, 0]} userData={{ blackoutInteractableId: 'emergency-route-door' }}>
        <mesh castShadow><boxGeometry args={[2.35, 2.34, 0.14]} /><meshStandardMaterial color="#30383d" roughness={0.52} metalness={0.32} /></mesh>
        <mesh castShadow position={[0.78, -0.02, -0.12]}><boxGeometry args={[0.5, 0.08, 0.1]} /><meshStandardMaterial color="#8a9194" metalness={0.72} roughness={0.28} /></mesh>
      </group>

      <group position={[-4.95, 2.2, 4.4]}>
        <mesh><boxGeometry args={[0.46, 0.46, 0.12]} /><meshStandardMaterial color="#711c13" roughness={0.54} /></mesh>
        <mesh position={[0, 0, -0.08]}><sphereGeometry args={[0.09, 12, 8]} />
          <meshStandardMaterial ref={alarmMaterial} color="#ff5e2b" emissive="#ff3b12" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {[-3.6, 0, 3.6].map((x) => (
        <mesh key={x} position={[x, 2.5, 0]} raycast={() => null}>
          <boxGeometry args={[2.1, 0.08, 0.24]} />
          <meshStandardMaterial color="#6a2c1d" emissive="#8f2f18" emissiveIntensity={0.18} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}
