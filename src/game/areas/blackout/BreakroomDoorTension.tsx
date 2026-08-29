import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const SHIFT_ANGLE = THREE.MathUtils.degToRad(15)

export function BreakroomDoorTension() {
  const door = useRef<THREE.Group>(null)
  const shiftedThisMount = useRef(false)
  const visionReturned = useGameStore((state) => Boolean(state.flags.blackout_vision_returned))
  const persistedShift = useGameStore((state) => Boolean(state.flags.breakroom_door_shifted))

  useEffect(() => {
    if (door.current && persistedShift) door.current.rotation.y = SHIFT_ANGLE
  }, [persistedShift])

  useFrame(({ clock }) => {
    if (!door.current || !visionReturned || persistedShift || shiftedThisMount.current) return
    const cycle = clock.elapsedTime % 4.65
    if (cycle < 0.2 || cycle > 0.27) return

    door.current.rotation.y = SHIFT_ANGLE
    shiftedThisMount.current = true
    useGameStore.getState().setFlag('breakroom_door_shifted')
  })

  return (
    <group position={[2.05, 1.15, -4.9]} raycast={() => null}>
      <group ref={door}>
        <mesh castShadow position={[0.92, 0, 0]}>
          <boxGeometry args={[1.84, 2.3, 0.12]} />
          <meshStandardMaterial color="#31363a" roughness={0.58} metalness={0.24} />
        </mesh>
        <mesh castShadow position={[1.62, -0.02, -0.1]}>
          <boxGeometry args={[0.42, 0.07, 0.09]} />
          <meshStandardMaterial color="#858b8e" roughness={0.3} metalness={0.68} />
        </mesh>
      </group>
    </group>
  )
}
