import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'

const REVERB_SECONDS = 2.8
const LATE_ECHO_SECONDS = 0.5

function createImpulse(context: AudioContext): AudioBuffer {
  const length = Math.floor(context.sampleRate * REVERB_SECONDS)
  const impulse = context.createBuffer(2, length, context.sampleRate)
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel)
    for (let index = 0; index < length; index += 1) {
      const t = index / length
      data[index] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.4) * 0.5
    }
  }
  return impulse
}

function createStepEcho(
  context: AudioContext,
  input: AudioNode,
  running: boolean,
) {
  const duration = running ? 0.11 : 0.085
  const length = Math.floor(context.sampleRate * duration)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) {
    const envelope = 1 - index / length
    data[index] = (Math.random() * 2 - 1) * envelope * (running ? 0.46 : 0.32)
  }
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = buffer
  filter.type = 'bandpass'
  filter.frequency.value = running ? 190 : 155
  filter.Q.value = 0.85
  gain.gain.value = running ? 0.14 : 0.1
  source.connect(filter)
  filter.connect(gain)
  gain.connect(input)
  source.start()
}

export function StairwellAudio() {
  const masterGain = useRef<GainNode | null>(null)

  useEffect(() => {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    const master = context.createGain()
    master.gain.value = audioEngine.isMuted() ? 0 : 0.055
    master.connect(context.destination)
    masterGain.current = master

    const convolver = context.createConvolver()
    convolver.buffer = createImpulse(context)
    const lateEcho = context.createDelay(1)
    lateEcho.delayTime.value = LATE_ECHO_SECONDS
    const echoGain = context.createGain()
    echoGain.gain.value = 0.58
    lateEcho.connect(convolver)
    convolver.connect(echoGain)
    echoGain.connect(master)

    const hum = context.createOscillator()
    const humGain = context.createGain()
    hum.type = 'sine'
    hum.frequency.value = 47
    humGain.gain.value = 0.12
    hum.connect(humGain).connect(master)

    const metal = context.createOscillator()
    const metalGain = context.createGain()
    metal.type = 'triangle'
    metal.frequency.value = 83
    metalGain.gain.value = 0.032
    metal.connect(metalGain).connect(master)

    hum.start()
    metal.start()

    const onFootstep = (event: Event) => {
      if (context.state === 'suspended') void context.resume()
      const detail = (event as CustomEvent<{ running?: boolean }>).detail
      createStepEcho(context, lateEcho, Boolean(detail?.running))
    }

    const resume = () => {
      if (context.state === 'suspended') void context.resume()
    }

    const creakTimer = window.setInterval(() => {
      if (audioEngine.isMuted() || context.state === 'closed') return
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(132, context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(58, context.currentTime + 0.72)
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.03, context.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.78)
      oscillator.connect(gain)
      gain.connect(lateEcho)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.8)
    }, 6500)

    window.addEventListener('game:footstep', onFootstep)
    window.addEventListener('pointerdown', resume)
    window.addEventListener('keydown', resume)

    return () => {
      window.clearInterval(creakTimer)
      window.removeEventListener('game:footstep', onFootstep)
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
      hum.stop()
      metal.stop()
      masterGain.current = null
      void context.close()
    }
  }, [])

  useFrame(() => {
    const master = masterGain.current
    if (!master) return
    master.gain.value = audioEngine.isMuted() ? 0 : 0.055
  })

  return null
}
