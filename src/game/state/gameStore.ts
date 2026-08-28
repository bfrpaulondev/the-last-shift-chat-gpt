import { create } from 'zustand'
import { audioEngine } from '../audio/AudioEngine'

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
  pendingSubtitle: string | null
  note: NoteState | null
  objective: string
  interactPrompt: string | null
  telemetry: TelemetryEvent[]
  cinematic: boolean
  blackout: boolean
  demoEnded: boolean
  setFlag: (flag: string) => void
  hasFlag: (flag: string) => boolean
  say: (text: string, seconds?: number) => void
  queueSubtitle: (text: string) => void
  openNote: (title: string, body: string) => void
  closeNote: () => void
  setObjective: (text: string) => void
  setPrompt: (prompt: string | null) => void
  setCinematic: (cinematic: boolean) => void
  setBlackout: (blackout: boolean) => void
  endDemo: () => void
  logEvent: (event: TelemetryEvent) => void
}

const REQUIRED_EXIT_FLAGS = [
  'faucet_fixed',
  'coffee_made',
  'badge_taken',
  'phone_checked',
] as const

let subtitleTimer: number | null = null

function checklistComplete(flags: Record<string, boolean>): boolean {
  return REQUIRED_EXIT_FLAGS.every((flag) => Boolean(flags[flag]))
}

export const useGameStore = create<GameState>((set, get) => ({
  flags: {},
  subtitle: null,
  pendingSubtitle: null,
  note: null,
  objective: 'Levante-se da cama.',
  interactPrompt: null,
  telemetry: [],
  cinematic: false,
  blackout: false,
  demoEnded: false,
  setFlag: (flag) => {
    const wasChecklistComplete = checklistComplete(get().flags)

    set((state) => {
      const flags = {
        ...state.flags,
        [flag]: true,
      }

      return {
        flags,
        objective: checklistComplete(flags)
          ? 'Sair de casa — pegar o ônibus das 06:05.'
          : state.objective,
      }
    })

    if (!wasChecklistComplete && checklistComplete(get().flags)) {
      audioEngine.playDoorUnlock()
    }
  },
  hasFlag: (flag) => Boolean(get().flags[flag]),
  say: (text, seconds = 4) => {
    if (subtitleTimer !== null) {
      window.clearTimeout(subtitleTimer)
    }

    audioEngine.playDialogueBlip()
    set({ subtitle: text })
    subtitleTimer = window.setTimeout(() => {
      set({ subtitle: null })
      subtitleTimer = null
    }, seconds * 1000)
  },
  queueSubtitle: (pendingSubtitle) => {
    set({ pendingSubtitle })
  },
  openNote: (title, body) => {
    audioEngine.playPaper()
    set({ note: { title, body }, interactPrompt: null })
  },
  closeNote: () => {
    const pendingSubtitle = get().pendingSubtitle
    set({ note: null, pendingSubtitle: null })
    if (pendingSubtitle) {
      get().say(pendingSubtitle)
    }
  },
  setObjective: (objective) => {
    set({ objective })
  },
  setPrompt: (interactPrompt) => {
    if (get().demoEnded) {
      if (get().interactPrompt !== null) {
        set({ interactPrompt: null })
      }
      return
    }

    if (get().interactPrompt !== interactPrompt) {
      set({ interactPrompt })
    }
  },
  setCinematic: (cinematic) => {
    set({ cinematic })
  },
  setBlackout: (blackout) => {
    set({ blackout })
  },
  endDemo: () => {
    set({ demoEnded: true, interactPrompt: null, subtitle: null })
  },
  logEvent: (event) => {
    set((state) => ({ telemetry: [...state.telemetry, event] }))
  },
}))
