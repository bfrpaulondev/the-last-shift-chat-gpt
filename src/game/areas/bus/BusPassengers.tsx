import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

type PassengerRole =
  | 'book'
  | 'paulo'
  | 'knitting'
  | 'executive'
  | 'colleague-a'
  | 'colleague-b'
  | 'cap'

interface PassengerProps {
  id: string
  role: PassengerRole
  position: [number, number, number]
  rotationY: number
  shirt: string
  trousers: string
  skin?: string
}

function BookProp() {
  return (
    <group position={[0.03, 0.08, -0.28]} rotation={[-0.7, 0.08, 0]} raycast={() => null}>
      <mesh>
        <boxGeometry args={[0.27, 0.36, 0.035]} />
        <meshStandardMaterial color="#3d5449" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0, 0.019]}>
        <planeGeometry args={[0.22, 0.3]} />
        <meshStandardMaterial color="#d1c9ae" roughness={0.86} />
      </mesh>
    </group>
  )
}

function BriefcaseProp() {
  return (
    <group position={[0.28, -0.14, -0.18]} rotation={[0, 0.1, 0]} raycast={() => null}>
      <mesh>
        <boxGeometry args={[0.38, 0.25, 0.09]} />
        <meshStandardMaterial color="#302822" roughness={0.42} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.165, 0]}>
        <torusGeometry args={[0.075, 0.012, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#4b4035" roughness={0.38} />
      </mesh>
    </group>
  )
}

function KnittingProp() {
  return (
    <group position={[0, 0.02, -0.29]} raycast={() => null}>
      <mesh position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.09, 12, 8]} />
        <meshStandardMaterial color="#6d4855" roughness={0.95} />
      </mesh>
      <mesh position={[-0.05, 0.12, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.006, 0.006, 0.42, 6]} />
        <meshStandardMaterial color="#a9a6a0" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[0.05, 0.12, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.006, 0.006, 0.42, 6]} />
        <meshStandardMaterial color="#a9a6a0" metalness={0.55} roughness={0.28} />
      </mesh>
    </group>
  )
}

function BackwardCap({ color = '#22282c' }: { color?: string }) {
  return (
    <group position={[0, 0.28, -0.005]} raycast={() => null}>
      <mesh scale={[1.05, 0.46, 1.04]}>
        <sphereGeometry args={[0.19, 16, 10, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        <meshStandardMaterial color={color} roughness={0.76} />
      </mesh>
      <mesh position={[0, 0.015, 0.19]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.23, 0.13, 0.025]} />
        <meshStandardMaterial color={color} roughness={0.74} />
      </mesh>
    </group>
  )
}

function Passenger({ id, role, position, rotationY, shirt, trousers, skin = '#9d6a53' }: PassengerProps) {
  const root = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const nervousLeg = useRef<THREE.Group>(null)
  const phase = (id.length * 1.37) % Math.PI

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase
    if (root.current) {
      root.current.position.y = position[1] + Math.sin(t * 1.15) * 0.004
    }
    if (head.current) {
      if (role === 'cap') {
        head.current.rotation.y = Math.sin(t * 0.58) * 0.32
        head.current.rotation.x = -0.05 + Math.sin(t * 0.9) * 0.025
      } else {
        head.current.rotation.y = Math.sin(t * 0.25) * 0.04
      }
    }
    if (nervousLeg.current && role === 'paulo') {
      nervousLeg.current.rotation.x = -0.82 + Math.sin(t * 8.4) * 0.08
    }
  })

  return (
    <group
      ref={root}
      position={position}
      rotation={[0, rotationY, 0]}
      userData={{ busInteractableId: id, passengerRole: role }}
    >
      <mesh position={[0, 0.77, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.48, 5, 10]} />
        <meshStandardMaterial color={shirt} roughness={0.84} />
      </mesh>
      <group ref={head} position={[0, 1.28, -0.01]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshStandardMaterial color={skin} roughness={0.78} />
        </mesh>
        <mesh position={[0, 0.02, -0.165]} scale={[1.02, 0.78, 0.3]}>
          <sphereGeometry args={[0.16, 12, 8]} />
          <meshStandardMaterial color={role === 'executive' ? '#2d2521' : '#33271f'} roughness={0.88} />
        </mesh>
        {role === 'cap' && <BackwardCap />}
      </group>

      <group position={[-0.14, 0.38, -0.2]} rotation={[-0.85, 0, -0.05]}>
        <mesh>
          <capsuleGeometry args={[0.075, 0.4, 4, 8]} />
          <meshStandardMaterial color={trousers} roughness={0.9} />
        </mesh>
      </group>
      <group ref={nervousLeg} position={[0.14, 0.38, -0.2]} rotation={[-0.82, 0, 0.05]}>
        <mesh>
          <capsuleGeometry args={[0.075, 0.4, 4, 8]} />
          <meshStandardMaterial color={trousers} roughness={0.9} />
        </mesh>
      </group>
      <mesh position={[-0.26, 0.68, -0.12]} rotation={[-0.35, 0, 0.28]}>
        <capsuleGeometry args={[0.06, 0.36, 4, 8]} />
        <meshStandardMaterial color={shirt} roughness={0.86} />
      </mesh>
      <mesh position={[0.26, 0.68, -0.12]} rotation={[-0.35, 0, -0.28]}>
        <capsuleGeometry args={[0.06, 0.36, 4, 8]} />
        <meshStandardMaterial color={shirt} roughness={0.86} />
      </mesh>

      {role === 'book' && <BookProp />}
      {role === 'executive' && <BriefcaseProp />}
      {role === 'knitting' && <KnittingProp />}
    </group>
  )
}

