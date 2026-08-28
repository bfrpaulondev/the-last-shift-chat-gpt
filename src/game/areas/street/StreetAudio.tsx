import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'
import { useGameStore } from '../../state/gameStore'

function noiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const frameCount = Math.max(1, Math.floor(context.sampleRate * seconds))
  const buffer = context.createBuffer(1, frameCount, context.sampleRate)
  const data = buffer.getChannelData(0)
  let brown = 0
  for (let index = 0; index < frameCount; index += 1) {
    const white = Math.random() * 2 - 1
    brown = (brown + 0.02 * white) / 1.02
    data[index] = brown * 3.2
  }
  return buffer
}

export function StreetAudio() {
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const lastBusArrived = useRef(false)

  useEffect(() => {
    let rainSource: AudioBufferSourceNode | null = null
    let roadSource: AudioBufferSourceNode | null = null
    let birdTimer: number | null = null

    const start = async () => {
      const context = new window.AudioContext()
      contextRef.current = context
      if (context.state === 'suspended') {
        await context.resume().catch(() => undefined)
      }

      const master = context.createGain()
      master.gain.value = audioEngine.isMuted() ? 0 : 0.44
      master.connect(context.destination)
      masterRef.current = master

      rainSource = context.createBufferSource()
      const rainFilter = context.createBiquadFilter()
      const rainGain = context.createGain()
      rainSource.buffer = noiseBuffer(context, 3)
      rainSource.loop = true
      rainFilter.type = 'highpass'
      rainFilter.frequency.value = 1200
      rainGain.gain.value = 0.13
      rainSource.connect(rainFilter)
      rainFilter.connect(rainGain)
      rainGain.connect(master)
      rainSource.start()

      roadSource = context.createBufferSource()
      const roadFilter = context.createBiquadFilter()
      const roadGain = context.createGain()
      roadSource.buffer = noiseBuffer(context, 4)
      roadSource.loop = true
      roadFilter.type = 'lowpass'
      roadFilter.frequency.value = 180
      roadGain.gain.value = 0.055
      roadSource.connect(roadFilter)
      roadFilter.connect(roadGain)
      roadGain.connect(master)
      roadSource.start()

      const playBird = () => {
        if (!contextRef.current || !masterRef.current) return
        const osc = contextRef.current.createOscillator()
        const gain = contextRef.current.createGain()
        const now = contextRef.current.currentTime
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1320, now)
        osc.frequency.exponentialRampToValueAtTime(1740, now + 0.09)
        osc.frequency.exponentialRampToValueAtTime(1140, now + 0.28)
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(0.022, now + 0.025)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
        osc.connect(gain)
        gain.connect(masterRef.current)
        osc.start(now)
        osc.stop(now + 0.31)
      }

      birdTimer = window.setInterval(playBird, 11700)
      window.setTimeout(playBird, 4200)
    }

    void start()

    return () => {
      if (birdTimer !== null) window.clearInterval(birdTimer)
      try { rainSource?.stop() } catch { /* already stopped */ }
      try { roadSource?.stop() } catch { /* already stopped */ }
      void contextRef.current?.close().catch(() => undefined)
      contextRef.current = null
      masterRef.current = null
    }
  }, [])

  useFrame(() => {
    audioEngine.updateSpatialAudio(1000, 1000, true)
    const master = masterRef.current
    const context = contextRef.current
    if (master && context) {
      master.gain.setTargetAtTime(audioEngine.isMuted() ? 0 : 0.44, context.currentTime, 0.04)
    }

    const arrived = Boolean(useGameStore.getState().flags.bus_arrived)
    if (arrived && !lastBusArrived.current && context && master) {
      const now = context.currentTime
      const compressor = context.createDynamicsCompressor()
      const gain = context.createGain()
      const source = context.createBufferSource()
      const filter = context.createBiquadFilter()
      source.buffer = noiseBuffer(context, 1.5)
      filter.type = 'lowpass'
      filter.frequency.value = 520
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.11, now + 0.06)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.35)
      source.connect(filter)
      filter.connect(compressor)
      compressor.connect(gain)
      gain.connect(master)
      source.start(now)
      source.stop(now + 1.5)

      const hiss = context.createBufferSource()
      const hissFilter = context.createBiquadFilter()
      const hissGain = context.createGain()
      hiss.buffer = noiseBuffer(context, 0.85)
      hissFilter.type = 'highpass'
      hissFilter.frequency.value = 1800
      hissGain.gain.setValueAtTime(0.0001, now + 0.35)
      hissGain.gain.exponentialRampToValueAtTime(0.07, now + 0.41)
      hissGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.12)
      hiss.connect(hissFilter)
      hissFilter.connect(hissGain)
      hissGain.connect(master)
      hiss.start(now + 0.35)
      hiss.stop(now + 1.15)
    }
    lastBusArrived.current = arrived
  })

  return null
}
