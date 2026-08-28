import { useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'
import { createCorvusFlyerTexture, createPortuguesePavementTexture, createRoute214Texture } from './streetTextures'

function easeOutCubic(value: number): number {
  const t = THREE.MathUtils.clamp(value, 0, 1)
  return 1 - Math.pow(1 - t, 3)
}

function SignatureFluorescent() {
  const light = useRef<THREE.PointLight>(null)
  const tube = useRef<THREE.Mesh>(null)
  const pattern = useMemo(() => [0.12, 0.11, 0.12, 0.11, 0.12, 0.18, 0.62, 0.36], [])

  useFrame(({ clock }) => {
    const total = pattern.reduce((sum, duration) => sum + duration, 0)
    let cursor = clock.elapsedTime % total
    let index = 0
    for (; index < pattern.length; index += 1) {
      if (cursor <= pattern[index]) break
      cursor -= pattern[index]
    }
    const on = index % 2 === 0
    if (light.current) light.current.intensity = on ? 0.58 : 0.018
    if (tube.current) {
      const material = tube.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = on ? 2.1 : 0.05
    }
  })

  return (
    <group position={[2.15, 2.52, 1.02]}>
      <mesh ref={tube} raycast={() => null}>
        <boxGeometry args={[1.35, 0.055, 0.055]} />
        <meshStandardMaterial color="#dbe6d5" emissive="#c9e7c1" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <pointLight ref={light} color="#d7e8d4" intensity={0.58} distance={4.2} decay={2} />
    </group>
  )
}

function BusShelter() {
  const scheduleTexture = useMemo(() => createRoute214Texture(), [])

  return (
    <group position={[2.1, 0, 1.15]}>
      <mesh position={[0, 2.62, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.05, 0.11, 1.5]} />
        <meshStandardMaterial color="#343b3e" metalness={0.72} roughness={0.34} />
      </mesh>
      {[-1.42, 1.42].map((x) => (
        <mesh key={x} position={[x, 1.28, -0.55]} castShadow>
          <boxGeometry args={[0.085, 2.56, 0.085]} />
          <meshStandardMaterial color="#4c5558" metalness={0.8} roughness={0.28} />
        </mesh>
      ))}
      <mesh position={[0, 1.28, -0.62]} raycast={() => null}>
        <planeGeometry args={[2.72, 2.38]} />
        <meshPhysicalMaterial color="#aab7b6" transparent opacity={0.22} roughness={0.18} transmission={0.38} thickness={0.015} clearcoat={0.8} />
      </mesh>
      <mesh position={[-0.92, 1.34, -0.595]} userData={{ streetInteractableId: 'route-214' }}>
        <planeGeometry args={[0.62, 0.86]} />
        <meshStandardMaterial map={scheduleTexture} roughness={0.63} />
      </mesh>
      <RoundedBox args={[1.82, 0.12, 0.48]} radius={0.055} smoothness={3} position={[0.42, 0.55, 0.18]} castShadow receiveShadow>
        <meshStandardMaterial color="#3a4142" metalness={0.52} roughness={0.46} />
      </RoundedBox>
      <SignatureFluorescent />
    </group>
  )
}

function MeridianTower() {
  const windows = useMemo(() => {
    const rows: Array<{ x: number; y: number; lit: boolean }> = []
    for (let row = 0; row < 14; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        rows.push({ x: -2.4 + col * 1.2, y: 5 + row * 2.3, lit: (row * 7 + col * 11) % 17 === 0 })
      }
    }
    return rows
  }, [])

  return (
    <group position={[0, 0, -62]} raycast={() => null}>
      <mesh position={[0, 18, 0]}>
        <boxGeometry args={[7.2, 38, 5.6]} />
        <meshStandardMaterial color="#111820" metalness={0.34} roughness={0.42} />
      </mesh>
      {windows.map((window, index) => (
        <mesh key={index} position={[window.x, window.y, 2.815]}>
          <planeGeometry args={[0.72, 1.25]} />
          <meshStandardMaterial
            color={window.lit ? '#d9c47c' : '#16232d'}
            emissive={window.lit ? '#d9c47c' : '#0d151b'}
            emissiveIntensity={window.lit ? 0.75 : 0.08}
            roughness={0.16}
            metalness={0.34}
            toneMapped={!window.lit}
          />
        </mesh>
      ))}
      <mesh position={[0, 38.3, 0]}>
        <boxGeometry args={[3.4, 1.0, 2.7]} />
        <meshStandardMaterial color="#0e141a" roughness={0.7} />
      </mesh>
    </group>
  )
}

