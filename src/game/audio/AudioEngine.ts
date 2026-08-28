export class AudioEngine {
  private static singleton: AudioEngine | null = null

  private context: AudioContext | null = null
  private master: GainNode | null = null

  static getInstance(): AudioEngine {
    if (!AudioEngine.singleton) {
      AudioEngine.singleton = new AudioEngine()
    }

    return AudioEngine.singleton
  }

  async init(): Promise<void> {
    if (!this.context) {
      const AudioContextClass = window.AudioContext
      this.context = new AudioContextClass()
      this.master = this.context.createGain()
      this.master.gain.value = 0.7
      this.master.connect(this.context.destination)
    }

    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
  }

  playFootstep(running: boolean): void {
    const context = this.context
    const master = this.master

    if (!context || !master || context.state !== 'running') {
      return
    }

    const duration = 0.06
    const frameCount = Math.max(1, Math.floor(context.sampleRate * duration))
    const buffer = context.createBuffer(1, frameCount, context.sampleRate)
    const channel = buffer.getChannelData(0)

    for (let index = 0; index < frameCount; index += 1) {
      channel[index] = Math.random() * 2 - 1
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const now = context.currentTime
    const variation = 0.85 + Math.random() * 0.3
    const peak = (running ? 0.16 : 0.11) * variation

    source.buffer = buffer
    source.playbackRate.value = variation

    filter.type = 'lowpass'
    filter.frequency.value = 400 * variation

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)

    source.start(now)
    source.stop(now + duration)
  }
}

export const audioEngine = AudioEngine.getInstance()
