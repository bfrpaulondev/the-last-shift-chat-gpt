import { useEffect } from 'react'
import { audioEngine } from '../../audio/AudioEngine'

export function Floor30Audio() {
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
    hum.frequency.value = 58
    humGain.gain.value = 0.28
    hum.connect(humGain).connect(master)

    const ballast = context.createOscillator()
    const ballastGain = context.createGain()
    ballast.type = 'triangle'
    ballast.frequency.value = 119
    ballastGain.gain.value = 0.08
    ballast.connect(ballastGain).connect(master)

    hum.start()
    ballast.start()

    return () => {
      hum.stop()
      ballast.stop()
      void context.close()
    }
  }, [])

  return null
}
