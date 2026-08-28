import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../state/gameStore'

const PHONE_SOURCE = new THREE.Vector3(-1.12, 0.72, -2.1)
const BADGE_WALL_SOURCE = new THREE.Vector3(0.22, 1.52, 2.86)
const BADGE_FLOOR_SOURCE = new THREE.Vector3(0.4, 0.045, 2.38)

function smooth01(value: number): number {
  const t = THREE.MathUtils.clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

function gripWindow(progress: number): number {
  const enter = smooth01(progress / 0.42)
  const leave = 1 - smooth01((progress - 0.78) / 0.22)
  return Math.min(enter, leave)
}

function actionProgress(startedAt: number, durationMs: number): number {
  return THREE.MathUtils.clamp((performance.now() - startedAt) / durationMs, 0, 1)
}

function DoorHardware() {
  const lever = useRef<THREE.Group>(null)
  const action = useGameStore((state) => state.handAction)

  useFrame((_, delta) => {
    if (!lever.current) {
      return
    }
    const active = action?.objectId === 'door_exit'
    const target = active ? -0.52 * gripWindow(actionProgress(action.startedAt, action.durationMs)) : 0
    lever.current.rotation.z = THREE.MathUtils.damp(lever.current.rotation.z, target, 20, Math.min(delta, 0.05))
  })

  return (
    <group position={[1.27, 1.08, 2.815]}>
      <mesh raycast={() => null} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.018, 20]} />
        <meshStandardMaterial color="#8f7e60" metalness={0.78} roughness={0.24} />
      </mesh>
      <group ref={lever}>
        <mesh raycast={() => null} position={[-0.11, 0, -0.012]}>
          <boxGeometry args={[0.22, 0.035, 0.045]} />
          <meshStandardMaterial color="#a18e69" metalness={0.82} roughness={0.2} />
        </mesh>
        <mesh raycast={() => null} position={[-0.225, 0, -0.012]}>
          <sphereGeometry args={[0.026, 12, 8]} />
          <meshStandardMaterial color="#9c8966" metalness={0.8} roughness={0.22} />
        </mesh>
      </group>
    </group>
  )
}

function FaucetHardware() {
  const valve = useRef<THREE.Group>(null)
  const action = useGameStore((state) => state.handAction)

  useFrame((_, delta) => {
    if (!valve.current) {
      return
    }
    const active = action?.objectId === 'faucet_bathroom'
    const progress = active ? actionProgress(action.startedAt, action.durationMs) : 0
    const target = active ? -1.08 * gripWindow(progress) : 0
    valve.current.rotation.y = THREE.MathUtils.damp(valve.current.rotation.y, target, 18, Math.min(delta, 0.05))
  })

  return (
    <group position={[1.98, 1.055, -2.705]}>
      <mesh raycast={() => null} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.028, 18]} />
        <meshStandardMaterial color="#aab0b2" metalness={0.9} roughness={0.18} />
      </mesh>
      <group ref={valve}>
        <mesh raycast={() => null}>
          <boxGeometry args={[0.19, 0.028, 0.035]} />
          <meshStandardMaterial color="#b0b5b6" metalness={0.9} roughness={0.17} />
        </mesh>
        <mesh raycast={() => null} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.19, 0.028, 0.035]} />
          <meshStandardMaterial color="#b0b5b6" metalness={0.9} roughness={0.17} />
        </mesh>
      </group>
    </group>
  )
}

function CoffeeHardware() {
  const button = useRef<THREE.Mesh>(null)
  const lamp = useRef<THREE.Mesh>(null)
  const action = useGameStore((state) => state.handAction)
  const coffeeMade = useGameStore((state) => Boolean(state.flags.coffee_made))

  useFrame((_, delta) => {
    const active = action?.objectId === 'coffee'
    const progress = active ? actionProgress(action.startedAt, action.durationMs) : 0
    const press = active ? Math.sin(Math.min(progress / 0.72, 1) * Math.PI) : 0

    if (button.current) {
      button.current.position.z = THREE.MathUtils.damp(
        button.current.position.z,
        2.365 + press * 0.018,
        25,
        Math.min(delta, 0.05),
      )
    }
    if (lamp.current) {
      const material = lamp.current.material as THREE.MeshStandardMaterial
      const target = coffeeMade ? 1.2 : active && progress > 0.38 ? 0.82 : 0.08
      material.emissiveIntensity = THREE.MathUtils.damp(
        material.emissiveIntensity,
        target,
        16,
        Math.min(delta, 0.05),
      )
    }
  })

  return (
    <group>
      <mesh ref={button} raycast={() => null} position={[-1.6, 1.315, 2.365]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.036, 0.036, 0.018, 18]} />
        <meshStandardMaterial color="#454b4c" metalness={0.62} roughness={0.24} />
      </mesh>
      <mesh ref={lamp} raycast={() => null} position={[-1.51, 1.315, 2.354]}>
        <sphereGeometry args={[0.018, 12, 8]} />
        <meshStandardMaterial color="#6e8f63" emissive="#8fd071" emissiveIntensity={0.08} toneMapped={false} />
      </mesh>
    </group>
  )
}

