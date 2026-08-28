import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function flickerValue(time: number): number {
  const slow = Math.sin(time * 1.7) * 0.08
  const brokenPulse = Math.sin(time * 18.5) > 0.86 ? 0.22 : 1
  const hardDrop = Math.sin(time * 7.1 + 1.8) > 0.965 ? 0.05 : 1
  return THREE.MathUtils.clamp((0.92 + slow) * brokenPulse * hardDrop, 0.04, 1)
}

export function BrokenBathroomLight() {
  const light = useRef<THREE.PointLight>(null)
  const bulb = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const value = flickerValue(clock.elapsedTime)

    if (light.current) {
      light.current.intensity = 1.05 * value
    }

    if (bulb.current) {
      bulb.current.emissiveIntensity = 1.8 * value
    }
  })

  return (
    <group position={[2.45, 2.49, -1.9]}>
      <pointLight
        ref={light}
        castShadow
        color="#ffd799"
        intensity={1.05}
        distance={4.4}
        decay={2}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
      />

      <mesh raycast={() => null} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.19, 0.07, 16]} />
        <meshStandardMaterial color="#5e5b53" roughness={0.72} metalness={0.28} />
      </mesh>

      <mesh raycast={() => null} position={[0, -0.045, 0]}>
        <sphereGeometry args={[0.105, 16, 12]} />
        <meshStandardMaterial
          ref={bulb}
          color="#f2d7a1"
          emissive="#ffc56d"
          emissiveIntensity={1.8}
          roughness={0.48}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
