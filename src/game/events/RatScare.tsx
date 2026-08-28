import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { audioEngine } from '../audio/AudioEngine'
import { suspenseCue } from '../audio/SuspenseCue'
import { useGameStore } from '../state/gameStore'

const RAT_START = new THREE.Vector3(2.72, 0.1, -1.02)
const RAT_END = new THREE.Vector3(0.12, 0.1, 0.18)
const RUN_DURATION_MS = 900

export function RatScare() {
  const rat = useRef<THREE.Group>(null)
  const startedAt = useRef(0)
  const scheduled = useRef(false)
  const messageTimer = useRef<number | null>(null)
  const [running, setRunning] = useState(false)
  const showered = useGameStore((state) => Boolean(state.flags.showered))
  const subtitleActive = useGameStore((state) => Boolean(state.subtitle))
  const noteOpen = useGameStore((state) => Boolean(state.note))

  useEffect(() => {
    if (!showered || subtitleActive || noteOpen || scheduled.current) {
      return
    }

    const current = useGameStore.getState()
    if (current.flags.rat_scare_seen || current.demoEnded) {
      return
    }

    scheduled.current = true
    let fired = false
    const startTimer = window.setTimeout(() => {
      const state = useGameStore.getState()
      if (
        state.flags.rat_scare_seen ||
        state.demoEnded ||
        state.subtitle ||
        state.note
      ) {
        scheduled.current = false
        return
      }

      fired = true
      startedAt.current = performance.now()
      setRunning(true)
      audioEngine.playRatScurry()
      state.setFlag('rat_scare_seen')
      state.triggerScare(1700)
      suspenseCue.play()

      messageTimer.current = window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (!latest.demoEnded) {
          latest.say('Um rato... ótimo. Agora eu acordei de vez.')
        }
        messageTimer.current = null
      }, 1050)
    }, 850)

    return () => {
      window.clearTimeout(startTimer)
      if (!fired) {
        scheduled.current = false
      }
    }
  }, [noteOpen, showered, subtitleActive])

  useEffect(() => () => {
    if (messageTimer.current !== null) {
      window.clearTimeout(messageTimer.current)
    }
    suspenseCue.stop()
  }, [])

  useFrame(() => {
    if (!rat.current || !running) {
      return
    }

    const progress = THREE.MathUtils.clamp(
      (performance.now() - startedAt.current) / RUN_DURATION_MS,
      0,
      1,
    )
    const eased = 1 - Math.pow(1 - progress, 2)

    rat.current.position.lerpVectors(RAT_START, RAT_END, eased)
    rat.current.rotation.y = 1.12 + Math.sin(progress * Math.PI * 12) * 0.06
    rat.current.rotation.z = Math.sin(progress * Math.PI * 16) * 0.05

    if (progress >= 1) {
      setRunning(false)
    }
  })

  if (!running) {
    return null
  }

  return (
    <group ref={rat} position={[2.72, 0.1, -1.02]}>
      <mesh castShadow raycast={() => null} scale={[0.18, 0.1, 0.31]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#282523" roughness={0.96} />
      </mesh>
      <mesh castShadow raycast={() => null} position={[0, 0.015, -0.27]} scale={[0.12, 0.09, 0.14]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#312d2a" roughness={0.95} />
      </mesh>
      <mesh raycast={() => null} position={[-0.07, 0.095, -0.3]} scale={[0.045, 0.055, 0.025]}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshStandardMaterial color="#7f6159" roughness={0.9} />
      </mesh>
      <mesh raycast={() => null} position={[0.07, 0.095, -0.3]} scale={[0.045, 0.055, 0.025]}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshStandardMaterial color="#7f6159" roughness={0.9} />
      </mesh>
      <mesh
        castShadow
        raycast={() => null}
        position={[0, 0.01, 0.35]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.012, 0.02, 0.48, 6]} />
        <meshStandardMaterial color="#6f554d" roughness={0.9} />
      </mesh>
    </group>
  )
}
