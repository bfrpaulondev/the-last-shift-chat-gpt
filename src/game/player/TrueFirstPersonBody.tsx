import { RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../state/gameStore'

interface TrueFirstPersonBodyProps {
  enabled: boolean
}

type Side = 'left' | 'right'

const EYE_HEIGHT = 1.65
const SKIN = '#a86f59'
const SKIN_SHADOW = '#895445'
const SHIRT = '#20282e'
const SHIRT_DARK = '#151b20'
const PANTS = '#24272b'
const SHOES = '#18191b'
const UP = new THREE.Vector3(0, 1, 0)
const SEGMENT_AXIS = new THREE.Vector3(0, 1, 0)

const LEFT_SHOULDER = new THREE.Vector3(-0.235, 1.365, 0.055)
const RIGHT_SHOULDER = new THREE.Vector3(0.235, 1.365, 0.055)

function dampAngle(current: number, target: number, lambda: number, delta: number): number {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current))
  return current + difference * (1 - Math.exp(-lambda * delta))
}

function setSegment(mesh: THREE.Mesh | null, start: THREE.Vector3, end: THREE.Vector3): void {
  if (!mesh) {
    return
  }

  const direction = end.clone().sub(start)
  const length = Math.max(direction.length(), 0.001)
  direction.multiplyScalar(1 / length)

  mesh.position.copy(start).add(end).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(SEGMENT_AXIS, direction)
  mesh.scale.set(1, length, 1)
}

function BodyFabricMaterial({ color = SHIRT }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.94} metalness={0} />
}

function SkinMaterial({ color = SKIN }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.7} metalness={0} />
}

function Finger({
  side,
  index,
  x,
  proximal,
  distal,
  rootRefs,
  distalRefs,
}: {
  side: Side
  index: number
  x: number
  proximal: number
  distal: number
  rootRefs: React.MutableRefObject<Array<THREE.Group | null>>
  distalRefs: React.MutableRefObject<Array<THREE.Group | null>>
}) {
  const spread = (index - 1.5) * 0.025 * (side === 'left' ? -1 : 1)

  return (
    <group
      ref={(node) => {
        rootRefs.current[index] = node
      }}
      position={[x, 0, -0.05]}
      rotation={[0.05, spread, 0]}
    >
      <mesh raycast={() => null} position={[0, 0, -proximal / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.0105, proximal, 10]} />
        <SkinMaterial />
      </mesh>
      <mesh raycast={() => null} position={[0, 0, -proximal]} castShadow>
        <sphereGeometry args={[0.0105, 10, 8]} />
        <SkinMaterial />
      </mesh>
      <group
        ref={(node) => {
          distalRefs.current[index] = node
        }}
        position={[0, 0, -proximal]}
      >
        <mesh raycast={() => null} position={[0, 0, -distal / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.0075, 0.0095, distal, 10]} />
          <SkinMaterial />
        </mesh>
        <mesh raycast={() => null} position={[0, 0, -distal]} castShadow>
          <sphereGeometry args={[0.008, 10, 8]} />
          <SkinMaterial />
        </mesh>
      </group>
    </group>
  )
}

