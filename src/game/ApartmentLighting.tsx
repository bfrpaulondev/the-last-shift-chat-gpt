import { BrokenBathroomLight } from './effects/BrokenBathroomLight'

export function ApartmentLighting() {
  return (
    <>
      <hemisphereLight
        color="#aebdcc"
        groundColor="#211d1a"
        intensity={0.055}
      />

      <rectAreaLight
        color="#a8c4dc"
        intensity={2.05}
        width={2.55}
        height={1.25}
        position={[-1.3, 1.55, -2.82]}
        rotation={[0, Math.PI, 0]}
      />

      <rectAreaLight
        color="#d5ad78"
        intensity={0.72}
        width={1.6}
        height={0.95}
        position={[-1.8, 2.38, 1.72]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      <pointLight
        color="#aec3d5"
        intensity={0.055}
        distance={3.2}
        decay={2}
        position={[-1.3, 1.72, -1.0]}
      />

      <pointLight
        color="#c49d72"
        intensity={0.065}
        distance={2.7}
        decay={2}
        position={[0.82, 1.72, 1.7]}
      />

      <BrokenBathroomLight />
    </>
  )
}
