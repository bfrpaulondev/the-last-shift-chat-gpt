import { useEffect } from 'react'
import { audioEngine } from '../../audio/AudioEngine'
import { useGameStore } from '../../state/gameStore'

export function Floor37Audio() {
  const blackoutTriggered = useGameStore((state) => Boolean(state.flags.floor37_blackout_triggered))

  useEffect(() => {
    if (audioEngine.isMuted()) return

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    const master = context.createGain()
    master.gain.value = blackoutTriggered ? 0.012 : 0.032
    master.connect(context.destination)

    const hum = context.createOscillator()
    const humGain = context.createGain()
    hum.type = 'sine'
    hum.frequency.value = blackoutTriggered ? 41 : 54
    humGain.gain.value = blackoutTriggered ? 0.16 : 0.3
    hum.connect(humGain).connect(master)

    const ballast = context.createOscillator()
    const ballastGain = context.createGain()
    ballast.type = 'triangle'
    ballast.frequency.value = blackoutTriggered ? 82 : 108
    ballastGain.gain.value = blackoutTriggered ? 0.03 : 0.08
    ballast.connect(ballastGain).connect(master)

    hum.start()
    ballast.start()

    return () => {
      hum.stop()
      ballast.stop()
      void context.close()
    }
  }, [blackoutTriggered])

  return null
}
