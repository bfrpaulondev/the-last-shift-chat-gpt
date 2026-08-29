import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const RAIN_COUNT = 180

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function LobbyRain() {
  const geometry = useRef<THREE.BufferGeometry>(null)
  const positions = useMemo(() => {
    const values = new Float32Array(RAIN_COUNT * 6)
    for (let index = 0; index < RAIN_COUNT; index += 1) {
      const x = -6 + seeded(index, 1) * 12
      const y = seeded(index, 2) * 5.5
      const z = 6.15 + seeded(index, 3) * 2.5
      const offset = index * 6
      values[offset] = x
      values[offset + 1] = y
      values[offset + 2] = z
      values[offset + 3] = x - 0.045
      values[offset + 4] = y - 0.42
      values[offset + 5] = z + 0.025
    }
    return values
  }, [])

  useFrame((_, delta) => {
    if (!geometry.current) return
    const attribute = geometry.current.getAttribute('position') as THREE.BufferAttribute
    const values = attribute.array as Float32Array
    for (let index = 0; index < RAIN_COUNT; index += 1) {
      const offset = index * 6
      values[offset + 1] -= delta * 6.2
      values[offset + 4] -= delta * 6.2
      if (values[offset + 1] < -0.5) {
        const reset = 4.5 + seeded(index, Math.floor(performance.now() / 900)) * 1.4
        values[offset + 1] = reset
        values[offset + 4] = reset - 0.42
      }
    }
    attribute.needsUpdate = true
  })

  return (
    <lineSegments frustumCulled={false} raycast={() => null}>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#b9d1dc" transparent opacity={0.36} depthWrite={false} toneMapped={false} />
    </lineSegments>
  )
}

function OrangeStrobes() {
  const left = useRef<THREE.PointLight>(null)
  const right = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const phase = clock.elapsedTime % 2.6
    const intensity = phase < 0.08 || (phase > 0.18 && phase < 0.28) ? 2.4 : 0.08
    if (left.current) left.current.intensity = intensity
    if (right.current) right.current.intensity = intensity * 0.7
  })

  return (
    <>
      <pointLight ref={left} position={[-4.4, 2.6, 3.9]} color="#ff711f" distance={10} decay={2} />
      <pointLight ref={right} position={[4.1, 2.5, -3.7]} color="#ff7d26" distance={9} decay={2} />
    </>
  )
}

function makeNewsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = '#071016'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#ced7da'
    context.font = '700 48px system-ui, sans-serif'
    context.fillText('NOTÍCIAS DA MANHÃ', 46, 76)
    context.fillStyle = '#7ea1b1'
    context.fillRect(46, 104, canvas.width - 92, 4)
    context.fillStyle = '#eef2f2'
    context.font = '600 37px system-ui, sans-serif'
    context.fillText('...a Meridian Tower sedia AMANHÃ', 46, 205)
    context.fillText('a reunião anual do conselho da Corvus...', 46, 260)
    context.fillStyle = '#b44b42'
    context.fillRect(46, 350, 188, 58)
    context.fillStyle = '#ffffff'
    context.font = '700 30px system-ui, sans-serif'
    context.fillText('SEM ÁUDIO', 64, 389)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function MutedNewsScreen() {
  const texture = useMemo(() => makeNewsTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group position={[-4.78, 2.15, -2.45]} rotation={[0, Math.PI / 2, 0]} raycast={() => null}>
      <mesh castShadow>
        <boxGeometry args={[1.9, 1.08, 0.12]} />
        <meshStandardMaterial color="#141a1d" roughness={0.35} metalness={0.48} />
      </mesh>
      <mesh position={[0, 0, -0.068]}>
        <planeGeometry args={[1.72, 0.9]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}

function LobbyCamera() {
  const gaze = useGameStore((state) => Boolean(state.flags.nascimento_camera_gaze))
  const led = useRef<THREE.MeshBasicMaterial>(null)
  const blinkStarted = useRef<number | null>(null)

  useEffect(() => {
    if (gaze && blinkStarted.current === null) blinkStarted.current = performance.now()
  }, [gaze])

  useFrame(() => {
    if (!led.current) return
    const started = blinkStarted.current
    if (started === null) {
      led.current.opacity = 0.18
      return
    }
    const elapsed = performance.now() - started
    led.current.opacity = elapsed < 420 ? 1 : 0.18
  })

  return (
    <group position={[0.8, 3.08, -1.25]} rotation={[0.55, 0.18, 0]} raycast={() => null}>
      <mesh castShadow>
        <boxGeometry args={[0.52, 0.28, 0.38]} />
        <meshStandardMaterial color="#d9dcda" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.02, 0.22]}>
        <cylinderGeometry args={[0.12, 0.15, 0.12, 16]} />
        <meshStandardMaterial color="#15191b" roughness={0.22} metalness={0.35} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.2]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshBasicMaterial ref={led} color="#ff1f1f" transparent opacity={0.18} toneMapped={false} />
      </mesh>
    </group>
  )
}

