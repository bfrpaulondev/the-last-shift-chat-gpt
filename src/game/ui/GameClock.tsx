import { formatWorldTime, nextRoutineMinute, useShiftClock } from '../time/shiftClock'

export const START_MINUTES = 320
export const SECONDS_PER_MINUTE = 10

export function GameClock() {
  const worldMinute = useShiftClock((state) => state.worldMinute)
  const nextRoutine = nextRoutineMinute(worldMinute)

  return (
    <div className="game-clock" title={`Próxima rotina: ${formatWorldTime(nextRoutine)}`}>
      {formatWorldTime(worldMinute)}
    </div>
  )
}
