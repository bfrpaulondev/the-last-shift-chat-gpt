import { create } from 'zustand'

export type TriagePhase = 'idle' | 'alert' | 'resolved' | 'missed'
export type PinPhase = 'idle' | 'active' | 'protected' | 'exposed'

interface BusTriageState {
  triagePhase: TriagePhase
  alertStartedAt: number | null
  markProgress: number
  focusedCandidate: string | null
  feedback: string | null
  feedbackUntil: number
  pinPhase: PinPhase
  pinStartedAt: number | null
  gossipDistance: number
  gameplayTimeScale: number
  bumpPulse: number
  startAlert: () => void
  setFocusedCandidate: (candidate: string | null) => void
  setMarkProgress: (progress: number) => void
  setFeedback: (feedback: string | null, durationMs?: number) => void
  resolveAlert: (caught: boolean) => void
  startPinQte: () => void
  resolvePin: (protectedPin: boolean) => void
  setGossipDistance: (distance: number) => void
  pulseBump: () => void
  reset: () => void
}

const INITIAL = {
  triagePhase: 'idle' as TriagePhase,
  alertStartedAt: null as number | null,
  markProgress: 0,
  focusedCandidate: null as string | null,
  feedback: null as string | null,
  feedbackUntil: 0,
  pinPhase: 'idle' as PinPhase,
  pinStartedAt: null as number | null,
  gossipDistance: Number.POSITIVE_INFINITY,
  gameplayTimeScale: 1,
  bumpPulse: 0,
}

export const useBusTriageStore = create<BusTriageState>((set) => ({
  ...INITIAL,
  startAlert: () => set({
    triagePhase: 'alert',
    alertStartedAt: performance.now(),
    markProgress: 0,
    focusedCandidate: null,
    feedback: 'ALGO ESTÁ FORA DO PADRÃO.',
    feedbackUntil: performance.now() + 6000,
    gameplayTimeScale: 0.3,
  }),
  setFocusedCandidate: (focusedCandidate) => set((state) => ({
    focusedCandidate,
    markProgress: state.focusedCandidate === focusedCandidate ? state.markProgress : 0,
  })),
  setMarkProgress: (markProgress) => set({ markProgress: Math.max(0, Math.min(1, markProgress)) }),
  setFeedback: (feedback, durationMs = 1500) => set({
    feedback,
    feedbackUntil: feedback ? performance.now() + durationMs : 0,
  }),
  resolveAlert: (caught) => set({
    triagePhase: caught ? 'resolved' : 'missed',
    alertStartedAt: null,
    markProgress: 0,
    focusedCandidate: null,
    feedback: caught ? 'ANOMALIA MARCADA.' : null,
    feedbackUntil: caught ? performance.now() + 1800 : 0,
    gameplayTimeScale: 1,
  }),
  startPinQte: () => set({
    pinPhase: 'active',
    pinStartedAt: performance.now(),
  }),
  resolvePin: (protectedPin) => set({
    pinPhase: protectedPin ? 'protected' : 'exposed',
    pinStartedAt: null,
  }),
  setGossipDistance: (gossipDistance) => set({ gossipDistance }),
  pulseBump: () => set((state) => ({ bumpPulse: state.bumpPulse + 1 })),
  reset: () => set({ ...INITIAL }),
}))
