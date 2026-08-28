import { useMemo } from 'react'
import * as THREE from 'three'

function TowerFacade() {
  const windows = useMemo(() => Array.from({ length: 54 }, (_, index) => ({
    x: -5.5 + (index % 7) * 1.82,
    y: 3.2 + Math.floor(index / 7) * 2.15,
    lit: index % 11 === 0 || index % 17 === 0,
  })), [])

  return (
    <group position={[0, 0, -10.8]} raycast={() => null}>
      <mesh position={[0, 10.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[14.8, 22, 3.2]} />
        <meshStandardMaterial color="#121a21" metalness={0.42} roughness={0.38} />
      </mesh>
      {windows.map((window, index) => (
        <mesh key={index} position={[window.x, window.y, 1.615]}>
          <planeGeometry args={[1.08, 1.28]} />
          <meshStandardMaterial
            color={window.lit ? '#d9c77f' : '#172630'}
            emissive={window.lit ? '#d9c77f' : '#0d171c'}
            emissiveIntensity={window.lit ? 0.74 : 0.07}
            metalness={0.28}
            roughness={0.18}
            toneMapped={!window.lit}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.3, 1.66]} userData={{ plazaInteractableId: 'lobby-door' }}>
        <boxGeometry args={[2.6, 2.6, 0.12]} />
        <meshPhysicalMaterial color="#24343c" metalness={0.48} roughness={0.2} transparent opacity={0.88} transmission={0.18} />
      </mesh>
      <mesh position={[0, 2.94, 1.7]} userData={{ plazaInteractableId: 'tower-sign' }}>
        <planeGeometry args={[4.2, 0.58]} />
        <meshStandardMaterial color="#11191f" emissive="#d6dde0" emissiveIntensity={0.82} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 3.1, 3.8]} color="#c8d9df" intensity={1.1} distance={8} decay={2} />
    </group>
  )
}

function SecurityNotice() {
  return (
    <group position={[-3.18, 0, -1.8]}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[1.15, 2.1, 0.12]} />
        <meshStandardMaterial color="#30383b" metalness={0.58} roughness={0.34} />
      </mesh>
      <mesh position={[0, 1.13, 0.066]} userData={{ plazaInteractableId: 'security-notice' }}>
        <planeGeometry args={[0.92, 1.3]} />
        <meshStandardMaterial color="#d4d1c3" roughness={0.82} />
      </mesh>
    </group>
  )
}

function Bollards() {
  return (
    <group raycast={() => null)}>
      {[-5.6, -3.4, 3.4, 5.6].map((x) => (
        <mesh key={x} position={[x, 0.42, -4.15]} castShadow>
          <cylinderGeometry args={[0.16, 0.2, 0.84, 12]} />
          <meshStandardMaterial color="#464d50" metalness={0.68} roughness={0.36} />
        </mesh>
      ))}
    </group>
  )
}

export function PlazaScene() {
  return (
    <>
      <color attach="background" args={['#111923']} />
      <fog attach="fog" args={['#17212a', 14, 74]} />
      <ambientLight color="#8298a9" intensity={0.26} />
      <hemisphereLight color="#71899c" groundColor="#252321" intensity={0.34} />
      <directionalLight position={[-7, 10, 5]} color="#9fb7ca" intensity={0.62} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

      <mesh position={[0, -0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 16]} />
        <meshPhysicalMaterial color="#3b4245" roughness={0.22} metalness={0.12} clearcoat={0.72} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, -0.018, 2.6]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <circleGeometry args={[2.8, 48]} />
        <meshPhysicalMaterial color="#1e2a30" transparent opacity={0.6} roughness={0.05} clearcoat={1} clearcoatRoughness={0.02} />
      </mesh>

      <TowerFacade />
      <SecurityNotice />
      <Bollards />
    </>
  )
}
