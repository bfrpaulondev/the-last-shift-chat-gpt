import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { BusAudio } from './BusAudio'
import { BUS_COLLIDERS } from './busColliders'
import { BusEventDirector } from './BusEventDirector'
import { BusExitDoor } from './BusExitDoor'
import { BusInteractionSystem } from './BusInteractionSystem'
import { BusRideMotion } from './BusRideMotion'
import { BusScene } from './BusScene'
import { useBusTriageStore } from './busTriageStore'

type BusAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function BusArea({ gameStarted, isPointerLocked, onLockChange }: BusAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)
  const pinPhase = useBusTriageStore((state) => state.pinPhase)
  const gameplayTimeScale = useBusTriageStore((state) => state.gameplayTimeScale)

  useEffect(() => {
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 365) clock.setWorldMinute(365)
  }, [])

  const enabled =
    gameStarted &&
    isPointerLocked &&
    !noteOpen &&
    !cinematic &&
    !blackout &&
    !scareActive &&
    !demoEnded &&
    !areaTransition &&
    pinPhase !== 'active'

  return (
    <>
      <PbrEnvironment />
      <BusScene />
      <BusExitDoor />
      <BusAudio />
      <BusEventDirector />
      {gameStarted && <BusInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={BUS_COLLIDERS} enabled={enabled} speedScale={gameplayTimeScale} />
      <BusRideMotion />

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