function PhoneProxy() {
  const { camera, scene } = useThree()
  const group = useRef<THREE.Group>(null)
  const sourceQuaternion = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, -0.12)))
  const targetQuaternion = useRef(new THREE.Quaternion())
  const offsetQuaternion = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.08, 0.08, 0.05)))
  const right = useRef(new THREE.Vector3())
  const up = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const hold = useRef(new THREE.Vector3())
  const original = useRef<THREE.Object3D | null>(null)
  const action = useGameStore((state) => state.handAction)
  const phoneChecked = useGameStore((state) => Boolean(state.flags.phone_checked))

  useEffect(() => {
    scene.traverse((object) => {
      if (object.userData.interactableId === 'phone' && object.name !== 'cinematic-phone-proxy') {
        original.current = object
      }
    })
    return () => {
      if (original.current) {
        original.current.visible = true
      }
    }
  }, [scene])

  useFrame(() => {
    if (!group.current) {
      return
    }
    const active = action?.objectId === 'phone'
    const progress = active ? actionProgress(action.startedAt, action.durationMs) : 0
    const lift = smooth01((progress - 0.28) / 0.42)
    const visible = active && progress > 0.24

    if (original.current) {
      original.current.visible = !phoneChecked && !(active && progress > 0.31)
    }
    group.current.visible = visible
    if (!visible) {
      return
    }

    right.current.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize()
    up.current.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize()
    forward.current.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize()
    hold.current.copy(camera.position)
      .addScaledVector(right.current, 0.14)
      .addScaledVector(up.current, -0.17)
      .addScaledVector(forward.current, 0.42)

    group.current.position.lerpVectors(PHONE_SOURCE, hold.current, lift)
    targetQuaternion.current.copy(camera.quaternion).multiply(offsetQuaternion.current)
    group.current.quaternion.copy(sourceQuaternion.current).slerp(targetQuaternion.current, lift)
  })

  return (
    <group ref={group} name="cinematic-phone-proxy" visible={false}>
      <mesh raycast={() => null} castShadow>
        <boxGeometry args={[0.145, 0.265, 0.018]} />
        <meshPhysicalMaterial color="#0e1218" roughness={0.2} metalness={0.5} clearcoat={0.55} clearcoatRoughness={0.12} />
      </mesh>
      <mesh raycast={() => null} position={[0, 0, 0.0105]}>
        <planeGeometry args={[0.13, 0.235]} />
        <meshStandardMaterial color="#18242c" emissive="#35515f" emissiveIntensity={0.18} roughness={0.12} toneMapped={false} />
      </mesh>
      <mesh raycast={() => null} position={[0, -0.102, 0.012]}>
        <circleGeometry args={[0.011, 16]} />
        <meshStandardMaterial color="#252b2f" metalness={0.38} roughness={0.32} />
      </mesh>
    </group>
  )
}

function BadgeProxy() {
  const { camera, scene } = useThree()
  const group = useRef<THREE.Group>(null)
  const wallBadge = useRef<THREE.Object3D | null>(null)
  const right = useRef(new THREE.Vector3())
  const up = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const hold = useRef(new THREE.Vector3())
  const targetQuaternion = useRef(new THREE.Quaternion())
  const offsetQuaternion = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.02, 0.03, -0.08)))
  const action = useGameStore((state) => state.handAction)
  const dropped = useGameStore((state) => Boolean(state.flags.badge_dropped))
  const taken = useGameStore((state) => Boolean(state.flags.badge_taken))

  useEffect(() => {
    scene.traverse((object) => {
      if (object.userData.interactableId === 'badge' && object.name !== 'badge-floor') {
        wallBadge.current = object
      }
    })
  }, [scene])

  useFrame(() => {
    if (!group.current) {
      return
    }
    const active = action?.objectId === 'badge'
    const progress = active ? actionProgress(action.startedAt, action.durationMs) : 0
    const slip = active && action.variant === 'badge-slip'
    const pickup = active && action.variant === 'badge-pickup'
    const floor = scene.getObjectByName('badge-floor')

    if (wallBadge.current) {
      wallBadge.current.visible = !dropped && !taken && !(slip && progress > 0.26)
    }
    if (floor) {
      floor.visible = dropped && !taken && !(pickup && progress > 0.25)
    }

    group.current.visible = (slip || pickup) && progress > 0.24
    if (!group.current.visible) {
      return
    }

    right.current.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize()
    up.current.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize()
    forward.current.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize()
    hold.current.copy(camera.position)
      .addScaledVector(right.current, 0.13)
      .addScaledVector(up.current, -0.2)
      .addScaledVector(forward.current, 0.43)

    const source = pickup ? BADGE_FLOOR_SOURCE : BADGE_WALL_SOURCE
    let blend = smooth01((progress - 0.24) / 0.32)
    group.current.position.lerpVectors(source, hold.current, blend)

    if (slip && progress > 0.58) {
      const fall = smooth01((progress - 0.58) / 0.32)
      group.current.position.lerp(BADGE_FLOOR_SOURCE, fall)
      group.current.rotation.z += 0.045
      blend *= 1 - fall * 0.25
    }

    targetQuaternion.current.copy(camera.quaternion).multiply(offsetQuaternion.current)
    group.current.quaternion.slerp(targetQuaternion.current, Math.max(0.12, blend))
  })

  return (
    <group ref={group} visible={false}>
      <mesh raycast={() => null} castShadow>
        <boxGeometry args={[0.19, 0.125, 0.012]} />
        <meshStandardMaterial color="#c9d1bd" roughness={0.7} />
      </mesh>
      <mesh raycast={() => null} position={[0, 0, 0.007]}>
        <planeGeometry args={[0.17, 0.105]} />
        <meshBasicMaterial color="#9faa92" />
      </mesh>
      <mesh raycast={() => null} position={[0, 0.092, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.085, 8]} />
        <meshStandardMaterial color="#4e5050" metalness={0.65} roughness={0.32} />
      </mesh>
    </group>
  )
}

export function CinematicPropAnimations() {
  return (
    <>
      <DoorHardware />
      <FaucetHardware />
      <CoffeeHardware />
      <PhoneProxy />
      <BadgeProxy />
    </>
  )
}
