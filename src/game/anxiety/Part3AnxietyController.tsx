import { useEffect, useRef } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { useGameStore } from '../state/gameStore'

const TICK_MS = 100
const MOVEMENT_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD'])

function playHeartbeat(context: AudioContext, bpm: number) {
  if (audioEngine.isMuted()) return

  const now = context.currentTime
  const master = context.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.055, now + 0.018)
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)
  master.connect(context.destination)

  const makePulse = (offset: number, gainScale: number) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(55, now + offset)
    gain.gain.setValueAtTime(0.0001, now + offset)
    gain.gain.exponentialRampToValueAtTime(gainScale, now + offset + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.085)
    oscillator.connect(gain)
    gain.connect(master)
    oscillator.start(now + offset)
    oscillator.stop(now + offset + 0.1)
  }

  const intensity = 0.55 + ((bpm - 60) / 100) * 0.45
  makePulse(0, intensity)
  makePulse(0.11, intensity * 0.72)
}

function playExhale(context: AudioContext) {
  if (audioEngine.isMuted()) return

  const now = context.currentTime
  const length = Math.floor(context.sampleRate * 0.75)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) {
    const envelope = Math.sin((index / length) * Math.PI)
    data[index] = (Math.random() * 2 - 1) * envelope * 0.18
  }

  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(720, now)
  filter.Q.setValueAtTime(0.7, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(0.08, now + 0.12)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75)
  source.buffer = buffer
  source.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)
  source.start(now)
}

export function Part3AnxietyController() {
  const part = useGameStore((state) => state.location.part)
  const contextRef = useRef<AudioContext | null>(null)
  const keys = useRef(new Set<string>())
  const breathingSince = useRef<number | null>(null)
  const breathingApplied = useRef(false)
  const lastBeat = useRef(0)
  const silenceUntil = useRef(0)

  useEffect(() => {
    if (part !== 'part-3') return

    const game = useGameStore.getState()
    if (!game.flags.part3_bpm_initialized) {
      game.setBpm(128)
      game.setFlag('part3_bpm_initialized')
    }

    const ensureContext = () => {
      if (!contextRef.current) contextRef.current = new AudioContext()
      if (contextRef.current.state === 'suspended') void contextRef.current.resume()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      keys.current.add(event.code)
      if (event.code === 'Space' && !event.repeat) {
        const current = useGameStore.getState()
        if (!current.subtitle && !current.note && !current.cinematic && !current.areaTransition) {
          breathingSince.current = performance.now()
          breathingApplied.current = false
        }
      }
      ensureContext()
    }

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code)
      if (event.code === 'Space') {
        breathingSince.current = null
        breathingApplied.current = false
      }
    }

    const onTotalSilence = (event: Event) => {
      const detail = (event as CustomEvent<{ durationMs?: number }>).detail
      silenceUntil.current = Math.max(
        silenceUntil.current,
        performance.now() + (detail?.durationMs ?? 4000),
      )
    }

    const onPointerDown = () => ensureContext()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('part3:total-silence', onTotalSilence)

    const interval = window.setInterval(() => {
      const current = useGameStore.getState()
      if (current.location.part !== 'part-3' || current.demoEnded) return

      const blocked = Boolean(
        current.note ||
        current.subtitle ||
        current.cinematic ||
        current.areaTransition ||
        current.blackout,
      )

      if (!blocked) {
        const moving = [...MOVEMENT_KEYS].some((key) => keys.current.has(key))
        const sprinting = moving && (keys.current.has('ShiftLeft') || keys.current.has('ShiftRight'))
        if (sprinting) current.adjustBpm(8 * (TICK_MS / 1000))
        else if (!moving) current.adjustBpm(-4 * (TICK_MS / 1000))
      }

      if (
        breathingSince.current !== null &&
        !breathingApplied.current &&
        performance.now() - breathingSince.current >= 2000 &&
        !current.subtitle &&
        !current.note &&
        !current.cinematic &&
        !current.areaTransition
      ) {
        breathingApplied.current = true
        current.adjustBpm(-12)
        current.triggerHandAction('brace', 900, undefined, 'breathing-control')
        if (contextRef.current && performance.now() >= silenceUntil.current) playExhale(contextRef.current)
      }

      const context = contextRef.current
      if (
        !context ||
        context.state !== 'running' ||
        current.blackout ||
        performance.now() < silenceUntil.current
      ) return
      const bpm = useGameStore.getState().bpm
      const beatEveryMs = 60000 / bpm
      if (performance.now() - lastBeat.current >= beatEveryMs) {
        lastBeat.current = performance.now()
        playHeartbeat(context, bpm)
      }
    }, TICK_MS)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('part3:total-silence', onTotalSilence)
      keys.current.clear()
      breathingSince.current = null
      breathingApplied.current = false
      silenceUntil.current = 0
      if (contextRef.current) {
        void contextRef.current.close()
        contextRef.current = null
      }
    }
  }, [part])

  return null
}
