export function ApartmentLighting() {
  return (
    <>
      <hemisphereLight
        color="#b7c5d3"
        groundColor="#2f2925"
        intensity={0.11}
      />

      <pointLight
        color="#c8d5df"
        intensity={0.12}
        distance={3.8}
        decay={2}
        position={[-1.35, 2.05, -1.15]}
      />

      <pointLight
        color="#d7b98d"
        intensity={0.18}
        distance={3.2}
        decay={2}
        position={[-1.75, 2.05, 1.85]}
      />

      <pointLight
        color="#cbb89d"
        intensity={0.1}
        distance={2.8}
        decay={2}
        position={[0.85, 1.95, 1.65]}
      />
    </>
  )
}
