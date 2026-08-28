import { useGameStore } from '../../state/gameStore'

function OfficeShell() {
  return (
    <group raycast={() => null}>
      <mesh position={[0, -0.06, -0.2]} receiveShadow>
        <boxGeometry args={[14, 0.12, 17]} />
        <meshStandardMaterial color="#484a47" roughness={0.88} metalness={0.05} />
      </mesh>
      <mesh position={[-6.95, 1.45, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 2.9, 17]} />
        <meshStandardMaterial color="#d4d2c8" roughness={0.92} />
      </mesh>
      <mesh position={[6.95, 1.45, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 2.9, 17]} />
        <meshStandardMaterial color="#d4d2c8" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.45, -8.65]} castShadow receiveShadow>
        <boxGeometry args={[14, 2.9, 0.1]} />
        <meshStandardMaterial color="#c9c9c3" roughness={0.9} />
      </mesh>
      <mesh position={[-4.2, 1.45, 8.15]} castShadow receiveShadow>
        <boxGeometry args={[5.6, 2.9, 0.1]} />
        <meshStandardMaterial color="#c6c7c2" roughness={0.9} />
      </mesh>
      <mesh position={[4.2, 1.45, 8.15]} castShadow receiveShadow>
        <boxGeometry args={[5.6, 2.9, 0.1]} />
        <meshStandardMaterial color="#c6c7c2" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.9, -0.2]} receiveShadow>
        <boxGeometry args={[14, 0.1, 17]} />
        <meshStandardMaterial color="#ecebe5" roughness={0.96} />
      </mesh>
    </group>
  )
}

function CubicleBanks() {
  return (
    <group raycast={() => null}>
      <mesh position={[-3.85, 0.56, -2.25]} castShadow>
        <boxGeometry args={[3.5, 1.12, 1.15]} />
        <meshStandardMaterial color="#737b7c" roughness={0.64} metalness={0.12} />
      </mesh>
      <mesh position={[-3.85, 0.84, -2.25]}>
        <boxGeometry args={[3.34, 0.05, 1]} />
        <meshStandardMaterial color="#b5aa95" roughness={0.68} />
      </mesh>
      <mesh position={[3.75, 0.56, -4.42]} castShadow>
        <boxGeometry args={[3.5, 1.12, 1.15]} />
        <meshStandardMaterial color="#737b7c" roughness={0.64} metalness={0.12} />
      </mesh>
      <mesh position={[3.75, 0.84, -4.42]}>
        <boxGeometry args={[3.34, 0.05, 1]} />
        <meshStandardMaterial color="#b5aa95" roughness={0.68} />
      </mesh>
      <mesh position={[0.15, 0.8, -6.35]}>
        <boxGeometry args={[0.06, 1.55, 3.2]} />
        <meshStandardMaterial color="#aeb5b3" roughness={0.74} />
      </mesh>
    </group>
  )
}

function CleaningCart() {
  const ready = useGameStore((state) => Boolean(state.flags.floor22_cart_ready))

  return (
    <group position={[-3.65, 0, 2.95]}>
      <mesh position={[0, 0.46, 0]} castShadow userData={{ floor22InteractableId: 'cleaning-cart' }}>
        <boxGeometry args={[1.05, 0.72, 1.15]} />
        <meshStandardMaterial color="#59656a" metalness={0.45} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.88, 0]} userData={{ floor22InteractableId: 'work-order' }}>
        <boxGeometry args={[0.62, 0.06, 0.82]} />
        <meshStandardMaterial color="#d7d0bd" roughness={0.78} />
      </mesh>
      <mesh position={[-0.34, 0.15, 0.4]}>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 16]} />
        <meshStandardMaterial color="#20262a" roughness={0.55} />
      </mesh>
      <mesh position={[0.34, 0.15, 0.4]}>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 16]} />
        <meshStandardMaterial color="#20262a" roughness={0.55} />
      </mesh>
      <mesh position={[0.31, 1.05, -0.18]}>
        <cylinderGeometry args={[0.1, 0.1, 0.42, 16]} />
        <meshStandardMaterial color={ready ? '#6fa7b4' : '#758087'} emissive={ready ? '#17343c' : '#000000'} emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}

function Spill() {
  const cleaned = useGameStore((state) => Boolean(state.flags.floor22_spill_cleaned))
  if (cleaned) return null

  return (
    <mesh
      position={[2.15, 0.015, -1.25]}
      rotation={[-Math.PI / 2, 0, 0]}
      userData={{ floor22InteractableId: 'spill' }}
    >
      <circleGeometry args={[0.78, 28]} />
      <meshStandardMaterial color="#2f4144" roughness={0.2} metalness={0.06} transparent opacity={0.72} />
    </mesh>
  )
}

function WasteStation() {
  const emptied = useGameStore((state) => Boolean(state.flags.floor22_waste_emptied))

  return (
    <group position={[-4.78, 0, -5.85]}>
      <mesh position={[0, 0.54, 0]} castShadow userData={{ floor22InteractableId: 'waste-bin' }}>
        <boxGeometry args={[0.9, 1.08, 0.95]} />
        <meshStandardMaterial color={emptied ? '#343a3b' : '#2d3032'} roughness={0.7} metalness={0.25} />
      </mesh>
      {!emptied && (
        <mesh position={[0, 1.06, 0]}>
          <boxGeometry args={[0.72, 0.12, 0.72]} />
          <meshStandardMaterial color="#50565a" roughness={0.82} />
        </mesh>
      )}
    </group>
  )
}

function ElevatorDoor() {
  const complete = useGameStore((state) => Boolean(state.flags.floor22_routine_complete))

  return (
    <group position={[0, 0, 8.08]}>
      <mesh position={[-0.67, 1.28, 0]} castShadow userData={{ floor22InteractableId: 'elevator-return' }}>
        <boxGeometry args={[1.3, 2.5, 0.1]} />
        <meshStandardMaterial color="#899092" metalness={0.76} roughness={0.28} />
      </mesh>
      <mesh position={[0.67, 1.28, 0]} castShadow userData={{ floor22InteractableId: 'elevator-return' }}>
        <boxGeometry args={[1.3, 2.5, 0.1]} />
        <meshStandardMaterial color="#899092" metalness={0.76} roughness={0.28} />
      </mesh>
      <mesh position={[1.68, 1.35, -0.03]}>
        <boxGeometry args={[0.24, 0.48, 0.1]} />
        <meshStandardMaterial color="#202526" emissive={complete ? '#6bbf91' : '#7c4929'} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Floor22Scene() {
  return (
    <>
      <color attach="background" args={['#a9afb0']} />
      <fog attach="fog" args={['#a9afb0', 10, 26]} />
      <ambientLight color="#dce5e4" intensity={0.33} />
      <directionalLight position={[3, 7, 5]} color="#f0f4ef" intensity={0.7} castShadow />
      <pointLight position={[-4, 2.55, 3]} color="#edf5ee" intensity={0.72} distance={8} decay={2} />
      <pointLight position={[3, 2.55, -3]} color="#e7f0ec" intensity={0.76} distance={9} decay={2} />
      <OfficeShell />
      <CubicleBanks />
      <CleaningCart />
      <Spill />
      <WasteStation />
      <ElevatorDoor />
    </>
  )
}