function ArticulatedHand({ side }: { side: Side }) {
  const fingerRoots = useRef<Array<THREE.Group | null>>([])
  const fingerDistals = useRef<Array<THREE.Group | null>>([])
  const thumb = useRef<THREE.Group>(null)
  const handAction = useGameStore((state) => state.handAction)
  const mirror = side === 'left' ? -1 : 1
  const fingerXs = [-0.033, -0.011, 0.011, 0.033]
  const proximalLengths = [0.048, 0.057, 0.054, 0.044]
  const distalLengths = [0.035, 0.041, 0.039, 0.032]

  useFrame((_, delta) => {
    let curl = 0.1
    let indexCurl = curl
    let thumbCurl = 0.16

    if (handAction) {
      const progress = THREE.MathUtils.clamp(
        (performance.now() - handAction.startedAt) / handAction.durationMs,
        0,
        1,
      )
      const pulse = Math.sin(progress * Math.PI)

      switch (handAction.kind) {
        case 'grab':
          curl += 0.95 * pulse
          thumbCurl += 0.68 * pulse
          break
        case 'turn':
          curl += 0.72 * pulse
          thumbCurl += 0.56 * pulse
          break
        case 'door':
          curl += 0.62 * pulse
          thumbCurl += 0.45 * pulse
          break
        case 'press':
          curl += 0.48 * pulse
          indexCurl = 0.08 + 0.08 * pulse
          thumbCurl += 0.35 * pulse
          break
        case 'reach':
          curl += 0.18 * pulse
          break
        case 'brace':
          curl += 0.12 * pulse
          break
        case 'startle':
          curl += 0.22 * pulse
          break
      }
    }

    const safeDelta = Math.min(delta, 0.05)
    fingerRoots.current.forEach((finger, index) => {
      if (!finger) {
        return
      }
      const target = index === 1 ? indexCurl : curl
      finger.rotation.x = THREE.MathUtils.damp(finger.rotation.x, target * 0.92, 16, safeDelta)
    })
    fingerDistals.current.forEach((finger, index) => {
      if (!finger) {
        return
      }
      const target = index === 1 ? indexCurl : curl
      finger.rotation.x = THREE.MathUtils.damp(finger.rotation.x, target * 0.82, 18, safeDelta)
    })
    if (thumb.current) {
      thumb.current.rotation.z = THREE.MathUtils.damp(
        thumb.current.rotation.z,
        mirror * (0.72 + thumbCurl * 0.5),
        16,
        safeDelta,
      )
      thumb.current.rotation.x = THREE.MathUtils.damp(
        thumb.current.rotation.x,
        0.18 + thumbCurl * 0.45,
        16,
        safeDelta,
      )
    }
  })

  return (
    <group scale={[0.96, 0.96, 0.96]}>
      <mesh raycast={() => null} position={[0, 0, 0.072]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.036, 0.043, 0.115, 14]} />
        <BodyFabricMaterial color={SHIRT_DARK} />
      </mesh>

      <RoundedBox
        args={[0.092, 0.036, 0.112]}
        radius={0.017}
        smoothness={5}
        position={[0, 0, 0]}
        raycast={() => null}
        castShadow
      >
        <SkinMaterial />
      </RoundedBox>

      <mesh raycast={() => null} position={[0, -0.021, 0.005]} scale={[0.038, 0.009, 0.052]} castShadow>
        <sphereGeometry args={[1, 12, 8]} />
        <SkinMaterial color={SKIN_SHADOW} />
      </mesh>

      {fingerXs.map((x, index) => (
        <Finger
          key={x}
          side={side}
          index={index}
          x={x}
          proximal={proximalLengths[index]}
          distal={distalLengths[index]}
          rootRefs={fingerRoots}
          distalRefs={fingerDistals}
        />
      ))}

      <group
        ref={thumb}
        position={[mirror * 0.052, -0.004, 0.016]}
        rotation={[0.2, 0, mirror * 0.72]}
      >
        <mesh raycast={() => null} position={[mirror * 0.018, 0, -0.017]} rotation={[Math.PI / 2, 0, mirror * 0.18]} castShadow>
          <cylinderGeometry args={[0.0105, 0.012, 0.048, 10]} />
          <SkinMaterial />
        </mesh>
        <mesh raycast={() => null} position={[mirror * 0.031, 0, -0.047]} scale={[0.012, 0.011, 0.025]} castShadow>
          <sphereGeometry args={[1, 10, 8]} />
          <SkinMaterial />
        </mesh>
      </group>
    </group>
  )
}

