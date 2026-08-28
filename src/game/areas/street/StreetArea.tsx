import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { StreetAudio } from './StreetAudio'
import { STREET_COLLIDERS } from './streetColliders'
import { StreetInteractionSystem } from './StreetInteractionSystem'
import { StreetRain } from './StreetRain'
import { StreetScene } from './StreetScene'

type StreetAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function StreetArea({ gameStarted, isPointerLocked, onLockChange }: StreetAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 355) {
      clock.setWorldMinute(355)
    }

    const state = useGameStore.getState()
    if (!state.flags.street_arrival_seen) {
      state.setFlag('street_arrival_seen')
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area === 'street' && !latest.subtitle) {
          latest.say('Chuva fina. Dez minutos até o 214. Ainda dá tempo.')
        }
      }, 850)
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
      <StreetScene />
      <StreetRain />
      <StreetAudio />
      {gameStarted && <StreetInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={STREET_COLLIDERS} enabled={enabled} />

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
