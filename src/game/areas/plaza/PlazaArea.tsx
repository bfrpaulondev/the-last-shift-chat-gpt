import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { StreetAudio } from '../street/StreetAudio'
import { StreetRain } from '../street/StreetRain'
import { PLAZA_COLLIDERS } from './plazaColliders'
import { PlazaInteractionSystem } from './PlazaInteractionSystem'
import { PlazaScene } from './PlazaScene'

type PlazaAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function PlazaArea({ gameStarted, isPointerLocked, onLockChange }: PlazaAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 390) clock.setWorldMinute(390)

    const state = useGameStore.getState()
    if (!state.flags.plaza_arrival_seen) {
      state.setFlag('plaza_arrival_seen')
      state.setCheckpoint(state.location.checkpoint, state.location.spawn)
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area !== 'meridian-plaza' || latest.subtitle) return
        if (latest.location.checkpoint === 'plaza-missed-stop') {
          latest.say('Uma parada a mais. Ótimo começo de turno.')
          latest.say('A Meridian ainda está ali. Anda.')
        } else {
          latest.say('06:30. Meridian Tower.')
        }
      }, 700)
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
      <PlazaScene />
      <StreetRain />
      <StreetAudio />
      {gameStarted && <PlazaInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={PLAZA_COLLIDERS} enabled={enabled} />

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
