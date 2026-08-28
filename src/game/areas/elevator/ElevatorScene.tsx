import { useGameStore } from '../../state/gameStore'

function CabinShell() {
  return (
    <group raycast={() => null}>
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[4, 0.08, 4]} />
        <meshStandardMaterial color="#35393b" metalness={0.55} roughness={0.34} />
      </mesh>
      <mesh position={[0, 2.65, 0]} receiveShadow>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial color="#c8cbca" metalness={0.38} roughness={0.48} />
      </mesh>
      <mesh position={[-1.98, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 2.6, 4]} />
        <meshStandardMaterial color="#777d7f" metalness={0.72} roughness={0.3} />
      </mesh>
      <mesh position={[1.98, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 2.6, 4]} />
        <meshStandardMaterial color="#777d7f" metalness={0.72} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.3, 1.98]} castShadow receiveShadow>
        <boxGeometry args={[4, 2.6, 0.08]} />
        <meshStandardMaterial color="#6d7375" metalness={0.7} roughness={0.32} />
      </mesh>
    </group>
  )
}

function FrontDoors() {
  const arrived22 = useGameStore((state) => Boolean(state.flags.elevator_arrived_22))
  const floor22Complete = useGameStore((state) => Boolean(state.flags.floor22_routine_complete))
  const ride30Started = useGameStore((state) => Boolean(state.flags.elevator_ride_to_30_started))
  const arrived30 = useGameStore((state) => Boolean(state.flags.elevator_arrived_30))
  const floor30Complete = useGameStore((state) => Boolean(state.flags.floor30_routine_complete))
  const rideCafeteriaStarted = useGameStore((state) => Boolean(state.flags.elevator_ride_to_cafeteria_started))
  const arrivedCafeteria = useGameStore((state) => Boolean(state.flags.elevator_arrived_cafeteria))
  const cafeteriaComplete = useGameStore((state) => Boolean(state.flags.cafeteria_break_complete))
  const ride37Started = useGameStore((state) => Boolean(state.flags.elevator_ride_to_37_started))
  const arrived37 = useGameStore((state) => Boolean(state.flags.elevator_arrived_37))

  let open = arrived22 && !floor22Complete
  if (floor22Complete) open = !ride30Started || arrived30
  if (floor30Complete) open = !rideCafeteriaStarted || arrivedCafeteria
  if (cafeteriaComplete) open = !ride37Started || arrived37

  const offset = open ? 0.64 : 0

  return (
    <group position={[0, 0, -1.94]}>
      <mesh position={[-0.66 - offset, 1.28, 0]} castShadow userData={{ elevatorInteractableId: 'doors' }}>
        <boxGeometry args={[1.28, 2.5, 0.09]} />
        <meshStandardMaterial color="#92999b" metalness={0.82} roughness={0.22} />
      </mesh>
      <mesh position={[0.66 + offset, 1.28, 0]} castShadow userData={{ elevatorInteractableId: 'doors' }}>
        <boxGeometry args={[1.28, 2.5, 0.09]} />
        <meshStandardMaterial color="#92999b" metalness={0.82} roughness={0.22} />
      </mesh>
    </group>
  )
}

function ControlPanel() {
  const ride22Started = useGameStore((state) => Boolean(state.flags.elevator_ride_started))
  const floor22Complete = useGameStore((state) => Boolean(state.flags.floor22_routine_complete))
  const ride30Started = useGameStore((state) => Boolean(state.flags.elevator_ride_to_30_started))
  const floor30Complete = useGameStore((state) => Boolean(state.flags.floor30_routine_complete))
  const rideCafeteriaStarted = useGameStore((state) => Boolean(state.flags.elevator_ride_to_cafeteria_started))
  const cafeteriaComplete = useGameStore((state) => Boolean(state.flags.cafeteria_break_complete))
  const ride37Started = useGameStore((state) => Boolean(state.flags.elevator_ride_to_37_started))
  const arrived22 = useGameStore((state) => Boolean(state.flags.elevator_arrived_22))
  const arrived30 = useGameStore((state) => Boolean(state.flags.elevator_arrived_30))
  const arrivedCafeteria = useGameStore((state) => Boolean(state.flags.elevator_arrived_cafeteria))
  const arrived37 = useGameStore((state) => Boolean(state.flags.elevator_arrived_37))
  const anyArrived = arrived37 || arrivedCafeteria || arrived30 || arrived22

  return (
    <group position={[1.83, 1.2, -0.35]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.08, 1.72, 0.86]} />
        <meshStandardMaterial color="#555b5d" metalness={0.88} roughness={0.2} />
      </mesh>
      <mesh position={[0.047, 0.46, -0.22]} userData={{ elevatorInteractableId: 'floor-22-button' }}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
        <meshStandardMaterial color="#d6d9d7" emissive={ride22Started ? '#f4c65d' : '#202522'} emissiveIntensity={ride22Started ? 1.05 : 0.08} metalness={0.65} roughness={0.22} />
      </mesh>
      <mesh position={[0.047, 0.46, 0.22]} userData={{ elevatorInteractableId: 'floor-30-button' }}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
        <meshStandardMaterial color={floor22Complete ? '#d6d9d7' : '#767b7b'} emissive={ride30Started ? '#f4c65d' : '#202522'} emissiveIntensity={ride30Started ? 1.05 : 0.05} metalness={0.65} roughness={0.22} />
      </mesh>
      <mesh position={[0.047, 0.12, -0.22]} userData={{ elevatorInteractableId: 'cafeteria-button' }}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
        <meshStandardMaterial color={floor30Complete ? '#d6d9d7' : '#767b7b'} emissive={rideCafeteriaStarted ? '#f4c65d' : '#202522'} emissiveIntensity={rideCafeteriaStarted ? 1.05 : 0.05} metalness={0.65} roughness={0.22} />
      </mesh>
      <mesh position={[0.047, 0.12, 0.22]} userData={{ elevatorInteractableId: 'floor-37-button' }}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
        <meshStandardMaterial color={cafeteriaComplete ? '#d6d9d7' : '#767b7b'} emissive={ride37Started ? '#f4c65d' : '#202522'} emissiveIntensity={ride37Started ? 1.05 : 0.05} metalness={0.65} roughness={0.22} />
      </mesh>
      <mesh position={[0.047, -0.36, 0]} userData={{ elevatorInteractableId: 'service-notice' }}>
        <boxGeometry args={[0.05, 0.38, 0.58]} />
        <meshStandardMaterial color="#d8d3c4" roughness={0.78} />
      </mesh>
      <mesh position={[0.047, 0.72, 0]}>
        <boxGeometry args={[0.05, 0.18, 0.58]} />
        <meshStandardMaterial color="#101719" emissive={anyArrived ? '#72d3a5' : '#d6a84f'} emissiveIntensity={0.85} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function ElevatorScene() {
  return (
    <>
      <color attach="background" args={['#111416']} />
      <fog attach="fog" args={['#111416', 7, 16]} />
      <ambientLight color="#b9c5c7" intensity={0.28} />
      <pointLight position={[0, 2.38, 0.3]} color="#e5efec" intensity={1.25} distance={7} decay={2} />
      <pointLight position={[0, 2.32, -1.2]} color="#cbd8d7" intensity={0.65} distance={5} decay={2} />
      <CabinShell />
      <FrontDoors />
      <ControlPanel />
    </>
  )
}
