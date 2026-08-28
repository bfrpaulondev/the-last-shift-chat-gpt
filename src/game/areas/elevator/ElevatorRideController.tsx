import { useEffect } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'

export function ElevatorRideController() {
  const rideStarted = useGameStore((state) => Boolean(state.flags.elevator_ride_started))
  const arrived = useGameStore((state) => Boolean(state.flags.elevator_arrived_22))
  const ride30Started = useGameStore((state) => Boolean(state.flags.elevator_ride_to_30_started))
  const arrived30 = useGameStore((state) => Boolean(state.flags.elevator_arrived_30))

  useEffect(() => {
    if (!rideStarted || arrived) return

    const timer = window.setTimeout(() => {
      const game = useGameStore.getState()
      if (game.location.area !== 'service-elevator' || game.flags.elevator_arrived_22) return

      game.setFlag('elevator_arrived_22')
      game.setCheckpoint('elevator-floor-22', game.location.spawn)
      const clock = useShiftClock.getState()
      if (clock.worldMinute < 396) clock.setWorldMinute(396)
      game.say('22.º andar. Primeiro da rota.')
    }, 4300)

    return () => window.clearTimeout(timer)
  }, [arrived, rideStarted])

  useEffect(() => {
    if (!ride30Started || arrived30) return

    const timer = window.setTimeout(() => {
      const game = useGameStore.getState()
      if (game.location.area !== 'service-elevator' || game.flags.elevator_arrived_30) return

      game.setFlag('elevator_arrived_30')
      game.setCheckpoint('elevator-floor-30', game.location.spawn)
      const clock = useShiftClock.getState()
      if (clock.worldMinute < 402) clock.setWorldMinute(402)
      game.setObjective('Saia no 30.º andar.')
      game.say('30.º andar.')
    }, 3600)

    return () => window.clearTimeout(timer)
  }, [arrived30, ride30Started])

  return null
}
