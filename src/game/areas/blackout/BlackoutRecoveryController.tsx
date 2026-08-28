import { useEffect } from 'react'
import { useGameStore } from '../../state/gameStore'

const KNOCKED_OUT_SPAWN = { x: 0, y: 0.72, z: 2.2, yaw: Math.PI }

export function BlackoutRecoveryController() {
  useEffect(() => {
    const state = useGameStore.getState()
    if (state.location.area !== 'blackout') return

    if (state.flags.blackout_vision_returned) {
      state.setBlackout(false)
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
