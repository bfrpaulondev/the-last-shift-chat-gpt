import { useEffect, useRef } from 'react'
import { GAME_SECONDS_PER_MINUTE, isRoutineBoundary, useShiftClock } from './shiftClock'

export function ShiftClockDriver() {
  const accumulatedSeconds = useRef(0)
  const previous = useRef(performance.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = performance.now()
      accumulatedSeconds.current += Math.max(0, (now - previous.current) / 1000)
      previous.current = now

      while (accumulatedSeconds.current >= GAME_SECONDS_PER_MINUTE) {
        accumulatedSeconds.current -= GAME_SECONDS_PER_MINUTE
        const state = useShiftClock.getState()
        const nextMinute = state.worldMinute + 1
        state.setWorldMinute(nextMinute)
        if (isRoutineBoundary(nextMinute)) {
          useShiftClock.getState().markRoutineMinute(nextMinute)
        }
      }
    }, 250)

    const onVisibility = () => {
      previous.current = performance.now()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return null
}
