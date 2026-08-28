import { useGameStore } from '../../state/gameStore'

function Shell() {
  return (
    <group raycast={() => null}>
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[12.4, 0.08, 13.6]} />
        <meshStandardMaterial color="#353a3b" roughness={0.84} metalness={0.12} />
      </mesh>
      <mesh position={[0, 2.7, 0]} receiveShadow>
        <boxGeometry args={[12.4, 0.1, 13.6]} />
        <meshStandardMaterial color="#d5d8d4" roughness={0.82} />
      </mesh>
      <mesh position={[-6.05, 1.35, 0]} receiveShadow>
        <boxGeometry args={[0.18, 2.7, 13.6]} />
        <meshStandardMaterial color="#9ea5a2" roughness={0.76} />
      </mesh>
      <mesh position={[6.05, 1.35, 0]} receiveShadow>
        <boxGeometry args={[0.18, 2.7, 13.6]} />
        <meshStandardMaterial color="#9ea5a2" roughness={0.76} />
      </mesh>
      <mesh position={[0, 1.35, -6.7]} receiveShadow>
        <boxGeometry args={[12.4, 2.7, 0.18]} />
        <meshStandardMaterial color="#a9afab" roughness={0.78} />
      </mesh>
      <mesh position={[-3.65, 1.35, 6.7]} receiveShadow>
        <boxGeometry args={[4.9, 2.7, 0.18]} />
        <meshStandardMaterial color="#9da4a0" roughness={0.78} />
      </mesh>
      <mesh position={[3.65, 1.35, 6.7]} receiveShadow>
        <boxGeometry args={[4.9, 2.7, 0.18]} />
        <meshStandardMaterial color="#9da4a0" roughness={0.78} />
      </mesh>
    </group>
  )
}

function Tables() {
  return (
    <group raycast={() => null}>
      {[-3.5, 0, 3.5].map((x) => (
        <group key={x} position={[x, 0, -2.2]}>
          <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.25, 0.12, 1.25]} />
            <meshStandardMaterial color="#a79a83" roughness={0.62} />
          </mesh>
          <mesh position={[-0.82, 0.37, -0.42]} castShadow>
            <boxGeometry args={[0.12, 0.74, 0.12]} />
            <meshStandardMaterial color="#555b5b" metalness={0.55} roughness={0.34} />
          </mesh>
          <mesh position={[0.82, 0.37, 0.42]} castShadow>
            <boxGeometry args={[0.12, 0.74, 0.12]} />
            <meshStandardMaterial color="#555b5b" metalness={0.55} roughness={0.34} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function CoffeeStation() {
  const coffeeTaken = useGameStore((state) => Boolean(state.flags.cafeteria_coffee_taken))
  return (
    <group position={[-3.6, 0, 1.8]}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.1, 1.15]} />
        <meshStandardMaterial color="#616768" metalness={0.42} roughness={0.42} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow userData={{ cafeteriaInteractableId: 'coffee-machine' }}>
        <boxGeometry args={[0.95, 1.0, 0.72]} />
        <meshStandardMaterial color="#24292a" metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh position={[0.12, 1.48, -0.38]} userData={{ cafeteriaInteractableId: 'coffee-machine' }}>
        <boxGeometry args={[0.25, 0.1, 0.08]} />
        <meshStandardMaterial emissive={coffeeTaken ? '#71c99c' : '#d4a94e'} emissiveIntensity={0.95} color="#202525" toneMapped={false} />
      </mesh>
    </group>
  )
}

function BreakTable() {
  const breakTaken = useGameStore((state) => Boolean(state.flags.cafeteria_break_taken))
  return (
    <group position={[0, 0, 1]}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow userData={{ cafeteriaInteractableId: 'break-seat' }}>
        <boxGeometry args={[2.4, 0.12, 1.25]} />
        <meshStandardMaterial color={breakTaken ? '#7f7665' : '#9e927d'} roughness={0.64} />
      </mesh>
      <mesh position={[0, 0.48, 1.05]} castShadow userData={{ cafeteriaInteractableId: 'break-seat' }}>
        <boxGeometry args={[1.0, 0.1, 0.52]} />
        <meshStandardMaterial color="#4c5454" metalness={0.42} roughness={0.46} />
      </mesh>
    </group>
  )
}

function NoticeAndExit() {
  return (
    <>
      <mesh position={[3.65, 1.4, -6.56]} userData={{ cafeteriaInteractableId: 'break-notice' }}>
        <boxGeometry args={[1.45, 0.95, 0.06]} />
        <meshStandardMaterial color="#ddd7c7" roughness={0.78} />
      </mesh>
      <group position={[0, 0, 6.57]}>
        <mesh position={[-0.66, 1.28, 0]} castShadow userData={{ cafeteriaInteractableId: 'elevator-return' }}>
          <boxGeometry args={[1.28, 2.5, 0.12]} />
          <meshStandardMaterial color="#8d9495" metalness={0.72} roughness={0.28} />
        </mesh>
        <mesh position={[0.66, 1.28, 0]} castShadow userData={{ cafeteriaInteractableId: 'elevator-return' }}>
          <boxGeometry args={[1.28, 2.5, 0.12]} />
          <meshStandardMaterial color="#8d9495" metalness={0.72} roughness={0.28} />
        </mesh>
      </group>
    </>
  )
}

export function CafeteriaScene() {
  return (
    <>
      <color attach="background" args={['#15191a']} />
      <fog attach="fog" args={['#15191a', 10, 24]} />
      <ambientLight color="#c6d0cc" intensity={0.32} />
      <pointLight position={[0, 2.4, 0]} color="#eef2e9" intensity={1.15} distance={11} decay={2} />
      <pointLight position={[-4, 2.25, 2]} color="#e6d5b7" intensity={0.52} distance={6} decay={2} />
      <Shell />
      <Tables />
      <CoffeeStation />
      <BreakTable />
      <NoticeAndExit />
    </>
  )
}
