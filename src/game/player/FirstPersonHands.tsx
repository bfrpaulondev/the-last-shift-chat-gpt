import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../state/gameStore'

interface FirstPersonHandsProps {
  enabled: boolean
}

type HandSide = 'left' | 'right'

const LEFT_BASE = new THREE.Vector3(-0.29, -0.39, -0.66)
const RIGHT_BASE = new THREE.Vector3(0.29, -0.39, -0.66)

function HandModel({ side }: { side: HandSide }) {
  const mirror = side === 'left' ? -1 : 1

  return (
    <group>
      <mesh
        castShadow
        raycast={() => null}
        position={[0, -0.11, 0.16]}
        rotation={[Math.PI / 2, 0, 0]}
        renderOrder={20}
      >
        <cylinderGeometry args={[0.075, 0.095, 0.38, 8]} />
        <meshStandardMaterial color="#252b31" roughness={0.92} depthTest={false} />
      </mesh>

      <mesh
        castShadow
        raycast={() => null}
        scale={[0.12, 0.09, 0.17]}
        renderOrder={21}
      >
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#b78368" roughness={0.82} depthTest={false} />
      </mesh>

      <mesh
        castShadow
        raycast={() => null}
        position={[mirror * 0.095, -0.005, -0.015]}
        rotation={[0.15, 0, mirror * 0.58]}
        scale={[0.045, 0.04, 0.09]}
        renderOrder={22}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#b78368" roughness={0.82} depthTest={false} />
      </mesh>

      <mesh
        raycast={() => null}
        position={[0, -0.09, 0.015]}
        scale={[0.095, 0.025, 0.12]}
        renderOrder={23}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#9b6d58" roughness={0.88} depthTest={false} />
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

    const targetMovement = THREE.MathUtils.clamp(horizontalDelta / Math.max(delta, 0.001) / 2.2, 0, 1)
    movementAmount.current = THREE.MathUtils.damp(
      movementAmount.current,
      targetMovement,
      8,
      Math.min(delta, 0.05),
    )

    const walkPhase = state.clock.elapsedTime * 7.6
    const sway = Math.sin(walkPhase) * 0.025 * movementAmount.current
    const bob = Math.abs(Math.cos(walkPhase)) * 0.014 * movementAmount.current

    const leftPosition = LEFT_BASE.clone()
    const rightPosition = RIGHT_BASE.clone()
    leftPosition.x += sway
    rightPosition.x += sway
    leftPosition.y -= bob
    rightPosition.y -= bob

    let leftRotationX = 0.12
    let leftRotationZ = -0.08
    let rightRotationX = 0.12
    let rightRotationZ = 0.08

    if (handAction) {
      const elapsed = performance.now() - handAction.startedAt
      const progress = THREE.MathUtils.clamp(elapsed / handAction.durationMs, 0, 1)
      const pulse = Math.sin(progress * Math.PI)

      switch (handAction.kind) {
        case 'reach':
          rightPosition.y += 0.12 * pulse
          rightPosition.z -= 0.28 * pulse
          rightPosition.x -= 0.06 * pulse
          rightRotationX -= 0.28 * pulse
          break
        case 'grab':
          rightPosition.y += 0.16 * pulse
          rightPosition.z -= 0.32 * pulse
          rightPosition.x -= 0.07 * pulse
          leftPosition.y += 0.05 * pulse
          leftPosition.z -= 0.08 * pulse
          rightRotationX -= 0.34 * pulse
          break
        case 'press':
          rightPosition.y += 0.18 * pulse
          rightPosition.z -= 0.33 * pulse
          rightPosition.x -= 0.1 * pulse
          rightRotationX -= 0.42 * pulse
          break
        case 'turn':
          rightPosition.y += 0.15 * pulse
          rightPosition.z -= 0.28 * pulse
          rightPosition.x -= 0.06 * pulse
          rightRotationZ += 0.75 * pulse
          break
        case 'door':
          rightPosition.y += 0.08 * pulse
          rightPosition.z -= 0.3 * pulse
          rightPosition.x -= 0.04 * pulse
          rightRotationZ += 0.42 * pulse
          break
        case 'brace':
          leftPosition.y += 0.1 * pulse
          rightPosition.y += 0.1 * pulse
          leftPosition.z -= 0.2 * pulse
          rightPosition.z -= 0.2 * pulse
          leftPosition.x -= 0.04 * pulse
          rightPosition.x += 0.04 * pulse
          break
        case 'startle':
          leftPosition.y += 0.3 * pulse
          rightPosition.y += 0.3 * pulse
          leftPosition.z -= 0.1 * pulse
          rightPosition.z -= 0.1 * pulse
          leftPosition.x += 0.08 * pulse
          rightPosition.x -= 0.08 * pulse
          leftRotationX -= 0.6 * pulse
          rightRotationX -= 0.6 * pulse
          break
      }
    }

    left.current.position.lerp(leftPosition, 0.35)
    right.current.position.lerp(rightPosition, 0.35)
    left.current.rotation.x = THREE.MathUtils.lerp(left.current.rotation.x, leftRotationX, 0.3)
    left.current.rotation.z = THREE.MathUtils.lerp(left.current.rotation.z, leftRotationZ, 0.3)
    right.current.rotation.x = THREE.MathUtils.lerp(right.current.rotation.x, rightRotationX, 0.3)
    right.current.rotation.z = THREE.MathUtils.lerp(right.current.rotation.z, rightRotationZ, 0.3)

    root.current.rotation.z = sway * 0.35
    root.current.position.y = -bob * 0.2
  })

  return createPortal(
    <group ref={root} visible={enabled}>
      <group ref={left} position={LEFT_BASE.toArray()}>
        <HandModel side="left" />
      </group>
      <group ref={right} position={RIGHT_BASE.toArray()}>
        <HandModel side="right" />
      </group>
    </group>,
    camera,
  )
}
