import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../state/gameStore'

interface FirstPersonHandsProps {
  enabled: boolean
}

type HandSide = 'left' | 'right'

const LEFT_BASE = new THREE.Vector3(-0.19, -0.34, -0.62)
const RIGHT_BASE = new THREE.Vector3(0.19, -0.34, -0.62)
const SKIN = '#a86f59'
const SKIN_DARK = '#8f5848'
const SLEEVE = '#1e252b'

function SkinMaterial({ color = SKIN }: { color?: string }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.78}
      metalness={0}
      emissive={color}
      emissiveIntensity={0.035}
      depthTest={false}
      depthWrite={false}
    />
  )
}

function SleeveMaterial() {
  return (
    <meshStandardMaterial
      color={SLEEVE}
      roughness={0.92}
      metalness={0}
      emissive="#11171b"
      emissiveIntensity={0.04}
      depthTest={false}
      depthWrite={false}
    />
  )
}

function HandModel({ side }: { side: HandSide }) {
  const mirror = side === 'left' ? -1 : 1
  const fingerOffsets = [-0.038, -0.013, 0.013, 0.038]
  const fingerLengths = [0.082, 0.096, 0.092, 0.078]

  return (
    <group scale={[0.82, 0.82, 0.82]}>
      <mesh
        frustumCulled={false}
        raycast={() => null}
        position={[0, -0.105, 0.13]}
        rotation={[Math.PI / 2, 0, 0]}
        renderOrder={100}
      >
        <cylinderGeometry args={[0.038, 0.048, 0.29, 12]} />
        <SleeveMaterial />
      </mesh>

      <mesh
        frustumCulled={false}
        raycast={() => null}
        position={[0, -0.005, 0]}
        scale={[0.073, 0.048, 0.095]}
        renderOrder={101}
      >
        <sphereGeometry args={[1, 16, 12]} />
        <SkinMaterial />
      </mesh>

      <mesh
        frustumCulled={false}
        raycast={() => null}
        position={[0, -0.044, 0.015]}
        scale={[0.056, 0.018, 0.072]}
        renderOrder={102}
      >
        <sphereGeometry args={[1, 12, 8]} />
        <SkinMaterial color={SKIN_DARK} />
      </mesh>

      {fingerOffsets.map((offset, index) => (
        <mesh
          key={offset}
          frustumCulled={false}
          raycast={() => null}
          position={[offset, 0.002, -0.098 - fingerLengths[index] * 0.35]}
          rotation={[Math.PI / 2, 0, mirror * (index - 1.5) * 0.025]}
          renderOrder={103 + index}
        >
          <capsuleGeometry args={[0.0095, fingerLengths[index], 4, 8]} />
          <SkinMaterial />
        </mesh>
      ))}

      <mesh
        frustumCulled={false}
        raycast={() => null}
        position={[mirror * 0.067, -0.004, -0.018]}
        rotation={[0.12, 0, mirror * 0.7]}
        scale={[0.024, 0.021, 0.055]}
        renderOrder={108}
      >
        <sphereGeometry args={[1, 12, 8]} />
        <SkinMaterial />
      </mesh>
    </group>
  )
}

