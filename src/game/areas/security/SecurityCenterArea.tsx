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
import { SentinelHardware } from './SentinelHardware'
import { SentinelTerminal } from './SentinelTerminal'

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
    }

    if (state.flags.part3_complete) {
      state.setObjective('PARTE 3 CONCLUÍDA — próximo: O Porão.')
    } else if (state.flags.log_vision) {
      state.setObjective('Conclua o pacto com o SENTINEL.')
    } else if (state.flags.elevator_returned_39 && state.flags.notebook_taken) {
      state.setCheckpoint('security-center-return', state.location.spawn)
      state.setObjective('A caderneta está com você. O terminal principal aguarda.')
    } else if (state.flags.all_doors_released) {
      state.setObjective('Desça para o lobby e encontre Nascimento.')
    } else if (state.flags.observed_first) {
      state.setObjective("Use o FIREMAN'S OVERRIDE para liberar as portas.")
    } else {
      state.setObjective('Consulte o monitor vivo da Central de Segurança.')
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
      <SecurityCenterScene />
      <SentinelHardware />
      <SecurityCenterAudio />
      {gameStarted && <SecurityCenterInteractionSystem />}
      {gameStarted && <SentinelTerminal />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={SECURITY_CENTER_COLLIDERS} enabled={enabled} />
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
