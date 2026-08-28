import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { useBusTriageStore } from './busTriageStore'

const ALERT_WORLD_MINUTE = 6 * 60 + 14
const PIN_WORLD_MINUTE = 6 * 60 + 20
const ANNOUNCEMENT_WORLD_MINUTE = 6 * 60 + 28
const MERIDIAN_WORLD_MINUTE = 6 * 60 + 30
const MISSED_STOP_WORLD_MINUTE = 6 * 60 + 34
const ALERT_DURATION_MS = 6000
const PIN_DURATION_MS = 2000

export function BusEventDirector() {
  useEffect(() => {
    const state = useGameStore.getState()
    const clock = useShiftClock.getState()
    if (clock.worldMinute < 365) clock.setWorldMinute(365)
    if (!state.flags.bus_ride_started) {
      state.setFlag('bus_ride_started')
      state.setObjective('Observe a viagem até a Meridian Tower.')
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE') return
      const triage = useBusTriageStore.getState()
      if (triage.pinPhase !== 'active') return

      event.preventDefault()
      triage.resolvePin(true)
      const latest = useGameStore.getState()
      latest.setFlag('pin_protected')
      latest.triggerHandAction('brace', 850, undefined, 'pin-screen')
      latest.say('Melhor não facilitar.')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      useBusTriageStore.getState().reset()
    }
  }, [])

  useFrame(() => {
    const game = useGameStore.getState()
    const clock = useShiftClock.getState()
    const bus = useBusTriageStore.getState()
    const now = performance.now()

    if (
      clock.worldMinute >= ALERT_WORLD_MINUTE &&
      !game.flags.bus_alert_started &&
      !game.flags.bus_alert_completed
    ) {
      game.setFlag('bus_alert_started')
      bus.startAlert()
    }

    if (
      bus.triagePhase === 'alert' &&
      bus.alertStartedAt !== null &&
      now - bus.alertStartedAt >= ALERT_DURATION_MS
    ) {
      bus.resolveAlert(false)
      game.setFlag('bus_alert_completed')
      game.setFlag('pickpocket_unmarked')
    }

    if (
      clock.worldMinute >= PIN_WORLD_MINUTE &&
      game.flags.bus_alert_completed &&
      !game.flags.pin_qte_started &&
      !game.flags.pin_protected &&
      !game.flags.pin_exposed
    ) {
      game.setFlag('pin_qte_started')
      bus.startPinQte()
      game.triggerHandAction('grab', 2200, undefined, 'pin-phone')
    }

    if (
      bus.pinPhase === 'active' &&
      bus.pinStartedAt !== null &&
      now - bus.pinStartedAt >= PIN_DURATION_MS
    ) {
      bus.resolvePin(false)
      game.setFlag('pin_exposed')
    }

    if (
      clock.worldMinute >= ANNOUNCEMENT_WORLD_MINUTE &&
      !game.flags.bus_next_stop_announced
    ) {
      game.setFlag('bus_next_stop_announced')
      game.say('PRÓXIMA PARADA: AVENIDA MERIDIAN.')
      game.setObjective('Prepare-se para descer na Avenida Meridian.')
    }

    if (
      clock.worldMinute >= MERIDIAN_WORLD_MINUTE &&
      !game.flags.meridian_stop_ready
    ) {
      game.setFlag('meridian_stop_ready')
      game.say('Meridian. É aqui.')
      game.setObjective('Desça do ônibus 214.')
    }

    if (
      clock.worldMinute >= MISSED_STOP_WORLD_MINUTE &&
      game.flags.meridian_stop_ready &&
      !game.flags.bus_exited &&
      !game.areaTransition
    ) {
      game.setFlag('missed_stop')
      game.setFlag('bus_exited')
      game.requestAreaTransition(
        'meridian-plaza',
        'plaza-missed-stop',
        { x: 0, y: 1.65, z: 7.2, yaw: Math.PI },
        1300,
      )
    }

    if (bus.feedback && now >= bus.feedbackUntil) {
      bus.setFeedback(null)
    }
  })

  return null
}
