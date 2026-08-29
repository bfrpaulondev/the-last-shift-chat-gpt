import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { SECURITY_CENTER_COLLIDERS } from '../security/securityCenterColliders'
import { SecurityCenterAudio } from '../security/SecurityCenterAudio'
import { SecurityCenterScene } from '../security/SecurityCenterScene'
import { SentinelHardware } from '../security/SentinelHardware'
import { Part4Terminal } from './Part4Terminal'

type Part4TerminalAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function Part4TerminalArea({ gameStarted, isPointerLocked, onLockChange }: Part4TerminalAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  const enabled =
    gameStarted &&
    isPointerLocked &&
    !noteOpen &&
    !cinematic &&
    !blackout &&
    !scareActive &&
    !demoEnded &&
    !areaTransition

  return (
    <>
      <PbrEnvironment />
      <SecurityCenterScene />
      <SentinelHardware />
      <SecurityCenterAudio />
      {gameStarted && <Part4Terminal />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={SECURITY_CENTER_COLLIDERS} enabled={enabled} />
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
