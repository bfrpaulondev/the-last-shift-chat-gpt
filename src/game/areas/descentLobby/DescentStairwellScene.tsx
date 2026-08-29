import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DESCENT_FLOOR_DROP, DESCENT_TOP_Z, descentBaseY } from './descentGeometry'

const STEP_COUNT = 18

function makeFloorTexture(floor: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = '#15191b'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#5d6669'
    context.lineWidth = 6
    context.strokeRect(6, 6, canvas.width - 12, canvas.height - 12)
    context.fillStyle = '#d8dddd'
    context.font = '700 70px ui-monospace, monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(floor === 0 ? 'T' : String(floor), canvas.width / 2, canvas.height / 2 + 4)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function EmergencyPulse() {
  const light = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    if (!light.current) return
    const phase = clock.elapsedTime % 2.25
    const pulse = phase < 0.11 || (phase > 0.22 && phase < 0.32) ? 1 : 0.08
    light.current.intensity = 0.12 + pulse * 1.2
  })

  return <pointLight ref={light} position={[1.75, 2.15, 2.7]} color="#ff7a22" distance={8} decay={2} />
}

export function DescentStairwellScene({ floor }: { floor: number }) {
  const baseY = descentBaseY(floor)
  const floorTexture = useMemo(() => makeFloorTexture(floor), [floor])
  const steps = useMemo(() => Array.from({ length: STEP_COUNT }, (_, index) => index), [])

  useEffect(() => () => floorTexture.dispose(), [floorTexture])

  return (
    <group name="part3-area-k-descent">
      <color attach="background" args={['#030506']} />
      <fog attach="fog" args={['#050709', 4, 18]} />
      <ambientLight color="#6d7479" intensity={0.055} />

      <group position={[0, baseY, 0]}>
        <EmergencyPulse />
        <pointLight position={[-1.5, 1.8, -2.7]} color="#73828a" intensity={0.18} distance={6} decay={2} />

        <mesh position={[-2.48, 0.55, 0]} receiveShadow>
          <boxGeometry args={[0.24, 3.8, 9.6]} />
          <meshStandardMaterial color="#373b3c" roughness={0.96} />
        </mesh>
        <mesh position={[2.48, 0.55, 0]} receiveShadow>
          <boxGeometry args={[0.24, 3.8, 9.6]} />
          <meshStandardMaterial color="#373b3c" roughness={0.96} />
        </mesh>
        <mesh position={[0, 2.45, 0]} receiveShadow>
          <boxGeometry args={[5.0, 0.18, 9.6]} />
          <meshStandardMaterial color="#292d2f" roughness={0.93} />
        </mesh>

        <mesh position={[0, -0.08, 4.32]} receiveShadow>
          <boxGeometry args={[4.7, 0.16, 1.0]} />
          <meshStandardMaterial color="#404345" roughness={0.9} />
        </mesh>

        {steps.map((index) => {
          const progress = index / (STEP_COUNT - 1)
          const z = DESCENT_TOP_Z - 0.55 - progress * 7.65
          const y = -progress * DESCENT_FLOOR_DROP - 0.055
          return (
            <mesh key={index} position={[0, y, z]} receiveShadow castShadow>
              <boxGeometry args={[3.9, 0.11, 0.48]} />
              <meshStandardMaterial color={index % 2 === 0 ? '#3f4243' : '#393c3d'} roughness={0.91} />
            </mesh>
          )
        })}

        <mesh position={[0, -DESCENT_FLOOR_DROP - 0.08, -4.22]} receiveShadow>
          <boxGeometry args={[4.7, 0.16, 1.05]} />
          <meshStandardMaterial color="#404345" roughness={0.9} />
        </mesh>

        <mesh position={[-1.92, 0.86, -0.1]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
          <cylinderGeometry args={[0.035, 0.035, 8.0, 8]} />
          <meshStandardMaterial color="#8b8d8d" metalness={0.72} roughness={0.28} />
        </mesh>
        <mesh position={[1.92, 0.86, -0.1]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
          <cylinderGeometry args={[0.035, 0.035, 8.0, 8]} />
          <meshStandardMaterial color="#8b8d8d" metalness={0.72} roughness={0.28} />
        </mesh>

        <group position={[1.95, 1.3, 3.75]} rotation={[0, -Math.PI / 2, 0]} raycast={() => null}>
          <mesh>
            <boxGeometry args={[0.72, 0.42, 0.06]} />
            <meshStandardMaterial color="#15191b" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0, -0.035]}>
            <planeGeometry args={[0.62, 0.31]} />
            <meshBasicMaterial map={floorTexture} toneMapped={false} />
          </mesh>
        </group>

        <mesh position={[0, 1.1, -4.57]} raycast={() => null}>
          <boxGeometry args={[4.4, 2.2, 0.12]} />
          <meshStandardMaterial color="#202527" roughness={0.88} />
        </mesh>
      </group>
    </group>
  )
}
