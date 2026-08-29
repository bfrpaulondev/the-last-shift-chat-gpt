import { useEffect } from 'react'
import { audioEngine } from '../../audio/AudioEngine'

function makeNoiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1
  return buffer
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const samples = 512
  const buffer = new ArrayBuffer(samples * Float32Array.BYTES_PER_ELEMENT)
  const curve = new Float32Array(buffer)
  for (let index = 0; index < samples; index += 1) {
    const x = (index * 2) / (samples - 1) - 1
    curve[index] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x))
  }
  return curve
}

export function Part4TerminalAudio() {
  useEffect(() => {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    const master = context.createGain()
    master.gain.value = audioEngine.isMuted() ? 0 : 0.16
    master.connect(context.destination)

    const resume = () => {
      if (context.state === 'suspended') void context.resume()
    }

    const playShadowByte = () => {
      resume()
      if (audioEngine.isMuted() || context.state === 'closed') return

      const now = context.currentTime
      const source = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const distortion = context.createWaveShaper()
      const gain = context.createGain()
      source.buffer = makeNoiseBuffer(context, 5.4)
      filter.type = 'bandpass'
      filter.frequency.value = 1450
      filter.Q.value = 1.3
      distortion.curve = makeDistortionCurve(68)
      distortion.oversample = '2x'
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04)
      gain.gain.setValueAtTime(0.085, now + 4.9)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.35)
      source.connect(filter).connect(distortion).connect(gain).connect(master)
      source.start(now)

      for (const offset of [0.86, 2.14, 3.68]) {
        gain.gain.setValueAtTime(0.085, now + offset)
        gain.gain.setValueAtTime(0.0001, now + offset + 0.04)
        gain.gain.setValueAtTime(0.085, now + offset + 0.08)
      }

      if (Math.random() < 0.03) {
        const realTone = context.createBufferSource()
        const realFilter = context.createBiquadFilter()
        const realGain = context.createGain()
        realTone.buffer = makeNoiseBuffer(context, 0.3)
        realFilter.type = 'bandpass'
        realFilter.frequency.value = 1650
        realFilter.Q.value = 0.7
        realGain.gain.value = 0.045
        realTone.connect(realFilter).connect(realGain).connect(master)
        realTone.start(now + 1.35)
        realTone.stop(now + 1.65)
      }
    }

    window.addEventListener('pointerdown', resume)
    window.addEventListener('keydown', resume)
    window.addEventListener('basement:shadowbyte', playShadowByte)

    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
      window.removeEventListener('basement:shadowbyte', playShadowByte)
      void context.close()
    }
  }, [])

  return null
}