function NascimentoFigure() {
  const notebookPush = useGameStore((state) => Boolean(state.flags.nascimento_notebook_push))
  const wristGrab = useGameStore((state) => Boolean(state.flags.nascimento_wrist_grab))
  const cameraGaze = useGameStore((state) => Boolean(state.flags.nascimento_camera_gaze))
  const dead = useGameStore((state) => Boolean(state.flags.nascimento_dead))
  const notebookTaken = useGameStore((state) => Boolean(state.flags.notebook_taken))
  const closedEyes = useGameStore((state) => Boolean(state.flags.closed_eyes))
  const notebook = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const reachingHand = useRef<THREE.Group>(null)
  const notebookFingers = useRef<Array<THREE.Group | null>>([])
  const handoffAt = useRef<number | null>(null)

  useEffect(() => {
    const onTransfer = () => { handoffAt.current = performance.now() }
    window.addEventListener('lobby:notebook-transfer', onTransfer)
    return () => window.removeEventListener('lobby:notebook-transfer', onTransfer)
  }, [])

  useFrame((_, delta) => {
    if (notebook.current) {
      const targetZ = notebookPush ? 0.34 : 0.18
      notebook.current.position.z = THREE.MathUtils.damp(notebook.current.position.z, targetZ, 8, Math.min(delta, 0.05))
    }
    if (head.current) {
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, cameraGaze || dead ? -0.22 : 0.04, 7, Math.min(delta, 0.05))
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, cameraGaze || dead ? -0.28 : 0.02, 7, Math.min(delta, 0.05))
    }
    if (reachingHand.current) {
      reachingHand.current.position.z = THREE.MathUtils.damp(reachingHand.current.position.z, wristGrab ? 0.78 : 0.2, 7, Math.min(delta, 0.05))
      reachingHand.current.position.y = THREE.MathUtils.damp(reachingHand.current.position.y, wristGrab ? 1.18 : 0.92, 7, Math.min(delta, 0.05))
    }

    const started = handoffAt.current
    if (started !== null) {
      const progress = THREE.MathUtils.clamp((performance.now() - started) / 1500, 0, 1)
      notebookFingers.current.forEach((finger, index) => {
        if (!finger) return
        const stage = THREE.MathUtils.clamp(progress * 5 - index, 0, 1)
        finger.rotation.x = THREE.MathUtils.lerp(0.72, -0.08, stage)
      })
    }
  })

  return (
    <group position={[0.72, 0, -3.42]} rotation={[0, -0.08, 0]} userData={{ areaKInteractableId: 'nascimento' }}>
      <mesh castShadow position={[0, 0.48, 0]} rotation={[0.04, 0, -0.08]}>
        <capsuleGeometry args={[0.29, 0.72, 8, 12]} />
        <meshStandardMaterial color="#242b2e" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[-0.2, 0.2, 0.08]} rotation={[0.12, 0.1, -0.18]}>
        <capsuleGeometry args={[0.1, 0.68, 6, 10]} />
        <meshStandardMaterial color="#1b2022" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0.22, 0.2, 0.05]} rotation={[0.12, -0.1, 0.15]}>
        <capsuleGeometry args={[0.1, 0.68, 6, 10]} />
        <meshStandardMaterial color="#1b2022" roughness={0.92} />
      </mesh>

      <group ref={head} position={[-0.04, 1.24, 0.02]}>
        <mesh castShadow>
          <sphereGeometry args={[0.23, 18, 14]} />
          <meshStandardMaterial color="#7b594b" roughness={0.78} />
        </mesh>
        <mesh position={[-0.075, 0.025, 0.205]}>
          <sphereGeometry args={[0.026, 10, 8]} />
          <meshStandardMaterial color="#111313" roughness={0.35} />
        </mesh>
        <mesh position={[0.075, 0.025, 0.205]}>
          <sphereGeometry args={[0.026, 10, 8]} />
          <meshStandardMaterial color="#111313" roughness={0.35} />
        </mesh>
        {closedEyes && (
          <>
            <mesh position={[-0.075, 0.026, 0.226]}><boxGeometry args={[0.075, 0.018, 0.012]} /><meshStandardMaterial color="#694a40" roughness={0.8} /></mesh>
            <mesh position={[0.075, 0.026, 0.226]}><boxGeometry args={[0.075, 0.018, 0.012]} /><meshStandardMaterial color="#694a40" roughness={0.8} /></mesh>
          </>
        )}
      </group>

      <group ref={reachingHand} position={[0.32, 0.92, 0.2]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.065, 0.52, 5, 8]} />
          <meshStandardMaterial color="#7b594b" roughness={0.78} />
        </mesh>
        <mesh castShadow position={[0, 0.02, 0.28]} scale={[0.12, 0.045, 0.16]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#7b594b" roughness={0.78} />
        </mesh>
        {wristGrab && [0, 1, 2, 3].map((index) => (
          <mesh key={index} position={[-0.075 + index * 0.05, -0.012 + (index % 2) * 0.004, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.012, 0.1 - 0.002, 4, 6]} />
            <meshStandardMaterial color="#7b594b" roughness={0.78} />
          </mesh>
        ))}
      </group>

      {!notebookTaken && (
        <group ref={notebook} position={[-0.02, 0.74, 0.18]} rotation={[-0.32, 0.08, -0.04]} userData={{ areaKInteractableId: 'notebook' }}>
          <mesh castShadow>
            <boxGeometry args={[0.52, 0.055, 0.72]} />
            <meshStandardMaterial color="#2b2520" roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.036, 0.02]}>
            <boxGeometry args={[0.46, 0.025, 0.64]} />
            <meshStandardMaterial color="#d7cfb9" roughness={0.9} />
          </mesh>
          {[0, 1, 2, 3, 4].map((index) => (
            <group
              key={index}
              ref={(node) => { notebookFingers.current[index] = node }}
              position={[-0.18 + index * 0.09, 0.09, 0.32]}
              rotation={[0.72, 0, 0]}
            >
              <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.014, 0.11, 4, 6]} />
                <meshStandardMaterial color="#7b594b" roughness={0.78} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      <mesh position={[0.62, 0.08, 0.32]} rotation={[0.1, 0, Math.PI / 2]} userData={{ areaKInteractableId: 'nascimento-radio' }}>
        <boxGeometry args={[0.18, 0.48, 0.12]} />
        <meshStandardMaterial color="#151a1d" roughness={0.48} metalness={0.35} />
      </mesh>
    </group>
  )
}