function BackgroundCity() {
  const buildings = useMemo(() => {
    return Array.from({ length: 22 }, (_, index) => {
      const side = index % 2 === 0 ? -1 : 1
      const column = Math.floor(index / 2)
      const height = 4.5 + ((index * 37) % 8)
      return {
        x: side * (6.5 + (column % 4) * 4.3),
        z: -23 - column * 4.4,
        height,
        width: 3 + ((index * 17) % 3),
      }
    })
  }, [])

  return (
    <group raycast={() => null}>
      {buildings.map((building, index) => (
        <mesh key={index} position={[building.x, building.height / 2, building.z]}>
          <boxGeometry args={[building.width, building.height, 4.6]} />
          <meshStandardMaterial color={index % 3 === 0 ? '#22292d' : '#1a2025'} roughness={0.82} />
        </mesh>
      ))}
    </group>
  )
}

function StreetPuddles() {
  return (
    <group>
      <mesh position={[-0.7, 0.014, 0.52]} rotation={[-Math.PI / 2, 0, -0.12]} userData={{ streetInteractableId: 'tower-puddle' }}>
        <circleGeometry args={[0.9, 42]} />
        <meshPhysicalMaterial color="#1b252b" transparent opacity={0.72} roughness={0.05} metalness={0.2} clearcoat={1} clearcoatRoughness={0.02} />
      </mesh>
      <mesh position={[-0.7, 0.021, 0.52]} rotation={[-Math.PI / 2, 0, Math.PI]} raycast={() => null}>
        <planeGeometry args={[0.19, 0.75]} />
        <meshBasicMaterial color="#11181d" transparent opacity={0.42} />
      </mesh>
      <mesh position={[3.5, 0.012, 3.3]} rotation={[-Math.PI / 2, 0, 0.3]} raycast={() => null}>
        <circleGeometry args={[0.52, 32]} />
        <meshPhysicalMaterial color="#273239" transparent opacity={0.58} roughness={0.08} clearcoat={0.9} />
      </mesh>
    </group>
  )
}

function CorvusFlyer() {
  const texture = useMemo(() => createCorvusFlyerTexture(), [])
  return (
    <mesh position={[-3.18, 0.035, 2.05]} rotation={[-Math.PI / 2, 0, -0.22]} userData={{ streetInteractableId: 'corvus-flyer' }}>
      <planeGeometry args={[0.52, 0.72]} />
      <meshStandardMaterial map={texture} roughness={0.88} side={THREE.DoubleSide} />
    </mesh>
  )
}

