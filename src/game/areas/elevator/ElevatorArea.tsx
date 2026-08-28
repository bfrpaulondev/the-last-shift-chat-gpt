import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { ELEVATOR_COLLIDERS } from './elevatorColliders'
import { ElevatorAudio } from './ElevatorAudio'
import { ElevatorInteractionSystem } from './ElevatorInteractionSystem'
import { ElevatorRideController } from './ElevatorRideController'
import { ElevatorScene } from './ElevatorScene'

type ElevatorAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function ElevatorArea({ gameStarted, isPointerLocked, onLockChange }: ElevatorAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 394) clock.setWorldMinute(394)

    const state = useGameStore.getState()
    if (!state.flags.elevator_entry_seen) {
      state.setFlag('elevator_entry_seen')
      state.setCheckpoint(state.location.checkpoint, state.location.spawn)
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area !== 'service-elevator' || latest.subtitle) return
        if (latest.flags.elevator_arrived_22) {
          latest.say('22.º. Portas abertas.')
        } else if (latest.flags.elevator_ride_started) {
          latest.say('Ainda subindo.')
        } else {
          latest.say('Elevador de serviço. 22.º primeiro.')
        }
      }, 650)
    }
  }, [])

  const enabled = gameStarted && isPointerLocked && !noteOpen && !cinematic && !blackout && !scareActive && !demoEnded && !areaTransition

  return (
    <>
      <PbrEnvironment />
      <ElevatorScene />
      <ElevatorAudio />
      <ElevatorRideController />
      {gameStarted && <ElevatorInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={ELEVATOR_COLLIDERS} enabled={enabled} />
      {gameStarted && !demoEnded && (
        <PointerLockControls makeDefault onLock={() => onLockChange(true)} onUnlock={() => onLockChange(false)} />
      )}
      <PostEffects />
    </>
  )
}
