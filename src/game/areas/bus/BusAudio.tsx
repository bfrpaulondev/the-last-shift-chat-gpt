import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'
import { useBusTriageStore } from './busTriageStore'

function noiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const count = Math.max(1, Math.floor(context.sampleRate * seconds))
  const buffer = context.createBuffer(1, count, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < count; index += 1) {
    data[index] = Math.random() * 2 - 1
  }
  return buffer
}

function makeLoop(
  context: AudioContext,
  destination: AudioNode,
  options: { volume: number; lowpass?: number; highpass?: number; seconds?: number },
): { source: AudioBufferSourceNode; gain: GainNode } {
  const source = context.createBufferSource()
  const gain = context.createGain()
  const filter = context.createBiquadFilter()
  source.buffer = noiseBuffer(context, options.seconds ?? 3)
  source.loop = true
  gain.gain.value = options.volume
  if (options.highpass) {
    filter.type = 'highpass'
    filter.frequency.value = options.highpass
  } else {
    filter.type = 'lowpass'
    filter.frequency.value = options.lowpass ?? 900
  }
  source.connect(filter)
  filter.connect(gain)
  gain.connect(destination)
  source.start()
  return { source, gain }
}

export function BusAudio() {
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const masterFilterRef = useRef<BiquadFilterNode | null>(null)
  const gossipGainRef = useRef<GainNode | null>(null)
  const bumpTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const sources: AudioBufferSourceNode[] = []
    const oscillators: OscillatorNode[] = []

    const start = async () => {
      const context = new window.AudioContext()
      contextRef.current = context
      if (context.state === 'suspended') await context.resume().catch(() => undefined)

      const masterFilter = context.createBiquadFilter()
      masterFilter.type = 'lowpass'
      masterFilter.frequency.value = 12000
      masterFilter.Q.value = 0.65
      masterFilterRef.current = masterFilter

      const master = context.createGain()
      master.gain.value = audioEngine.isMuted() ? 0 : 0.42
      masterRef.current = master
      masterFilter.connect(master)
      master.connect(context.destination)

      const engine = context.createOscillator()
      const engineGain = context.createGain()
      engine.type = 'sawtooth'
      engine.frequency.value = 54
      engineGain.gain.value = 0.018
      engine.connect(engineGain)
      engineGain.connect(masterFilter)
      engine.start()
      oscillators.push(engine)

      const resonance = context.createOscillator()
      const resonanceGain = context.createGain()
      resonance.type = 'sine'
      resonance.frequency.value = 93
      resonanceGain.gain.value = 0.012
      resonance.connect(resonanceGain)
      resonanceGain.connect(masterFilter)
      resonance.start()
      oscillators.push(resonance)

      const road = makeLoop(context, masterFilter, { volume: 0.055, lowpass: 520, seconds: 4 })
      const rain = makeLoop(context, masterFilter, { volume: 0.038, highpass: 1700, seconds: 3 })
      const air = makeLoop(context, masterFilter, { volume: 0.02, lowpass: 280, seconds: 5 })
      sources.push(road.source, rain.source, air.source)

      const gossip = makeLoop(context, masterFilter, { volume: 0, lowpass: 760, seconds: 2.6 })
      gossipGainRef.current = gossip.gain
      sources.push(gossip.source)

      const playBump = () => {
        const ctx = contextRef.current
        const busMaster = masterFilterRef.current
        if (!ctx || !busMaster || audioEngine.isMuted()) return
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(88, now)
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.17)
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(0.09, now + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
        osc.connect(gain)
        gain.connect(busMaster)
        osc.start(now)
        osc.stop(now + 0.3)
        useBusTriageStore.getState().pulseBump()
      }

      bumpTimerRef.current = window.setInterval(playBump, 22000)
      window.setTimeout(playBump, 13500)
    }

    void start()

    return () => {
      if (bumpTimerRef.current !== null) window.clearInterval(bumpTimerRef.current)
      sources.forEach((source) => {
        try { source.stop() } catch { /* already stopped */ }
      })
      oscillators.forEach((oscillator) => {
        try { oscillator.stop() } catch { /* already stopped */ }
      })
      void contextRef.current?.close().catch(() => undefined)
      contextRef.current = null
      masterRef.current = null
      masterFilterRef.current = null
      gossipGainRef.current = null
    }
  }, [])

  useFrame(() => {
    const context = contextRef.current
    const master = masterRef.current
    const filter = masterFilterRef.current
    if (!context || !master || !filter) return

    const state = useBusTriageStore.getState()
    master.gain.setTargetAtTime(audioEngine.isMuted() ? 0 : 0.42, context.currentTime, 0.04)
    filter.frequency.setTargetAtTime(state.triagePhase === 'alert' ? 600 : 12000, context.currentTime, 0.08)

    if (gossipGainRef.current) {
      const distance = state.gossipDistance
      const target = distance < 2.5 ? 0.008 : distance < 3.5 ? 0.022 : 0.006
      gossipGainRef.current.gain.setTargetAtTime(target, context.currentTime, 0.18)
    }
  })

  return null
}
