export const DESCENT_START_FLOOR = 39
export const DESCENT_FLOOR_DROP = 1.15
export const DESCENT_TOP_Z = 4.25
export const DESCENT_BOTTOM_Z = -4.1
export const DESCENT_TRIGGER_Z = 3.95

export function descentBaseY(floor: number): number {
  const clampedFloor = Math.max(0, Math.min(DESCENT_START_FLOOR, floor))
  return -(DESCENT_START_FLOOR - clampedFloor) * DESCENT_FLOOR_DROP
}

export function descentReversed(floor: number): boolean {
  return (DESCENT_START_FLOOR - floor) % 2 === 1
}

export function descentGroundHeight(floor: number, z: number): number {
  const span = DESCENT_TOP_Z - DESCENT_BOTTOM_Z
  const progress = descentReversed(floor)
    ? (z - DESCENT_BOTTOM_Z) / span
    : (DESCENT_TOP_Z - z) / span
  return descentBaseY(floor) - Math.max(0, Math.min(1, progress)) * DESCENT_FLOOR_DROP
}

export function reachedDescentLanding(floor: number, z: number): boolean {
  return descentReversed(floor) ? z >= DESCENT_TRIGGER_Z : z <= -DESCENT_TRIGGER_Z
}

export function floorFromCheckpoint(checkpoint: string): number {
  const match = /^descent-floor-(\d+)$/.exec(checkpoint)
  if (!match) return DESCENT_START_FLOOR
  const parsed = Number.parseInt(match[1], 10)
  if (!Number.isFinite(parsed)) return DESCENT_START_FLOOR
  return Math.max(1, Math.min(DESCENT_START_FLOOR, parsed))
}
