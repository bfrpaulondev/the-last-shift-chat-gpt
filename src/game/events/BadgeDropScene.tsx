import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { createLabelTexture } from '../materials/proceduralTextures'
import { useGameStore } from '../state/gameStore'

export function BadgeDropScene() {
  const { scene } = useThree()
  const dropped = useGameStore((state) => Boolean(state.flags.badge_dropped))
  const taken = useGameStore((state) => Boolean(state.flags.badge_taken))
  const texture = useMemo(
    () => createLabelTexture(
      'CRACHÁ 4471',
      ['PAULON, B.', 'MRD-1991-4471'],
      '#132018',
      '#c9d1bd',
    ),
    [],
  )

  useEffect(() => () => texture.dispose(), [texture])

  useEffect(() => {
    scene.traverse((object) => {
      if (
        object.userData.interactableId === 'badge' &&
        object.name !== 'badge-floor'
      ) {
        object.visible = !dropped && !taken
      }
    })
  }, [dropped, scene, taken])

  if (!dropped || taken) {
    return null
  }

  return (
    <group
      name="badge-floor"
      position={[0.4, 0.04, 2.38]}
      rotation={[-Math.PI / 2, 0, 0.32]}
      userData={{ interactableId: 'badge' }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.3, 0.035]} />
        <meshStandardMaterial color="#c9d1bd" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0, 0.019]}>
        <planeGeometry args={[0.42, 0.26]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.18, 6]} />
        <meshStandardMaterial color="#3e3d39" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}
