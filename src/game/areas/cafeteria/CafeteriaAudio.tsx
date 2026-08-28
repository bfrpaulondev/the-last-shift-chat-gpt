import { useEffect } from 'react'
import { audioEngine } from '../../audio/AudioEngine'

export function CafeteriaAudio() {
  useEffect(() => {
    if (audioEngine.isMuted()) return

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    const master = context.createGain()
    master.gain.value = 0.035
    master.connect(context.destination)

    const hum = context.createOscillator()
    const humGain = context.createGain()
    hum.type = 'sine'
    hum.frequency.value = 54
    humGain.gain.value = 0.22
    hum.connect(humGain).connect(master)

    const fridge = context.createOscillator()
    const fridgeGain = context.createGain()
    fridge.type = 'triangle'
    fridge.frequency.value = 92
    fridgeGain.gain.value = 0.07
    fridge.connect(fridgeGain).connect(master)

    hum.start()
    fridge.start()

    return () => {
      hum.stop()
      fridge.stop()
      void context.close()
    }
  }, [])

  return null
}