function Driver() {
  const head = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (head.current) head.current.rotation.y = Math.sin(clock.elapsedTime * 0.17) * 0.035
  })
  return (
    <group position={[0.58, 0.02, -3.84]} rotation={[0, Math.PI, 0]} raycast={() => null}>
      <mesh position={[0, 0.78, 0]}>
        <capsuleGeometry args={[0.21, 0.5, 5, 10]} />
        <meshStandardMaterial color="#344552" roughness={0.84} />
      </mesh>
      <group ref={head} position={[0, 1.3, 0]}>
        <mesh>
          <sphereGeometry args={[0.18, 14, 10]} />
          <meshStandardMaterial color="#8e5f49" roughness={0.8} />
        </mesh>
      </group>
      <mesh position={[0, 0.43, -0.27]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.025, 8, 18]} />
        <meshStandardMaterial color="#1c2022" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function BusPassengers() {
  const pickpocketLeft = useGameStore((state) => Boolean(state.flags.pickpocket_left_bus))

  return (
    <group>
      <Driver />
      <Passenger id="passenger-book" role="book" position={[-0.76, 0.04, 2.72]} rotationY={Math.PI} shirt="#605a4d" trousers="#2d3132" skin="#a8755b" />
      <Passenger id="passenger-paulo" role="paulo" position={[0.76, 0.04, 1.72]} rotationY={Math.PI} shirt="#716052" trousers="#2f3337" skin="#885a48" />
      <Passenger id="passenger-knitting" role="knitting" position={[-0.76, 0.04, 0.62]} rotationY={Math.PI} shirt="#695563" trousers="#343337" skin="#b78064" />
      <Passenger id="passenger-executive" role="executive" position={[0.76, 0.04, -0.42]} rotationY={0} shirt="#30363b" trousers="#20252a" skin="#9a6850" />
      <Passenger id="gossip-colleagues" role="colleague-a" position={[-0.76, 0.04, -1.26]} rotationY={0} shirt="#695e52" trousers="#303438" skin="#a76f58" />
      <Passenger id="gossip-colleagues" role="colleague-b" position={[0.76, 0.04, -1.72]} rotationY={0} shirt="#4f6260" trousers="#292f31" skin="#9f6c55" />
      {!pickpocketLeft && (
        <Passenger id="passenger-cap" role="cap" position={[-0.76, 0.04, -2.48]} rotationY={0} shirt="#41494b" trousers="#282d30" skin="#8f604e" />
      )}
    </group>
  )
}
