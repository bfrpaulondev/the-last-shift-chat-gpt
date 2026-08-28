import { PointerLockControls } from '@react-three/drei'
import { ApartmentDetails } from './ApartmentDetails'
import { ApartmentLighting } from './ApartmentLighting'
import { ApartmentScene } from './ApartmentScene'
import { AudioAmbience } from './audio/AudioAmbience'
import { BadgeDropScene } from './events/BadgeDropScene'
import { RatScare } from './events/RatScare'
import { InteractionSystem } from './interaction/InteractionSystem'
import { CameraPolish } from './player/CameraPolish'
import { FirstPersonHands } from './player/FirstPersonHands'
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
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const cameraInteractionEnabled =
    gameStarted &&
    isPointerLocked &&
    !noteOpen &&
    !cinematic &&
    !blackout &&
    !scareActive &&
    !demoEnded

  return (
    <>
      <ApartmentScene />
      <ApartmentLighting />
      <ApartmentDetails />
      <BadgeDropScene />
      <AudioAmbience enabled={gameStarted && !demoEnded} />
      {gameStarted && <InteractionSystem />}
      {gameStarted && <RatScare />}
      <CameraPolish enabled={cameraInteractionEnabled} />
      <FirstPersonHands enabled={gameStarted && awake && !demoEnded} />
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
