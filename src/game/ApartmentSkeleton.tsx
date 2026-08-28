import { PointerLockControls } from '@react-three/drei'
import { InteractionSystem } from './interaction/InteractionSystem'
import { PlayerController } from './player/PlayerController'
import { APARTMENT_COLLIDERS } from './physics/colliders'
import { useGameStore } from './state/gameStore'

type ApartmentSkeletonProps = {
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

const WALL_COLOR = '#74777b'
const FLOOR_COLOR = '#4f5154'

export function ApartmentSkeleton({
  isPointerLocked,
  onLockChange,
}: ApartmentSkeletonProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))

  return (
    <>
      <ambientLight color="#aeb8c8" intensity={0.35} />
      <directionalLight
        castShadow
        color="#c7d3e2"
        intensity={1.2}
        position={[-3, 5, -4]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <group>
        <mesh receiveShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[7, 0.1, 6]} />
          <meshStandardMaterial color={FLOOR_COLOR} roughness={0.95} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 1.275, -3]}>
          <boxGeometry args={[7, 2.55, 0.12]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={1} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 1.275, 3]}>
          <boxGeometry args={[7, 2.55, 0.12]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={1} />
        </mesh>

        <mesh castShadow receiveShadow position={[-3.5, 1.275, 0]}>
          <boxGeometry args={[0.12, 2.55, 6]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={1} />
        </mesh>

        <mesh castShadow receiveShadow position={[3.5, 1.275, 0]}>
          <boxGeometry args={[0.12, 2.55, 6]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={1} />
        </mesh>
      </group>

      <mesh
        castShadow
        receiveShadow
        position={[-1.45, 0.3, 1.15]}
        userData={{ interactableId: 'bed' }}
      >
        <boxGeometry args={[2.1, 0.6, 1.3]} />
        <meshStandardMaterial color="#55565a" roughness={1} />
      </mesh>

      <mesh
        castShadow
        position={[0.7, 1.85, -2.88]}
        userData={{ interactableId: 'clock' }}
      >
        <boxGeometry args={[0.42, 0.42, 0.08]} />
        <meshStandardMaterial color="#25282c" roughness={0.9} />
      </mesh>

      <mesh
        castShadow
        position={[2.2, 1.45, 2.88]}
        rotation={[0, Math.PI, 0]}
        userData={{ interactableId: 'frame' }}
      >
        <boxGeometry args={[0.7, 0.9, 0.07]} />
        <meshStandardMaterial color="#3a3028" roughness={0.95} />
      </mesh>

      <InteractionSystem />
      <PlayerController
        colliders={APARTMENT_COLLIDERS}
        enabled={isPointerLocked && !noteOpen}
      />

      <PointerLockControls
        makeDefault
        onLock={() => onLockChange(true)}
        onUnlock={() => onLockChange(false)}
      />
    </>
  )
}
