import { audioEngine } from './AudioEngine'

class SuspenseCue {
  private context: AudioContext | null = null
  private stopTimer: number | null = null

  play(): void {
    if (audioEngine.isMuted()) {
      return
    }

    this.stop()

    const context = new window.AudioContext()
    const master = context.createGain()
    const lowpass = context.createBiquadFilter()
    const now = context.currentTime
    const duration = 6.8

    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.13, now + 0.18)
    master.gain.setValueAtTime(0.13, now + 2.2)
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    lowpass.type = 'lowpass'
    lowpass.frequency.setValueAtTime(1500, now)
    lowpass.frequency.exponentialRampToValueAtTime(420, now + duration)

    lowpass.connect(master)
    master.connect(context.destination)

    const drones = [73.42, 110, 116.54]
    drones.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = index === 0 ? 'sine' : 'triangle'
      oscillator.frequency.value = frequency
      gain.gain.value = index === 0 ? 0.42 : 0.17
      oscillator.connect(gain)
      gain.connect(lowpass)
      oscillator.start(now)
      oscillator.stop(now + duration + 0.15)
    })

    const motif = [
      { frequency: 220, at: 0.25 },
      { frequency: 233.08, at: 0.92 },
      { frequency: 174.61, at: 1.55 },
      { frequency: 164.81, at: 2.2 },
      { frequency: 146.83, at: 3.0 },
      { frequency: 138.59, at: 3.75 },
    ]

    motif.forEach(({ frequency, at }) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const start = now + at
      oscillator.type = 'triangle'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.055, start + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.72)
      oscillator.connect(gain)
      gain.connect(lowpass)
      oscillator.start(start)
      oscillator.stop(start + 0.75)
    })

    this.context = context
    this.stopTimer = window.setTimeout(() => {
      void context.close().catch(() => undefined)
      if (this.context === context) {
        this.context = null
      }
      this.stopTimer = null
    }, (duration + 0.4) * 1000)
  }

  stop(): void {
    if (this.stopTimer !== null) {
      window.clearTimeout(this.stopTimer)
      this.stopTimer = null
    }

    const context = this.context
    this.context = null
    if (context) {
      void context.close().catch(() => undefined)
    }
  }
}

export const suspenseCue = new SuspenseCue()
