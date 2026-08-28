import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { BLACKOUT_COLLIDERS } from './blackoutColliders'
import { BlackoutAudio } from './BlackoutAudio'
import { BlackoutInteractionSystem } from './BlackoutInteractionSystem'
import { BlackoutRecoveryController } from './BlackoutRecoveryController'
import { BlackoutScene } from './BlackoutScene'

type BlackoutAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function BlackoutArea({ gameStarted, isPointerLocked, onLockChange }: BlackoutAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)
  const stoodUp = useGameStore((state) => Boolean(state.flags.blackout_stood_up))

  const enabled =
    gameStarted &&
    stoodUp &&
    isPointerLocked &&
    !noteOpen &&
    !cinematic &&
    !blackout &&
    !scareActive &&
    !demoEnded &&
    !areaTransition

  return (
    <>
      <BlackoutScene />
      <BlackoutAudio />
      <BlackoutRecoveryController />
      {gameStarted && <BlackoutInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded && !blackout} />
      <PlayerController colliders={BLACKOUT_COLLIDERS} enabled={enabled} />
      {gameStarted && !demoEnded && !blackout && (
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
