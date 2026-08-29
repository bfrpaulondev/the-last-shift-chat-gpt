import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const WAYPOINTS = {
  parking: new THREE.Vector3(-0.8, 0.22, 4.8),
  technical: new THREE.Vector3(2.2, 0.22, -0.2),
  archive: new THREE.Vector3(-0.4, 0.22, -8.9),
  return: new THREE.Vector3(5.6, 0.22, -12.8),
}

function targetFor(flags: Record<string, boolean>) {
  if (flags.canary_live || flags.canary_killed) return WAYPOINTS.return
  if (flags.ghost_switch_found) return WAYPOINTS.archive
  if (flags.cam04_frozen) return WAYPOINTS.technical
  return WAYPOINTS.parking
}

export function JudasCat() {
  const { camera } = useThree()
  const root = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const frontLeft = useRef<THREE.Group>(null)
  const frontRight = useRef<THREE.Group>(null)
  const backLeft = useRef<THREE.Group>(null)
  const backRight = useRef<THREE.Group>(null)
  const flags = useGameStore((state) => state.flags)
  const scratch = useMemo(() => ({
    target: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    frustum: new THREE.Frustum(),
    matrix: new THREE.Matrix4(),
    direction: new THREE.Vector3(),
  }), [])

  useFrame((state, delta) => {
    const cat = root.current
    if (!cat) return
    cat.visible = Boolean(flags.false_positive_cat)
    if (!cat.visible) return

    const target = targetFor(flags)
    scratch.target.copy(target)
    scratch.toTarget.copy(target).sub(cat.position)
    const distance = scratch.toTarget.length()
    const moving = distance > 0.22

    if (moving) {
      const speed = Math.min(distance * 1.5, 1.45)
      scratch.toTarget.normalize()
      cat.position.addScaledVector(scratch.toTarget, Math.min(delta, 0.05) * speed)
      cat.rotation.y = THREE.MathUtils.damp(
        cat.rotation.y,
        Math.atan2(scratch.toTarget.x, scratch.toTarget.z),
        8,
        Math.min(delta, 0.05),
      )
    }

    const pace = state.clock.elapsedTime * 9
    const walk = moving ? 0.46 : 0.04
    if (frontLeft.current) frontLeft.current.rotation.x = Math.sin(pace) * walk
    if (backRight.current) backRight.current.rotation.x = Math.sin(pace) * walk
    if (frontRight.current) frontRight.current.rotation.x = -Math.sin(pace) * walk
    if (backLeft.current) backLeft.current.rotation.x = -Math.sin(pace) * walk

    if (tail.current) {
      tail.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.1) * 0.35
      tail.current.rotation.x = 0.55 + Math.sin(state.clock.elapsedTime * 1.3) * 0.08
    }

    const archiveLook = flags.ghost_switch_found && !flags.cat_looks_up && cat.position.z < -8.2
    if (head.current) {
      head.current.rotation.x = THREE.MathUtils.damp(
        head.current.rotation.x,
        archiveLook ? -0.62 : moving ? 0 : 0.08,
        8,
        Math.min(delta, 0.05),
      )
      head.current.rotation.y = moving
        ? Math.sin(state.clock.elapsedTime * 1.6) * 0.08
        : Math.sin(state.clock.elapsedTime * 0.7) * 0.18
    }

    scratch.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    scratch.frustum.setFromProjectionMatrix(scratch.matrix)
    if (!scratch.frustum.containsPoint(cat.position) && distance > 5.5) {
      scratch.direction.copy(target).sub(camera.position)
      scratch.direction.y = 0
      if (scratch.direction.lengthSq() > 0.001) scratch.direction.normalize()
      else scratch.direction.set(0, 0, -1)
      cat.position.copy(camera.position).addScaledVector(scratch.direction, 4)
      cat.position.y = 0.22
    }
  })

  const legs: Array<[
    string,
    number,
    number,
    MutableRefObject<THREE.Group | null>,
  ]> = [
    ['frontLeft', -0.2, 0.26, frontLeft],
    ['frontRight', 0.2, 0.26, frontRight],
    ['backLeft', -0.2, -0.3, backLeft],
    ['backRight', 0.2, -0.3, backRight],
  ]

  return (
    <group
      ref={root}
      name="judas-cat"
      position={[-0.8, 0.22, 4.8]}
      userData={{ basementInteractableId: 'judas' }}
    >
      <mesh castShadow scale={[0.34, 0.25, 0.56]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#111214" roughness={0.86} />
      </mesh>
      <group ref={head} position={[0, 0.18, 0.47]}>
        <mesh castShadow scale={[0.26, 0.25, 0.25]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#0d0e10" roughness={0.82} />
        </mesh>
        <mesh position={[-0.14, 0.19, 0.02]} rotation={[0, 0, -0.28]}>
          <coneGeometry args={[0.09, 0.2, 4]} />
          <meshStandardMaterial color="#111214" roughness={0.85} />
        </mesh>
        <mesh position={[0.14, 0.19, 0.02]} rotation={[0, 0, 0.28]}>
          <coneGeometry args={[0.09, 0.2, 4]} />
          <meshStandardMaterial color="#111214" roughness={0.85} />
        </mesh>
        <mesh position={[-0.085, 0.04, 0.22]} scale={[0.025, 0.035, 0.018]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#c7cf78" emissive="#8c944e" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0.085, 0.04, 0.22]} scale={[0.025, 0.035, 0.018]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#c7cf78" emissive="#8c944e" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, -0.08, 0.18]} scale={[0.035, 0.02, 0.025]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#7f5f62" roughness={0.7} />
        </mesh>
      </group>
      <mesh position={[0, 0.03, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.025, 6, 16]} />
        <meshStandardMaterial color="#b71c1c" roughness={0.68} />
      </mesh>
      <group ref={tail} position={[0, 0.05, -0.48]} rotation={[0.55, 0, 0]}>
        <mesh position={[0, 0.25, -0.12]} rotation={[0.45, 0, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.06, 0.65, 8]} />
          <meshStandardMaterial color="#101113" roughness={0.88} />
        </mesh>
      </group>
      {legs.map(([key, x, z, ref]) => (
        <group key={key} ref={ref} position={[x, -0.13, z]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 0.44, 7]} />
            <meshStandardMaterial color="#111214" roughness={0.88} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
