import { useEffect, useRef } from 'react'
import { audioEngine } from '../../audio/AudioEngine'
import { useGameStore } from '../../state/gameStore'

function makeNoiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  let brown = 0
  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1
    brown = (brown + 0.02 * white) / 1.02
    data[index] = brown * 3.2
  }
  return buffer
}

export function BasementAudio() {
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)

  useEffect(() => {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    const master = context.createGain()
    master.gain.value = audioEngine.isMuted() ? 0 : 0.19
    master.connect(context.destination)
    contextRef.current = context
    masterRef.current = master

    const room = context.createBufferSource()
    const roomFilter = context.createBiquadFilter()
    const roomGain = context.createGain()
    room.buffer = makeNoiseBuffer(context, 3)
    room.loop = true
    roomFilter.type = 'lowpass'
    roomFilter.frequency.value = 150
    roomGain.gain.value = 0.19
    room.connect(roomFilter).connect(roomGain).connect(master)
    room.start()

    const ballast = context.createOscillator()
    const ballastGain = context.createGain()
    ballast.type = 'sine'
    ballast.frequency.value = 120
    ballastGain.gain.value = 0.018
    ballast.connect(ballastGain).connect(master)
    ballast.start()

    const harmonic = context.createOscillator()
    const harmonicGain = context.createGain()
    harmonic.type = 'sine'
    harmonic.frequency.value = 240
    harmonicGain.gain.value = 0.006
    harmonic.connect(harmonicGain).connect(master)
    harmonic.start()

    const ventilation = context.createOscillator()
    const ventGain = context.createGain()
    ventilation.type = 'sawtooth'
    ventilation.frequency.value = 45
    ventGain.gain.value = 0.0001
    ventilation.connect(ventGain).connect(master)
    ventilation.start()

    const playDrop = () => {
      if (context.state === 'closed' || audioEngine.isMuted()) return
      const now = context.currentTime
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = 2000 + Math.random() * 2000
      gain.gain.setValueAtTime(0.025, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
      oscillator.connect(gain).connect(master)
      oscillator.start(now)
      oscillator.stop(now + 0.09)
    }

    let dripTimer = 0
    const scheduleDrip = () => {
      dripTimer = window.setTimeout(() => {
        playDrop()
        scheduleDrip()
      }, 1000 + Math.random() * 2000)
    }
    scheduleDrip()

    const playTick = (frequency = 8000, volume = 0.015) => {
      if (context.state === 'closed' || audioEngine.isMuted()) return
      const now = context.currentTime
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'square'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(volume, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025)
      oscillator.connect(gain).connect(master)
      oscillator.start(now)
      oscillator.stop(now + 0.03)
    }

    const ledTimer = window.setInterval(() => {
      const state = useGameStore.getState()
      if (state.location.area !== 'basement' || state.flags.canary_killed) return
      playTick(); window.setTimeout(() => playTick(), 180); window.setTimeout(() => playTick(), 360); window.setTimeout(() => playTick(), 920)
    }, 2300)

    const makeBurst = (frequency: number, duration: number, volume: number, type: BiquadFilterType = 'bandpass') => {
      if (context.state === 'closed' || audioEngine.isMuted()) return
      const now = context.currentTime
      const source = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const gain = context.createGain()
      source.buffer = makeNoiseBuffer(context, Math.max(duration, 0.08))
      filter.type = type
      filter.frequency.value = frequency
      filter.Q.value = 0.8
      gain.gain.setValueAtTime(volume, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
      source.connect(filter).connect(gain).connect(master)
      source.start(now)
      source.stop(now + duration + 0.02)
    }

    const playCan = () => {
      const now = context.currentTime
      ;[1800, 2100, 2350, 2600].forEach((frequency, index) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.value = frequency
        gain.gain.setValueAtTime(0.055 / (index + 1), now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8)
        oscillator.connect(gain).connect(master)
        oscillator.start(now + index * 0.03)
        oscillator.stop(now + 2.9)
      })
    }

    const playYank = () => {
      const now = context.currentTime
      const snap = context.createOscillator()
      const gain = context.createGain()
      snap.type = 'square'
      snap.frequency.value = 200
      gain.gain.setValueAtTime(0.14, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02)
      snap.connect(gain).connect(master)
      snap.start(now)
      snap.stop(now + 0.03)
      makeBurst(1600, 0.06, 0.08)
      roomGain.gain.cancelScheduledValues(now)
      roomGain.gain.setValueAtTime(roomGain.gain.value, now)
      roomGain.gain.linearRampToValueAtTime(0.0001, now + 0.02)
      roomGain.gain.setValueAtTime(0.0001, now + 0.5)
      roomGain.gain.linearRampToValueAtTime(0.19, now + 0.7)
    }

    const playPurr = () => {
      const now = context.currentTime
      const source = context.createBufferSource()
      const gain = context.createGain()
      const lfo = context.createOscillator()
      const lfoGain = context.createGain()
      source.buffer = makeNoiseBuffer(context, 2.2)
      lfo.frequency.value = 25
      lfoGain.gain.value = 0.02
      gain.gain.value = 0.045
      lfo.connect(lfoGain).connect(gain.gain)
      source.connect(gain).connect(master)
      lfo.start(now)
      source.start(now)
      lfo.stop(now + 2.2)
      source.stop(now + 2.2)
    }

    const playWetSteps = () => {
      window.setTimeout(() => makeBurst(210, 0.18, 0.11, 'lowpass'), 500)
      window.setTimeout(() => makeBurst(230, 0.18, 0.09, 'lowpass'), 900)
    }

    const deathSilence = () => {
      const now = context.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(0.0001, now + 0.03)
      master.gain.setValueAtTime(0.0001, now + 3)
      master.gain.linearRampToValueAtTime(audioEngine.isMuted() ? 0.0001 : 0.19, now + 3.12)
    }

    const playShadowByte = () => {
      makeBurst(1350, 4.8, 0.14)
      if (Math.random() < 0.03) {
        window.setTimeout(() => makeBurst(1800, 0.3, 0.08, 'highpass'), 1200)
      }
    }

    const onKeyDown = () => {
      if (context.state === 'suspended') void context.resume()
      const now = context.currentTime
      ventGain.gain.cancelScheduledValues(now)
      ventGain.gain.linearRampToValueAtTime(0.0001, now + 0.12)
    }
    let ventStartTimer: number | null = null
    const onKeyUp = (event: KeyboardEvent) => {
      if (!['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) return
      if (ventStartTimer !== null) window.clearTimeout(ventStartTimer)
      ventStartTimer = window.setTimeout(() => {
        const now = context.currentTime
        ventGain.gain.cancelScheduledValues(now)
        ventGain.gain.linearRampToValueAtTime(0.045, now + 1.2)
        ventGain.gain.setValueAtTime(0.045, now + 20)
        ventGain.gain.linearRampToValueAtTime(0.0001, now + 21)
      }, 2000)
    }

    const onCircuitDrop = () => {
      const now = context.currentTime
      ballastGain.gain.cancelScheduledValues(now)
      ballastGain.gain.linearRampToValueAtTime(0.0001, now + 0.02)
      ballastGain.gain.setValueAtTime(0.0001, now + 1.4)
      ballastGain.gain.linearRampToValueAtTime(0.018, now + 1.55)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('basement:can-roll', playCan)
    window.addEventListener('basement:cardboard', () => makeBurst(900, 0.36, 0.08))
    window.addEventListener('basement:connector-yank', playYank)
    window.addEventListener('basement:cracked-phone', () => playTick(1200, 0.03))
    window.addEventListener('basement:cat-purr', playPurr)
    window.addEventListener('basement:wet-steps', playWetSteps)
    window.addEventListener('basement:circuit-drop', onCircuitDrop)
    window.addEventListener('basement:monitor-static', () => makeBurst(2600, 1.1, 0.08, 'highpass'))
    window.addEventListener('basement:diego-silence', deathSilence)
    window.addEventListener('basement:shadowbyte', playShadowByte)

    return () => {
      window.clearTimeout(dripTimer)
      window.clearInterval(ledTimer)
      if (ventStartTimer !== null) window.clearTimeout(ventStartTimer)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('basement:can-roll', playCan)
      window.removeEventListener('basement:connector-yank', playYank)
      window.removeEventListener('basement:cat-purr', playPurr)
      window.removeEventListener('basement:wet-steps', playWetSteps)
      window.removeEventListener('basement:circuit-drop', onCircuitDrop)
      window.removeEventListener('basement:diego-silence', deathSilence)
      window.removeEventListener('basement:shadowbyte', playShadowByte)
      try { room.stop() } catch { /* already stopped */ }
      try { ballast.stop() } catch { /* already stopped */ }
      try { harmonic.stop() } catch { /* already stopped */ }
      try { ventilation.stop() } catch { /* already stopped */ }
      void context.close()
      contextRef.current = null
      masterRef.current = null
    }
  }, [])

  return null
}
