import { useEffect, useRef } from 'react'
import { useGameStore } from '../state/gameStore'
import { GAME_SECONDS_PER_MINUTE, isRoutineBoundary, useShiftClock } from './shiftClock'

interface ShiftClockControllerProps {
  enabled: boolean
}

const ROUTINE_AREAS = new Set([
  'service-elevator',
  'work-floor-22',
  'work-floor-30',
  'cafeteria',
  'floor-37',
])

export function ShiftClockController({ enabled }: ShiftClockControllerProps) {
  const anchorRealMs = useRef(performance.now())
  const anchorWorldMinute = useRef(useShiftClock.getState().worldMinute)
  const enabledRef = useRef(enabled)

  useEffect(() => {
    enabledRef.current = enabled
    anchorRealMs.current = performance.now()
    anchorWorldMinute.current = useShiftClock.getState().worldMinute
  }, [enabled])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!enabledRef.current) return

      const elapsedSeconds = (performance.now() - anchorRealMs.current) / 1000
      const elapsedGameMinutes = Math.floor(elapsedSeconds / GAME_SECONDS_PER_MINUTE)
      const targetMinute = anchorWorldMinute.current + elapsedGameMinutes
      const clock = useShiftClock.getState()

      if (targetMinute !== clock.worldMinute) {
        clock.setWorldMinute(targetMinute)
      }

      const game = useGameStore.getState()
      if (
        ROUTINE_AREAS.has(game.location.area) &&
        isRoutineBoundary(targetMinute) &&
        clock.lastRoutineMinute !== targetMinute
      ) {
        clock.markRoutineMinute(targetMinute)
      }
    }, 250)

    return () => window.clearInterval(timer)
  }, [])

  return null
}