function TorsoAndLegs({
  torsoRef,
  leftThigh,
  rightThigh,
  leftKnee,
  rightKnee,
}: {
  torsoRef: React.RefObject<THREE.Group | null>
  leftThigh: React.RefObject<THREE.Group | null>
  rightThigh: React.RefObject<THREE.Group | null>
  leftKnee: React.RefObject<THREE.Group | null>
  rightKnee: React.RefObject<THREE.Group | null>
}) {
  return (
    <group>
      <group ref={torsoRef}>
        <RoundedBox args={[0.43, 0.34, 0.2]} radius={0.07} smoothness={5} position={[0, 1.23, 0.09]} raycast={() => null} castShadow>
          <BodyFabricMaterial />
        </RoundedBox>
        <RoundedBox args={[0.34, 0.29, 0.18]} radius={0.055} smoothness={5} position={[0, 0.99, 0.085]} raycast={() => null} castShadow>
          <BodyFabricMaterial color={SHIRT_DARK} />
        </RoundedBox>
        <mesh raycast={() => null} position={[0, 1.405, 0.085]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.075, 0.014, 10, 24, Math.PI]} />
          <BodyFabricMaterial color="#333b40" />
        </mesh>
        <mesh raycast={() => null} position={[0, 1.438, 0.09]} castShadow>
          <cylinderGeometry args={[0.057, 0.064, 0.085, 14]} />
          <SkinMaterial />
        </mesh>
        <mesh raycast={() => null} position={[-0.012, 1.255, -0.016]}>
          <boxGeometry args={[0.012, 0.2, 0.008]} />
          <meshStandardMaterial color="#4a5257" roughness={0.5} metalness={0.2} />
        </mesh>
      </group>

      <RoundedBox args={[0.35, 0.22, 0.2]} radius={0.06} smoothness={5} position={[0, 0.8, 0.085]} raycast={() => null} castShadow>
        <BodyFabricMaterial color={PANTS} />
      </RoundedBox>

      <group ref={leftThigh} position={[-0.105, 0.75, 0.08]}>
        <mesh raycast={() => null} position={[0, -0.18, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.23, 6, 12]} />
          <BodyFabricMaterial color={PANTS} />
        </mesh>
        <group ref={leftKnee} position={[0, -0.39, 0]}>
          <mesh raycast={() => null} position={[0, -0.17, 0]} castShadow>
            <capsuleGeometry args={[0.058, 0.22, 6, 12]} />
            <BodyFabricMaterial color={PANTS} />
          </mesh>
          <RoundedBox args={[0.13, 0.075, 0.25]} radius={0.035} smoothness={4} position={[0, -0.37, -0.075]} raycast={() => null} castShadow>
            <BodyFabricMaterial color={SHOES} />
          </RoundedBox>
        </group>
      </group>

      <group ref={rightThigh} position={[0.105, 0.75, 0.08]}>
        <mesh raycast={() => null} position={[0, -0.18, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.23, 6, 12]} />
          <BodyFabricMaterial color={PANTS} />
        </mesh>
        <group ref={rightKnee} position={[0, -0.39, 0]}>
          <mesh raycast={() => null} position={[0, -0.17, 0]} castShadow>
            <capsuleGeometry args={[0.058, 0.22, 6, 12]} />
            <BodyFabricMaterial color={PANTS} />
          </mesh>
          <RoundedBox args={[0.13, 0.075, 0.25]} radius={0.035} smoothness={4} position={[0, -0.37, -0.075]} raycast={() => null} castShadow>
            <BodyFabricMaterial color={SHOES} />
          </RoundedBox>
        </group>
      </group>
    </group>
  )
}

