type NoiseKind = 'white' | 'brown'

export class AudioEngine {
  private static singleton: AudioEngine | null = null

  private context: AudioContext | null = null
  private master: GainNode | null = null
  private ambientGain: GainNode | null = null
  private rainGain: GainNode | null = null
  private faucetGain: GainNode | null = null
  private titleGain: GainNode | null = null
  private ambientSource: AudioBufferSourceNode | null = null
  private rainSource: AudioBufferSourceNode | null = null
  private titleSource: AudioBufferSourceNode | null = null
  private faucetTimer: number | null = null
  private trainTimer: number | null = null
  private muted = false
  private ambienceStarted = false

  static getInstance(): AudioEngine {
    if (!AudioEngine.singleton) {
      AudioEngine.singleton = new AudioEngine()
    }

    return AudioEngine.singleton
  }

  async init(): Promise<void> {
    if (!this.context) {
      this.context = new window.AudioContext()
      this.master = this.context.createGain()
      this.master.gain.value = this.muted ? 0 : 0.7
      this.master.connect(this.context.destination)
    }

    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted
    this.setMuted(this.muted)
    return this.muted
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    const context = this.context
    const master = this.master

    if (!context || !master) {
      return
    }

    master.gain.cancelScheduledValues(context.currentTime)
    master.gain.setTargetAtTime(muted ? 0 : 0.7, context.currentTime, 0.025)
  }

  isMuted(): boolean {
    return this.muted
  }

  startTitleNoise(): void {
    const context = this.context
    const master = this.master

    if (!context || !master || this.titleSource) {
      return
    }

    const source = context.createBufferSource()
    const gain = context.createGain()
    const filter = context.createBiquadFilter()

    source.buffer = this.createNoiseBuffer(2, 'brown')
    source.loop = true
    filter.type = 'lowpass'
    filter.frequency.value = 700
    gain.gain.value = 0.018

    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start()

    this.titleSource = source
    this.titleGain = gain
  }

  stopTitleNoise(): void {
    const context = this.context
    const source = this.titleSource
    const gain = this.titleGain

    if (!context || !source || !gain) {
      return
    }

    gain.gain.setTargetAtTime(0.0001, context.currentTime, 0.08)
    window.setTimeout(() => {
      try {
        source.stop()
      } catch {
        return
      }
    }, 350)

    this.titleSource = null
    this.titleGain = null
  }

  startAmbience(): void {
    const context = this.context
    const master = this.master

    if (!context || !master || this.ambienceStarted) {
      return
    }

    this.ambienceStarted = true

    const ambientSource = context.createBufferSource()
    const ambientGain = context.createGain()
    const ambientFilter = context.createBiquadFilter()
    ambientSource.buffer = this.createNoiseBuffer(3, 'brown')
    ambientSource.loop = true
    ambientFilter.type = 'lowpass'
    ambientFilter.frequency.value = 260
    ambientGain.gain.value = 0.035
    ambientSource.connect(ambientFilter)
    ambientFilter.connect(ambientGain)
    ambientGain.connect(master)
    ambientSource.start()

    const rainSource = context.createBufferSource()
    const rainGain = context.createGain()
    const rainFilter = context.createBiquadFilter()
    rainSource.buffer = this.createNoiseBuffer(2, 'white')
    rainSource.loop = true
    rainFilter.type = 'highpass'
    rainFilter.frequency.value = 900
    rainGain.gain.value = 0
    rainSource.connect(rainFilter)
    rainFilter.connect(rainGain)
    rainGain.connect(master)
    rainSource.start()

    const faucetGain = context.createGain()
    faucetGain.gain.value = 0
    faucetGain.connect(master)

    this.ambientSource = ambientSource
    this.ambientGain = ambientGain
    this.rainSource = rainSource
    this.rainGain = rainGain
    this.faucetGain = faucetGain

    this.faucetTimer = window.setInterval(() => {
      this.playFaucetPing()
    }, 1600)
    this.playFaucetPing()
    this.scheduleTrain()
  }

  updateSpatialAudio(playerX: number, playerZ: number, faucetFixed: boolean): void {
    const context = this.context
    const rainGain = this.rainGain
    const faucetGain = this.faucetGain

    if (!context || !rainGain || !faucetGain) {
      return
    }

    const faucetDistance = Math.hypot(playerX - 1.98, playerZ + 2.68)
    const windowDistance = Math.hypot(playerX + 1.3, playerZ + 2.95)
    const faucetVolume = faucetFixed ? 0 : 0.15 / (1 + faucetDistance * 0.62)
    const rainVolume = Math.max(0, 0.05 * (1 - windowDistance / 4.5))

    faucetGain.gain.setTargetAtTime(faucetVolume, context.currentTime, 0.12)
    rainGain.gain.setTargetAtTime(rainVolume, context.currentTime, 0.15)
  }

