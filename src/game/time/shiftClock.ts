import { create } from 'zustand'

export const INITIAL_WORLD_MINUTES = 5 * 60 + 20
export const GAME_SECONDS_PER_MINUTE = 10
export const ROUTINE_INTERVAL_MINUTES = 15

export interface ShiftTimeSnapshot {
  worldMinute: number
  lastRoutineMinute: number | null
}

interface ShiftClockState extends ShiftTimeSnapshot {
  routineCycle: number
  setWorldMinute: (worldMinute: number) => void
  markRoutineMinute: (worldMinute: number) => void
  hydrateShiftTime: (snapshot?: Partial<ShiftTimeSnapshot>) => void
}

function normalizeMinute(value: number): number {
  if (!Number.isFinite(value)) {
    return INITIAL_WORLD_MINUTES
  }
  return Math.max(0, Math.floor(value))
}

export function formatWorldTime(totalMinutes: number): string {
  const normalized = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function isRoutineBoundary(worldMinute: number): boolean {
  return worldMinute % ROUTINE_INTERVAL_MINUTES === 0
}

export function nextRoutineMinute(worldMinute: number): number {
  const minute = normalizeMinute(worldMinute)
  return Math.ceil((minute + 1) / ROUTINE_INTERVAL_MINUTES) * ROUTINE_INTERVAL_MINUTES
}

export const useShiftClock = create<ShiftClockState>((set) => ({
  worldMinute: INITIAL_WORLD_MINUTES,
  lastRoutineMinute: null,
  routineCycle: 0,
  setWorldMinute: (worldMinute) => {
    set({ worldMinute: normalizeMinute(worldMinute) })
  },
  markRoutineMinute: (worldMinute) => {
    const normalized = normalizeMinute(worldMinute)
    set((state) => {
      if (state.lastRoutineMinute === normalized) {
        return state
      }
      return {
        lastRoutineMinute: normalized,
        routineCycle: state.routineCycle + 1,
      }
    })
  },
  hydrateShiftTime: (snapshot) => {
    set({
      worldMinute: normalizeMinute(snapshot?.worldMinute ?? INITIAL_WORLD_MINUTES),
      lastRoutineMinute:
        typeof snapshot?.lastRoutineMinute === 'number'
          ? normalizeMinute(snapshot.lastRoutineMinute)
          : null,
      routineCycle: 0,
    })
  },
}))