function TrashAndStreetWear() {
  return (
    <group raycast={() => null}>
      {[-4.15, 4.45].map((x, index) => (
        <group key={x} position={[x, 0, 1.25]}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <sphereGeometry args={[0.34 + index * 0.03, 12, 8]} />
            <meshStandardMaterial color="#171a18" roughness={0.94} />
          </mesh>
          <mesh position={[0.2, 0.22, 0.1]} castShadow>
            <sphereGeometry args={[0.23, 10, 7]} />
            <meshStandardMaterial color="#20231f" roughness={0.96} />
          </mesh>
        </group>
      ))}
      <mesh position={[-4.2, 1.75, -0.05]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 3.5, 10]} />
        <meshStandardMaterial color="#3c4240" metalness={0.68} roughness={0.42} />
      </mesh>
      <pointLight position={[-4.2, 3.3, -0.05]} color="#e5a14f" intensity={1.2} distance={7.5} decay={2} />
      <mesh position={[-4.2, 3.31, -0.05]}>
        <sphereGeometry args={[0.1, 12, 8]} />
        <meshStandardMaterial color="#e8b468" emissive="#e8a34f" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Bus214() {
  const group = useRef<THREE.Group>(null)
  const flagged = useRef(false)
  const arrived = useGameStore((state) => Boolean(state.flags.bus_arrived))

  useFrame(({ clock }) => {
    if (!group.current) return
    if (arrived) {
      group.current.position.x = 0.75
      return
    }
    const progress = THREE.MathUtils.clamp((clock.elapsedTime - 5.5) / 7.5, 0, 1)
    group.current.position.x = THREE.MathUtils.lerp(-19, 0.75, easeOutCubic(progress))
    if (progress >= 1 && !flagged.current) {
      flagged.current = true
      useGameStore.getState().setFlag('bus_arrived')
      useGameStore.getState().say('Linha 214. Na hora certa, por milagre.')
    }
  })

  return (
    <group ref={group} position={[-19, 0, -2.65]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={[1.72, 2.4, 5.2]} radius={0.18} smoothness={4} position={[0, 1.32, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d6d0bd" metalness={0.18} roughness={0.48} />
      </RoundedBox>
      <mesh position={[0, 2.05, 2.615]}>
        <planeGeometry args={[1.3, 0.44]} />
        <meshStandardMaterial color="#0e1818" emissive="#d5b743" emissiveIntensity={0.72} toneMapped={false} />
      </mesh>
      <mesh position={[0.54, 1.35, 2.62]} userData={{ streetInteractableId: 'bus-door' }}>
        <planeGeometry args={[0.55, 1.55]} />
        <meshPhysicalMaterial color="#243238" metalness={0.42} roughness={0.22} transparent opacity={0.9} />
      </mesh>
      {[-1.85, -0.5, 0.85].map((z) => (
        <mesh key={z} position={[-0.866, 1.55, z]} rotation={[0, -Math.PI / 2, 0]} raycast={() => null}>
          <planeGeometry args={[1.0, 0.72]} />
          <meshPhysicalMaterial color="#1b2a30" metalness={0.25} roughness={0.17} transparent opacity={0.72} />
        </mesh>
      ))}
      {[-1.75, 1.65].flatMap((z) => [-0.72, 0.72].map((x) => (
        <mesh key={`${x}-${z}`} position={[x, 0.43, z]} rotation={[0, 0, Math.PI / 2]} raycast={() => null}>
          <cylinderGeometry args={[0.34, 0.34, 0.18, 16]} />
          <meshStandardMaterial color="#111315" roughness={0.78} />
        </mesh>
      )))}
      <pointLight position={[-0.55, 0.88, 2.74]} color="#f3e2b3" intensity={0.8} distance={5} decay={2} />
      <pointLight position={[0.55, 0.88, 2.74]} color="#f3e2b3" intensity={0.8} distance={5} decay={2} />
    </group>
  )
}

export function StreetScene() {
  const pavement = useMemo(() => createPortuguesePavementTexture(), [])

  return (
    <>
      <color attach="background" args={['#111923']} />
      <fog attach="fog" args={['#17202a', 16, 92]} />
      <ambientLight color="#8ba1b7" intensity={0.28} />
      <hemisphereLight color="#718aa0" groundColor="#25221f" intensity={0.38} />
      <directionalLight position={[-6, 9, 4]} color="#9db7ce" intensity={0.62} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

      <mesh position={[0, -0.035, 2.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial map={pavement} color="#9a9b96" roughness={0.74} metalness={0.06} />
      </mesh>
      <mesh position={[0, -0.06, -4.25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 6.8]} />
        <meshPhysicalMaterial color="#1d2326" roughness={0.16} metalness={0.2} clearcoat={0.95} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, 0.005, -0.94]}>
        <boxGeometry args={[12, 0.13, 0.18]} />
        <meshStandardMaterial color="#8a8880" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.018, -3.9]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[0.12, 20]} />
        <meshStandardMaterial color="#b7a967" roughness={0.7} />
      </mesh>

      <BusShelter />
      <StreetPuddles />
      <CorvusFlyer />
      <TrashAndStreetWear />
      <BackgroundCity />
      <MeridianTower />
      <Bus214 />
    </>
  )
}
