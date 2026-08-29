import { Text } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const PHOSPHOR = '#79ff9b'
const KEY_ROWS = [12, 11, 10, 8]

function PhysicalKeyboard() {
  const keyRefs = useRef<Array<THREE.Mesh | null>>([])
  const activeIndex = useRef(-1)
  const pressedUntil = useRef(0)
  const [sessionActive, setSessionActive] = useState(false)

  const positions = useMemo(() => {
    const result: Array<[number, number, number]> = []
    let index = 0
    KEY_ROWS.forEach((count, row) => {
      const width = count * 0.095
      for (let column = 0; column < count; column += 1) {
        result[index] = [column * 0.095 - width / 2 + 0.0475 + row * 0.018, 0, row * 0.12 - 0.18]
        index += 1
      }
    })
    return result
  }, [])

  useEffect(() => {
    const onPulse = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; sequence: number }>).detail
      if (!detail) return
      activeIndex.current = Math.abs(detail.key.split('').reduce((sum, char) => sum + char.charCodeAt(0), detail.sequence)) % positions.length
      pressedUntil.current = performance.now() + 78
    }
    const onSession = (event: Event) => {
      const detail = (event as CustomEvent<{ active: boolean }>).detail
      setSessionActive(Boolean(detail?.active))
    }
    window.addEventListener('sentinel:key-pulse', onPulse)
    window.addEventListener('sentinel:session-state', onSession)
    return () => {
      window.removeEventListener('sentinel:key-pulse', onPulse)
      window.removeEventListener('sentinel:session-state', onSession)
    }
  }, [positions.length])

  useFrame((_, delta) => {
    const now = performance.now()
    keyRefs.current.forEach((key, index) => {
      if (!key) return
      const targetY = index === activeIndex.current && now < pressedUntil.current ? -0.028 : 0
      key.position.y = THREE.MathUtils.damp(key.position.y, targetY, targetY < 0 ? 42 : 22, Math.min(delta, 0.04))
    })
  })

  return (
    <group position={[0.55, 0.94, -1.73]} rotation={[-0.12, 0, 0]} raycast={() => null}>
      <mesh castShadow position={[0, -0.045, 0]}>
        <boxGeometry args={[1.42, 0.08, 0.62]} />
        <meshStandardMaterial color="#171c1c" roughness={0.42} metalness={0.32} />
      </mesh>
      {positions.map((position, index) => (
        <mesh
          key={index}
          ref={(node) => { keyRefs.current[index] = node }}
          position={position}
          castShadow
        >
          <boxGeometry args={[0.077, 0.035, 0.09]} />
          <meshStandardMaterial
            color="#242c29"
            emissive={sessionActive ? '#173d24' : '#07100b'}
            emissiveIntensity={sessionActive ? 0.5 : 0.06}
            roughness={0.58}
            metalness={0.08}
          />
        </mesh>
      ))}
    </group>
  )
}

function TerminalGlow() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const onSession = (event: Event) => {
      const detail = (event as CustomEvent<{ active: boolean }>).detail
      setActive(Boolean(detail?.active))
    }
    window.addEventListener('sentinel:session-state', onSession)
    return () => window.removeEventListener('sentinel:session-state', onSession)
  }, [])

  return (
    <group raycast={() => null}>
      <mesh position={[0.55, 1.28, -2.078]} rotation={[-0.18, 0, 0]}>
        <planeGeometry args={[1.05, 0.59]} />
        <meshBasicMaterial color={active ? '#163f23' : '#07110b'} transparent opacity={active ? 0.78 : 0.12} />
      </mesh>
      <pointLight
        position={[0.55, 1.14, -1.45]}
        color={PHOSPHOR}
        intensity={active ? 1.18 : 0.05}
        distance={2.7}
        decay={2}
      />
      <group position={[-0.23, 0.98, -1.68]} rotation={[-Math.PI / 2, 0, -0.08]}>
        <mesh castShadow>
          <boxGeometry args={[0.48, 0.66, 0.035]} />
          <meshStandardMaterial color="#64553d" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0, -0.022]}>
          <boxGeometry args={[0.42, 0.6, 0.01]} />
          <meshStandardMaterial color="#c7b789" roughness={0.94} />
        </mesh>
      </group>
    </group>
  )
}

function LogLabel({ position, text, rotation = [0, 0, 0] }: {
  position: [number, number, number]
  text: string
  rotation?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation} raycast={() => null}>
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[2.85, 0.34]} />
        <meshBasicMaterial color="#001b0b" transparent opacity={0.58} depthWrite={false} depthTest />
      </mesh>
      <Text
        position={[0, 0, 0.003]}
        fontSize={0.095}
        color={PHOSPHOR}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.003}
        outlineColor="#06130a"
        depthOffset={-1}
      >
        {text}
      </Text>
    </group>
  )
}

function LogVision() {
  const enabled = useGameStore((state) => Boolean(state.flags.log_vision))
  if (!enabled) return null

  return (
    <group name="sentinel-log-vision">
      <LogLabel position={[2.15, 1.5, -2.15]} text="RADIO BASE │ JAMMED 00:02:11 │ SIGNAL SOURCE: INTERNAL" />
      <LogLabel position={[4.72, 1.88, 0.45]} rotation={[0, -Math.PI / 2, 0]} text="FIRE OVERRIDE │ RELEASED 00:09:44 │ MANUAL" />
      <LogLabel position={[0.55, 1.86, -2.12]} text="TERMINAL 01 │ OPERATOR 4471 │ SESSION ACTIVE" />
      <LogLabel position={[0, 1.55, 5.95]} rotation={[0, Math.PI, 0]} text="DOOR 39-SEC │ UNLOCKED │ OVERRIDE" />
    </group>
  )
}

export function SentinelHardware() {
  return (
    <>
      <PhysicalKeyboard />
      <TerminalGlow />
      <LogVision />
    </>
  )
}
