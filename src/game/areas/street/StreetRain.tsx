import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Drop = {
  x: number
  y: number
  z: number
  speed: number
  drift: number
}

const DROP_COUNT = 520
const HALF_WIDTH = 8
const MIN_Z = -8
const MAX_Z = 7
const TOP = 7.5
const BOTTOM = 0.02

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

export function StreetRain() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const drops = useMemo<Drop[]>(() => {
    return Array.from({ length: DROP_COUNT }, (_, index) => ({
      x: (seeded(index, 1) * 2 - 1) * HALF_WIDTH,
      y: BOTTOM + seeded(index, 2) * (TOP - BOTTOM),
      z: MIN_Z + seeded(index, 3) * (MAX_Z - MIN_Z),
      speed: 5.8 + seeded(index, 4) * 4.8,
      drift: 0.2 + seeded(index, 5) * 0.28,
    }))
  }, [])

  useFrame((_, delta) => {
    if (!mesh.current) {
      return
    }
    const safeDelta = Math.min(delta, 0.05)
    for (let index = 0; index < drops.length; index += 1) {
      const drop = drops[index]
      drop.y -= drop.speed * safeDelta
      drop.x += drop.drift * safeDelta
      if (drop.y < BOTTOM) {
        drop.y = TOP + seeded(index, Math.floor(performance.now() * 0.001)) * 1.4
        drop.x = (seeded(index, 9) * 2 - 1) * HALF_WIDTH
      }
      if (drop.x > HALF_WIDTH) {
        drop.x = -HALF_WIDTH
      }
      dummy.position.set(drop.x, drop.y, drop.z)
      dummy.rotation.set(0.08, 0, 0.04)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(index, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, DROP_COUNT]} frustumCulled={false} raycast={() => null}>
      <boxGeometry args={[0.012, 0.42, 0.012]} />
      <meshBasicMaterial color="#b8c9d5" transparent opacity={0.34} depthWrite={false} />
    </instancedMesh>
  )
}
