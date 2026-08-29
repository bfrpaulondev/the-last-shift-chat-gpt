import { create } from 'zustand'
import { audioEngine } from '../audio/AudioEngine'
import {
  INITIAL_LOCATION,
  locationForArea,
  type GameArea,
  type GameLocationSnapshot,
  type PlayerSpawn,
} from '../flow/areaTypes'

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

export type HandActionVariant =
  | 'generic'
  | 'coffee-press'
  | 'badge-slip'
  | 'badge-pickup'
  | 'phone-lift'
  | 'faucet-turn'
  | 'door-handle'

export interface HandActionState {
  kind: HandActionKind
  startedAt: number
  durationMs: number
  target?: [number, number, number]
  objectId?: string
  variant?: HandActionVariant
}

export interface AreaTransitionState {
  from: GameArea
  to: GameArea
  checkpoint: string
  startedAt: number
  durationMs: number
}

interface NoteState {
  title: string
  body: string
}

interface GameState {
  flags: Record<string, boolean>
  location: GameLocationSnapshot
  areaTransition: AreaTransitionState | null
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
  bpm: number
  setFlag: (flag: string) => void
  hydrateFlags: (flags: Record<string, boolean>) => void
  hydrateProgress: (flags: Record<string, boolean>, location?: GameLocationSnapshot) => void
  hasFlag: (flag: string) => boolean
  setCheckpoint: (checkpoint: string, spawn?: PlayerSpawn) => void
  requestAreaTransition: (
    area: GameArea,
    checkpoint?: string,
    spawn?: PlayerSpawn,
    durationMs?: number,
  ) => void
  say: (text: string, seconds?: number) => void
  dismissSubtitle: () => void
  queueSubtitle: (text: string) => void
  openNote: (title: string, body: string) => void
  closeNote: () => void
  setObjective: (text: string) => void
  setPrompt: (prompt: string | null) => void
  setCinematic: (cinematic: boolean) => void
  setBlackout: (blackout: boolean) => void
  setBpm: (bpm: number) => void
  adjustBpm: (delta: number) => void
  triggerHandAction: (
    kind: HandActionKind,
    durationMs?: number,
    target?: [number, number, number],
    objectId?: string,
    variant?: HandActionVariant,
  ) => void
  triggerScare: (durationMs?: number) => void
  setBackendOnline: (backendOnline: boolean) => void
  setProgressSaved: (progressSaved: boolean) => void
  endDemo: () => void
  logEvent: (event: TelemetryEvent) => void
  acknowledgeTelemetry: (count: number) => void
}

const REQUIRED_EXIT_FLAGS = ['faucet_fixed', 'coffee_made', 'badge_taken', 'phone_checked'] as const

let handActionTimer: number | null = null
let scareTimer: number | null = null
let areaSwapTimer: number | null = null
let areaTransitionTimer: number | null = null

function checklistComplete(flags: Record<string, boolean>): boolean {
  return REQUIRED_EXIT_FLAGS.every((flag) => Boolean(flags[flag]))
}

function clampBpm(value: number): number {
  return Math.max(60, Math.min(160, value))
}

function canonicalizeLocation(location: GameLocationSnapshot): GameLocationSnapshot {
  if (
    (location.area === 'blackout' ||
      location.area === 'emergency-stairwell' ||
      location.area === 'security-center') &&
    location.part !== 'part-3'
  ) {
    return { ...location, part: 'part-3' }
  }
  return location
}

