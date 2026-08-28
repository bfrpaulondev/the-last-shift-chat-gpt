import { create } from 'zustand'

export interface TelemetryEvent {
  t: number
  type: 'interact'
  objectId: string
  wasFirstTime: boolean
}

interface NoteState {
  title: string
  body: string
}

interface GameState {
  flags: Record<string, boolean>
  subtitle: string | null
  note: NoteState | null
  objective: string
  interactPrompt: string | null
  telemetry: TelemetryEvent[]
  setFlag: (flag: string) => void
  hasFlag: (flag: string) => boolean
  say: (text: string, seconds?: number) => void
  openNote: (title: string, body: string) => void
  closeNote: () => void
  setObjective: (text: string) => void
  setPrompt: (prompt: string | null) => void
  logEvent: (event: TelemetryEvent) => void
}

let subtitleTimer: number | null = null

export const useGameStore = create<GameState>((set, get) => ({
  flags: {},
  subtitle: null,
  note: null,
  objective: 'Levante-se da cama.',
  interactPrompt: null,
  telemetry: [],
  setFlag: (flag) => {
    set((state) => ({
      flags: {
        ...state.flags,
        [flag]: true,
      },
    }))
  },
  hasFlag: (flag) => Boolean(get().flags[flag]),
  say: (text, seconds = 4) => {
    if (subtitleTimer !== null) {
      window.clearTimeout(subtitleTimer)
    }

    set({ subtitle: text })
    subtitleTimer = window.setTimeout(() => {
      set({ subtitle: null })
      subtitleTimer = null
    }, seconds * 1000)
  },
  openNote: (title, body) => {
    set({ note: { title, body }, interactPrompt: null })
  },
  closeNote: () => {
    set({ note: null })
  },
  setObjective: (objective) => {
    set({ objective })
  },
  setPrompt: (interactPrompt) => {
    if (get().interactPrompt !== interactPrompt) {
      set({ interactPrompt })
    }
  },
  logEvent: (event) => {
    set((state) => ({ telemetry: [...state.telemetry, event] }))
  },
}))
