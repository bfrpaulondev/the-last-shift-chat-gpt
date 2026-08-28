import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { CAFETERIA_COLLIDERS } from './cafeteriaColliders'
import { CafeteriaAudio } from './CafeteriaAudio'
import { CafeteriaInteractionSystem } from './CafeteriaInteractionSystem'
import { CafeteriaScene } from './CafeteriaScene'

type CafeteriaAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function CafeteriaArea({ gameStarted, isPointerLocked, onLockChange }: CafeteriaAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 408) clock.setWorldMinute(408)

    const state = useGameStore.getState()
    if (!state.flags.cafeteria_entry_seen) {
      state.setFlag('cafeteria_entry_seen')
      state.setCheckpoint(state.location.checkpoint, state.location.spawn)
      state.setObjective('Faça a pausa no refeitório.')
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area !== 'cafeteria' || latest.subtitle) return
        latest.say('Refeitório. Café, pausa, depois 37.º.')
      }, 650)
    } else if (state.flags.cafeteria_break_complete) {
      state.setObjective('Volte ao elevador de serviço. Próxima parada: 37.º andar.')
    }
  }, [])

  const enabled = gameStarted && isPointerLocked && !noteOpen && !cinematic && !blackout && !scareActive && !demoEnded && !areaTransition

  return (
    <>
      <PbrEnvironment />
      <CafeteriaScene />
      <CafeteriaAudio />
      {gameStarted && <CafeteriaInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={CAFETERIA_COLLIDERS} enabled={enabled} />
      {gameStarted && !demoEnded && (
        <PointerLockControls makeDefault onLock={() => onLockChange(true)} onUnlock={() => onLockChange(false)} />
      )}
      <PostEffects />
    </>
  )
}
