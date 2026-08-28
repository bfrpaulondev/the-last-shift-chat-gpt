import { PointerLockControls } from '@react-three/drei'
import { ApartmentScene } from './ApartmentScene'
import { AudioAmbience } from './audio/AudioAmbience'
import { InteractionSystem } from './interaction/InteractionSystem'
import { PlayerController } from './player/PlayerController'
import { APARTMENT_COLLIDERS } from './physics/colliders'
import { useGameStore } from './state/gameStore'

type ApartmentSkeletonProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function ApartmentSkeleton({
  gameStarted,
  isPointerLocked,
  onLockChange,
}: ApartmentSkeletonProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const awake = useGameStore((state) => Boolean(state.flags.awake))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const demoEnded = useGameStore((state) => state.demoEnded)

  return (
    <>
      <ApartmentScene />
      <AudioAmbience enabled={gameStarted && !demoEnded} />
      {gameStarted && <InteractionSystem />}
      <PlayerController
        colliders={APARTMENT_COLLIDERS}
        enabled={
          gameStarted &&
          isPointerLocked &&
          awake &&
          !noteOpen &&
          !cinematic &&
          !blackout &&
          !demoEnded
        }
      />

      {gameStarted && !demoEnded && (
        <PointerLockControls
          makeDefault
          onLock={() => onLockChange(true)}
          onUnlock={() => onLockChange(false)}
        />
      )}
    </>
  )
}