export function TrueFirstPersonBody({ enabled }: TrueFirstPersonBodyProps) {
  const { camera } = useThree()
  const root = useRef<THREE.Group>(null)
  const bodyOnly = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Group>(null)
  const leftThigh = useRef<THREE.Group>(null)
  const rightThigh = useRef<THREE.Group>(null)
  const leftKnee = useRef<THREE.Group>(null)
  const rightKnee = useRef<THREE.Group>(null)
  const leftUpperArm = useRef<THREE.Mesh>(null)
  const rightUpperArm = useRef<THREE.Mesh>(null)
  const leftForearm = useRef<THREE.Mesh>(null)
  const rightForearm = useRef<THREE.Mesh>(null)
  const leftElbowJoint = useRef<THREE.Mesh>(null)
  const rightElbowJoint = useRef<THREE.Mesh>(null)
  const leftHand = useRef<THREE.Group>(null)
  const rightHand = useRef<THREE.Group>(null)
  const previousCameraPosition = useRef(camera.position.clone())
  const movementAmount = useRef(0)
  const walkPhase = useRef(0)
  const bodyYaw = useRef(Math.PI)
  const awake = useGameStore((state) => Boolean(state.flags.awake))
  const handAction = useGameStore((state) => state.handAction)

  useFrame((state, delta) => {
    if (!root.current || !leftHand.current || !rightHand.current) {
      return
    }

    const safeDelta = Math.min(delta, 0.05)
    root.current.visible = enabled
    if (bodyOnly.current) {
      bodyOnly.current.visible = awake
    }

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
      horizontalDelta / Math.max(safeDelta, 0.001) / 2.2,
      0,
      1.35,
    )
    movementAmount.current = THREE.MathUtils.damp(
      movementAmount.current,
      targetMovement,
      8,
      safeDelta,
    )
    walkPhase.current += safeDelta * (5.4 + movementAmount.current * 3.3)

    const cameraForward = new THREE.Vector3()
    camera.getWorldDirection(cameraForward)
    cameraForward.y = 0
    if (cameraForward.lengthSq() < 0.0001) {
      cameraForward.set(0, 0, -1)
    }
    cameraForward.normalize()
    const targetYaw = Math.atan2(-cameraForward.x, -cameraForward.z)
    bodyYaw.current = dampAngle(bodyYaw.current, targetYaw, 11, safeDelta)

    root.current.position.set(camera.position.x, 0, camera.position.z)
    root.current.quaternion.setFromAxisAngle(UP, bodyYaw.current)

    const breath = Math.sin(state.clock.elapsedTime * 1.7) * 0.004
    if (torso.current) {
      torso.current.position.y = breath
      torso.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.72) * 0.003
    }

    const stride = Math.sin(walkPhase.current) * 0.28 * Math.min(movementAmount.current, 1)
    const kneeBendLeft = Math.max(0, -Math.sin(walkPhase.current)) * 0.34 * Math.min(movementAmount.current, 1)
    const kneeBendRight = Math.max(0, Math.sin(walkPhase.current)) * 0.34 * Math.min(movementAmount.current, 1)
    if (leftThigh.current) {
      leftThigh.current.rotation.x = THREE.MathUtils.damp(leftThigh.current.rotation.x, stride, 12, safeDelta)
    }
    if (rightThigh.current) {
      rightThigh.current.rotation.x = THREE.MathUtils.damp(rightThigh.current.rotation.x, -stride, 12, safeDelta)
    }
    if (leftKnee.current) {
      leftKnee.current.rotation.x = THREE.MathUtils.damp(leftKnee.current.rotation.x, kneeBendLeft, 14, safeDelta)
    }
    if (rightKnee.current) {
      rightKnee.current.rotation.x = THREE.MathUtils.damp(rightKnee.current.rotation.x, kneeBendRight, 14, safeDelta)
    }

    const bodyPosition = root.current.position
    const bodyQuaternion = root.current.quaternion
    const inverseBodyQuaternion = bodyQuaternion.clone().invert()
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize()
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize()
    const viewForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize()

    const leftWorld = camera.position.clone()
      .addScaledVector(cameraRight, -0.205)
      .addScaledVector(cameraUp, -0.305)
      .addScaledVector(viewForward, 0.48)
    const rightWorld = camera.position.clone()
      .addScaledVector(cameraRight, 0.205)
      .addScaledVector(cameraUp, -0.305)
      .addScaledVector(viewForward, 0.48)

    const actionPulse = handAction
      ? Math.sin(
        THREE.MathUtils.clamp(
          (performance.now() - handAction.startedAt) / handAction.durationMs,
          0,
          1,
        ) * Math.PI,
      )
      : 0

    if (handAction) {
      if (handAction.kind === 'brace') {
        leftWorld
          .addScaledVector(cameraRight, -0.025 * actionPulse)
          .addScaledVector(cameraUp, 0.12 * actionPulse)
          .addScaledVector(viewForward, 0.16 * actionPulse)
        rightWorld
          .addScaledVector(cameraRight, 0.025 * actionPulse)
          .addScaledVector(cameraUp, 0.12 * actionPulse)
          .addScaledVector(viewForward, 0.16 * actionPulse)
      } else if (handAction.kind === 'startle') {
        leftWorld
          .addScaledVector(cameraRight, 0.08 * actionPulse)
          .addScaledVector(cameraUp, 0.23 * actionPulse)
          .addScaledVector(viewForward, 0.06 * actionPulse)
        rightWorld
          .addScaledVector(cameraRight, -0.08 * actionPulse)
          .addScaledVector(cameraUp, 0.23 * actionPulse)
          .addScaledVector(viewForward, 0.06 * actionPulse)
      } else {
        let desiredRight = camera.position.clone()
          .addScaledVector(cameraRight, 0.12)
          .addScaledVector(cameraUp, -0.17)
          .addScaledVector(viewForward, 0.66)

        if (handAction.target) {
          const requestedTarget = new THREE.Vector3(...handAction.target)
          const shoulderWorld = RIGHT_SHOULDER.clone().applyQuaternion(bodyQuaternion).add(bodyPosition)
          const reachVector = requestedTarget.sub(shoulderWorld)
          const reachLength = Math.min(reachVector.length(), 0.72)
          if (reachVector.lengthSq() > 0.0001) {
            desiredRight = shoulderWorld.add(reachVector.normalize().multiplyScalar(reachLength))
          }
        }

        rightWorld.lerp(desiredRight, actionPulse)
        if (handAction.kind === 'grab' || handAction.kind === 'turn' || handAction.kind === 'door') {
          leftWorld
            .addScaledVector(cameraRight, 0.025 * actionPulse)
            .addScaledVector(cameraUp, 0.045 * actionPulse)
            .addScaledVector(viewForward, 0.055 * actionPulse)
        }
      }
    }

    const toLocal = (world: THREE.Vector3) => world
      .clone()
      .sub(bodyPosition)
      .applyQuaternion(inverseBodyQuaternion)

    const leftWristLocal = toLocal(leftWorld)
    const rightWristLocal = toLocal(rightWorld)

    const leftElbow = LEFT_SHOULDER.clone().lerp(leftWristLocal, 0.5)
    leftElbow.x -= 0.115
    leftElbow.y -= 0.055
    leftElbow.z += 0.035

    const rightElbow = RIGHT_SHOULDER.clone().lerp(rightWristLocal, 0.5)
    rightElbow.x += 0.115
    rightElbow.y -= 0.055
    rightElbow.z += 0.035

    setSegment(leftUpperArm.current, LEFT_SHOULDER, leftElbow)
    setSegment(rightUpperArm.current, RIGHT_SHOULDER, rightElbow)
    setSegment(leftForearm.current, leftElbow, leftWristLocal)
    setSegment(rightForearm.current, rightElbow, rightWristLocal)

    if (leftElbowJoint.current) {
      leftElbowJoint.current.position.copy(leftElbow)
    }
    if (rightElbowJoint.current) {
      rightElbowJoint.current.position.copy(rightElbow)
    }

    const smoothing = 1 - Math.exp(-18 * safeDelta)
    leftHand.current.position.lerp(leftWristLocal, smoothing)
    rightHand.current.position.lerp(rightWristLocal, smoothing)

    const cameraLocalQuaternion = inverseBodyQuaternion.clone().multiply(camera.quaternion)
    const leftOffset = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, -0.05, -0.11))
    const rightOffset = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, 0.05, 0.11))
    leftHand.current.quaternion.slerp(cameraLocalQuaternion.clone().multiply(leftOffset), smoothing)
    rightHand.current.quaternion.slerp(cameraLocalQuaternion.clone().multiply(rightOffset), smoothing)
  })

  return (
    <group ref={root} visible={enabled}>
      <group ref={bodyOnly} visible={awake}>
        <TorsoAndLegs
          torsoRef={torso}
          leftThigh={leftThigh}
          rightThigh={rightThigh}
          leftKnee={leftKnee}
          rightKnee={rightKnee}
        />
      </group>

      <mesh ref={leftUpperArm} raycast={() => null} castShadow>
        <cylinderGeometry args={[0.061, 0.067, 1, 14]} />
        <BodyFabricMaterial />
      </mesh>
      <mesh ref={rightUpperArm} raycast={() => null} castShadow>
        <cylinderGeometry args={[0.061, 0.067, 1, 14]} />
        <BodyFabricMaterial />
      </mesh>
      <mesh ref={leftForearm} raycast={() => null} castShadow>
        <cylinderGeometry args={[0.046, 0.056, 1, 14]} />
        <BodyFabricMaterial color={SHIRT_DARK} />
      </mesh>
      <mesh ref={rightForearm} raycast={() => null} castShadow>
        <cylinderGeometry args={[0.046, 0.056, 1, 14]} />
        <BodyFabricMaterial color={SHIRT_DARK} />
      </mesh>

      <mesh ref={leftElbowJoint} raycast={() => null} castShadow>
        <sphereGeometry args={[0.062, 12, 9]} />
        <BodyFabricMaterial />
      </mesh>
      <mesh ref={rightElbowJoint} raycast={() => null} castShadow>
        <sphereGeometry args={[0.062, 12, 9]} />
        <BodyFabricMaterial />
      </mesh>

      <group ref={leftHand}>
        <ArticulatedHand side="left" />
      </group>
      <group ref={rightHand}>
        <ArticulatedHand side="right" />
      </group>
    </group>
  )
}
