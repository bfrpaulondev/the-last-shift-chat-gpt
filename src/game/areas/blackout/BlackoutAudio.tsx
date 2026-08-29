import { useEffect } from 'react'
import { audioEngine } from '../../audio/AudioEngine'
import { useGameStore } from '../../state/gameStore'

function makeNoiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1
  return buffer
}

function scheduleClick(context: AudioContext, destination: AudioNode, when: number) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(70, when)
  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.exponentialRampToValueAtTime(0.045, when + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.024)
  oscillator.connect(gain)
  gain.connect(destination)
  oscillator.start(when)
  oscillator.stop(when + 0.03)
}

export function BlackoutAudio() {
  useEffect(() => {
    let context: AudioContext | null = null
    let master: GainNode | null = null
    let rain: AudioBufferSourceNode | null = null
    let strobeTimer: number | null = null
    let breathTimer: number | null = null
    let muteTimer: number | null = null
    let disposed = false

    const start = () => {
      if (disposed) return
      if (context) {
        if (context.state === 'suspended') void context.resume()
        return
      }

      context = new AudioContext()
      master = context.createGain()
      master.gain.value = audioEngine.isMuted() ? 0 : 0.7
      master.connect(context.destination)

      const left = context.createOscillator()
      const right = context.createOscillator()
      const leftPan = context.createStereoPanner()
      const rightPan = context.createStereoPanner()
      const tinnitusGain = context.createGain()
      left.type = 'sine'
      right.type = 'sine'
      left.frequency.value = 3997
      right.frequency.value = 4003
      leftPan.pan.value = -0.78
      rightPan.pan.value = 0.78
      tinnitusGain.gain.setValueAtTime(0.055, context.currentTime)
      tinnitusGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 6)
      left.connect(leftPan)
      right.connect(rightPan)
      leftPan.connect(tinnitusGain)
      rightPan.connect(tinnitusGain)
      tinnitusGain.connect(master)
      left.start()
      right.start()
      left.stop(context.currentTime + 6.1)
      right.stop(context.currentTime + 6.1)

      rain = context.createBufferSource()
      const rainFilter = context.createBiquadFilter()
      const rainGain = context.createGain()
      rain.buffer = makeNoiseBuffer(context, 2.1)
      rain.loop = true
      rainFilter.type = 'highpass'
      rainFilter.frequency.value = 1800
      rainGain.gain.value = 0.035
      rain.connect(rainFilter)
      rainFilter.connect(rainGain)
      rainGain.connect(master)
      rain.start()

      const strobeCycle = () => {
        if (!context || !master || context.state !== 'running') return
        const now = context.currentTime + 0.01
        scheduleClick(context, master, now)
        scheduleClick(context, master, now + 0.29)
        scheduleClick(context, master, now + 0.67)
      }
      strobeCycle()
      strobeTimer = window.setInterval(strobeCycle, 4650)

      breathTimer = window.setInterval(() => {
        if (!context || !master || context.state !== 'running' || audioEngine.isMuted()) return
        if (useGameStore.getState().bpm <= 110) return
        const source = context.createBufferSource()
        const filter = context.createBiquadFilter()
        const gain = context.createGain()
        source.buffer = makeNoiseBuffer(context, 0.34)
        filter.type = 'bandpass'
        filter.frequency.value = 820
        filter.Q.value = 0.55
        gain.gain.setValueAtTime(0.0001, context.currentTime)
        gain.gain.linearRampToValueAtTime(0.028, context.currentTime + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.34)
        source.connect(filter)
        filter.connect(gain)
        gain.connect(master)
        source.start()
      }, 1450)

      muteTimer = window.setInterval(() => {
        if (!context || !master) return
        master.gain.setTargetAtTime(audioEngine.isMuted() ? 0 : 0.7, context.currentTime, 0.03)
      }, 120)
    }

    window.addEventListener('pointerdown', start)
    window.addEventListener('keydown', start)

    return () => {
      disposed = true
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
      if (strobeTimer !== null) window.clearInterval(strobeTimer)
      if (breathTimer !== null) window.clearInterval(breathTimer)
      if (muteTimer !== null) window.clearInterval(muteTimer)
      try { rain?.stop() } catch { /* already stopped */ }
      if (context) void context.close()
    }
  }, [])

  return null
}
