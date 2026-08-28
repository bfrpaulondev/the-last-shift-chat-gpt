import { PointerLockControls } from '@react-three/drei'
import { PlayerController } from './player/PlayerController'
import { APARTMENT_COLLIDERS } from './physics/colliders'

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

      <PlayerController colliders={APARTMENT_COLLIDERS} enabled={isPointerLocked} />

      <PointerLockControls
        makeDefault
        onLock={() => onLockChange(true)}
        onUnlock={() => onLockChange(false)}
      />
    </>
  )
}
