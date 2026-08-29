import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'
import { useGameStore } from '../../state/gameStore'

function makeNoiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1
  return buffer
}

function makeDistortionCurve(amount: number): Float32Array {
  const samples = 512
  const curve = new Float32Array(samples)
  for (let index = 0; index < samples; index += 1) {
    const x = (index * 2) / (samples - 1) - 1
    curve[index] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x))
  }
  return curve
}

export function AreaKAudio() {
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const rainGainRef = useRef<GainNode | null>(null)
  const stairHumGainRef = useRef<GainNode | null>(null)
  const keys = useRef(new Set<string>())
  const silenceUntil = useRef(0)
  const silenceRestoreUntil = useRef(0)

  useEffect(() => {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    const master = context.createGain()
    master.gain.value = audioEngine.isMuted() ? 0 : 0.18
    master.connect(context.destination)
    contextRef.current = context
    masterRef.current = master

    const stairHum = context.createOscillator()
    const stairHumGain = context.createGain()
    stairHum.type = 'sine'
    stairHum.frequency.value = 47
    stairHumGain.gain.value = 0.045
    stairHum.connect(stairHumGain).connect(master)
    stairHumGainRef.current = stairHumGain
    stairHum.start()

    const rain = context.createBufferSource()
    const rainFilter = context.createBiquadFilter()
    const rainGain = context.createGain()
    rain.buffer = makeNoiseBuffer(context, 2)
    rain.loop = true
    rainFilter.type = 'lowpass'
    rainFilter.frequency.value = 2800
    rainFilter.Q.value = 0.4
    rainGain.gain.value = 0.0001
    rain.connect(rainFilter).connect(rainGain).connect(master)
    rainGainRef.current = rainGain
    rain.start()

    const playBreath = () => {
      if (audioEngine.isMuted() || performance.now() < silenceRestoreUntil.current) return
      const game = useGameStore.getState()
      if (game.location.area !== 'descent-lobby' || game.flags.descent_complete || game.cinematic) return
      const moving = keys.current.has('KeyW') || keys.current.has('KeyA') || keys.current.has('KeyS') || keys.current.has('KeyD')
      const sprinting = moving && (keys.current.has('ShiftLeft') || keys.current.has('ShiftRight'))
      if (!sprinting || context.state === 'closed') return

      const now = context.currentTime
      const source = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const gain = context.createGain()
      source.buffer = makeNoiseBuffer(context, 0.46)
      filter.type = 'bandpass'
      filter.frequency.value = 680
      filter.Q.value = 0.65
      const intensity = 0.12 + ((game.bpm - 60) / 100) * 0.16
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(intensity, now + 0.07)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.44)
      source.connect(filter).connect(gain).connect(master)
      source.start(now)
    }

    const playRadioVoiceTexture = () => {
      if (audioEngine.isMuted() || context.state === 'closed') return
      const now = context.currentTime
      const source = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const distortion = context.createWaveShaper()
      const gain = context.createGain()
      source.buffer = makeNoiseBuffer(context, 4.8)
      filter.type = 'bandpass'
      filter.frequency.value = 1350
      filter.Q.value = 1.4
      distortion.curve = makeDistortionCurve(70)
      distortion.oversample = '2x'
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.11, now + 0.05)
      gain.gain.setValueAtTime(0.075, now + 4.25)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.75)
      source.connect(filter).connect(distortion).connect(gain).connect(master)
      source.start(now)

      const carrier = context.createOscillator()
      const carrierGain = context.createGain()
      carrier.type = 'square'
      carrier.frequency.value = 31
      carrierGain.gain.setValueAtTime(0.0001, now)
      carrierGain.gain.linearRampToValueAtTime(0.018, now + 0.05)
      carrierGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.7)
      carrier.connect(carrierGain).connect(master)
      carrier.start(now)
      carrier.stop(now + 4.8)
    }

    const playCableArrival = () => {
      if (audioEngine.isMuted() || context.state === 'closed') return
      const now = context.currentTime
      const cable = context.createOscillator()
      const gain = context.createGain()
      cable.type = 'triangle'
      cable.frequency.setValueAtTime(88, now)
      cable.frequency.exponentialRampToValueAtTime(42, now + 2)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.12, now + 0.18)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2)
      cable.connect(gain).connect(master)
      cable.start(now)
      cable.stop(now + 2.05)
    }

    const playRide = () => {
      if (audioEngine.isMuted() || context.state === 'closed') return
      const now = context.currentTime
      const motor = context.createOscillator()
      const gain = context.createGain()
      motor.type = 'sine'
      motor.frequency.setValueAtTime(34, now)
      motor.frequency.linearRampToValueAtTime(48, now + 1.2)
      motor.frequency.linearRampToValueAtTime(38, now + 4.6)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.09, now + 0.2)
      gain.gain.setValueAtTime(0.07, now + 4.4)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 5)
      motor.connect(gain).connect(master)
      motor.start(now)
      motor.stop(now + 5.05)
    }

    const playDing = () => {
      if (audioEngine.isMuted() || context.state === 'closed') return
      const now = context.currentTime
      const bell = context.createOscillator()
      const gain = context.createGain()
      bell.type = 'sine'
      bell.frequency.value = 880
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7)
      bell.connect(gain).connect(master)
      bell.start(now)
      bell.stop(now + 0.72)
    }

    const onDeathSilence = (event: Event) => {
      const detail = (event as CustomEvent<{ durationMs?: number }>).detail
      const durationMs = detail?.durationMs ?? 4000
      silenceUntil.current = performance.now() + durationMs
      silenceRestoreUntil.current = silenceUntil.current + 2000
      const now = context.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(0.0001, now + 0.03)
      master.gain.setValueAtTime(0.0001, now + durationMs / 1000)
      master.gain.linearRampToValueAtTime(audioEngine.isMuted() ? 0.0001 : 0.18, now + durationMs / 1000 + 2)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      keys.current.add(event.code)
      if (context.state === 'suspended') void context.resume()
    }
    const onKeyUp = (event: KeyboardEvent) => { keys.current.delete(event.code) }

    const breathTimer = window.setInterval(playBreath, 520)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('lobby:death-silence', onDeathSilence)
    window.addEventListener('lobby:shadowbyte-radio', playRadioVoiceTexture)
    window.addEventListener('lobby:elevator-cables', playCableArrival)
    window.addEventListener('lobby:elevator-ride', playRide)
    window.addEventListener('lobby:elevator-ding', playDing)

    return () => {
      window.clearInterval(breathTimer)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('lobby:death-silence', onDeathSilence)
      window.removeEventListener('lobby:shadowbyte-radio', playRadioVoiceTexture)
      window.removeEventListener('lobby:elevator-cables', playCableArrival)
      window.removeEventListener('lobby:elevator-ride', playRide)
      window.removeEventListener('lobby:elevator-ding', playDing)
      try { stairHum.stop() } catch { /* already stopped */ }
      try { rain.stop() } catch { /* already stopped */ }
      void context.close()
      contextRef.current = null
      masterRef.current = null
      rainGainRef.current = null
      stairHumGainRef.current = null
      keys.current.clear()
    }
  }, [])

  useFrame(() => {
    const context = contextRef.current
    const master = masterRef.current
    const rainGain = rainGainRef.current
    const stairHumGain = stairHumGainRef.current
    if (!context || !master || !rainGain || !stairHumGain) return

    const game = useGameStore.getState()
    const inLobby = Boolean(game.flags.descent_complete)
    rainGain.gain.setTargetAtTime(inLobby ? 0.28 : 0.018, context.currentTime, 0.35)
    stairHumGain.gain.setTargetAtTime(inLobby ? 0.012 : 0.045, context.currentTime, 0.25)

    if (performance.now() >= silenceRestoreUntil.current) {
      master.gain.setTargetAtTime(audioEngine.isMuted() ? 0 : 0.18, context.currentTime, 0.08)
    }
  })

  return null
}
