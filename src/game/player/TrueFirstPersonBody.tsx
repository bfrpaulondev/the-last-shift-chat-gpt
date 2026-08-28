import { RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../state/gameStore'

interface TrueFirstPersonBodyProps {
  enabled: boolean
}

type Side = 'left' | 'right'

const SKIN = '#a86f59'
const SKIN_SHADOW = '#895445'
const NAIL = '#d4a18d'
const SHIRT = '#20282e'
const SHIRT_DARK = '#151b20'
const PANTS = '#24272b'
const SHOES = '#18191b'
const UP = new THREE.Vector3(0, 1, 0)
const SEGMENT_AXIS = new THREE.Vector3(0, 1, 0)
const SEGMENT_DIRECTION = new THREE.Vector3()
const SEGMENT_MIDPOINT = new THREE.Vector3()
const LEFT_SHOULDER = new THREE.Vector3(-0.235, 1.365, 0.055)
const RIGHT_SHOULDER = new THREE.Vector3(0.235, 1.365, 0.055)

function smooth01(value: number): number {
  const t = THREE.MathUtils.clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

function gripWindow(progress: number): number {
  const enter = smooth01(progress / 0.4)
  const leave = 1 - smooth01((progress - 0.82) / 0.18)
  return Math.min(enter, leave)
}

function dampAngle(current: number, target: number, lambda: number, delta: number): number {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current))
  return current + difference * (1 - Math.exp(-lambda * delta))
}

function setSegment(mesh: THREE.Mesh | null, start: THREE.Vector3, end: THREE.Vector3): void {
  if (!mesh) {
    return
  }

  SEGMENT_DIRECTION.copy(end).sub(start)
  const length = Math.max(SEGMENT_DIRECTION.length(), 0.001)
  SEGMENT_DIRECTION.multiplyScalar(1 / length)
  SEGMENT_MIDPOINT.copy(start).add(end).multiplyScalar(0.5)

  mesh.position.copy(SEGMENT_MIDPOINT)
  mesh.quaternion.setFromUnitVectors(SEGMENT_AXIS, SEGMENT_DIRECTION)
  mesh.scale.set(1, length, 1)
}

function BodyFabricMaterial({ color = SHIRT }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.94} metalness={0} />
}

