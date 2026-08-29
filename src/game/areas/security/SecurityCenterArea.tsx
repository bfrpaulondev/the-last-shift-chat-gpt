import { useEffect } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { SECURITY_CENTER_COLLIDERS } from './securityCenterColliders'
import { SecurityCenterAudio } from './SecurityCenterAudio'
import { SecurityCenterInteractionSystem } from './SecurityCenterInteractionSystem'
import { SecurityCenterScene } from './SecurityCenterScene'

type SecurityCenterAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function SecurityCenterArea({ gameStarted, isPointerLocked, onLockChange }: SecurityCenterAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const state = useGameStore.getState()
    if (!state.flags.security_center_entered) {
      state.setFlag('security_center_entered')
      state.setFlag('operator_gone')
      state.setCheckpoint('security-center-entry', state.location.spawn)
      state.setObjective('Examine a Central de Segurança e descubra o que aconteceu.')
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area !== 'security-center' || latest.subtitle) return
        latest.say('Alguém saiu daqui correndo.')
      }, 650)
      return
    }

    if (state.flags.all_doors_released) state.setObjective('Desça para o lobby e encontre Nascimento.')
    else if (state.flags.observed_first) state.setObjective('Use o FIREMAN\'S OVERRIDE para liberar as portas.')
    else state.setObjective('Consulte o monitor vivo da Central de Segurança.')
  }, [])

  const enabled = gameStarted && isPointerLocked && !noteOpen && !cinematic && !blackout && !scareActive && !demoEnded && !areaTransition

  return (
    <>
      <PbrEnvironment />
      <SecurityCenterScene />
      <SecurityCenterAudio />
      {gameStarted && <SecurityCenterInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={SECURITY_CENTER_COLLIDERS} enabled={enabled} />
      {gameStarted && !demoEnded && (
        <PointerLockControls makeDefault onLock={() => onLockChange(true)} onUnlock={() => onLockChange(false)} />
      )}
      <PostEffects />
    </>
  )
}
