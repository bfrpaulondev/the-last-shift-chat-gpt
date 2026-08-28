export function ApartmentLighting() {
  return (
    <>
      <hemisphereLight
        color="#c5d4e4"
        groundColor="#3d342f"
        intensity={0.38}
      />
      <pointLight
        castShadow
        color="#c7d7e8"
        intensity={0.5}
        distance={5.2}
        decay={2}
        position={[-1.45, 2.2, -1.2]}
      />
      <pointLight
        castShadow
        color="#e7c79c"
        intensity={0.72}
        distance={4.4}
        decay={2}
        position={[-1.75, 2.15, 1.7]}
      />
      <pointLight
        color="#d8c3a3"
        intensity={0.34}
        distance={3.6}
        decay={2}
        position={[0.85, 2.1, 1.7]}
      />
    </>
  )
}
