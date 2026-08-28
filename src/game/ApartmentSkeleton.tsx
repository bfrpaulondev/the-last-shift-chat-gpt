import { PointerLockControls } from '@react-three/drei'
import { ApartmentScene } from './ApartmentScene'
import { AudioAmbience } from './audio/AudioAmbience'
import { InteractionSystem } from './interaction/InteractionSystem'
import { CameraPolish } from './player/CameraPolish'
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
  const cameraInteractionEnabled =
    gameStarted &&
    isPointerLocked &&
    !noteOpen &&
    !cinematic &&
    !blackout &&
    !demoEnded

  return (
    <>
      <ApartmentScene />
      <AudioAmbience enabled={gameStarted && !demoEnded} />
      {gameStarted && <InteractionSystem />}
      <CameraPolish enabled={cameraInteractionEnabled} />
      <PlayerController
        colliders={APARTMENT_COLLIDERS}
        enabled={cameraInteractionEnabled && awake}
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
