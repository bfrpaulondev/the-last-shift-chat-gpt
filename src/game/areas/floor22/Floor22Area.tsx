import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { FLOOR22_COLLIDERS } from './floor22Colliders'
import { Floor22Audio } from './Floor22Audio'
import { Floor22InteractionSystem } from './Floor22InteractionSystem'
import { Floor22Scene } from './Floor22Scene'

type Floor22AreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function Floor22Area({ gameStarted, isPointerLocked, onLockChange }: Floor22AreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 397) clock.setWorldMinute(397)

    const state = useGameStore.getState()
    if (!state.flags.floor22_entry_seen) {
      state.setFlag('floor22_entry_seen')
      state.setCheckpoint(state.location.checkpoint, state.location.spawn)
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area !== 'work-floor-22' || latest.subtitle) return
        latest.say('22.º. Começar pela ordem de serviço.')
      }, 650)
    } else if (state.flags.floor22_routine_complete) {
      state.setObjective('Volte ao elevador de serviço. Próximo destino: 30.º andar.')
    }
  }, [])

  const enabled = gameStarted && isPointerLocked && !noteOpen && !cinematic && !blackout && !scareActive && !demoEnded && !areaTransition

  return (
    <>
      <PbrEnvironment />
      <Floor22Scene />
      <Floor22Audio />
      {gameStarted && <Floor22InteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={FLOOR22_COLLIDERS} enabled={enabled} />
      {gameStarted && !demoEnded && (
        <PointerLockControls makeDefault onLock={() => onLockChange(true)} onUnlock={() => onLockChange(false)} />
      )}
      <PostEffects />
    </>
  )
}
