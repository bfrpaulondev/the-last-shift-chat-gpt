import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { audioEngine } from '../../audio/AudioEngine'
import { useGameStore } from '../../state/gameStore'

export function ElevatorAudio() {
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const motorRef = useRef<OscillatorNode | null>(null)
  const motorGainRef = useRef<GainNode | null>(null)
  const movingRef = useRef(false)
  const arrivalSignalRef = useRef(false)

  useEffect(() => {
    const context = new window.AudioContext()
    const master = context.createGain()
    const hum = context.createOscillator()
    const humGain = context.createGain()

    contextRef.current = context
    masterRef.current = master
    master.gain.value = audioEngine.isMuted() ? 0 : 0.32
    master.connect(context.destination)

    hum.type = 'sine'
    hum.frequency.value = 48
    humGain.gain.value = 0.012
    hum.connect(humGain)
    humGain.connect(master)
    hum.start()

    void context.resume().catch(() => undefined)

    return () => {
      try { hum.stop() } catch { /* already stopped */ }
      try { motorRef.current?.stop() } catch { /* already stopped */ }
      void context.close().catch(() => undefined)
      contextRef.current = null
      masterRef.current = null
      motorRef.current = null
      motorGainRef.current = null
    }
  }, [])

  useFrame(() => {
    const context = contextRef.current
    const master = masterRef.current
    if (!context || !master) return

    master.gain.setTargetAtTime(audioEngine.isMuted() ? 0 : 0.32, context.currentTime, 0.04)

    const flags = useGameStore.getState().flags
    const rideStarted = Boolean(flags.elevator_ride_started)
    const arrived22 = Boolean(flags.elevator_arrived_22)
    const floor22Complete = Boolean(flags.floor22_routine_complete)
    const ride30Started = Boolean(flags.elevator_ride_to_30_started)
    const arrived30 = Boolean(flags.elevator_arrived_30)
    const moving = (rideStarted && !arrived22) || (ride30Started && !arrived30)
    const arrivalSignal = floor22Complete ? arrived30 : arrived22

    if (moving && !movingRef.current) {
      const motor = context.createOscillator()
      const motorGain = context.createGain()
      const filter = context.createBiquadFilter()
      const now = context.currentTime
      motor.type = 'sawtooth'
      motor.frequency.setValueAtTime(58, now)
      motor.frequency.exponentialRampToValueAtTime(82, now + 1.2)
      filter.type = 'lowpass'
      filter.frequency.value = 220
      motorGain.gain.setValueAtTime(0.0001, now)
      motorGain.gain.exponentialRampToValueAtTime(0.025, now + 0.18)
      motor.connect(filter)
      filter.connect(motorGain)
      motorGain.connect(master)
      motor.start(now)
      motorRef.current = motor
      motorGainRef.current = motorGain
    }

    if (!moving && movingRef.current) {
      const now = context.currentTime
      const motorGain = motorGainRef.current
      if (motorGain) {
        motorGain.gain.cancelScheduledValues(now)
        motorGain.gain.setValueAtTime(Math.max(0.0001, motorGain.gain.value), now)
        motorGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
      }
      window.setTimeout(() => {
        try { motorRef.current?.stop() } catch { /* already stopped */ }
        motorRef.current = null
        motorGainRef.current = null
      }, 500)
    }

    if (arrivalSignal && !arrivalSignalRef.current) {
      const now = context.currentTime
      const bell = context.createOscillator()
      const bellGain = context.createGain()
      bell.type = 'sine'
      bell.frequency.value = 880
      bellGain.gain.setValueAtTime(0.0001, now)
      bellGain.gain.exponentialRampToValueAtTime(0.055, now + 0.02)
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65)
      bell.connect(bellGain)
      bellGain.connect(master)
      bell.start(now)
      bell.stop(now + 0.68)
    }

    movingRef.current = moving
    arrivalSignalRef.current = arrivalSignal
  })

  return null
}
