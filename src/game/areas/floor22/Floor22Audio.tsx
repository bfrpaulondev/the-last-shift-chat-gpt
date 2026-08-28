import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'

export function Floor22Audio() {
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)

  useEffect(() => {
    const context = new window.AudioContext()
    const master = context.createGain()
    const hvac = context.createOscillator()
    const hvacGain = context.createGain()
    const ballast = context.createOscillator()
    const ballastGain = context.createGain()
    const filter = context.createBiquadFilter()

    contextRef.current = context
    masterRef.current = master
    master.gain.value = audioEngine.isMuted() ? 0 : 0.26
    master.connect(context.destination)

    hvac.type = 'sine'
    hvac.frequency.value = 43
    hvacGain.gain.value = 0.015
    hvac.connect(hvacGain)
    hvacGain.connect(filter)

    ballast.type = 'triangle'
    ballast.frequency.value = 120
    ballastGain.gain.value = 0.0035
    ballast.connect(ballastGain)
    ballastGain.connect(filter)

    filter.type = 'lowpass'
    filter.frequency.value = 460
    filter.connect(master)

    void context.resume().catch(() => undefined)
    hvac.start()
    ballast.start()

    return () => {
      try { hvac.stop() } catch { /* already stopped */ }
      try { ballast.stop() } catch { /* already stopped */ }
      void context.close().catch(() => undefined)
      contextRef.current = null
      masterRef.current = null
    }
  }, [])

  useFrame(() => {
    const context = contextRef.current
    const master = masterRef.current
    if (!context || !master) return
    master.gain.setTargetAtTime(audioEngine.isMuted() ? 0 : 0.26, context.currentTime, 0.05)
  })

  return null
}
