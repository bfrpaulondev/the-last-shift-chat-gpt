import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'

export function LockerAudio() {
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)

  useEffect(() => {
    const context = new window.AudioContext()
    const master = context.createGain()
    const hum = context.createOscillator()
    const humGain = context.createGain()
    const ballast = context.createOscillator()
    const ballastGain = context.createGain()

    contextRef.current = context
    masterRef.current = master
    master.gain.value = audioEngine.isMuted() ? 0 : 0.28
    master.connect(context.destination)

    hum.type = 'sine'
    hum.frequency.value = 58
    humGain.gain.value = 0.014
    hum.connect(humGain)
    humGain.connect(master)

    ballast.type = 'triangle'
    ballast.frequency.value = 116
    ballastGain.gain.value = 0.004
    ballast.connect(ballastGain)
    ballastGain.connect(master)

    void context.resume().catch(() => undefined)
    hum.start()
    ballast.start()

    return () => {
      try { hum.stop() } catch { /* already stopped */ }
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
    master.gain.setTargetAtTime(audioEngine.isMuted() ? 0 : 0.28, context.currentTime, 0.05)
  })

  return null
}
