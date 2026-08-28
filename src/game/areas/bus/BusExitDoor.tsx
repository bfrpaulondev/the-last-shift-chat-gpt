import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

export function BusExitDoor() {
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const ready = useGameStore((state) => Boolean(state.flags.meridian_stop_ready))
  const exiting = useGameStore((state) => Boolean(state.flags.bus_exited))

  useFrame((_, delta) => {
    const target = ready || exiting ? 0.38 : 0
    const safe = Math.min(delta, 0.05)
    if (left.current) left.current.position.x = THREE.MathUtils.damp(left.current.position.x, -target, 9, safe)
    if (right.current) right.current.position.x = THREE.MathUtils.damp(right.current.position.x, target, 9, safe)
  })

  return (
    <group position={[-0.58, 0, -4.385]} userData={{ busInteractableId: 'bus-exit' }}>
      <group ref={left} position={[0, 0, 0]}>
        <mesh position={[-0.3, 1.15, 0]}>
          <boxGeometry args={[0.56, 2.05, 0.055]} />
          <meshStandardMaterial color="#b6bab4" roughness={0.62} metalness={0.14} />
        </mesh>
        <mesh position={[-0.3, 1.38, -0.031]}>
          <planeGeometry args={[0.42, 0.78]} />
          <meshPhysicalMaterial color="#52666d" transparent opacity={0.38} roughness={0.12} transmission={0.34} />
        </mesh>
      </group>
      <group ref={right} position={[0, 0, 0]}>
        <mesh position={[0.3, 1.15, 0]}>
          <boxGeometry args={[0.56, 2.05, 0.055]} />
          <meshStandardMaterial color="#b6bab4" roughness={0.62} metalness={0.14} />
        </mesh>
        <mesh position={[0.3, 1.38, -0.031]}>
          <planeGeometry args={[0.42, 0.78]} />
          <meshPhysicalMaterial color="#52666d" transparent opacity={0.38} roughness={0.12} transmission={0.34} />
        </mesh>
      </group>
      <mesh position={[0.58, 1.7, -0.08]} raycast={() => null}>
        <boxGeometry args={[0.11, 0.16, 0.035]} />
        <meshStandardMaterial color={ready ? '#3c7b47' : '#5c2f2f'} emissive={ready ? '#58a867' : '#6d3030'} emissiveIntensity={ready ? 0.7 : 0.12} toneMapped={false} />
      </mesh>
    </group>
  )
}
