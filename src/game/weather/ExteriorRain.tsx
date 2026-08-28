import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NEAR_RAIN_COUNT = 280
const MID_RAIN_COUNT = 440
const FAR_RAIN_COUNT = 360
const WINDOW_STREAKS = 36
const WINDOW_DROPS = 26

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function createRainPositions(count: number, width: number, depthStart: number, depthSpan: number, lengthScale: number) {
  const positions = new Float32Array(count * 2 * 3)

  for (let index = 0; index < count; index += 1) {
    const x = -width / 2 + seeded(index, 1) * width
    const y = -1 + seeded(index, 2) * 13
    const z = depthStart - seeded(index, 3) * depthSpan
    const length = (0.16 + seeded(index, 4) * 0.52) * lengthScale
    const offset = index * 6

    positions[offset] = x
    positions[offset + 1] = y
    positions[offset + 2] = z
    positions[offset + 3] = x - 0.05 * lengthScale
    positions[offset + 4] = y - length
    positions[offset + 5] = z + 0.03
  }

  return positions
}

function RainLayer({
  count,
  width,
  depthStart,
  depthSpan,
  speed,
  opacity,
  lengthScale,
}: {
  count: number
  width: number
  depthStart: number
  depthSpan: number
  speed: number
  opacity: number
  lengthScale: number
}) {
  const geometry = useRef<THREE.BufferGeometry>(null)
  const positions = useMemo(
    () => createRainPositions(count, width, depthStart, depthSpan, lengthScale),
    [count, depthSpan, depthStart, lengthScale, width],
  )

  useFrame((_, delta) => {
    if (!geometry.current) {
      return
    }

    const attribute = geometry.current.getAttribute('position') as THREE.BufferAttribute
    const values = attribute.array as Float32Array
    const fall = delta * speed

    for (let index = 0; index < count; index += 1) {
      const offset = index * 6
      values[offset + 1] -= fall
      values[offset + 4] -= fall

      if (values[offset + 1] < -1.5) {
        const reset = 8.5 + seeded(index, Math.floor(performance.now() / 650)) * 4.5
        const length = values[offset + 1] - values[offset + 4]
        values[offset + 1] = reset
        values[offset + 4] = reset - Math.max(0.16, length)
      }
    }

    attribute.needsUpdate = true
  })

  return (
    <lineSegments frustumCulled={false}>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#c4d6e0"
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  )
}

function WetWindow() {
  const movingDrops = useRef<THREE.Group>(null)
  const streaks = useMemo(() => (
    Array.from({ length: WINDOW_STREAKS }, (_, index) => ({
      x: -1.21 + seeded(index, 8) * 2.42,
      y: -0.52 + seeded(index, 9) * 1.08,
      length: 0.08 + seeded(index, 10) * 0.3,
      opacity: 0.055 + seeded(index, 11) * 0.11,
      width: 0.004 + seeded(index, 15) * 0.006,
    }))
  ), [])
  const drops = useMemo(() => (
    Array.from({ length: WINDOW_DROPS }, (_, index) => ({
      x: -1.24 + seeded(index, 20) * 2.48,
      y: -0.53 + seeded(index, 21) * 1.1,
      size: 0.012 + seeded(index, 22) * 0.025,
      opacity: 0.06 + seeded(index, 23) * 0.13,
    }))
  ), [])

  useFrame(({ clock }) => {
    if (!movingDrops.current) {
      return
    }
    movingDrops.current.children.forEach((child, index) => {
      const base = drops[index]
      const travel = (clock.elapsedTime * (0.015 + seeded(index, 26) * 0.018) + seeded(index, 27)) % 1.1
      child.position.y = base.y - travel
      if (child.position.y < -0.58) {
        child.position.y += 1.1
      }
    })
  })

  return (
    <group position={[-1.3, 1.48, -3.058]} raycast={() => null}>
      <mesh renderOrder={7}>
        <planeGeometry args={[2.62, 1.36]} />
        <meshPhysicalMaterial
          color="#9ab0bd"
          transparent
          opacity={0.07}
          roughness={0.09}
          clearcoat={0.68}
          clearcoatRoughness={0.14}
          transmission={0.18}
          depthWrite={false}
        />
      </mesh>

      {streaks.map((streak, index) => (
        <mesh
          key={`streak-${index}`}
          position={[streak.x, streak.y, 0.006]}
          rotation={[0, 0, -0.035 - seeded(index, 14) * 0.025]}
          renderOrder={8}
        >
          <planeGeometry args={[streak.width, streak.length]} />
          <meshBasicMaterial
            color="#dce9ee"
            transparent
            opacity={streak.opacity}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      <group ref={movingDrops} position={[0, 0, 0.009]}>
        {drops.map((drop, index) => (
          <mesh key={`drop-${index}`} position={[drop.x, drop.y, 0]} renderOrder={9}>
            <sphereGeometry args={[drop.size, 7, 5]} />
            <meshPhysicalMaterial
              color="#cfe0e6"
              transparent
              opacity={drop.opacity}
              roughness={0.04}
              transmission={0.3}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 0.53, 0.004]} renderOrder={6}>
        <planeGeometry args={[2.55, 0.16]} />
        <meshBasicMaterial color="#d7e2e5" transparent opacity={0.018} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function ExteriorRain() {
  return (
    <group>
      <RainLayer
        count={NEAR_RAIN_COUNT}
        width={11}
        depthStart={-3.35}
        depthSpan={6}
        speed={9.4}
        opacity={0.42}
        lengthScale={1.35}
      />
      <RainLayer
        count={MID_RAIN_COUNT}
        width={18}
        depthStart={-8}
        depthSpan={13}
        speed={6.6}
        opacity={0.24}
        lengthScale={0.92}
      />
      <RainLayer
        count={FAR_RAIN_COUNT}
        width={30}
        depthStart={-19}
        depthSpan={20}
        speed={4.2}
        opacity={0.12}
        lengthScale={0.62}
      />
      <WetWindow />
    </group>
  )
}
