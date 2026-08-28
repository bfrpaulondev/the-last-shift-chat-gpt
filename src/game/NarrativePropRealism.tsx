import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

function FridgeNoteWear() {
  return (
    <group position={[-2.697, 1.42, 1.34]} rotation={[0, Math.PI / 2, 0]}>
      <mesh raycast={() => null} position={[0.012, -0.012, -0.01]}>
        <planeGeometry args={[0.405, 0.515]} />
        <meshBasicMaterial color="#16120e" transparent opacity={0.24} depthWrite={false} />
      </mesh>

      <mesh raycast={() => null} position={[0.16, -0.225, 0.02]} rotation={[0.18, 0.08, -0.12]}>
        <planeGeometry args={[0.075, 0.085]} />
        <meshStandardMaterial color="#d4c7a7" roughness={0.94} side={THREE.DoubleSide} />
      </mesh>

      <mesh raycast={() => null} position={[0, 0.06, 0.021]}>
        <planeGeometry args={[0.34, 0.006]} />
        <meshBasicMaterial color="#6f6554" transparent opacity={0.24} depthWrite={false} />
      </mesh>
      <mesh raycast={() => null} position={[-0.02, -0.105, 0.021]} rotation={[0, 0, 0.02]}>
        <planeGeometry args={[0.31, 0.005]} />
        <meshBasicMaterial color="#6f6554" transparent opacity={0.16} depthWrite={false} />
      </mesh>

      <mesh raycast={() => null} position={[-0.165, 0.235, 0.022]} rotation={[0, 0, -0.35]}>
        <planeGeometry args={[0.095, 0.024]} />
        <meshStandardMaterial color="#c6b78d" transparent opacity={0.48} roughness={1} />
      </mesh>
    </group>
  )
}

function FrameWear() {
  return (
    <group position={[2.75, 1.48, 2.885]} rotation={[0, Math.PI, 0]}>
      <RoundedBox
        args={[0.17, 0.055, 0.045]}
        radius={0.012}
        smoothness={3}
        position={[-0.27, -0.43, -0.005]}
        rotation={[0.02, 0.08, 0.22]}
        raycast={() => null}
        castShadow
      >
        <meshStandardMaterial color="#2c211b" roughness={0.88} />
      </RoundedBox>
      <RoundedBox
        args={[0.11, 0.04, 0.035]}
        radius={0.01}
        smoothness={3}
        position={[-0.34, -0.37, -0.012]}
        rotation={[-0.04, -0.08, -0.3]}
        raycast={() => null}
        castShadow
      >
        <meshStandardMaterial color="#433027" roughness={0.84} />
      </RoundedBox>

      {[
        { x: -0.18, y: 0.24, h: 0.34, r: -0.08 },
        { x: 0.13, y: 0.06, h: 0.28, r: 0.04 },
        { x: -0.03, y: -0.18, h: 0.22, r: -0.02 },
      ].map((scratch, index) => (
        <mesh
          key={index}
          raycast={() => null}
          position={[scratch.x, scratch.y, 0.052]}
          rotation={[0, 0, scratch.r]}
          renderOrder={7}
        >
          <planeGeometry args={[0.005, scratch.h]} />
          <meshBasicMaterial color="#e2e5df" transparent opacity={0.13} depthWrite={false} />
        </mesh>
      ))}

      <mesh raycast={() => null} position={[0.18, -0.36, 0.049]} renderOrder={7}>
        <circleGeometry args={[0.035, 18]} />
        <meshBasicMaterial color="#d8e0df" transparent opacity={0.045} depthWrite={false} />
      </mesh>
    </group>
  )
}

function DoorAge() {
  return (
    <group>
      <mesh raycast={() => null} position={[0.91, 0.18, 2.827]}>
        <planeGeometry args={[0.5, 0.22]} />
        <meshBasicMaterial color="#15100d" transparent opacity={0.17} depthWrite={false} />
      </mesh>
      <mesh raycast={() => null} position={[1.31, 1.08, 2.827]}>
        <circleGeometry args={[0.12, 24]} />
        <meshBasicMaterial color="#1d1815" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh raycast={() => null} position={[0.49, 1.45, 2.827]} rotation={[0, 0, -0.1]}>
        <planeGeometry args={[0.018, 0.34]} />
        <meshBasicMaterial color="#b6a58c" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function NarrativePropRealism() {
  return (
    <group>
      <FridgeNoteWear />
      <FrameWear />
      <DoorAge />
    </group>
  )
}
