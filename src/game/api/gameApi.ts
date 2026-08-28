import type { TelemetryEvent } from '../state/gameStore'
import {
  AREA_DEFINITIONS,
  INITIAL_LOCATION,
  isGameArea,
  isGamePart,
  locationForArea,
  type GameLocationSnapshot,
} from '../flow/areaTypes'

const PLAYER_ID_KEY = 'the-last-shift-player-id'

export interface SaveSnapshot {
  playerId: string
  flags: Record<string, boolean>
  chapter: string
  location?: GameLocationSnapshot
  schemaVersion?: number
  playtimeSeconds: number
}

function createPlayerId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `player-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getPlayerId(): string {
  try {
    const stored = window.localStorage.getItem(PLAYER_ID_KEY)
    if (stored) {
      return stored
    }

    const created = createPlayerId()
    window.localStorage.setItem(PLAYER_ID_KEY, created)
    return created
  } catch {
    return createPlayerId()
  }
}

export function normalizeSaveLocation(save: SaveSnapshot): GameLocationSnapshot {
  const candidate = save.location
  if (
    candidate &&
    isGamePart(candidate.part) &&
    isGameArea(candidate.area) &&
    typeof candidate.checkpoint === 'string' &&
    candidate.checkpoint.length > 0
  ) {
    return candidate
  }

  if (save.flags?.left_home) {
    return locationForArea('street', 'street-arrival')
  }

  return INITIAL_LOCATION
}

export async function checkBackend(): Promise<boolean> {
  try {
    const response = await fetch('/api/health')
    return response.ok
  } catch {
    return false
  }
}

export async function loadSave(playerId: string): Promise<SaveSnapshot | null> {
  try {
    const response = await fetch(`/api/save/${encodeURIComponent(playerId)}`)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      return null
    }

    return (await response.json()) as SaveSnapshot
  } catch {
    return null
  }
}

export async function saveProgress(
  playerId: string,
  flags: Record<string, boolean>,
  location: GameLocationSnapshot,
  playtimeSeconds: number,
): Promise<boolean> {
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerId,
        flags,
        chapter: AREA_DEFINITIONS[location.area].chapter,
        location,
        schemaVersion: 2,
        playtimeSeconds,
      }),
    })

    return response.ok
  } catch {
    return false
  }
}

export async function postTelemetry(
  playerId: string,
  events: TelemetryEvent[],
  keepalive = false,
): Promise<boolean> {
  if (events.length === 0) {
    return true
  }

  try {
    const response = await fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId, events }),
      keepalive,
    })

    return response.ok
  } catch {
    return false
  }
}
