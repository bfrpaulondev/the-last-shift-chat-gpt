import { useEffect, useState } from 'react'
import { useGameStore } from '../../state/gameStore'

export function StairwellScene() {
  const checkpoint = useGameStore((state) => state.location.checkpoint)
  const reached38 = useGameStore((state) => Boolean(state.flags.stairwell_reached_38))
  const reached39 = useGameStore((state) => Boolean(state.flags.stairwell_reached_39))
  const sc39Open = useGameStore((state) => Boolean(state.flags.sc39_open))
  const [readerGlow, setReaderGlow] = useState(false)

  useEffect(() => {
    if (checkpoint !== 'stairwell-floor-38') return
    const state = useGameStore.getState()
    if (state.flags.reader38_green) return

    const start = window.setTimeout(() => {
      const latest = useGameStore.getState()
      if (latest.location.area !== 'emergency-stairwell' || latest.location.checkpoint !== 'stairwell-floor-38') return
      setReaderGlow(true)
      latest.setFlag('reader38_green')
      latest.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: 'stairwell:reader38-green-auto',
        wasFirstTime: true,
      })
    }, 420)

    const stop = window.setTimeout(() => setReaderGlow(false), 1920)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(stop)
    }
  }, [checkpoint])

  return (
    <group name="part3-stairwell-37-to-39">
      <color attach="background" args={['#040506']} />
      <fog attach="fog" args={['#040506', 4, 18]} />
      <ambientLight color="#686b6d" intensity={0.045} />
      <pointLight position={[-2.8, 2.2, 5]} color="#c9b99b" intensity={0.28} distance={6} decay={2} />
      <pointLight position={[2.7, 2.2, -4.9]} color="#9b8d76" intensity={reached39 ? 0.24 : 0.08} distance={6} decay={2} />
      {readerGlow && <pointLight position={[3.25, 1.45, 0]} color="#44ff83" intensity={2.1} distance={3.2} decay={2} />}

      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[8.4, 0.16, 14.6]} />
        <meshStandardMaterial color="#1e2123" roughness={0.97} metalness={0.02} />
      </mesh>
      <mesh receiveShadow position={[0, 2.65, 0]}>
        <boxGeometry args={[8.4, 0.16, 14.6]} />
        <meshStandardMaterial color="#26292b" roughness={0.94} />
      </mesh>
      <mesh position={[-4.15, 1.28, 0]}><boxGeometry args={[0.24, 2.7, 14.6]} /><meshStandardMaterial color="#34383b" roughness={0.88} /></mesh>
      <mesh position={[4.15, 1.28, 0]}><boxGeometry args={[0.24, 2.7, 14.6]} /><meshStandardMaterial color="#34383b" roughness={0.88} /></mesh>
      <mesh position={[0, 1.28, -7.25]}><boxGeometry args={[8.4, 2.7, 0.24]} /><meshStandardMaterial color="#34383b" roughness={0.88} /></mesh>
      <mesh position={[0, 1.28, 7.25]}><boxGeometry args={[8.4, 2.7, 0.24]} /><meshStandardMaterial color="#34383b" roughness={0.88} /></mesh>

      <group position={[0, 0, 2.2]} userData={{ stairwellInteractableId: 'flight-to-38' }}>
        {[0, 1, 2, 3, 4].map((step) => (
          <mesh key={step} castShadow position={[0, 0.12 + step * 0.12, -step * 0.28]}>
            <boxGeometry args={[2.5, 0.18, 0.52]} />
            <meshStandardMaterial color="#373b3e" roughness={0.92} />
          </mesh>
        ))}
        <mesh castShadow position={[-1.52, 0.72, -0.55]} rotation={[0, 0, -0.04]}>
          <cylinderGeometry args={[0.035, 0.035, 2.9, 10]} />
          <meshStandardMaterial color="#5b5b57" roughness={0.5} metalness={0.48} />
        </mesh>
      </group>

      <group position={[3.12, 1.3, 0]} userData={{ stairwellInteractableId: 'reader-38' }}>
        <mesh castShadow><boxGeometry args={[0.42, 0.74, 0.18]} /><meshStandardMaterial color="#161a1c" roughness={0.5} metalness={0.3} /></mesh>
        <mesh position={[0, 0.16, -0.11]}>
          <boxGeometry args={[0.22, 0.1, 0.035]} />
          <meshStandardMaterial
            color={readerGlow ? '#5aff87' : '#621713'}
            emissive={readerGlow ? '#28ff63' : '#a11c14'}
            emissiveIntensity={readerGlow ? 2.2 : 0.58}
          />
        </mesh>
        <mesh position={[0, -0.25, -0.105]}>
          <planeGeometry args={[0.28, 0.12]} />
          <meshBasicMaterial color="#b8b8b0" />
        </mesh>
      </group>

      <group position={[0, 0, -2.4]} userData={{ stairwellInteractableId: 'flight-to-39' }}>
        {[0, 1, 2, 3, 4].map((step) => (
          <mesh key={step} castShadow position={[0, 0.12 + step * 0.12, -step * 0.28]}>
            <boxGeometry args={[2.5, 0.18, 0.52]} />
            <meshStandardMaterial color="#34383b" roughness={0.93} />
          </mesh>
        ))}
        <mesh castShadow position={[1.52, 0.72, -0.55]} rotation={[0, 0, 0.04]}>
          <cylinderGeometry args={[0.035, 0.035, 2.9, 10]} />
          <meshStandardMaterial color="#565752" roughness={0.52} metalness={0.46} />
        </mesh>
      </group>

      <group position={[0, 1.08, -6.98]} userData={{ stairwellInteractableId: 'door-39' }} rotation={[0, sc39Open ? -0.18 : -0.05, 0]}>
        <mesh castShadow><boxGeometry args={[2.35, 2.18, 0.14]} /><meshStandardMaterial color="#40464a" roughness={0.5} metalness={0.3} /></mesh>
        <mesh castShadow position={[-0.82, 0, -0.12]}><boxGeometry args={[0.48, 0.08, 0.1]} /><meshStandardMaterial color="#92999c" metalness={0.72} roughness={0.28} /></mesh>
      </group>

      <group position={[1.25, 0.16, -6.35]} rotation={[0, 0, Math.PI / 2.2]} raycast={() => null}>
        <mesh castShadow><cylinderGeometry args={[0.12, 0.16, 0.86, 14]} /><meshStandardMaterial color="#b12d25" roughness={0.52} metalness={0.18} /></mesh>
        <mesh position={[0, 0.46, 0]}><cylinderGeometry args={[0.18, 0.18, 0.08, 14]} /><meshStandardMaterial color="#202427" roughness={0.62} /></mesh>
      </group>

      <mesh position={[-3.2, 2.36, 2.9]} raycast={() => null}>
        <boxGeometry args={[1.45, 0.1, 0.34]} />
        <meshStandardMaterial color="#d7d0ae" emissive="#b49d62" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>

      <mesh position={[3.2, 2.36, -3.1]} raycast={() => null}>
        <boxGeometry args={[1.45, 0.1, 0.34]} />
        <meshStandardMaterial color="#766a58" emissive="#7b6b45" emissiveIntensity={0.08} roughness={0.82} />
      </mesh>

      {reached38 && (
        <mesh position={[3.63, 1.55, 0]} raycast={() => null}>
          <boxGeometry args={[0.08, 0.28, 0.6]} />
          <meshStandardMaterial color="#6d1110" emissive="#7b0e0b" emissiveIntensity={0.32} />
        </mesh>
      )}
    </group>
  )
}
