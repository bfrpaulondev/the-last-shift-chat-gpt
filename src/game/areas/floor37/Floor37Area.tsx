import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { FLOOR37_COLLIDERS } from './floor37Colliders'
import { Floor37Audio } from './Floor37Audio'
import { Floor37BlackoutController } from './Floor37BlackoutController'
import { Floor37InteractionSystem } from './Floor37InteractionSystem'
import { Floor37Scene } from './Floor37Scene'

type Floor37AreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function Floor37Area({ gameStarted, isPointerLocked, onLockChange }: Floor37AreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 414) clock.setWorldMinute(414)

    const state = useGameStore.getState()
    if (!state.flags.floor37_entry_seen) {
      state.setFlag('floor37_entry_seen')
      state.setCheckpoint(state.location.checkpoint, state.location.spawn)
      state.setObjective('Complete a última rotina no 37.º andar.')
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area !== 'floor-37' || latest.subtitle) return
        latest.say('37.º. Último andar da rota.')
      }, 650)
    } else if (state.flags.floor37_routine_complete && !state.flags.floor37_blackout_triggered) {
      state.setObjective('Chame o elevador de serviço e encerre a rota.')
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
      <Floor37Scene />
      <Floor37Audio />
      <Floor37BlackoutController />
      {gameStarted && <Floor37InteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={FLOOR37_COLLIDERS} enabled={enabled} />
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
