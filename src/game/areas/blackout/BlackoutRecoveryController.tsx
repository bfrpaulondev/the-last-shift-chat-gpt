import { useEffect } from 'react'
import { useGameStore } from '../../state/gameStore'

const KNOCKED_OUT_SPAWN = { x: 0, y: 0.72, z: 2.2, yaw: Math.PI }

function restoreRecoveryObjective() {
  const game = useGameStore.getState()
  if (game.flags.blackout_recovery_complete) {
    game.setObjective('Continue pela rota de emergência.')
    return
  }
  if (!game.flags.blackout_stood_up) {
    game.setObjective('Levante-se do chão.')
    return
  }
  if (!game.flags.blackout_emergency_light_on) {
    game.setObjective('Encontre e ative a luz de emergência.')
    return
  }
  if (!game.flags.blackout_elevator_checked) {
    game.setObjective('Verifique se o elevador de serviço responde.')
    return
  }
  game.setObjective('Procure uma saída pelo corredor de emergência.')
}

export function BlackoutRecoveryController() {
  useEffect(() => {
    const state = useGameStore.getState()
    if (state.location.area !== 'blackout') return

    if (state.flags.blackout_vision_returned) {
      state.setBlackout(false)
      restoreRecoveryObjective()
      return
    }

    state.setBlackout(true)
    if (!state.flags.blackout_recovery_started) {
      state.setFlag('blackout_recovery_started')
      state.setCheckpoint('blackout-unconscious', KNOCKED_OUT_SPAWN)
    }

    const wakeTimer = window.setTimeout(() => {
      const latest = useGameStore.getState()
      if (latest.location.area !== 'blackout' || latest.flags.blackout_vision_returned) return

      latest.setFlag('blackout_vision_returned')
      latest.setCheckpoint('blackout-waking', KNOCKED_OUT_SPAWN)
      latest.setBlackout(false)
      latest.setObjective('Levante-se do chão.')
      latest.say('Minha cabeça... o que aconteceu?')
    }, 1500)

    return () => window.clearTimeout(wakeTimer)
  }, [])

  return null
}