function makeIndicatorTexture(floor: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = '#050606'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#e0b85c'
    context.font = '700 78px ui-monospace, monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(floor === 0 ? 'T' : String(floor), canvas.width / 2, canvas.height / 2 + 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function ReturnElevator() {
  const elevatorAlone = useGameStore((state) => Boolean(state.flags.elevator_alone))
  const riding = useGameStore((state) => Boolean(state.flags.elevator_riding))
  const leftDoor = useRef<THREE.Mesh>(null)
  const rightDoor = useRef<THREE.Mesh>(null)
  const [indicatorFloor, setIndicatorFloor] = useState(0)
  const indicatorTexture = useMemo(() => makeIndicatorTexture(indicatorFloor), [indicatorFloor])

  useEffect(() => () => indicatorTexture.dispose(), [indicatorTexture])

  useEffect(() => {
    const onIndicator = (event: Event) => {
      const detail = (event as CustomEvent<{ floor?: number }>).detail
      if (typeof detail?.floor === 'number') setIndicatorFloor(detail.floor)
    }
    window.addEventListener('lobby:elevator-indicator', onIndicator)
    return () => window.removeEventListener('lobby:elevator-indicator', onIndicator)
  }, [])

  useFrame((_, delta) => {
    const open = elevatorAlone && !riding
    const leftTarget = open ? -0.7 : -0.34
    const rightTarget = open ? 0.7 : 0.34
    if (leftDoor.current) leftDoor.current.position.x = THREE.MathUtils.damp(leftDoor.current.position.x, leftTarget, 7, Math.min(delta, 0.05))
    if (rightDoor.current) rightDoor.current.position.x = THREE.MathUtils.damp(rightDoor.current.position.x, rightTarget, 7, Math.min(delta, 0.05))
  })

  return (
    <group position={[4.85, 0, -0.05]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 1.35, 0.36]}>
        <boxGeometry args={[1.75, 2.7, 0.18]} />
        <meshStandardMaterial color="#252c30" roughness={0.44} metalness={0.62} />
      </mesh>
      <mesh position={[0, 1.34, 0.27]} userData={{ areaKInteractableId: 'elevator-return' }}>
        <boxGeometry args={[1.28, 2.42, 0.08]} />
        <meshStandardMaterial color={elevatorAlone ? '#d8d0b8' : '#101417'} emissive={elevatorAlone ? '#8c7f55' : '#000000'} emissiveIntensity={elevatorAlone ? 0.26 : 0} roughness={0.6} />
      </mesh>
      <mesh ref={leftDoor} position={[-0.34, 1.34, 0.18]}>
        <boxGeometry args={[0.64, 2.42, 0.08]} />
        <meshStandardMaterial color="#5e6669" roughness={0.34} metalness={0.72} />
      </mesh>
      <mesh ref={rightDoor} position={[0.34, 1.34, 0.18]}>
        <boxGeometry args={[0.64, 2.42, 0.08]} />
        <meshStandardMaterial color="#5e6669" roughness={0.34} metalness={0.72} />
      </mesh>
      <group position={[0, 2.9, 0.17]}>
        <mesh><boxGeometry args={[0.72, 0.34, 0.08]} /><meshStandardMaterial color="#0c0e0e" roughness={0.4} /></mesh>
        <mesh position={[0, 0, -0.045]}><planeGeometry args={[0.62, 0.25]} /><meshBasicMaterial map={indicatorTexture} toneMapped={false} /></mesh>
      </group>
    </group>
  )
}