export function FirstPersonHands({ enabled }: FirstPersonHandsProps) {
  const { camera } = useThree()
  const root = useRef<THREE.Group>(null)
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const previousCameraPosition = useRef(camera.position.clone())
  const movementAmount = useRef(0)
  const handAction = useGameStore((state) => state.handAction)

  useFrame((state, delta) => {
    if (!root.current || !left.current || !right.current) {
      return
    }

    root.current.visible = enabled
    root.current.position.copy(camera.position)
    root.current.quaternion.copy(camera.quaternion)

    if (!enabled) {
      previousCameraPosition.current.copy(camera.position)
      movementAmount.current = 0
      return
    }

    const horizontalDelta = Math.hypot(
      camera.position.x - previousCameraPosition.current.x,
      camera.position.z - previousCameraPosition.current.z,
    )
    previousCameraPosition.current.copy(camera.position)

    const targetMovement = THREE.MathUtils.clamp(
      horizontalDelta / Math.max(delta, 0.001) / 2.2,
      0,
      1,
    )
    movementAmount.current = THREE.MathUtils.damp(
      movementAmount.current,
      targetMovement,
      7,
      Math.min(delta, 0.05),
    )

    const walkPhase = state.clock.elapsedTime * 7.2
    const sway = Math.sin(walkPhase) * 0.012 * movementAmount.current
    const bob = Math.abs(Math.cos(walkPhase)) * 0.008 * movementAmount.current

    const leftPosition = LEFT_BASE.clone()
    const rightPosition = RIGHT_BASE.clone()
    leftPosition.x += sway
    rightPosition.x += sway
    leftPosition.y -= bob
    rightPosition.y -= bob

    let leftRotationX = 0.14
    let leftRotationZ = -0.09
    let rightRotationX = 0.14
    let rightRotationZ = 0.09

    if (handAction) {
      const elapsed = performance.now() - handAction.startedAt
      const progress = THREE.MathUtils.clamp(elapsed / handAction.durationMs, 0, 1)
      const pulse = Math.sin(progress * Math.PI)

      switch (handAction.kind) {
        case 'reach':
          rightPosition.y += 0.075 * pulse
          rightPosition.z -= 0.17 * pulse
          rightPosition.x -= 0.035 * pulse
          rightRotationX -= 0.24 * pulse
          break
        case 'grab':
          rightPosition.y += 0.085 * pulse
          rightPosition.z -= 0.19 * pulse
          rightPosition.x -= 0.04 * pulse
          leftPosition.y += 0.025 * pulse
          leftPosition.z -= 0.035 * pulse
          rightRotationX -= 0.28 * pulse
          break
        case 'press':
          rightPosition.y += 0.09 * pulse
          rightPosition.z -= 0.2 * pulse
          rightPosition.x -= 0.045 * pulse
          rightRotationX -= 0.3 * pulse
          break
        case 'turn':
          rightPosition.y += 0.082 * pulse
          rightPosition.z -= 0.18 * pulse
          rightPosition.x -= 0.035 * pulse
          rightRotationZ += 0.46 * pulse
          break
        case 'door':
          rightPosition.y += 0.055 * pulse
          rightPosition.z -= 0.19 * pulse
          rightPosition.x -= 0.025 * pulse
          rightRotationZ += 0.3 * pulse
          break
        case 'brace':
          leftPosition.y += 0.05 * pulse
          rightPosition.y += 0.05 * pulse
          leftPosition.z -= 0.09 * pulse
          rightPosition.z -= 0.09 * pulse
          leftPosition.x -= 0.02 * pulse
          rightPosition.x += 0.02 * pulse
          break
        case 'startle':
          leftPosition.y += 0.17 * pulse
          rightPosition.y += 0.17 * pulse
          leftPosition.z -= 0.07 * pulse
          rightPosition.z -= 0.07 * pulse
          leftPosition.x += 0.04 * pulse
          rightPosition.x -= 0.04 * pulse
          leftRotationX -= 0.4 * pulse
          rightRotationX -= 0.4 * pulse
          break
      }
    }

    const smoothing = 1 - Math.exp(-12 * Math.min(delta, 0.05))
    left.current.position.lerp(leftPosition, smoothing)
    right.current.position.lerp(rightPosition, smoothing)
    left.current.rotation.x = THREE.MathUtils.lerp(left.current.rotation.x, leftRotationX, smoothing)
    left.current.rotation.z = THREE.MathUtils.lerp(left.current.rotation.z, leftRotationZ, smoothing)
    right.current.rotation.x = THREE.MathUtils.lerp(right.current.rotation.x, rightRotationX, smoothing)
    right.current.rotation.z = THREE.MathUtils.lerp(right.current.rotation.z, rightRotationZ, smoothing)
  })

  return (
    <group ref={root} visible={enabled} renderOrder={99}>
      <group ref={left} position={LEFT_BASE.toArray()} rotation={[0, -0.08, 0]}>
        <HandModel side="left" />
      </group>
      <group ref={right} position={RIGHT_BASE.toArray()} rotation={[0, 0.08, 0]}>
        <HandModel side="right" />
      </group>
    </group>
  )
}
