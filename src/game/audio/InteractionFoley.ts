import { audioEngine } from './AudioEngine'

type Waveform = OscillatorType

class InteractionFoley {
  private context: AudioContext | null = null

  prepare(): void {
    void this.getContext()
  }

  private getContext(): AudioContext | null {
    if (audioEngine.isMuted()) {
      return null
    }
    if (!this.context) {
      this.context = new window.AudioContext()
    }
    if (this.context.state === 'suspended') {
      void this.context.resume().catch(() => undefined)
    }
    return this.context
  }

  private tone(
    frequency: number,
    waveform: Waveform,
    duration: number,
    volume: number,
    delay = 0,
    endFrequency?: number,
  ): void {
    const context = this.getContext()
    if (!context) {
      return
    }
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = context.currentTime + delay
    oscillator.type = waveform
    oscillator.frequency.setValueAtTime(frequency, start)
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration)
    }
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + duration)
  }

  private noise(
    duration: number,
    volume: number,
    highpass: number,
    delay = 0,
  ): void {
    const context = this.getContext()
    if (!context) {
      return
    }
    const frames = Math.max(1, Math.floor(context.sampleRate * duration))
    const buffer = context.createBuffer(1, frames, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let index = 0; index < frames; index += 1) {
      data[index] = Math.random() * 2 - 1
    }
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const start = context.currentTime + delay
    source.buffer = buffer
    filter.type = 'highpass'
    filter.frequency.value = highpass
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)
    source.start(start)
    source.stop(start + duration)
  }

  playDoorHandle(): void {
    this.tone(245, 'triangle', 0.075, 0.045, 0, 165)
    this.tone(132, 'sine', 0.095, 0.034, 0.055, 104)
    this.noise(0.06, 0.024, 1600, 0.02)
  }

  playFaucetTurn(): void {
    this.noise(0.16, 0.028, 900)
    this.tone(315, 'sine', 0.13, 0.022, 0.02, 225)
    this.tone(540, 'triangle', 0.045, 0.018, 0.12)
  }

  playCoffeeButton(): void {
    this.tone(520, 'square', 0.026, 0.028)
    this.tone(180, 'triangle', 0.055, 0.025, 0.028, 120)
  }

  playPhonePickup(): void {
    this.noise(0.075, 0.018, 1300)
    this.tone(430, 'sine', 0.055, 0.016, 0.015, 330)
  }

  playBadgeHandling(): void {
    this.noise(0.11, 0.022, 1700)
    this.tone(680, 'triangle', 0.04, 0.012, 0.03, 490)
  }
}

export const interactionFoley = new InteractionFoley()
