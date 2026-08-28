import { create } from 'zustand'
import { audioEngine } from '../audio/AudioEngine'

export interface TelemetryEvent {
  t: number
  type: 'interact'
  objectId: string
  wasFirstTime: boolean
}

export type HandActionKind =
  | 'reach'
  | 'grab'
  | 'press'
  | 'turn'
  | 'door'
  | 'brace'
  | 'startle'

export interface HandActionState {
  kind: HandActionKind
  startedAt: number
  durationMs: number
}

interface NoteState {
  title: string
  body: string
}

interface GameState {
  flags: Record<string, boolean>
  subtitle: string | null
  subtitleQueue: string[]
  pendingSubtitle: string | null
  note: NoteState | null
  objective: string
  interactPrompt: string | null
  telemetry: TelemetryEvent[]
  cinematic: boolean
  blackout: boolean
  scareActive: boolean
  handAction: HandActionState | null
  demoEnded: boolean
  backendOnline: boolean
  progressSaved: boolean
  setFlag: (flag: string) => void
  hydrateFlags: (flags: Record<string, boolean>) => void
  hasFlag: (flag: string) => boolean
  say: (text: string, seconds?: number) => void
  dismissSubtitle: () => void
  queueSubtitle: (text: string) => void
  openNote: (title: string, body: string) => void
  closeNote: () => void
  setObjective: (text: string) => void
  setPrompt: (prompt: string | null) => void
  setCinematic: (cinematic: boolean) => void
  setBlackout: (blackout: boolean) => void
  triggerHandAction: (kind: HandActionKind, durationMs?: number) => void
  triggerScare: (durationMs?: number) => void
  setBackendOnline: (backendOnline: boolean) => void
  setProgressSaved: (progressSaved: boolean) => void
  endDemo: () => void
  logEvent: (event: TelemetryEvent) => void
  acknowledgeTelemetry: (count: number) => void
}

const REQUIRED_EXIT_FLAGS = [
  'faucet_fixed',
  'coffee_made',
  'badge_taken',
  'phone_checked',
] as const

let handActionTimer: number | null = null
let scareTimer: number | null = null

function checklistComplete(flags: Record<string, boolean>): boolean {
  return REQUIRED_EXIT_FLAGS.every((flag) => Boolean(flags[flag]))
}

function objectiveForFlags(flags: Record<string, boolean>): string {
  if (!flags.awake) {
    return 'Levante-se da cama.'
  }

  if (checklistComplete(flags)) {
    return 'Sair de casa — pegar o ônibus das 06:05.'
  }

  return 'Prepare-se: feche a torneira, tome café, pegue o crachá e o celular.'
}

export const useGameStore = create<GameState>((set, get) => ({
  flags: {},
  subtitle: null,
  subtitleQueue: [],
  pendingSubtitle: null,
  note: null,
  objective: 'Levante-se da cama.',
  interactPrompt: null,
  telemetry: [],
  cinematic: false,
  blackout: false,
  scareActive: false,
  handAction: null,
  demoEnded: false,
  backendOnline: false,
  progressSaved: false,
  setFlag: (flag) => {
    const wasChecklistComplete = checklistComplete(get().flags)

    set((state) => {
      const flags = {
        ...state.flags,
        [flag]: true,
      }

      return {
        flags,
        progressSaved: false,
        objective: checklistComplete(flags)
          ? 'Sair de casa — pegar o ônibus das 06:05.'
          : state.objective,
      }
    })

    if (!wasChecklistComplete && checklistComplete(get().flags)) {
      audioEngine.playDoorUnlock()
    }
  },
  hydrateFlags: (flags) => {
    set({
      flags: { ...flags },
      objective: objectiveForFlags(flags),
      progressSaved: true,
    })
  },
  hasFlag: (flag) => Boolean(get().flags[flag]),
  say: (text, _seconds) => {
    const current = get()
    if (current.subtitle) {
      if (
        current.subtitle !== text &&
        !current.subtitleQueue.includes(text)
      ) {
        set({ subtitleQueue: [...current.subtitleQueue, text] })
      }
      return
    }

    audioEngine.playDialogueBlip()
    set({ subtitle: text })
  },
  dismissSubtitle: () => {
    const queue = get().subtitleQueue
    const next = queue[0] ?? null
    if (next) {
      audioEngine.playDialogueBlip()
    }
    set({
      subtitle: next,
      subtitleQueue: queue.slice(1),
    })
  },
  queueSubtitle: (pendingSubtitle) => {
    set({ pendingSubtitle })
  },
  openNote: (title, body) => {
    audioEngine.playPaper()
    set({
      note: { title, body },
      interactPrompt: null,
    })
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
  triggerHandAction: (kind, durationMs = 650) => {
    if (handActionTimer !== null) {
      window.clearTimeout(handActionTimer)
    }

    const action: HandActionState = {
      kind,
      startedAt: performance.now(),
      durationMs,
    }

    set({ handAction: action })
    handActionTimer = window.setTimeout(() => {
      if (get().handAction?.startedAt === action.startedAt) {
        set({ handAction: null })
      }
      handActionTimer = null
    }, durationMs)
  },
  triggerScare: (durationMs = 1600) => {
    if (scareTimer !== null) {
      window.clearTimeout(scareTimer)
    }

    audioEngine.playScareSting()
    audioEngine.playHeartbeat()
    get().triggerHandAction('startle', Math.min(durationMs, 1300))
    set({ scareActive: true })

    scareTimer = window.setTimeout(() => {
      set({ scareActive: false })
      scareTimer = null
    }, durationMs)
  },
  setBackendOnline: (backendOnline) => {
    set({ backendOnline })
  },
  setProgressSaved: (progressSaved) => {
    set({ progressSaved })
  },
  endDemo: () => {
    set({
      demoEnded: true,
      interactPrompt: null,
      subtitle: null,
      subtitleQueue: [],
      scareActive: false,
      handAction: null,
    })
  },
  logEvent: (event) => {
    set((state) => ({ telemetry: [...state.telemetry, event] }))
  },
  acknowledgeTelemetry: (count) => {
    if (count <= 0) {
      return
    }

    set((state) => ({ telemetry: state.telemetry.slice(count) }))
  },
}))