export function NightLobbyScene() {
  return (
    <group name="part3-area-k-night-lobby">
      <color attach="background" args={['#04070a']} />
      <fog attach="fog" args={['#070b0e', 11, 28]} />
      <ambientLight color="#51606a" intensity={0.09} />
      <hemisphereLight color="#6f8490" groundColor="#171a1d" intensity={0.16} />
      <OrangeStrobes />
      <pointLight position={[0, 2.7, -2.7]} color="#82959e" intensity={0.32} distance={8} decay={2} />

      <mesh position={[0, -0.055, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshPhysicalMaterial color="#2f3538" roughness={0.12} metalness={0.14} clearcoat={0.9} clearcoatRoughness={0.06} />
      </mesh>
      <mesh position={[0, 3.35, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow raycast={() => null}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#171d21" roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.65, -5.78]} receiveShadow raycast={() => null}>
        <boxGeometry args={[12, 3.4, 0.24]} />
        <meshStandardMaterial color="#1d252a" roughness={0.76} />
      </mesh>
      <mesh position={[-5.82, 1.65, 0]} receiveShadow raycast={() => null}>
        <boxGeometry args={[0.24, 3.4, 12]} />
        <meshStandardMaterial color="#1d252a" roughness={0.76} />
      </mesh>
      <mesh position={[5.82, 1.65, 0]} receiveShadow raycast={() => null}>
        <boxGeometry args={[0.24, 3.4, 12]} />
        <meshStandardMaterial color="#1d252a" roughness={0.76} />
      </mesh>

      <group position={[0, 1.65, 5.7]} userData={{ areaKInteractableId: 'exit-glass' }}>
        <mesh position={[-2.95, 0, 0]} raycast={() => null}><boxGeometry args={[5.6, 3.3, 0.14]} /><meshPhysicalMaterial color="#4e6a76" transparent opacity={0.22} roughness={0.08} transmission={0.45} /></mesh>
        <mesh position={[2.95, 0, 0]} raycast={() => null}><boxGeometry args={[5.6, 3.3, 0.14]} /><meshPhysicalMaterial color="#4e6a76" transparent opacity={0.22} roughness={0.08} transmission={0.45} /></mesh>
        <mesh position={[-0.72, 0, -0.02]}><boxGeometry args={[1.34, 3.15, 0.08]} /><meshPhysicalMaterial color="#5b7680" transparent opacity={0.18} transmission={0.52} roughness={0.06} /></mesh>
        <mesh position={[0.72, 0, -0.02]}><boxGeometry args={[1.34, 3.15, 0.08]} /><meshPhysicalMaterial color="#5b7680" transparent opacity={0.18} transmission={0.52} roughness={0.06} /></mesh>
      </group>
      <LobbyRain />

      <group position={[0, 0, -2.95]}>
        <mesh position={[0, 0.58, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 1.16, 1.0]} />
          <meshStandardMaterial color="#1b2227" metalness={0.48} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.16, 0.38]} raycast={() => null}>
          <boxGeometry args={[4.6, 0.12, 0.48]} />
          <meshStandardMaterial color="#747f84" metalness={0.72} roughness={0.22} />
        </mesh>
      </group>

      <NascimentoFigure />
      <LobbyCamera />
      <MutedNewsScreen />
      <ReturnElevator />
    </group>
  )
}
