function DetailBox({
  position,
  size,
  color,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  rotation?: [number, number, number]
}) {
  return (
    <mesh
      castShadow
      receiveShadow
      raycast={() => null}
      position={position}
      rotation={rotation}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.88} />
    </mesh>
  )
}

function BathroomDetails() {
  return (
    <group>
      <DetailBox position={[1.91, 1.14, -0.79]} size={[0.07, 2.28, 0.08]} color="#554d46" />
      <DetailBox position={[2.89, 1.14, -0.79]} size={[0.07, 2.28, 0.08]} color="#554d46" />
      <DetailBox position={[2.4, 2.27, -0.79]} size={[1.05, 0.08, 0.08]} color="#554d46" />
      <DetailBox position={[2.4, 0.025, -0.78]} size={[1.05, 0.04, 0.16]} color="#5d5046" />

      <mesh raycast={() => null} position={[2.42, 0.012, -1.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.78, 0.52]} />
        <meshStandardMaterial color="#4c5558" roughness={1} />
      </mesh>

      <DetailBox position={[2.25, 0.91, -2.64]} size={[0.09, 0.18, 0.09]} color="#6e8b79" />
      <mesh raycast={() => null} position={[2.25, 1.025, -2.64]}>
        <cylinderGeometry args={[0.018, 0.02, 0.08, 8]} />
        <meshStandardMaterial color="#d9d7cf" roughness={0.55} />
      </mesh>
      <mesh raycast={() => null} position={[1.73, 0.91, -2.64]}>
        <cylinderGeometry args={[0.075, 0.07, 0.17, 10]} />
        <meshStandardMaterial color="#867b6b" roughness={0.82} />
      </mesh>
      <DetailBox position={[1.71, 1.05, -2.64]} size={[0.018, 0.24, 0.018]} color="#d5dfdc" rotation={[0, 0, -0.08]} />
      <DetailBox position={[1.76, 1.05, -2.63]} size={[0.018, 0.24, 0.018]} color="#c8a9a0" rotation={[0, 0, 0.06]} />

      <mesh raycast={() => null} position={[3.435, 1.35, -1.62]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.62, 0.92]} />
        <meshStandardMaterial color="#7c7265" roughness={1} />
      </mesh>
      <DetailBox position={[3.39, 1.82, -1.62]} size={[0.05, 0.05, 0.72]} color="#77716b" rotation={[0, Math.PI / 2, 0]} />

      <mesh raycast={() => null} position={[2.95, 0.012, -2.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.055, 0.085, 12]} />
        <meshStandardMaterial color="#555b5c" metalness={0.45} roughness={0.42} />
      </mesh>

      <DetailBox position={[2.05, 0.67, -1.72]} size={[0.18, 0.04, 0.07]} color="#d3cec1" />
      <mesh raycast={() => null} position={[2.05, 0.67, -1.77]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.18, 10]} />
        <meshStandardMaterial color="#ede9dd" roughness={0.92} />
      </mesh>
    </group>
  )
}

function KitchenDetails() {
  return (
    <group>
      <DetailBox position={[-2.25, 0.5, 2.275]} size={[0.7, 0.78, 0.035]} color="#574d47" />
      <DetailBox position={[-1.5, 0.5, 2.275]} size={[0.7, 0.78, 0.035]} color="#574d47" />
      <DetailBox position={[-1.92, 0.5, 2.252]} size={[0.025, 0.78, 0.02]} color="#2e2b29" />
      <DetailBox position={[-2.02, 0.58, 2.245]} size={[0.16, 0.025, 0.025]} color="#92908a" />
      <DetailBox position={[-1.74, 0.58, 2.245]} size={[0.16, 0.025, 0.025]} color="#92908a" />

      <DetailBox position={[-2.75, 1.42, 2.85]} size={[0.92, 0.08, 0.22]} color="#49403a" />
      <mesh raycast={() => null} position={[-2.96, 1.54, 2.84]}>
        <cylinderGeometry args={[0.09, 0.075, 0.2, 10]} />
        <meshStandardMaterial color="#aaa69b" roughness={0.8} />
      </mesh>
      <mesh raycast={() => null} position={[-2.7, 1.54, 2.84]}>
        <cylinderGeometry args={[0.09, 0.075, 0.2, 10]} />
        <meshStandardMaterial color="#6e716e" roughness={0.78} />
      </mesh>
      <mesh raycast={() => null} position={[-2.44, 1.54, 2.84]}>
        <cylinderGeometry args={[0.09, 0.075, 0.2, 10]} />
        <meshStandardMaterial color="#8a6e57" roughness={0.8} />
      </mesh>

      <mesh raycast={() => null} position={[-2.6, 0.92, 2.27]}>
        <planeGeometry args={[0.34, 0.55]} />
        <meshStandardMaterial color="#6e5848" roughness={1} />
      </mesh>

      <DetailBox position={[-3.34, 0.62, 1.31]} size={[0.045, 0.52, 0.36]} color="#696d69" />
      <DetailBox position={[-3.34, 1.48, 1.31]} size={[0.045, 0.42, 0.36]} color="#696d69" />

      <mesh raycast={() => null} position={[-1.23, 1.02, 2.53]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.17, 16]} />
        <meshStandardMaterial color="#777b7b" metalness={0.42} roughness={0.42} />
      </mesh>
    </group>
  )
}