  playFootstep(running: boolean): void {
    const context = this.context
    const master = this.master

    if (!context || !master || context.state !== 'running') {
      return
    }

    const duration = 0.06
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const now = context.currentTime
    const variation = 0.85 + Math.random() * 0.3
    const peak = (running ? 0.16 : 0.11) * variation

    source.buffer = this.createNoiseBuffer(duration, 'white')
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

  playCoffee(): void {
    const context = this.context
    const master = this.master

    if (!context || !master) {
      return
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const now = context.currentTime

    source.buffer = this.createNoiseBuffer(3, 'brown')
    filter.type = 'bandpass'
    filter.frequency.value = 300
    filter.Q.value = 0.7
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.12)
    gain.gain.setValueAtTime(0.09, now + 2.7)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start(now)
    source.stop(now + 3)

    const pingCount = 8 + Math.floor(Math.random() * 3)
    for (let index = 0; index < pingCount; index += 1) {
      const offset = 0.2 + Math.random() * 2.6
      this.playTone(520 + Math.random() * 300, 'sine', 0.03, 0.045, offset)
    }
  }

  playShower(): void {
    const context = this.context
    const master = this.master

    if (!context || !master) {
      return
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const now = context.currentTime

    source.buffer = this.createNoiseBuffer(4, 'white')
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1800, now)
    filter.frequency.linearRampToValueAtTime(4300, now + 0.5)
    filter.frequency.linearRampToValueAtTime(2400, now + 4)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.12)
    gain.gain.setValueAtTime(0.16, now + 3.6)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start(now)
    source.stop(now + 4)
  }

  playDoorUnlock(): void {
    this.playTone(800, 'square', 0.03, 0.1, 0)
    this.playTone(800, 'square', 0.03, 0.1, 0.12)
  }

  playAlarm(): void {
    const context = this.context
    const master = this.master

    if (!context || !master) {
      return
    }

    const now = context.currentTime
    for (let index = 0; index < 6; index += 1) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const start = now + index * 0.25
      oscillator.type = 'sawtooth'
      oscillator.frequency.value = index % 2 === 0 ? 880 : 660
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.13, start + 0.015)
      gain.gain.setValueAtTime(0.13, start + 0.2)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.245)
      oscillator.connect(gain)
      gain.connect(master)
      oscillator.start(start)
      oscillator.stop(start + 0.25)
    }
  }

  playDialogueBlip(): void {
    this.playTone(1200, 'square', 0.025, 0.03, 0)
  }

  playPaper(): void {
    const context = this.context
    const master = this.master

    if (!context || !master) {
      return
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const now = context.currentTime
    const duration = 0.12

    source.buffer = this.createNoiseBuffer(duration, 'white')
    filter.type = 'highpass'
    filter.frequency.value = 1800
    gain.gain.setValueAtTime(0.07, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start(now)
    source.stop(now + duration)
  }

  private playFaucetPing(): void {
    const context = this.context
    const faucetGain = this.faucetGain

    if (!context || !faucetGain || faucetGain.gain.value <= 0.0001) {
      return
    }

    const oscillator = context.createOscillator()
    const dryGain = context.createGain()
    const wetGain = context.createGain()
    const convolver = context.createConvolver()
    const now = context.currentTime

    oscillator.type = 'sine'
    oscillator.frequency.value = 2100
    dryGain.gain.setValueAtTime(0.8, now)
    dryGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)
    wetGain.gain.value = 0.2
    convolver.buffer = this.createImpulseResponse(0.32)

    oscillator.connect(dryGain)
    dryGain.connect(faucetGain)
    oscillator.connect(convolver)
    convolver.connect(wetGain)
    wetGain.connect(faucetGain)
    oscillator.start(now)
    oscillator.stop(now + 0.16)
  }

  private scheduleTrain(): void {
    if (this.trainTimer !== null) {
      window.clearTimeout(this.trainTimer)
    }

    const delay = 25000 + Math.random() * 15000
    this.trainTimer = window.setTimeout(() => {
      this.playTrain()
      this.scheduleTrain()
    }, delay)
  }

  private playTrain(): void {
    const context = this.context
    const master = this.master

    if (!context || !master || !this.ambienceStarted) {
      return
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const now = context.currentTime

    source.buffer = this.createNoiseBuffer(4, 'brown')
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(120, now)
    filter.frequency.exponentialRampToValueAtTime(520, now + 2)
    filter.frequency.exponentialRampToValueAtTime(140, now + 4)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.075, now + 1.7)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start(now)
    source.stop(now + 4)
  }

  private playTone(
    frequency: number,
    type: OscillatorType,
    duration: number,
    volume: number,
    delay: number,
  ): void {
    const context = this.context
    const master = this.master

    if (!context || !master) {
      return
    }

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = context.currentTime + delay

    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain)
    gain.connect(master)
    oscillator.start(start)
    oscillator.stop(start + duration)
  }

  private createNoiseBuffer(duration: number, kind: NoiseKind): AudioBuffer {
    const context = this.context
    if (!context) {
      throw new Error('Audio context not initialized')
    }

    const frameCount = Math.max(1, Math.floor(context.sampleRate * duration))
    const buffer = context.createBuffer(1, frameCount, context.sampleRate)
    const channel = buffer.getChannelData(0)
    let last = 0

    for (let index = 0; index < frameCount; index += 1) {
      const white = Math.random() * 2 - 1
      if (kind === 'brown') {
        last = (last + 0.02 * white) / 1.02
        channel[index] = last * 3.5
      } else {
        channel[index] = white
      }
    }

    return buffer
  }

  private createImpulseResponse(duration: number): AudioBuffer {
    const context = this.context
    if (!context) {
      throw new Error('Audio context not initialized')
    }

    const frameCount = Math.max(1, Math.floor(context.sampleRate * duration))
    const buffer = context.createBuffer(1, frameCount, context.sampleRate)
    const channel = buffer.getChannelData(0)

    for (let index = 0; index < frameCount; index += 1) {
      const decay = Math.pow(1 - index / frameCount, 2.2)
      channel[index] = (Math.random() * 2 - 1) * decay
    }

    return buffer
  }
}

export const audioEngine = AudioEngine.getInstance()
