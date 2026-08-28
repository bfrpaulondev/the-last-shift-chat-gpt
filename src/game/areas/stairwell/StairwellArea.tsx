import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
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
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 418) clock.setWorldMinute(418)

    const state = useGameStore.getState()
    if (!state.flags.stairwell_entry_seen) {
      state.setFlag('stairwell_entry_seen')
      state.setCheckpoint(state.location.checkpoint, state.location.spawn)
      state.setObjective('Siga pela escada de emergência.')
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area !== 'emergency-stairwell' || latest.subtitle) return
        latest.say('Sem elevador. Só a escada.')
      }, 650)
      return
    }

    if (state.flags.stairwell_route_complete) {
      state.setObjective('Continue descendo — próximo patamar.')
    } else if (state.flags.stairwell_phone_checked) {
      state.setObjective('Continue descendo pela escada de emergência.')
    } else if (state.flags.stairwell_first_descent) {
      state.setObjective('Verifique o patamar inferior e continue pela rota de emergência.')
    } else {
      state.setObjective('Siga pela escada de emergência.')
    }
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
