import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'

export function SecurityCenterAudio() {
  const masterRef = useRef<GainNode | null>(null)

  useEffect(() => {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    const master = context.createGain()
    master.gain.value = audioEngine.isMuted() ? 0 : 0.028
    master.connect(context.destination)
    masterRef.current = master

    const crt = context.createOscillator()
    const crtGain = context.createGain()
    crt.type = 'sine'
    crt.frequency.value = 117
    crtGain.gain.value = 0.05
    crt.connect(crtGain).connect(master)

    const server = context.createOscillator()
    const serverGain = context.createGain()
    server.type = 'triangle'
    server.frequency.value = 54
    serverGain.gain.value = 0.11
    server.connect(serverGain).connect(master)

    crt.start()
    server.start()

    const chairTimer = window.setInterval(() => {
      if (audioEngine.isMuted() || context.state === 'closed') return
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(190, context.currentTime)
      osc.frequency.exponentialRampToValueAtTime(96, context.currentTime + 0.55)
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.7)
      osc.connect(gain).connect(master)
      osc.start()
      osc.stop(context.currentTime + 0.72)
    }, 3300)

    const onObservation = () => {
      if (audioEngine.isMuted() || context.state === 'closed') return
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(238, context.currentTime)
      osc.frequency.exponentialRampToValueAtTime(94, context.currentTime + 0.42)
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.018)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5)
      osc.connect(gain).connect(master)
      osc.start()
      osc.stop(context.currentTime + 0.52)
    }

    const onOverrideAlarm = () => {
      if (context.state === 'closed') return
      const alarm = context.createOscillator()
      const alarmGain = context.createGain()
      alarm.type = 'square'
      alarm.frequency.value = 760
      alarmGain.gain.setValueAtTime(audioEngine.isMuted() ? 0 : 0.46, context.currentTime)
      alarmGain.gain.setValueAtTime(audioEngine.isMuted() ? 0 : 0.46, context.currentTime + 1.92)
      alarmGain.gain.setValueAtTime(0.0001, context.currentTime + 2)
      alarm.connect(alarmGain).connect(context.destination)
      alarm.start()
      alarm.stop(context.currentTime + 2.05)
    }

    window.addEventListener('security:observation', onObservation)
    window.addEventListener('security:override-alarm', onOverrideAlarm)

    return () => {
      window.clearInterval(chairTimer)
      window.removeEventListener('security:observation', onObservation)
      window.removeEventListener('security:override-alarm', onOverrideAlarm)
      crt.stop()
      server.stop()
      masterRef.current = null
      void context.close()
    }
  }, [])

  useFrame(() => {
    const master = masterRef.current
    if (!master) return
    master.gain.value = audioEngine.isMuted() ? 0 : 0.028
  })

  return null
}
