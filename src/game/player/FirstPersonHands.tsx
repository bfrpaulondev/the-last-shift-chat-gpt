import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../state/gameStore'

interface FirstPersonHandsProps {
  enabled: boolean
}

type HandSide = 'left' | 'right'

const LEFT_BASE = new THREE.Vector3(-0.31, -0.3, -0.5)
const RIGHT_BASE = new THREE.Vector3(0.31, -0.3, -0.5)

function HandMaterial({ color }: { color: string }) {
  return (
    <meshBasicMaterial
      color={color}
      depthTest={false}
      depthWrite={false}
      toneMapped={false}
    />
  )
}

function HandModel({ side }: { side: HandSide }) {
  const mirror = side === 'left' ? -1 : 1
  const fingerOffsets = [-0.065, -0.022, 0.022, 0.065]

  return (
    <group>
      <mesh
        frustumCulled={false}
        raycast={() => null}
        position={[0, -0.13, 0.19]}
        rotation={[Math.PI / 2, 0, 0]}
        renderOrder={100}
      >
        <cylinderGeometry args={[0.08, 0.105, 0.42, 8]} />
        <HandMaterial color="#242b31" />
      </mesh>

      <mesh
        frustumCulled={false}
        raycast={() => null}
        scale={[0.13, 0.095, 0.16]}
        renderOrder={101}
      >
        <sphereGeometry args={[1, 10, 8]} />
        <HandMaterial color="#bd886d" />
      </mesh>

      {fingerOffsets.map((offset, index) => (
        <mesh
          key={offset}
          frustumCulled={false}
          raycast={() => null}
          position={[offset, 0.01 - Math.abs(index - 1.5) * 0.008, -0.135]}
          rotation={[Math.PI / 2, 0, 0]}
          renderOrder={102 + index}
        >
          <cylinderGeometry args={[0.018, 0.024, 0.18 + (1 - Math.abs(index - 1.5) / 2) * 0.025, 7]} />
          <HandMaterial color="#bd886d" />
        </mesh>
      ))}

      <mesh
        frustumCulled={false}
        raycast={() => null}
        position={[mirror * 0.105, -0.005, -0.02]}
        rotation={[0.18, 0, mirror * 0.62]}
        scale={[0.045, 0.04, 0.1]}
        renderOrder={108}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <HandMaterial color="#bd886d" />
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
      8,
      Math.min(delta, 0.05),
    )

    const walkPhase = state.clock.elapsedTime * 7.6
    const sway = Math.sin(walkPhase) * 0.03 * movementAmount.current
    const bob = Math.abs(Math.cos(walkPhase)) * 0.018 * movementAmount.current

    const leftPosition = LEFT_BASE.clone()
    const rightPosition = RIGHT_BASE.clone()
    leftPosition.x += sway
    rightPosition.x += sway
    leftPosition.y -= bob
    rightPosition.y -= bob

    let leftRotationX = 0.08
    let leftRotationZ = -0.08
    let rightRotationX = 0.08
    let rightRotationZ = 0.08

    if (handAction) {
      const elapsed = performance.now() - handAction.startedAt
      const progress = THREE.MathUtils.clamp(
        elapsed / handAction.durationMs,
        0,
        1,
      )
      const pulse = Math.sin(progress * Math.PI)

      switch (handAction.kind) {
        case 'reach':
          rightPosition.y += 0.17 * pulse
          rightPosition.z -= 0.35 * pulse
          rightPosition.x -= 0.1 * pulse
          rightRotationX -= 0.4 * pulse
          break
        case 'grab':
          rightPosition.y += 0.19 * pulse
          rightPosition.z -= 0.39 * pulse
          rightPosition.x -= 0.11 * pulse
          leftPosition.y += 0.06 * pulse
          leftPosition.z -= 0.1 * pulse
          rightRotationX -= 0.46 * pulse
          break
        case 'press':
          rightPosition.y += 0.2 * pulse
          rightPosition.z -= 0.4 * pulse
          rightPosition.x -= 0.11 * pulse
          rightRotationX -= 0.5 * pulse
          break
        case 'turn':
          rightPosition.y += 0.18 * pulse
          rightPosition.z -= 0.36 * pulse
          rightPosition.x -= 0.09 * pulse
          rightRotationZ += 0.92 * pulse
          break
        case 'door':
          rightPosition.y += 0.12 * pulse
          rightPosition.z -= 0.38 * pulse
          rightPosition.x -= 0.06 * pulse
          rightRotationZ += 0.55 * pulse
          break
        case 'brace':
          leftPosition.y += 0.12 * pulse
          rightPosition.y += 0.12 * pulse
          leftPosition.z -= 0.24 * pulse
          rightPosition.z -= 0.24 * pulse
          leftPosition.x -= 0.05 * pulse
          rightPosition.x += 0.05 * pulse
          break
        case 'startle':
          leftPosition.y += 0.34 * pulse
          rightPosition.y += 0.34 * pulse
          leftPosition.z -= 0.12 * pulse
          rightPosition.z -= 0.12 * pulse
          leftPosition.x += 0.09 * pulse
          rightPosition.x -= 0.09 * pulse
          leftRotationX -= 0.68 * pulse
          rightRotationX -= 0.68 * pulse
          break
      }
    }

    left.current.position.lerp(leftPosition, 0.38)
    right.current.position.lerp(rightPosition, 0.38)
    left.current.rotation.x = THREE.MathUtils.lerp(
      left.current.rotation.x,
      leftRotationX,
      0.34,
    )
    left.current.rotation.z = THREE.MathUtils.lerp(
      left.current.rotation.z,
      leftRotationZ,
      0.34,
    )
    right.current.rotation.x = THREE.MathUtils.lerp(
      right.current.rotation.x,
      rightRotationX,
      0.34,
    )
    right.current.rotation.z = THREE.MathUtils.lerp(
      right.current.rotation.z,
      rightRotationZ,
      0.34,
    )
  })

  return (
    <group ref={root} visible={enabled} renderOrder={99}>
      <group ref={left} position={LEFT_BASE.toArray()}>
        <HandModel side="left" />
      </group>
      <group ref={right} position={RIGHT_BASE.toArray()}>
        <HandModel side="right" />
      </group>
    </group>
  )
}