function BedroomDetails() {
  return (
    <group>
      {[-1.95, -1.63, -1.31, -0.99, -0.67].map((x) => (
        <DetailBox key={x} position={[x, 0.37, -2.83]} size={[0.18, 0.62, 0.08]} color="#747b7d" />
      ))}
      <DetailBox position={[-1.31, 0.68, -2.83]} size={[1.48, 0.07, 0.09]} color="#646a6c" />
      <DetailBox position={[-1.31, 0.06, -2.83]} size={[1.48, 0.07, 0.09]} color="#646a6c" />

      <mesh raycast={() => null} position={[-0.56, 1.45, 0.48]}>
        <circleGeometry args={[0.18, 12]} />
        <meshStandardMaterial color="#d0c7a8" emissive="#b4985f" emissiveIntensity={0.18} roughness={0.9} />
      </mesh>
      <DetailBox position={[-0.56, 1.12, 0.48]} size={[0.035, 0.48, 0.035]} color="#4a443f" />

      <DetailBox position={[-3.31, 1.18, -0.28]} size={[0.025, 0.18, 0.28]} color="#d6d1c4" />
      <mesh raycast={() => null} position={[-3.294, 1.18, -0.28]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.18, 0.12]} />
        <meshStandardMaterial color="#bcb7ab" roughness={0.92} />
      </mesh>

      <DetailBox position={[-2.95, 0.12, -2.54]} size={[0.35, 0.12, 0.18]} color="#353536" rotation={[0, 0.24, 0]} />
      <DetailBox position={[-2.58, 0.11, -2.56]} size={[0.36, 0.11, 0.18]} color="#2d2e30" rotation={[0, -0.18, 0]} />
    </group>
  )
}

function HallwayDetails() {
  return (
    <group>
      <DetailBox position={[0.43, 0.075, 1.82]} size={[0.24, 0.11, 0.52]} color="#292a2c" rotation={[0, 0.14, 0]} />
      <DetailBox position={[0.72, 0.075, 1.86]} size={[0.24, 0.11, 0.52]} color="#303135" rotation={[0, -0.12, 0]} />
      <DetailBox position={[0.92, 2.25, 2.86]} size={[1.05, 0.08, 0.1]} color="#4d433b" />
      <DetailBox position={[0.42, 1.15, 2.86]} size={[0.08, 2.2, 0.1]} color="#4d433b" />
      <DetailBox position={[1.42, 1.15, 2.86]} size={[0.08, 2.2, 0.1]} color="#4d433b" />

      <mesh raycast={() => null} position={[0.02, 1.2, 2.87]}>
        <planeGeometry args={[0.22, 0.34]} />
        <meshStandardMaterial color="#d0cbc0" roughness={0.92} />
      </mesh>
      <mesh raycast={() => null} position={[0.02, 1.21, 2.86]}>
        <circleGeometry args={[0.035, 8]} />
        <meshStandardMaterial color="#7b7770" roughness={0.8} />
      </mesh>
    </group>
  )
}

function CeilingDetails() {
  return (
    <group>
      <mesh raycast={() => null} position={[-1.4, 2.52, -1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.12, 12]} />
        <meshStandardMaterial color="#d0c7ad" emissive="#aa9e76" emissiveIntensity={0.18} roughness={0.85} />
      </mesh>
      <mesh raycast={() => null} position={[-1.8, 2.52, 1.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.11, 12]} />
        <meshStandardMaterial color="#beb59f" emissive="#9b895c" emissiveIntensity={0.12} roughness={0.86} />
      </mesh>
      <mesh raycast={() => null} position={[2.45, 2.51, -1.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.23, 0.1, 12]} />
        <meshStandardMaterial color="#d2c4a4" emissive="#d5b16d" emissiveIntensity={0.32} roughness={0.8} />
      </mesh>
    </group>
  )
}

export function ApartmentDetails() {
  return (
    <group>
      <BathroomDetails />
      <KitchenDetails />
      <BedroomDetails />
      <HallwayDetails />
      <CeilingDetails />
    </group>
  )
}
