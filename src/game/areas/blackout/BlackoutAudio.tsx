import { useEffect } from 'react'
import { audioEngine } from '../../audio/AudioEngine'
import { useGameStore } from '../../state/gameStore'

export function BlackoutAudio() {
  const emergencyLightOn = useGameStore((state) => Boolean(state.flags.blackout_emergency_light_on))

  useEffect(() => {
    if (audioEngine.isMuted()) return

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    const master = context.createGain()
    master.gain.value = emergencyLightOn ? 0.025 : 0.018
    master.connect(context.destination)

    const electrical = context.createOscillator()
    const electricalGain = context.createGain()
    electrical.type = 'sine'
    electrical.frequency.value = emergencyLightOn ? 61 : 47
    electricalGain.gain.value = emergencyLightOn ? 0.18 : 0.08
    electrical.connect(electricalGain).connect(master)

    const metal = context.createOscillator()
    const metalGain = context.createGain()
    metal.type = 'triangle'
    metal.frequency.value = 31
    metalGain.gain.value = 0.045
    metal.connect(metalGain).connect(master)

    electrical.start()
    metal.start()

    const groanTimer = window.setInterval(() => {
      if (context.state === 'closed') return
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(74, context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(42, context.currentTime + 0.75)
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.025, context.currentTime + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.9)
      oscillator.connect(gain).connect(master)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.95)
    }, 6200)

    return () => {
      window.clearInterval(groanTimer)
      electrical.stop()
      metal.stop()
      void context.close()
    }
  }, [emergencyLightOn])

  return null
}
