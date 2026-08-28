import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RAIN_COUNT = 420
const WINDOW_STREAKS = 28

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

export function ExteriorRain() {
  const rainGeometry = useRef<THREE.BufferGeometry>(null)

  const rainPositions = useMemo(() => {
    const positions = new Float32Array(RAIN_COUNT * 2 * 3)

    for (let index = 0; index < RAIN_COUNT; index += 1) {
      const x = -7 + seeded(index, 1) * 14
      const y = -1 + seeded(index, 2) * 13
      const z = -4.5 - seeded(index, 3) * 26
      const length = 0.18 + seeded(index, 4) * 0.5
      const offset = index * 6

      positions[offset] = x
      positions[offset + 1] = y
      positions[offset + 2] = z
      positions[offset + 3] = x - 0.035
      positions[offset + 4] = y - length
      positions[offset + 5] = z + 0.03
    }

    return positions
  }, [])

  const windowStreaks = useMemo(() => (
    Array.from({ length: WINDOW_STREAKS }, (_, index) => ({
      x: -2.55 + seeded(index, 8) * 2.5,
      y: 0.88 + seeded(index, 9) * 1.15,
      length: 0.08 + seeded(index, 10) * 0.24,
      opacity: 0.08 + seeded(index, 11) * 0.16,
    }))
  ), [])

  useFrame((_, delta) => {
    const geometry = rainGeometry.current
    if (!geometry) {
      return
    }

    const attribute = geometry.getAttribute('position') as THREE.BufferAttribute
    const positions = attribute.array as Float32Array
    const fall = delta * 6.8

    for (let index = 0; index < RAIN_COUNT; index += 1) {
      const offset = index * 6
      positions[offset + 1] -= fall
      positions[offset + 4] -= fall

      if (positions[offset + 1] < -1.4) {
        const reset = 8.5 + seeded(index, Math.floor(performance.now() / 500)) * 4.5
        const length = positions[offset + 1] - positions[offset + 4]
        positions[offset + 1] = reset
        positions[offset + 4] = reset - Math.max(0.18, length)
      }
    }

    attribute.needsUpdate = true
  })

  return (
    <group>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={rainGeometry}>
          <bufferAttribute
            attach="attributes-position"
            args={[rainPositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#b7cad8"
          transparent
          opacity={0.3}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      <group position={[0, 0, -3.07]}>
        {windowStreaks.map((streak, index) => (
          <mesh
            key={index}
            raycast={() => null}
            position={[streak.x, streak.y, 0]}
            rotation={[0, 0, -0.045]}
          >
            <planeGeometry args={[0.008, streak.length]} />
            <meshBasicMaterial
              color="#d9e8ef"
              transparent
              opacity={streak.opacity}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
