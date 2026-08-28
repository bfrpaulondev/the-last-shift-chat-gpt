type Vec3 = [number, number, number]

function DetailBox({
  position,
  size,
  color,
  roughness = 0.86,
  metalness = 0,
  rotation = [0, 0, 0],
}: {
  position: Vec3
  size: Vec3
  color: string
  roughness?: number
  metalness?: number
  rotation?: Vec3
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
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  )
}

function DetailCylinder({
  position,
  radius,
  height,
  color,
  roughness = 0.82,
  metalness = 0,
  rotation = [0, 0, 0],
}: {
  position: Vec3
  radius: number
  height: number
  color: string
  roughness?: number
  metalness?: number
  rotation?: Vec3
}) {
  return (
    <mesh
      castShadow
      receiveShadow
      raycast={() => null}
      position={position}
      rotation={rotation}
    >
      <cylinderGeometry args={[radius, radius * 0.94, height, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  )
}

function BathroomDetails() {
  return (
    <group>
      <DetailBox position={[1.91, 1.14, -0.79]} size={[0.07, 2.28, 0.08]} color="#4b4540" />
      <DetailBox position={[2.89, 1.14, -0.79]} size={[0.07, 2.28, 0.08]} color="#4b4540" />
      <DetailBox position={[2.4, 2.27, -0.79]} size={[1.05, 0.08, 0.08]} color="#4b4540" />

      <mesh raycast={() => null} receiveShadow position={[2.4, 0.012, -1.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.72, 0.46]} />
        <meshStandardMaterial color="#51585a" roughness={1} />
      </mesh>

      <DetailBox position={[3.435, 1.38, -1.62]} size={[0.035, 0.76, 0.52]} color="#7a7063" />
      <DetailBox position={[3.4, 1.79, -1.62]} size={[0.055, 0.045, 0.58]} color="#6c6862" />

      <DetailBox position={[1.72, 1.16, -2.72]} size={[0.36, 0.035, 0.16]} color="#77736c" />
      <DetailCylinder position={[1.62, 1.28, -2.72]} radius={0.055} height={0.18} color="#8c806e" />
      <DetailCylinder position={[1.79, 1.27, -2.72]} radius={0.045} height={0.16} color="#708b78" />
      <DetailBox position={[1.88, 1.31, -2.72]} size={[0.025, 0.24, 0.025]} color="#d8dfdc" rotation={[0, 0, -0.06]} />

      <DetailCylinder
        position={[2.95, 0.018, -2.54]}
        radius={0.07}
        height={0.025}
        color="#565d5f"
        metalness={0.42}
        roughness={0.4}
      />

      <DetailBox position={[2.13, 0.67, -1.72]} size={[0.26, 0.035, 0.08]} color="#cbc5b8" />
      <DetailCylinder position={[2.13, 0.67, -1.79]} radius={0.048} height={0.18} color="#e5e0d5" rotation={[Math.PI / 2, 0, 0]} />

      <DetailBox position={[2.72, 0.92, -2.72]} size={[0.34, 0.045, 0.16]} color="#69645e" />
      <DetailCylinder position={[2.63, 1.04, -2.72]} radius={0.045} height={0.18} color="#b8b0a0" />
      <DetailCylinder position={[2.78, 1.02, -2.72]} radius={0.042} height={0.15} color="#6f7778" />
    </group>
  )
}

function KitchenDetails() {
  return (
    <group>
      <DetailBox position={[-2.25, 0.5, 2.275]} size={[0.7, 0.78, 0.035]} color="#514843" />
      <DetailBox position={[-1.5, 0.5, 2.275]} size={[0.7, 0.78, 0.035]} color="#514843" />
      <DetailBox position={[-1.92, 0.5, 2.252]} size={[0.025, 0.78, 0.02]} color="#292726" />
      <DetailBox position={[-2.02, 0.58, 2.245]} size={[0.15, 0.02, 0.025]} color="#8c8982" metalness={0.42} roughness={0.46} />
      <DetailBox position={[-1.74, 0.58, 2.245]} size={[0.15, 0.02, 0.025]} color="#8c8982" metalness={0.42} roughness={0.46} />

      <DetailBox position={[-2.75, 1.43, 2.84]} size={[0.92, 0.07, 0.22]} color="#443c37" />
      <DetailCylinder position={[-2.98, 1.55, 2.83]} radius={0.073} height={0.2} color="#aaa69b" />
      <DetailCylinder position={[-2.73, 1.55, 2.83]} radius={0.073} height={0.2} color="#696d6a" />
      <DetailCylinder position={[-2.48, 1.55, 2.83]} radius={0.073} height={0.2} color="#8b6e55" />

      <mesh raycast={() => null} receiveShadow position={[-2.55, 0.93, 2.27]}>
        <planeGeometry args={[0.42, 0.58]} />
        <meshStandardMaterial color="#795d49" roughness={1} />
      </mesh>

      <DetailBox position={[-3.34, 0.62, 1.31]} size={[0.045, 0.52, 0.36]} color="#666965" />
      <DetailBox position={[-3.34, 1.48, 1.31]} size={[0.045, 0.42, 0.36]} color="#666965" />

      <DetailCylinder
        position={[-1.25, 1.025, 2.54]}
        radius={0.15}
        height={0.025}
        color="#757a7a"
        metalness={0.28}
        roughness={0.52}
      />
      <DetailCylinder position={[-1.24, 1.1, 2.54]} radius={0.07} height={0.13} color="#a89b88" />

      <DetailBox position={[-1.05, 1.0, 2.55]} size={[0.22, 0.025, 0.34]} color="#8c7562" rotation={[0, 0.12, 0]} />
      <DetailBox position={[-2.95, 0.97, 2.54]} size={[0.3, 0.018, 0.28]} color="#5d5047" rotation={[0, -0.08, 0]} />
    </group>
  )
}

function BedroomDetails() {
  return (
    <group>
      {[-1.95, -1.63, -1.31, -0.99, -0.67].map((x) => (
        <DetailBox key={x} position={[x, 0.37, -2.83]} size={[0.16, 0.62, 0.07]} color="#6e7475" />
      ))}
      <DetailBox position={[-1.31, 0.68, -2.83]} size={[1.46, 0.06, 0.08]} color="#606566" />
      <DetailBox position={[-1.31, 0.06, -2.83]} size={[1.46, 0.06, 0.08]} color="#606566" />

      <DetailCylinder position={[-0.58, 1.47, 0.48]} radius={0.15} height={0.055} color="#c8bfa2" rotation={[Math.PI / 2, 0, 0]} />
      <DetailBox position={[-0.58, 1.15, 0.48]} size={[0.03, 0.5, 0.03]} color="#44403d" />
      <DetailCylinder position={[-0.58, 0.88, 0.48]} radius={0.09} height={0.03} color="#3a3633" />

      <DetailBox position={[-3.31, 1.18, -0.28]} size={[0.025, 0.18, 0.28]} color="#d1ccc0" />
      <DetailBox position={[-2.96, 0.12, -2.54]} size={[0.31, 0.1, 0.17]} color="#303135" rotation={[0, 0.24, 0]} />
      <DetailBox position={[-2.61, 0.11, -2.55]} size={[0.32, 0.095, 0.17]} color="#282a2c" rotation={[0, -0.18, 0]} />

      <DetailBox position={[-0.33, 0.66, -1.42]} size={[0.22, 0.025, 0.3]} color="#66594c" rotation={[0, -0.16, 0]} />
      <DetailBox position={[-0.34, 0.69, -1.42]} size={[0.2, 0.018, 0.27]} color="#81705d" rotation={[0, -0.12, 0]} />

      <DetailBox position={[-2.43, 0.66, -0.2]} size={[0.58, 0.025, 0.06]} color="#776e64" rotation={[0, 0.22, 0]} />
    </group>
  )
}

function HallwayDetails() {
  return (
    <group>
      <mesh raycast={() => null} receiveShadow position={[0.9, 0.012, 2.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.82, 0.52]} />
        <meshStandardMaterial color="#343536" roughness={1} />
      </mesh>

      <DetailBox position={[0.92, 2.25, 2.86]} size={[1.05, 0.07, 0.1]} color="#453c36" />
      <DetailBox position={[0.42, 1.15, 2.86]} size={[0.07, 2.2, 0.1]} color="#453c36" />
      <DetailBox position={[1.42, 1.15, 2.86]} size={[0.07, 2.2, 0.1]} color="#453c36" />

      <DetailBox position={[0.02, 1.22, 2.87]} size={[0.22, 0.34, 0.018]} color="#cec9bd" />
      <DetailCylinder position={[0.02, 1.21, 2.845]} radius={0.032} height={0.018} color="#77736d" rotation={[Math.PI / 2, 0, 0]} />

      <DetailBox position={[2.57, 0.93, 2.58]} size={[0.55, 0.035, 0.25]} color="#71604e" />
      <DetailCylinder position={[2.46, 0.99, 2.58]} radius={0.045} height={0.08} color="#8e765d" />
      <DetailCylinder position={[2.62, 0.99, 2.58]} radius={0.04} height={0.08} color="#5b5b58" />

      <DetailBox position={[3.2, 0.55, 2.6]} size={[0.06, 1.1, 0.06]} color="#302e2c" />
      <DetailCylinder position={[3.2, 0.08, 2.46]} radius={0.12} height={0.45} color="#2c2c2d" rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

function CeilingDetails() {
  return (
    <group>
      <DetailCylinder position={[-1.4, 2.52, -1.1]} radius={0.2} height={0.1} color="#c6bea5" rotation={[Math.PI / 2, 0, 0]} />
      <DetailCylinder position={[-1.8, 2.52, 1.75]} radius={0.18} height={0.095} color="#b7ae98" rotation={[Math.PI / 2, 0, 0]} />
      <DetailCylinder position={[2.45, 2.51, -1.9]} radius={0.18} height={0.09} color="#cbbd9e" rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

export function ApartmentDetails() {
  return (
    <group>
      <BedroomDetails />
      <BathroomDetails />
      <KitchenDetails />
      <HallwayDetails />
      <CeilingDetails />
    </group>
  )
}
