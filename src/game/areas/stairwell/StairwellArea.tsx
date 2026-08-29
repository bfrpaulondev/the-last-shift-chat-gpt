import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { STAIRWELL_COLLIDERS } from './stairwellColliders'
import { StairwellAudio } from './StairwellAudio'
import { StairwellInteractionSystem } from './StairwellInteractionSystem'
import { StairwellScene } from './StairwellScene'

type StairwellAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function StairwellArea({ gameStarted, isPointerLocked, onLockChange }: StairwellAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const state = useGameStore.getState()
    if (!state.flags.stairwell_entry_seen) {
      state.setFlag('stairwell_entry_seen')
      state.setCheckpoint(state.location.checkpoint, state.location.spawn)
    }

    if (state.flags.sc39_open) state.setObjective('Entre no 39.º andar pela porta escorada.')
    else if (state.flags.stairwell_reached_39) state.setObjective('Verifique a porta do 39.º andar.')
    else if (state.flags.reader38_green) state.setObjective('Suba até o 39.º andar.')
    else if (state.flags.stairwell_reached_38) state.setObjective('Observe o leitor do 38.º andar.')
    else state.setObjective('Suba pela escada de emergência até o 39.º andar.')
  }, [])

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
      <StairwellScene />
      <StairwellAudio />
      {gameStarted && <StairwellInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={STAIRWELL_COLLIDERS} enabled={enabled} />
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
