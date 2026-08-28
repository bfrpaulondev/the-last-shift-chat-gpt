import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../state/gameStore'

const DROP_TOP = 1.06
const DROP_BOTTOM = 0.66
const DROP_PERIOD = 1.6

export function FaucetDrip() {
  const drop = useRef<THREE.Mesh>(null)
  const splash = useRef<THREE.Mesh>(null)
  const faucetFixed = useGameStore((state) => Boolean(state.flags.faucet_fixed))

  useFrame(({ clock }) => {
    if (!drop.current || !splash.current) {
      return
    }

    const phase = (clock.elapsedTime % DROP_PERIOD) / DROP_PERIOD
    const falling = THREE.MathUtils.clamp(phase / 0.34, 0, 1)
    const eased = falling * falling

    drop.current.visible = !faucetFixed && phase < 0.34
    splash.current.visible = !faucetFixed && phase >= 0.34 && phase < 0.46

    drop.current.position.y = THREE.MathUtils.lerp(DROP_TOP, DROP_BOTTOM, eased)
    drop.current.scale.y = 1 + falling * 1.5

    const splashPhase = THREE.MathUtils.clamp((phase - 0.34) / 0.12, 0, 1)
    splash.current.scale.setScalar(0.35 + splashPhase * 1.25)
    const splashMaterial = splash.current.material as THREE.MeshBasicMaterial
    splashMaterial.opacity = 0.42 * (1 - splashPhase)
  })

  return (
    <group position={[1.98, 0, -2.61]}>
      <mesh
        ref={drop}
        raycast={() => null}
        position={[0, DROP_TOP, 0]}
        scale={[1, 1, 1]}
      >
        <sphereGeometry args={[0.018, 10, 8]} />
        <meshPhysicalMaterial
          color="#d8eff7"
          transparent
          opacity={0.72}
          transmission={0.72}
          roughness={0.08}
          metalness={0}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={splash}
        raycast={() => null}
        position={[0, 0.655, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.018, 0.04, 14]} />
        <meshBasicMaterial
          color="#d8eff7"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
