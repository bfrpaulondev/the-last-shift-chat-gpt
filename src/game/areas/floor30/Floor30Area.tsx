import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { FLOOR30_COLLIDERS } from './floor30Colliders'
import { Floor30Audio } from './Floor30Audio'
import { Floor30InteractionSystem } from './Floor30InteractionSystem'
import { Floor30Scene } from './Floor30Scene'

type Floor30AreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function Floor30Area({ gameStarted, isPointerLocked, onLockChange }: Floor30AreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 404) clock.setWorldMinute(404)

    const state = useGameStore.getState()
    if (!state.flags.floor30_entry_seen) {
      state.setFlag('floor30_entry_seen')
      state.setCheckpoint(state.location.checkpoint, state.location.spawn)
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area !== 'work-floor-30' || latest.subtitle) return
        latest.say('30.º. Folha de serviço na sala executiva.')
      }, 650)
    } else if (state.flags.floor30_routine_complete) {
      state.setObjective('Volte ao elevador de serviço. Próxima parada: refeitório.')
    }
  }, [])

  const enabled = gameStarted && isPointerLocked && !noteOpen && !cinematic && !blackout && !scareActive && !demoEnded && !areaTransition

  return (
    <>
      <PbrEnvironment />
      <Floor30Scene />
      <Floor30Audio />
      {gameStarted && <Floor30InteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={FLOOR30_COLLIDERS} enabled={enabled} />
      {gameStarted && !demoEnded && (
        <PointerLockControls makeDefault onLock={() => onLockChange(true)} onUnlock={() => onLockChange(false)} />
      )}
      <PostEffects />
    </>
  )
}
