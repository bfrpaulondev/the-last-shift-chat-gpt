import { useEffect } from 'react'
import { useGameStore } from '../../state/gameStore'

const UNCONSCIOUS_SPAWN = { x: 0, y: 0.72, z: 2.2, yaw: Math.PI }

export function BlackoutRecoveryController() {
  useEffect(() => {
    const state = useGameStore.getState()
    if (state.location.area !== 'blackout') return

    if (!state.flags.knocked_out) state.setFlag('knocked_out')
    if (!state.flags.badge_stolen) state.setFlag('badge_stolen')
    if (!state.flags.cup_missing) state.setFlag('cup_missing')

    if (state.flags.blackout_vision_returned) {
      state.setBlackout(false)
      if (!state.flags.note_read) state.setObjective('Leia o bilhete sobre o seu peito.')
      return
    }

    state.setBlackout(true)
    if (!state.flags.part3_awakening_started) {
      state.setFlag('part3_awakening_started')
      state.setCheckpoint('awakening-unconscious', UNCONSCIOUS_SPAWN)
    }

    const wakeTimer = window.setTimeout(() => {
      const latest = useGameStore.getState()
      if (latest.location.area !== 'blackout' || latest.flags.blackout_vision_returned) return

      latest.setFlag('blackout_vision_returned')
      latest.setCheckpoint('awakening-vision', UNCONSCIOUS_SPAWN)
      latest.setBlackout(false)
      latest.setBpm(128)
      latest.setObjective('Leia o bilhete sobre o seu peito.')
    }, 1350)

    return () => window.clearTimeout(wakeTimer)
  }, [])

  return null
}
