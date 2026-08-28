import { formatWorldTime, nextRoutineMinute, useShiftClock } from '../time/shiftClock'

export function GameClock() {
  const worldMinute = useShiftClock((state) => state.worldMinute)
  const nextRoutine = nextRoutineMinute(worldMinute)

  return (
    <div className="game-clock" title={`Próxima rotina: ${formatWorldTime(nextRoutine)}`}>
      {formatWorldTime(worldMinute)}
    </div>
  )
}
