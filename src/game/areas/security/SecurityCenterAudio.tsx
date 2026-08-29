import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'

interface ActiveSiren {
  oscillators: OscillatorNode[]
  envelope: GainNode
}

function makeNoiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1
  return buffer
}

export function SecurityCenterAudio() {
  const masterRef = useRef<GainNode | null>(null)
  const alarmBusRef = useRef<GainNode | null>(null)

  useEffect(() => {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    const master = context.createGain()
    const alarmBus = context.createGain()
    master.gain.value = audioEngine.isMuted() ? 0 : 0.035
    alarmBus.gain.value = audioEngine.isMuted() ? 0 : 0.34
    master.connect(context.destination)
    alarmBus.connect(context.destination)
    masterRef.current = master
    alarmBusRef.current = alarmBus

    const crt = context.createOscillator()
    const crtGain = context.createGain()
    crt.type = 'sine'
    crt.frequency.value = 117
    crtGain.gain.value = 0.045
    crt.connect(crtGain).connect(master)

    const server = context.createOscillator()
    const serverGain = context.createGain()
    server.type = 'triangle'
    server.frequency.value = 54
    serverGain.gain.value = 0.1
    server.connect(serverGain).connect(master)

    crt.start()
    server.start()

    let siren: ActiveSiren | null = null

    const resume = () => {
      if (context.state === 'suspended') void context.resume()
    }

    const stopSiren = () => {
      if (!siren) return
      const now = context.currentTime
      siren.envelope.gain.cancelScheduledValues(now)
      siren.envelope.gain.setValueAtTime(Math.max(0.0001, siren.envelope.gain.value), now)
      siren.envelope.gain.setValueAtTime(0.0001, now + 0.012)
      siren.oscillators.forEach((oscillator) => {
        try { oscillator.stop(now + 0.015) } catch { /* already stopped */ }
      })
      siren = null
    }

    const startSiren = () => {
      resume()
      stopSiren()
      const now = context.currentTime
      const envelope = context.createGain()
      envelope.gain.setValueAtTime(1, now)
      envelope.gain.setValueAtTime(1, now + 1.799)
      envelope.gain.setValueAtTime(0.0001, now + 1.8)
      envelope.connect(alarmBus)

      const oscillators = [-4, 4].map((detune) => {
        const oscillator = context.createOscillator()
        oscillator.type = 'sawtooth'
        oscillator.frequency.setValueAtTime(650 + detune, now)
        oscillator.frequency.linearRampToValueAtTime(850 + detune, now + 1.8)
        oscillator.connect(envelope)
        oscillator.start(now)
        oscillator.stop(now + 1.805)
        return oscillator
      })
      siren = { oscillators, envelope }
      window.setTimeout(() => { siren = null }, 1850)
    }

    const playObservationSting = () => {
      resume()
      const now = context.currentTime
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(238, now)
      oscillator.frequency.exponentialRampToValueAtTime(94, now + 0.42)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.018)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
      oscillator.connect(gain).connect(master)
      oscillator.start(now)
      oscillator.stop(now + 0.52)
    }

    const playRadioStatic = () => {
      resume()
      const source = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const gain = context.createGain()
      source.buffer = makeNoiseBuffer(context, 0.85)
      filter.type = 'bandpass'
      filter.frequency.value = 1450
      filter.Q.value = 0.7
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.linearRampToValueAtTime(0.18, context.currentTime + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.85)
      source.connect(filter).connect(gain).connect(master)
      source.start()
    }

    const chairTimer = window.setInterval(() => {
      if (audioEngine.isMuted() || context.state === 'closed') return
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(190, context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(96, context.currentTime + 0.55)
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.03, context.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.7)
      oscillator.connect(gain).connect(master)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.72)
    }, 3200)

    window.addEventListener('pointerdown', resume)
    window.addEventListener('keydown', resume)
    window.addEventListener('security:observation-sting', playObservationSting)
    window.addEventListener('security:radio-static', playRadioStatic)
    window.addEventListener('security:override-start', startSiren)
    window.addEventListener('security:override-cancel', stopSiren)

    return () => {
      window.clearInterval(chairTimer)
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
      window.removeEventListener('security:observation-sting', playObservationSting)
      window.removeEventListener('security:radio-static', playRadioStatic)
      window.removeEventListener('security:override-start', startSiren)
      window.removeEventListener('security:override-cancel', stopSiren)
      stopSiren()
      crt.stop()
      server.stop()
      masterRef.current = null
      alarmBusRef.current = null
      void context.close()
    }
  }, [])

  useFrame(() => {
    const muted = audioEngine.isMuted()
    if (masterRef.current) masterRef.current.gain.value = muted ? 0 : 0.035
    if (alarmBusRef.current) alarmBusRef.current.gain.value = muted ? 0 : 0.34
  })

  return null
}
