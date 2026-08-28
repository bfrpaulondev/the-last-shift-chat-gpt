import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'

export function LobbyAudio() {
  const contextRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    const context = new window.AudioContext()
    const master = context.createGain()
    const hum = context.createOscillator()
    const humGain = context.createGain()
    const overtone = context.createOscillator()
    const overtoneGain = context.createGain()

    contextRef.current = context
    gainRef.current = master
    master.gain.value = audioEngine.isMuted() ? 0 : 0.3
    master.connect(context.destination)

    hum.type = 'sine'
    hum.frequency.value = 50
    humGain.gain.value = 0.018
    hum.connect(humGain)
    humGain.connect(master)

    overtone.type = 'sine'
    overtone.frequency.value = 100
    overtoneGain.gain.value = 0.007
    overtone.connect(overtoneGain)
    overtoneGain.connect(master)

    void context.resume().catch(() => undefined)
    hum.start()
    overtone.start()

    return () => {
      try { hum.stop() } catch { /* already stopped */ }
      try { overtone.stop() } catch { /* already stopped */ }
      void context.close().catch(() => undefined)
      contextRef.current = null
      gainRef.current = null
    }
  }, [])

  useFrame(() => {
    audioEngine.updateSpatialAudio(1000, 1000, true)
    const context = contextRef.current
    const gain = gainRef.current
    if (context && gain) {
      gain.gain.setTargetAtTime(audioEngine.isMuted() ? 0 : 0.3, context.currentTime, 0.04)
    }
  })

  return null
}
