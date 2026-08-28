import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'

export function StairwellAudio() {
  const masterGain = useRef<GainNode | null>(null)

  useEffect(() => {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    const master = context.createGain()
    master.gain.value = audioEngine.isMuted() ? 0 : 0.035
    master.connect(context.destination)
    masterGain.current = master

    const hum = context.createOscillator()
    const humGain = context.createGain()
    hum.type = 'sine'
    hum.frequency.value = 47
    humGain.gain.value = 0.22
    hum.connect(humGain).connect(master)

    const metal = context.createOscillator()
    const metalGain = context.createGain()
    metal.type = 'triangle'
    metal.frequency.value = 83
    metalGain.gain.value = 0.055
    metal.connect(metalGain).connect(master)

    hum.start()
    metal.start()

    const creakTimer = window.setInterval(() => {
      if (audioEngine.isMuted() || context.state === 'closed') return
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(128, context.currentTime)
      osc.frequency.exponentialRampToValueAtTime(62, context.currentTime + 0.65)
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.7)
      osc.connect(gain).connect(master)
      osc.start()
      osc.stop(context.currentTime + 0.72)
    }, 6200)

    return () => {
      window.clearInterval(creakTimer)
      hum.stop()
      metal.stop()
      masterGain.current = null
      void context.close()
    }
  }, [])

  useFrame(() => {
    const master = masterGain.current
    if (!master) return
    master.gain.value = audioEngine.isMuted() ? 0 : 0.035
  })

  return null
}
