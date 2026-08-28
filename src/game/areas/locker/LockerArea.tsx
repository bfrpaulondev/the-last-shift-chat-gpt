import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { LOCKER_COLLIDERS } from './lockerColliders'
import { LockerAudio } from './LockerAudio'
import { LockerInteractionSystem } from './LockerInteractionSystem'
import { LockerScene } from './LockerScene'

type LockerAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function LockerArea({ gameStarted, isPointerLocked, onLockChange }: LockerAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 393) clock.setWorldMinute(393)

    const state = useGameStore.getState()
    if (!state.flags.locker_entry_seen) {
      state.setFlag('locker_entry_seen')
      state.setCheckpoint(state.location.checkpoint, state.location.spawn)
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area !== 'locker-b1' || latest.subtitle) return
        latest.say('B1. Uniforme e rota. Depois elevador.')
      }, 650)
    }
  }, [])

  const enabled = gameStarted && isPointerLocked && !noteOpen && !cinematic && !blackout && !scareActive && !demoEnded && !areaTransition

  return (
    <>
      <PbrEnvironment />
      <LockerScene />
      <LockerAudio />
      {gameStarted && <LockerInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={LOCKER_COLLIDERS} enabled={enabled} />
      {gameStarted && !demoEnded && (
        <PointerLockControls makeDefault onLock={() => onLockChange(true)} onUnlock={() => onLockChange(false)} />
      )}
      <PostEffects />
    </>
  )
}
