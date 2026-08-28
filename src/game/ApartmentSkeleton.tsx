import { PointerLockControls } from '@react-three/drei'
import { ApartmentDetails } from './ApartmentDetails'
import { ApartmentLighting } from './ApartmentLighting'
import { ApartmentScene } from './ApartmentScene'
import { AtmosphereDetails } from './AtmosphereDetails'
import { AudioAmbience } from './audio/AudioAmbience'
import { FaucetDrip } from './effects/FaucetDrip'
import { BadgeDropScene } from './events/BadgeDropScene'
import { RatScare } from './events/RatScare'
import { InteractionSystem } from './interaction/InteractionSystem'
import { CameraPolish } from './player/CameraPolish'
import { FirstPersonHands } from './player/FirstPersonHands'
import { PlayerController } from './player/PlayerController'
import { APARTMENT_COLLIDERS } from './physics/colliders'
import { PostEffects } from './render/PostEffects'
import { useGameStore } from './state/gameStore'
import { ExteriorRain } from './weather/ExteriorRain'

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
      <AtmosphereDetails />
      <ExteriorRain />
      <FaucetDrip />
      <BadgeDropScene />
      <AudioAmbience enabled={gameStarted && !demoEnded} />
      {gameStarted && <InteractionSystem />}
      {gameStarted && <RatScare />}
      <CameraPolish enabled={cameraInteractionEnabled} />
      <FirstPersonHands enabled={gameStarted && !demoEnded} />
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

      <PostEffects />
    </>
  )
}