function SkinMaterial({ color = SKIN }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.68} metalness={0} />
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
  rootRefs: MutableRefObject<Array<THREE.Group | null>>
  distalRefs: MutableRefObject<Array<THREE.Group | null>>
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
        <mesh raycast={() => null} position={[0, 0.0075, -distal * 0.74]} scale={[0.0067, 0.0022, 0.012]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={NAIL} roughness={0.5} />
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
    const curls = [0.1, 0.1, 0.1, 0.1]
    let thumbCurl = 0.16

    if (handAction) {
      const progress = THREE.MathUtils.clamp(
        (performance.now() - handAction.startedAt) / handAction.durationMs,
        0,
        1,
      )
      const contact = gripWindow(progress)
      const pulse = Math.sin(progress * Math.PI)
      const isRight = side === 'right'

      if (isRight && handAction.objectId === 'coffee') {
        curls[0] += 0.44 * contact
        curls[1] += 0.05 * contact
        curls[2] += 0.5 * contact
        curls[3] += 0.58 * contact
        thumbCurl += 0.32 * contact
      } else if (isRight && handAction.objectId === 'door_exit') {
        curls[0] += 0.9 * contact
        curls[1] += 0.82 * contact
        curls[2] += 0.94 * contact
        curls[3] += 1.0 * contact
        thumbCurl += 0.7 * contact
      } else if (isRight && handAction.objectId === 'faucet_bathroom') {
        curls[0] += 0.72 * contact
        curls[1] += 0.7 * contact
        curls[2] += 0.78 * contact
        curls[3] += 0.84 * contact
        thumbCurl += 0.72 * contact
      } else if (isRight && handAction.objectId === 'phone') {
        curls[0] += 0.52 * contact
        curls[1] += 0.46 * contact
        curls[2] += 0.58 * contact
        curls[3] += 0.66 * contact
        thumbCurl += 0.62 * contact
      } else if (isRight && handAction.objectId === 'badge') {
        curls[0] += 0.25 * contact
        curls[1] += 0.82 * contact
        curls[2] += 0.32 * contact
        curls[3] += 0.25 * contact
        thumbCurl += 0.92 * contact
      } else {
        switch (handAction.kind) {
          case 'grab':
            curls.forEach((_, index) => { curls[index] += 0.95 * pulse })
            thumbCurl += 0.68 * pulse
            break
          case 'turn':
            curls.forEach((_, index) => { curls[index] += 0.72 * pulse })
            thumbCurl += 0.56 * pulse
            break
          case 'door':
            curls.forEach((_, index) => { curls[index] += 0.62 * pulse })
            thumbCurl += 0.45 * pulse
            break
          case 'press':
            curls[0] += 0.48 * pulse
            curls[1] += 0.08 * pulse
            curls[2] += 0.5 * pulse
            curls[3] += 0.55 * pulse
            thumbCurl += 0.35 * pulse
            break
          case 'reach':
            curls.forEach((_, index) => { curls[index] += 0.18 * pulse })
            break
          case 'brace':
            curls.forEach((_, index) => { curls[index] += 0.12 * pulse })
            break
          case 'startle':
            curls.forEach((_, index) => { curls[index] += 0.22 * pulse })
            break
        }
      }
    }

    const safeDelta = Math.min(delta, 0.05)
    fingerRoots.current.forEach((finger, index) => {
      if (!finger) {
        return
      }
      finger.rotation.x = THREE.MathUtils.damp(
        finger.rotation.x,
        curls[index] * 0.92,
        18,
        safeDelta,
      )
    })
    fingerDistals.current.forEach((finger, index) => {
      if (!finger) {
        return
      }
      finger.rotation.x = THREE.MathUtils.damp(
        finger.rotation.x,
        curls[index] * 0.82,
        20,
        safeDelta,
      )
    })
    if (thumb.current) {
      thumb.current.rotation.z = THREE.MathUtils.damp(
        thumb.current.rotation.z,
        mirror * (0.72 + thumbCurl * 0.5),
        18,
        safeDelta,
      )
      thumb.current.rotation.x = THREE.MathUtils.damp(
        thumb.current.rotation.x,
        0.18 + thumbCurl * 0.45,
        18,
        safeDelta,
      )
    }
  })

  return (
    <group scale={[0.93, 0.93, 0.93]}>
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
        <mesh raycast={() => null} position={[mirror * 0.031, 0.004, -0.047]} scale={[0.012, 0.011, 0.025]} castShadow>
          <sphereGeometry args={[1, 10, 8]} />
          <SkinMaterial />
        </mesh>
        <mesh raycast={() => null} position={[mirror * 0.032, 0.013, -0.052]} scale={[0.007, 0.002, 0.012]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={NAIL} roughness={0.5} />
        </mesh>
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

  const scratch = useRef({
    cameraForward: new THREE.Vector3(),
    cameraRight: new THREE.Vector3(),
    cameraUp: new THREE.Vector3(),
    viewForward: new THREE.Vector3(),
    leftWorld: new THREE.Vector3(),
    rightWorld: new THREE.Vector3(),
    desiredRight: new THREE.Vector3(),
    holdWorld: new THREE.Vector3(),
    requestedTarget: new THREE.Vector3(),
    shoulderWorld: new THREE.Vector3(),
    reachVector: new THREE.Vector3(),
    leftWristLocal: new THREE.Vector3(),
    rightWristLocal: new THREE.Vector3(),
    leftElbow: new THREE.Vector3(),
    rightElbow: new THREE.Vector3(),
    inverseBodyQuaternion: new THREE.Quaternion(),
    cameraLocalQuaternion: new THREE.Quaternion(),
    leftTargetQuaternion: new THREE.Quaternion(),
    rightTargetQuaternion: new THREE.Quaternion(),
    interactionQuaternion: new THREE.Quaternion(),
    leftOffset: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, -0.05, -0.11)),
    rightOffset: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, 0.05, 0.11)),
    interactionEuler: new THREE.Euler(),
  })

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

    const s = scratch.current
    camera.getWorldDirection(s.cameraForward)
    s.cameraForward.y = 0
    if (s.cameraForward.lengthSq() < 0.0001) {
      s.cameraForward.set(0, 0, -1)
    }
    s.cameraForward.normalize()

    const targetYaw = Math.atan2(-s.cameraForward.x, -s.cameraForward.z)
    bodyYaw.current = dampAngle(bodyYaw.current, targetYaw, 11, safeDelta)
    root.current.position.set(camera.position.x, 0, camera.position.z)
    root.current.quaternion.setFromAxisAngle(UP, bodyYaw.current)

    let actionProgress = 0
    let actionContact = 0
    if (handAction) {
      actionProgress = THREE.MathUtils.clamp(
        (performance.now() - handAction.startedAt) / handAction.durationMs,
        0,
        1,
      )
      actionContact = gripWindow(actionProgress)
    }

    const breath = Math.sin(state.clock.elapsedTime * 1.7) * 0.004
    if (torso.current) {
      torso.current.position.y = breath
      const leanTarget = handAction?.objectId ? -0.018 * actionContact : 0
      torso.current.rotation.x = THREE.MathUtils.damp(torso.current.rotation.x, leanTarget, 10, safeDelta)
      torso.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.72) * 0.003
    }

    const stride = Math.sin(walkPhase.current) * 0.28 * Math.min(movementAmount.current, 1)
    const leftRecovery = Math.max(0, -Math.sin(walkPhase.current)) * 0.34 * Math.min(movementAmount.current, 1)
    const rightRecovery = Math.max(0, Math.sin(walkPhase.current)) * 0.34 * Math.min(movementAmount.current, 1)

    if (leftThigh.current) {
      leftThigh.current.rotation.x = THREE.MathUtils.damp(leftThigh.current.rotation.x, stride, 12, safeDelta)
    }
    if (rightThigh.current) {
      rightThigh.current.rotation.x = THREE.MathUtils.damp(rightThigh.current.rotation.x, -stride, 12, safeDelta)
    }
    if (leftKnee.current) {
      leftKnee.current.rotation.x = THREE.MathUtils.damp(leftKnee.current.rotation.x, leftRecovery, 14, safeDelta)
    }
    if (rightKnee.current) {
      rightKnee.current.rotation.x = THREE.MathUtils.damp(rightKnee.current.rotation.x, rightRecovery, 14, safeDelta)
    }

    s.inverseBodyQuaternion.copy(root.current.quaternion).invert()
    s.cameraRight.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize()
    s.cameraUp.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize()
    s.viewForward.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize()

    s.leftWorld.copy(camera.position)
      .addScaledVector(s.cameraRight, -0.205)
      .addScaledVector(s.cameraUp, -0.305)
      .addScaledVector(s.viewForward, 0.48)
    s.rightWorld.copy(camera.position)
      .addScaledVector(s.cameraRight, 0.205)
      .addScaledVector(s.cameraUp, -0.305)
      .addScaledVector(s.viewForward, 0.48)

    if (handAction) {
      const pulse = Math.sin(actionProgress * Math.PI)

      if (handAction.kind === 'brace') {
        s.leftWorld
          .addScaledVector(s.cameraRight, -0.025 * pulse)
          .addScaledVector(s.cameraUp, 0.12 * pulse)
          .addScaledVector(s.viewForward, 0.16 * pulse)
        s.rightWorld
          .addScaledVector(s.cameraRight, 0.025 * pulse)
          .addScaledVector(s.cameraUp, 0.12 * pulse)
          .addScaledVector(s.viewForward, 0.16 * pulse)
      } else if (handAction.kind === 'startle') {
        s.leftWorld
          .addScaledVector(s.cameraRight, 0.08 * pulse)
          .addScaledVector(s.cameraUp, 0.23 * pulse)
          .addScaledVector(s.viewForward, 0.06 * pulse)
        s.rightWorld
          .addScaledVector(s.cameraRight, -0.08 * pulse)
          .addScaledVector(s.cameraUp, 0.23 * pulse)
          .addScaledVector(s.viewForward, 0.06 * pulse)
      } else {
        s.desiredRight.copy(camera.position)
          .addScaledVector(s.cameraRight, 0.12)
          .addScaledVector(s.cameraUp, -0.17)
          .addScaledVector(s.viewForward, 0.66)

        if (handAction.target) {
          s.requestedTarget.set(...handAction.target)
          s.shoulderWorld.copy(RIGHT_SHOULDER)
            .applyQuaternion(root.current.quaternion)
            .add(root.current.position)
          s.reachVector.copy(s.requestedTarget).sub(s.shoulderWorld)
          const reachLength = Math.min(s.reachVector.length(), 0.72)
          if (s.reachVector.lengthSq() > 0.0001) {
            s.desiredRight.copy(s.shoulderWorld)
              .add(s.reachVector.normalize().multiplyScalar(reachLength))
          }
        }

        const approach = smooth01(actionProgress / 0.38)
        const release = smooth01((actionProgress - 0.84) / 0.16)
        const reachBlend = approach * (1 - release)
        s.rightWorld.lerp(s.desiredRight, reachBlend)

        if (handAction.objectId === 'coffee') {
          const press = Math.sin(smooth01((actionProgress - 0.34) / 0.38) * Math.PI)
          s.rightWorld
            .addScaledVector(s.viewForward, 0.026 * press)
            .addScaledVector(s.cameraUp, 0.012 * actionContact)
        } else if (handAction.objectId === 'door_exit') {
          s.rightWorld
            .addScaledVector(s.cameraUp, -0.018 * actionContact)
            .addScaledVector(s.cameraRight, -0.018 * actionContact)
        } else if (handAction.objectId === 'faucet_bathroom') {
          s.rightWorld
            .addScaledVector(s.cameraUp, -0.012 * actionContact)
            .addScaledVector(s.viewForward, 0.012 * actionContact)
        } else if (handAction.objectId === 'phone') {
          const lift = smooth01((actionProgress - 0.48) / 0.32)
          s.holdWorld.copy(camera.position)
            .addScaledVector(s.cameraRight, 0.14)
            .addScaledVector(s.cameraUp, -0.17)
            .addScaledVector(s.viewForward, 0.42)
          s.rightWorld.lerp(s.holdWorld, lift)
          s.leftWorld
            .addScaledVector(s.cameraRight, 0.055 * lift)
            .addScaledVector(s.cameraUp, 0.035 * lift)
            .addScaledVector(s.viewForward, 0.06 * lift)
        } else if (handAction.objectId === 'badge') {
          if (handAction.variant === 'badge-pickup') {
            const lift = smooth01((actionProgress - 0.48) / 0.3)
            s.holdWorld.copy(camera.position)
              .addScaledVector(s.cameraRight, 0.13)
              .addScaledVector(s.cameraUp, -0.2)
              .addScaledVector(s.viewForward, 0.43)
            s.rightWorld.lerp(s.holdWorld, lift)
          } else if (handAction.variant === 'badge-slip' && actionProgress > 0.58) {
            const recoil = smooth01((actionProgress - 0.58) / 0.24)
            s.rightWorld
              .addScaledVector(s.cameraUp, 0.07 * recoil)
              .addScaledVector(s.viewForward, -0.06 * recoil)
          }
        }

        if (
          handAction.kind === 'grab' ||
          handAction.kind === 'turn' ||
          handAction.kind === 'door'
        ) {
          s.leftWorld
            .addScaledVector(s.cameraRight, 0.025 * actionContact)
            .addScaledVector(s.cameraUp, 0.045 * actionContact)
            .addScaledVector(s.viewForward, 0.055 * actionContact)
        }
      }
    }

    s.leftWristLocal.copy(s.leftWorld)
      .sub(root.current.position)
      .applyQuaternion(s.inverseBodyQuaternion)
    s.rightWristLocal.copy(s.rightWorld)
      .sub(root.current.position)
      .applyQuaternion(s.inverseBodyQuaternion)

    s.leftElbow.copy(LEFT_SHOULDER).lerp(s.leftWristLocal, 0.5)
    s.leftElbow.x -= 0.115
    s.leftElbow.y -= 0.055
    s.leftElbow.z += 0.035

    s.rightElbow.copy(RIGHT_SHOULDER).lerp(s.rightWristLocal, 0.5)
    s.rightElbow.x += 0.115
    s.rightElbow.y -= 0.055
    s.rightElbow.z += 0.035

    if (handAction?.objectId === 'phone' || handAction?.variant === 'badge-pickup') {
      s.rightElbow.x -= 0.045 * actionContact
      s.rightElbow.z += 0.035 * actionContact
    }

    setSegment(leftUpperArm.current, LEFT_SHOULDER, s.leftElbow)
    setSegment(rightUpperArm.current, RIGHT_SHOULDER, s.rightElbow)
    setSegment(leftForearm.current, s.leftElbow, s.leftWristLocal)
    setSegment(rightForearm.current, s.rightElbow, s.rightWristLocal)

    if (leftElbowJoint.current) {
      leftElbowJoint.current.position.copy(s.leftElbow)
    }
    if (rightElbowJoint.current) {
      rightElbowJoint.current.position.copy(s.rightElbow)
    }

    const smoothing = 1 - Math.exp(-18 * safeDelta)
    leftHand.current.position.lerp(s.leftWristLocal, smoothing)
    rightHand.current.position.lerp(s.rightWristLocal, smoothing)

    s.cameraLocalQuaternion.copy(s.inverseBodyQuaternion).multiply(camera.quaternion)
    s.leftTargetQuaternion.copy(s.cameraLocalQuaternion).multiply(s.leftOffset)
    s.rightTargetQuaternion.copy(s.cameraLocalQuaternion).multiply(s.rightOffset)

    s.interactionEuler.set(0, 0, 0)
    if (handAction?.objectId === 'door_exit') {
      s.interactionEuler.set(0.08 * actionContact, -0.08 * actionContact, -0.58 * actionContact)
    } else if (handAction?.objectId === 'faucet_bathroom') {
      s.interactionEuler.set(-0.12 * actionContact, 0.28 * actionContact, -0.82 * actionContact)
    } else if (handAction?.objectId === 'coffee') {
      s.interactionEuler.set(-0.34 * actionContact, 0.02, -0.06 * actionContact)
    } else if (handAction?.objectId === 'phone') {
      const lift = smooth01((actionProgress - 0.48) / 0.32)
      s.interactionEuler.set(-0.16 - 0.12 * lift, 0.1 * lift, 0.06 * lift)
    } else if (handAction?.objectId === 'badge') {
      s.interactionEuler.set(-0.18 * actionContact, 0.04, 0.14 * actionContact)
    }

    s.interactionQuaternion.setFromEuler(s.interactionEuler)
    s.rightTargetQuaternion.multiply(s.interactionQuaternion)
    leftHand.current.quaternion.slerp(s.leftTargetQuaternion, smoothing)
    rightHand.current.quaternion.slerp(s.rightTargetQuaternion, smoothing)
  })

  return (
    <group ref={root} visible={enabled}>
      <group ref={bodyOnly} visible={awake}>
        <group ref={torso}>
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