function objectiveForProgress(flags: Record<string, boolean>, location: GameLocationSnapshot): string {
  if (location.area === 'apartment') {
    if (!flags.awake) return 'Levante-se da cama.'
    if (checklistComplete(flags)) return 'Sair de casa — pegar o ônibus das 06:05.'
    return 'Prepare-se: feche a torneira, tome café, pegue o crachá e o celular.'
  }

  switch (location.area) {
    case 'street':
      return 'Vá até o ponto e pegue o ônibus 214 para a Meridian Tower.'
    case 'bus-214':
      return 'Siga para a Meridian Tower.'
    case 'meridian-plaza':
      return 'Entre na Meridian Tower.'
    case 'lobby':
      return 'Passe pela portaria e siga para o vestiário.'
    case 'locker-b1':
      return 'Vista o uniforme e confirme sua rota de trabalho.'
    case 'service-elevator':
      return 'Use o elevador de serviço para seguir a rota.'
    case 'work-floor-22':
    case 'work-floor-30':
      return 'Complete a rotina de limpeza do andar.'
    case 'cafeteria':
      return 'Faça a pausa e continue o turno.'
    case 'floor-37':
      return 'Limpe o 37.º andar.'
    case 'blackout':
      if (flags.door37_locked) return 'Siga pelo corredor de emergência até a escada.'
      if (flags.note_read) return 'Tente sair do 37.º andar.'
      return 'Leia o bilhete sobre o seu peito.'
    case 'emergency-stairwell':
      if (flags.sc39_open) return 'Entre no 39.º andar pela porta escorada.'
      if (flags.stairwell_reached_39) return 'Verifique a porta do 39.º andar.'
      if (flags.reader38_green) return 'Suba até o 39.º andar.'
      if (flags.stairwell_reached_38) return 'Observe o leitor do 38.º andar.'
      return 'Suba pela escada de emergência até o 39.º andar.'
    case 'security-center':
      if (flags.all_doors_released) return 'Desça para o lobby e encontre Nascimento.'
      if (flags.observed_first) return "Use o FIREMAN'S OVERRIDE para liberar as portas."
      if (flags.cam02_checked) return 'Feche o feed e observe a sala.'
      return 'Consulte o monitor vivo da Central de Segurança.'
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  flags: {},
  location: INITIAL_LOCATION,
  areaTransition: null,
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
  bpm: 72,
  setFlag: (flag) => {
    const wasChecklistComplete = checklistComplete(get().flags)
    set((state) => {
      const flags = { ...state.flags, [flag]: true }
      return { flags, progressSaved: false, objective: objectiveForProgress(flags, state.location) }
    })
    if (!wasChecklistComplete && checklistComplete(get().flags)) audioEngine.playDoorUnlock()
  },
  hydrateFlags: (flags) => {
    const location = get().location
    set({ flags: { ...flags }, objective: objectiveForProgress(flags, location), progressSaved: true })
  },
  hydrateProgress: (flags, location = INITIAL_LOCATION) => {
    const canonicalLocation = canonicalizeLocation(location)
    const part3Bpm = flags.note_read ? 112 : 128
    set({
      flags: { ...flags },
      location: canonicalLocation,
      areaTransition: null,
      objective: objectiveForProgress(flags, canonicalLocation),
      cinematic: false,
      blackout: canonicalLocation.area === 'blackout' && !flags.blackout_vision_returned,
      demoEnded: false,
      bpm: canonicalLocation.part === 'part-3' ? part3Bpm : 72,
      progressSaved: true,
    })
  },
  hasFlag: (flag) => Boolean(get().flags[flag]),
  setCheckpoint: (checkpoint, spawn) => {
    set((state) => {
      const location: GameLocationSnapshot = { ...state.location, checkpoint, spawn: spawn ?? state.location.spawn }
      return { location, progressSaved: false, objective: objectiveForProgress(state.flags, location) }
    })
  },
  requestAreaTransition: (area, checkpoint, spawn, durationMs = 900) => {
    if (areaSwapTimer !== null) window.clearTimeout(areaSwapTimer)
    if (areaTransitionTimer !== null) window.clearTimeout(areaTransitionTimer)

    const current = get()
    const target = locationForArea(area, checkpoint, spawn)
    const startedAt = performance.now()
    const duration = Math.max(400, durationMs)

    set({
      areaTransition: {
        from: current.location.area,
        to: area,
        checkpoint: target.checkpoint,
        startedAt,
        durationMs: duration,
      },
      cinematic: true,
      interactPrompt: null,
      handAction: null,
    })

    areaSwapTimer = window.setTimeout(() => {
      set((state) => ({
        location: target,
        objective: objectiveForProgress(state.flags, target),
        progressSaved: false,
        blackout: target.area === 'blackout' && !state.flags.blackout_vision_returned,
      }))
      areaSwapTimer = null
    }, Math.round(duration * 0.48))

    areaTransitionTimer = window.setTimeout(() => {
      set({ areaTransition: null, cinematic: false })
      areaTransitionTimer = null
    }, duration)
  },
  say: (text, _seconds) => {
    const current = get()
    if (current.subtitle) {
      if (current.subtitle !== text && !current.subtitleQueue.includes(text)) {
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
    if (next) audioEngine.playDialogueBlip()
    set({ subtitle: next, subtitleQueue: queue.slice(1) })
  },
  queueSubtitle: (pendingSubtitle) => set({ pendingSubtitle }),
  openNote: (title, body) => {
    audioEngine.playPaper()
    set({ note: { title, body }, interactPrompt: null })
  },
  closeNote: () => {
    const pendingSubtitle = get().pendingSubtitle
    set({ note: null, pendingSubtitle: null })
    if (pendingSubtitle) get().say(pendingSubtitle)
  },
  setObjective: (objective) => set({ objective }),
  setPrompt: (interactPrompt) => {
    if (get().demoEnded || get().areaTransition) {
      if (get().interactPrompt !== null) set({ interactPrompt: null })
      return
    }
    if (get().interactPrompt !== interactPrompt) set({ interactPrompt })
  },
  setCinematic: (cinematic) => set({ cinematic }),
  setBlackout: (blackout) => set({ blackout }),
  setBpm: (bpm) => set({ bpm: clampBpm(bpm) }),
  adjustBpm: (delta) => set((state) => ({ bpm: clampBpm(state.bpm + delta) })),
  triggerHandAction: (kind, durationMs = 650, target, objectId, variant = 'generic') => {
    if (handActionTimer !== null) window.clearTimeout(handActionTimer)
    const action: HandActionState = { kind, startedAt: performance.now(), durationMs, target, objectId, variant }
    set({ handAction: action })
    handActionTimer = window.setTimeout(() => {
      if (get().handAction?.startedAt === action.startedAt) set({ handAction: null })
      handActionTimer = null
    }, durationMs)
  },
  triggerScare: (durationMs = 1600) => {
    if (scareTimer !== null) window.clearTimeout(scareTimer)
    audioEngine.playScareSting()
    audioEngine.playHeartbeat()
    get().adjustBpm(25)
    get().triggerHandAction('startle', Math.min(durationMs, 1300))
    set({ scareActive: true })
    scareTimer = window.setTimeout(() => {
      set({ scareActive: false })
      scareTimer = null
    }, durationMs)
  },
  setBackendOnline: (backendOnline) => set({ backendOnline }),
  setProgressSaved: (progressSaved) => set({ progressSaved }),
  endDemo: () => {
    const current = get()
    if (current.location.area === 'apartment' && current.flags.left_home) {
      audioEngine.setMuted(false)
      get().requestAreaTransition('street', 'street-arrival', undefined, 1100)
      return
    }
    set({
      demoEnded: true,
      interactPrompt: null,
      subtitle: null,
      subtitleQueue: [],
      scareActive: false,
      handAction: null,
      areaTransition: null,
    })
  },
  logEvent: (event) => set((state) => ({ telemetry: [...state.telemetry, event] })),
  acknowledgeTelemetry: (count) => {
    if (count <= 0) return
    set((state) => ({ telemetry: state.telemetry.slice(count) }))
  },
}))
